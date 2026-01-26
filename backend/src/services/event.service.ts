import { prisma } from '../lib/prisma';
import { Event, EventType } from '@prisma/client';

export interface EventStats {
  eventId: string;
  participantCount: number;
  totalRewardsClaimed: number;
  recentParticipants: number; // Last hour
}

export interface ActiveMultiplier {
  multiplier: number;
  bonusChips: number;
  event: Event | null;
}

class EventService {
  /**
   * Get all currently active events
   */
  async getActiveEvents(): Promise<Event[]> {
    const now = new Date();

    return await prisma.event.findMany({
      where: {
        isActive: true,
        startTime: { lte: now },
        endTime: { gte: now },
      },
      orderBy: { priority: 'desc' },
    });
  }

  /**
   * Get all upcoming events (next 24 hours)
   */
  async getUpcomingEvents(limit: number = 3): Promise<Event[]> {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return await prisma.event.findMany({
      where: {
        startTime: {
          gte: now,
          lte: tomorrow,
        },
      },
      orderBy: { startTime: 'asc' },
      take: limit,
    });
  }

  /**
   * Update event active status based on current time
   * Called by scheduler every minute
   */
  async updateEventStatus(): Promise<void> {
    const now = new Date();

    // Activate events that should be active
    await prisma.event.updateMany({
      where: {
        isActive: false,
        startTime: { lte: now },
        endTime: { gte: now },
      },
      data: { isActive: true },
    });

    // Deactivate events that have ended
    await prisma.event.updateMany({
      where: {
        isActive: true,
        endTime: { lt: now },
      },
      data: { isActive: false },
    });

    // For recurring events (Happy Hour, Midnight Madness), update their times for next occurrence
    await this.updateRecurringEventTimes();
  }

  /**
   * Update recurring event times for next occurrence
   */
  private async updateRecurringEventTimes(): Promise<void> {
    const now = new Date();

    // Happy Hour - runs Mon-Fri 6-7pm
    const happyHour = await prisma.event.findUnique({
      where: { key: 'happy_hour' },
    });

    if (happyHour && happyHour.endTime < now) {
      const nextStart = this.getNextWeekdayTime(18, 0); // 6pm
      const nextEnd = this.getNextWeekdayTime(19, 0); // 7pm

      await prisma.event.update({
        where: { id: happyHour.id },
        data: {
          startTime: nextStart,
          endTime: nextEnd,
          isActive: false,
        },
      });
    }

    // Midnight Madness - runs daily 11pm-12am
    const midnightMadness = await prisma.event.findUnique({
      where: { key: 'midnight_madness' },
    });

    if (midnightMadness && midnightMadness.endTime < now) {
      const nextStart = this.getNextDailyTime(23, 0); // 11pm
      const nextEnd = this.getNextDailyTime(0, 0); // 12am (next day)

      await prisma.event.update({
        where: { id: midnightMadness.id },
        data: {
          startTime: nextStart,
          endTime: nextEnd,
          isActive: false,
        },
      });
    }

    // Weekend Bonanza - runs Sat-Sun
    const weekendBonanza = await prisma.event.findUnique({
      where: { key: 'weekend_bonanza' },
    });

    if (weekendBonanza && weekendBonanza.endTime < now) {
      const nextWeekendStart = this.getNextWeekendStart();
      const nextWeekendEnd = this.getNextWeekendEnd(nextWeekendStart);

      await prisma.event.update({
        where: { id: weekendBonanza.id },
        data: {
          startTime: nextWeekendStart,
          endTime: nextWeekendEnd,
          isActive: false,
        },
      });
    }
  }

  /**
   * Get next weekday (Mon-Fri) at specified time
   */
  private getNextWeekdayTime(hour: number, minute: number): Date {
    const now = new Date();
    const next = new Date(now);
    next.setHours(hour, minute, 0, 0);

    // If time has passed today, move to next occurrence
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    // Skip to next weekday if on weekend
    while (next.getDay() === 0 || next.getDay() === 6) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }

  /**
   * Get next daily occurrence at specified time
   */
  private getNextDailyTime(hour: number, minute: number): Date {
    const now = new Date();
    const next = new Date(now);
    next.setHours(hour, minute, 0, 0);

    // If time has passed today, move to tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }

  /**
   * Get next Saturday at 00:00
   */
  private getNextWeekendStart(): Date {
    const now = new Date();
    const next = new Date(now);
    next.setHours(0, 0, 0, 0);

    // Move to next Saturday
    const daysUntilSaturday = (6 - next.getDay() + 7) % 7 || 7;
    next.setDate(next.getDate() + daysUntilSaturday);

    return next;
  }

  /**
   * Get Sunday 23:59:59 following the given Saturday
   */
  private getNextWeekendEnd(saturdayStart: Date): Date {
    const end = new Date(saturdayStart);
    end.setDate(end.getDate() + 1); // Move to Sunday
    end.setHours(23, 59, 59, 999);
    return end;
  }

  /**
   * Get active multiplier for a user and bonus type
   */
  async getActiveMultiplier(userId: string, type: 'daily' | 'spin'): Promise<ActiveMultiplier> {
    const activeEvents = await this.getActiveEvents();

    if (activeEvents.length === 0) {
      return { multiplier: 1.0, bonusChips: 0, event: null };
    }

    // Return highest priority event
    const event = activeEvents[0];

    return {
      multiplier: event.multiplier,
      bonusChips: event.bonusChips,
      event,
    };
  }

  /**
   * Record user participation in an event
   */
  async recordEventParticipation(
    userId: string,
    eventId: string,
    rewardsClaimed: number
  ): Promise<void> {
    await prisma.userEvent.upsert({
      where: {
        userId_eventId: { userId, eventId },
      },
      update: {
        rewardsClaimed: { increment: rewardsClaimed },
        participatedAt: new Date(),
      },
      create: {
        userId,
        eventId,
        rewardsClaimed,
      },
    });
  }

  /**
   * Get event participation stats
   */
  async getEventStats(eventId: string): Promise<EventStats> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const [total, recent, sumResult] = await Promise.all([
      // Total participants
      prisma.userEvent.count({
        where: { eventId },
      }),

      // Recent participants (last hour)
      prisma.userEvent.count({
        where: {
          eventId,
          participatedAt: { gte: oneHourAgo },
        },
      }),

      // Total rewards claimed
      prisma.userEvent.aggregate({
        where: { eventId },
        _sum: { rewardsClaimed: true },
      }),
    ]);

    return {
      eventId,
      participantCount: total,
      totalRewardsClaimed: sumResult._sum.rewardsClaimed || 0,
      recentParticipants: recent,
    };
  }

  /**
   * Get user's notification settings
   */
  async getNotificationSettings(userId: string) {
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: { userId },
      });
    }

    return settings;
  }

  /**
   * Update user's notification settings
   */
  async updateNotificationSettings(
    userId: string,
    updates: {
      eventReminders?: boolean;
      streakWarnings?: boolean;
      achievementProgress?: boolean;
      leaderboardUpdates?: boolean;
      quietHoursStart?: number | null;
      quietHoursEnd?: number | null;
    }
  ) {
    return await prisma.notificationSettings.upsert({
      where: { userId },
      update: updates,
      create: {
        userId,
        ...updates,
      },
    });
  }
}

export const eventService = new EventService();
