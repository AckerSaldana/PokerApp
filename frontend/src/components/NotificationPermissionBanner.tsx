import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/Button';

const DISMISSED_KEY = 'notification-banner-dismissed';

export function NotificationPermissionBanner() {
  const { isSupported, permission, requestPermission } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Only show if supported and permission not yet decided
    if (isSupported && permission === 'default') {
      // Check if user has dismissed the banner before
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      if (!dismissed) {
        // Delay showing banner for better UX
        const timer = setTimeout(() => setIsVisible(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isSupported, permission]);

  const handleEnable = async () => {
    setIsRequesting(true);
    await requestPermission();
    setIsRequesting(false);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(DISMISSED_KEY, 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96"
        >
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm">Enable Notifications</h3>
                <p className="text-zinc-400 text-xs mt-1">
                  Get notified when you receive chips, game updates, and unlock achievements.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleEnable}
                    disabled={isRequesting}
                    className="text-xs px-3 py-1.5"
                  >
                    {isRequesting ? 'Enabling...' : 'Enable'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="text-xs px-3 py-1.5 text-zinc-400"
                  >
                    Not now
                  </Button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
