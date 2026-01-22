import { useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { achievementsApi } from '@/services/api/achievements';
import { useAuthStore } from '@/stores/authStore';
import { notifications } from '@/services/notifications';
import { AchievementToast } from './AchievementToast';
import type { UnlockedAchievement } from '@/lib/types';

export function AchievementChecker() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();
  const [toastQueue, setToastQueue] = useState<UnlockedAchievement[]>([]);
  const [currentToast, setCurrentToast] = useState<UnlockedAchievement | null>(null);

  // Poll for unnotified achievements
  const { data } = useQuery({
    queryKey: ['unnotifiedAchievements'],
    queryFn: achievementsApi.getUnnotified,
    enabled: isAuthenticated,
    refetchInterval: 15000, // Check every 15 seconds
    refetchOnWindowFocus: true,
  });

  // Add new achievements to queue
  useEffect(() => {
    if (data?.achievements && data.achievements.length > 0) {
      setToastQueue((prev) => {
        // Only add achievements not already in queue
        const existingIds = new Set(prev.map((a) => a.id));
        const newAchievements = data.achievements.filter((a) => !existingIds.has(a.id));
        return [...prev, ...newAchievements];
      });
    }
  }, [data]);

  // Process queue - show one toast at a time
  useEffect(() => {
    if (!currentToast && toastQueue.length > 0) {
      const [next, ...rest] = toastQueue;
      setCurrentToast(next);
      setToastQueue(rest);

      // Mark as notified
      achievementsApi.markNotified([next.id]).catch(console.error);

      // Show browser push notification (will only show if app is in background)
      notifications.showAchievementUnlocked(next.name);
    }
  }, [currentToast, toastQueue]);

  const handleCloseToast = useCallback(() => {
    setCurrentToast(null);
    // Invalidate queries to refresh achievement data
    queryClient.invalidateQueries({ queryKey: ['myAchievements'] });
  }, [queryClient]);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (currentToast) {
      const timer = setTimeout(handleCloseToast, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentToast, handleCloseToast]);

  return <AchievementToast achievement={currentToast} onClose={handleCloseToast} />;
}
