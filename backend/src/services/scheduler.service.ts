import * as cron from 'node-cron';
import { eventService } from './event.service';
import { notificationService } from './notification.service';

class SchedulerService {
  private tasks: cron.ScheduledTask[] = [];

  /**
   * Initialize all cron jobs
   */
  init() {
    console.log('🕒 Initializing scheduler service...');

    // Update event active status every minute
    const eventStatusTask = cron.schedule('* * * * *', async () => {
      try {
        await eventService.updateEventStatus();
      } catch (error) {
        console.error('Error updating event status:', error);
      }
    });
    this.tasks.push(eventStatusTask);

    // Send streak warnings at 10pm daily
    const streakWarningTask = cron.schedule('0 22 * * *', async () => {
      try {
        await notificationService.checkStreakWarnings();
      } catch (error) {
        console.error('Error sending streak warnings:', error);
      }
    });
    this.tasks.push(streakWarningTask);

    // Check leaderboard changes every 15 minutes
    const leaderboardTask = cron.schedule('*/15 * * * *', async () => {
      try {
        await notificationService.checkLeaderboardRivalries();
      } catch (error) {
        console.error('Error checking leaderboard:', error);
      }
    });
    this.tasks.push(leaderboardTask);

    // Send event reminders 5 minutes before start
    const eventReminderTask = cron.schedule('*/5 * * * *', async () => {
      try {
        await notificationService.sendEventReminders();
      } catch (error) {
        console.error('Error sending event reminders:', error);
      }
    });
    this.tasks.push(eventReminderTask);

    console.log(`✅ Scheduler initialized with ${this.tasks.length} tasks`);
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    console.log('🛑 Stopping all scheduled tasks...');
    this.tasks.forEach((task) => task.stop());
    this.tasks = [];
  }

  /**
   * Get status of all tasks
   */
  getStatus() {
    return {
      tasksRunning: this.tasks.length,
      tasks: [
        { name: 'Event Status Update', schedule: '* * * * *' },
        { name: 'Streak Warnings', schedule: '0 22 * * *' },
        { name: 'Leaderboard Check', schedule: '*/15 * * * *' },
        { name: 'Event Reminders', schedule: '*/5 * * * *' },
      ],
    };
  }
}

export const schedulerService = new SchedulerService();
