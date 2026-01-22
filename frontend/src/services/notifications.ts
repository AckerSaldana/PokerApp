// Notification service for browser push notifications

export interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
}

class NotificationService {
  private permissionStatus: NotificationPermission = 'default';

  constructor() {
    if (this.isSupported()) {
      this.permissionStatus = Notification.permission;
    }
  }

  /**
   * Check if notifications are supported in this browser
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    return this.permissionStatus;
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.permissionStatus === 'granted';
  }

  /**
   * Request notification permission from user
   * Returns true if permission was granted
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported');
      return false;
    }

    if (this.permissionStatus === 'granted') {
      return true;
    }

    if (this.permissionStatus === 'denied') {
      console.warn('Notifications permission was denied');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      this.permissionStatus = result;
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Show a notification
   */
  async show(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported');
      return;
    }

    if (this.permissionStatus !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    // Check if page is visible - only show notification if app is in background
    if (document.visibilityState === 'visible') {
      // App is in foreground, skip notification (toast will handle it)
      return;
    }

    try {
      // Try to use service worker for notification (better for PWA)
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options,
      });
    } catch (error) {
      // Fallback to regular notification
      console.warn('Service worker notification failed, using fallback:', error);
      new Notification(title, {
        icon: '/pwa-192x192.png',
        ...options,
      });
    }
  }

  /**
   * Show a transfer received notification
   */
  async showTransferReceived(senderName: string, amount: number): Promise<void> {
    await this.show('Chips Received!', {
      body: `${senderName} sent you $${amount} chips`,
      tag: 'transfer-received',
      data: { type: 'transfer', url: '/transfer' },
    });
  }

  /**
   * Show an achievement unlocked notification
   */
  async showAchievementUnlocked(achievementName: string): Promise<void> {
    await this.show('Achievement Unlocked!', {
      body: achievementName,
      tag: 'achievement-unlocked',
      data: { type: 'achievement', url: '/profile' },
    });
  }

  /**
   * Show a game event notification
   */
  async showGameEvent(title: string, body: string, gameId?: string): Promise<void> {
    await this.show(title, {
      body,
      tag: 'game-event',
      data: { type: 'game', url: gameId ? `/game/${gameId}` : '/game' },
    });
  }

  /**
   * Show a leave request notification (for hosts)
   */
  async showLeaveRequest(playerName: string, gameId: string): Promise<void> {
    await this.show('Leave Request', {
      body: `${playerName} wants to leave the game`,
      tag: `leave-request-${gameId}`,
      requireInteraction: true,
      data: { type: 'leave-request', url: `/game/${gameId}` },
    });
  }

  /**
   * Show a cashed out notification (for players)
   */
  async showCashedOut(amount: number, netResult: number, gameId: string): Promise<void> {
    const resultText = netResult >= 0 ? `+$${netResult}` : `-$${Math.abs(netResult)}`;
    await this.show('You\'ve Been Cashed Out', {
      body: `Cash out: $${amount} (${resultText})`,
      tag: `cashed-out-${gameId}`,
      data: { type: 'cashed-out', url: `/game/${gameId}` },
    });
  }
}

export const notifications = new NotificationService();
