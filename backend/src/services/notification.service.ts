import { prisma } from '../lib/prisma';
import { eventService } from './event.service';

interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  type: 'streak_warning' | 'event_reminder' | 'leaderboard' | 'achievement';
  data?: Record<string, any>;
}

class NotificationService {
  /**
   * Check for users whose streaks are about to break (2 hours before midnight)
   */
  async checkStreakWarnings(): Promise<void> {
    console.log('🔔 Checking streak warnings...');

    // Get users with active login streaks who haven't logged in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const users = await prisma.user.findMany({
      where: {
        loginStreak: { gt: 0 },
        lastLoginDate: { lt: today },
      },
      include: {
        notificationSettings: true,
      },
    });

    for (const user of users) {
      // Check notification preferences
      if (
        !user.notificationSettings?.streakWarnings ||
        !(await this.canSendNotification(user.id, 'streak_warning'))
      ) {
        continue;
      }

      // Send streak warning notification
      await this.sendNotification({
        userId: user.id,
        title: `${user.loginStreak}-day streak ending soon!`,
        body: `Your ${user.loginStreak}-day login streak will break at midnight. Log in now to keep it alive!`,
        type: 'streak_warning',
        data: { streak: user.loginStreak },
      });

      // Update last notification time
      await prisma.notificationSettings.update({
        where: { userId: user.id },
        data: { lastStreakNotification: new Date() },
      });
    }

    console.log(`✅ Sent ${users.length} streak warnings`);
  }

  /**
   * Send event reminders 5 minutes before start
   */
  async sendEventReminders(): Promise<void> {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    // Find events starting in the next 5-10 minutes
    const upcomingEvents = await prisma.event.findMany({
      where: {
        isActive: false,
        startTime: {
          gte: fiveMinutesFromNow,
          lte: tenMinutesFromNow,
        },
      },
    });

    if (upcomingEvents.length === 0) {
      return;
    }

    console.log(`🔔 Sending reminders for ${upcomingEvents.length} upcoming events...`);

    // Get users with event reminders enabled
    const usersWithReminders = await prisma.notificationSettings.findMany({
      where: {
        eventReminders: true,
      },
    });

    for (const event of upcomingEvents) {
      for (const settings of usersWithReminders) {
        // Check if we can send notification
        if (!(await this.canSendNotification(settings.userId, 'event_reminder'))) {
          continue;
        }

        // Send event reminder
        await this.sendNotification({
          userId: settings.userId,
          title: `${event.iconEmoji} ${event.name} starts soon!`,
          body: `${event.description} Starting in 5 minutes!`,
          type: 'event_reminder',
          data: {
            eventId: event.id,
            multiplier: event.multiplier,
            bonusChips: event.bonusChips,
          },
        });

        // Update last notification time
        await prisma.notificationSettings.update({
          where: { userId: settings.userId },
          data: { lastEventNotification: new Date() },
        });
      }
    }
  }

  /**
   * Check leaderboard for rivalries (when someone passes you)
   */
  async checkLeaderboardRivalries(): Promise<void> {
    console.log('🏆 Checking leaderboard rivalries...');

    // Get current leaderboard (top 100)
    const leaderboard = await prisma.user.findMany({
      where: {
        chipBalance: { gt: 0 },
      },
      orderBy: { chipBalance: 'desc' },
      take: 100,
      select: {
        id: true,
        username: true,
        chipBalance: true,
        lastLeaderboardRank: true,
        notificationSettings: true,
      },
    });

    for (let i = 0; i < leaderboard.length; i++) {
      const user = leaderboard[i];
      const currentRank = i + 1;
      const previousRank = user.lastLeaderboardRank;

      // Update user's current rank
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLeaderboardRank: currentRank },
      });

      // Check if someone passed them (rank got worse)
      if (previousRank && currentRank > previousRank && currentRank <= 10) {
        // Only notify for top 10
        if (
          !user.notificationSettings?.leaderboardUpdates ||
          !(await this.canSendNotification(user.id, 'leaderboard'))
        ) {
          continue;
        }

        // Find who passed them
        const passerIndex = currentRank - 2; // -1 for 0-index, -1 for person above
        if (passerIndex >= 0 && passerIndex < leaderboard.length) {
          const passer = leaderboard[passerIndex];

          await this.sendNotification({
            userId: user.id,
            title: '🏆 Leaderboard Update',
            body: `${passer.username} just passed you! You're now #${currentRank}.`,
            type: 'leaderboard',
            data: {
              newRank: currentRank,
              oldRank: previousRank,
              passerUsername: passer.username,
            },
          });
        }
      }
    }
  }

  /**
   * Check if we can send a notification to a user
   * Rate limiting: max 1 per type per hour, max 3 total per day
   */
  async canSendNotification(
    userId: string,
    type: 'streak_warning' | 'event_reminder' | 'leaderboard' | 'achievement'
  ): Promise<boolean> {
    const settings = await eventService.getNotificationSettings(userId);

    // Check quiet hours
    if (settings.quietHoursStart !== null && settings.quietHoursEnd !== null) {
      const now = new Date();
      const currentHour = now.getHours();

      if (this.isInQuietHours(currentHour, settings.quietHoursStart, settings.quietHoursEnd)) {
        return false;
      }
    }

    // Check type-specific rate limiting (1 per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    if (type === 'streak_warning' && settings.lastStreakNotification) {
      if (settings.lastStreakNotification > oneHourAgo) {
        return false;
      }
    }

    if (type === 'event_reminder' && settings.lastEventNotification) {
      if (settings.lastEventNotification > oneHourAgo) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if current hour is within quiet hours
   */
  private isInQuietHours(currentHour: number, start: number, end: number): boolean {
    if (start < end) {
      // Normal range (e.g., 22-6 means 10pm to 6am)
      return currentHour >= start && currentHour < end;
    } else {
      // Wraps around midnight (e.g., 22-6 means 10pm to 6am next day)
      return currentHour >= start || currentHour < end;
    }
  }

  /**
   * Send a notification (placeholder for actual push notification service)
   */
  private async sendNotification(payload: NotificationPayload): Promise<void> {
    // TODO: Integrate with actual push notification service (FCM, OneSignal, etc.)
    // For now, just log the notification
    console.log('📬 Notification:', {
      user: payload.userId,
      title: payload.title,
      body: payload.body,
      type: payload.type,
    });

    // In production, this would call:
    // - Firebase Cloud Messaging (FCM)
    // - OneSignal
    // - Apple Push Notification Service (APNS)
    // - Or another push notification provider
  }

  /**
   * Send achievement unlock notification
   */
  async sendAchievementNotification(userId: string, achievementName: string): Promise<void> {
    await this.sendNotification({
      userId,
      title: '🏆 Achievement Unlocked!',
      body: `You earned "${achievementName}"!`,
      type: 'achievement',
      data: { achievementName },
    });
  }
}

export const notificationService = new NotificationService();
