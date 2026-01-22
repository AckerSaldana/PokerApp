import { useState, useEffect, useCallback } from 'react';
import { notifications } from '@/services/notifications';

interface UseNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isEnabled: boolean;
  requestPermission: () => Promise<boolean>;
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>(
    notifications.getPermission()
  );

  // Listen for permission changes
  useEffect(() => {
    if (!notifications.isSupported()) return;

    // Check permission on visibility change (user might change in settings)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setPermission(Notification.permission);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const requestPermission = useCallback(async () => {
    const granted = await notifications.requestPermission();
    setPermission(notifications.getPermission());
    return granted;
  }, []);

  return {
    isSupported: notifications.isSupported(),
    permission,
    isEnabled: permission === 'granted',
    requestPermission,
  };
}
