import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/services/api/events';
import { cn } from '@/lib/utils';

export function EventBanner() {
  const { data: activeEvents } = useQuery({
    queryKey: ['activeEvents'],
    queryFn: eventsApi.getActiveEvents,
    refetchInterval: 60000, // Refresh every minute
  });

  const event = activeEvents?.[0]; // Highest priority event

  if (!event) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          'relative overflow-hidden rounded-2xl p-4 shadow-xl',
          'border-2'
        )}
        style={{
          backgroundColor: `${event.bannerColor}15`,
          borderColor: `${event.bannerColor}40`,
        }}
      >
        {/* Animated glow effect */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${event.bannerColor}, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className="relative z-10 flex items-center justify-between gap-4">
          {/* Event Info */}
          <div className="flex items-center gap-3 flex-1">
            <motion.div
              className="text-3xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {event.iconEmoji}
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-lg">{event.name}</h3>
                {event.multiplier > 1 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-bold animate-pulse"
                    style={{
                      backgroundColor: `${event.bannerColor}30`,
                      borderWidth: '1px',
                      borderColor: event.bannerColor,
                      color: event.bannerColor,
                    }}
                  >
                    {event.multiplier}x ACTIVE
                  </span>
                )}
                {event.bonusChips > 0 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{
                      backgroundColor: `${event.bannerColor}30`,
                      borderWidth: '1px',
                      borderColor: event.bannerColor,
                      color: event.bannerColor,
                    }}
                  >
                    +{event.bonusChips} CHIPS
                  </span>
                )}
              </div>
              <p className="text-zinc-400 text-sm mt-0.5">{event.description}</p>
            </div>
          </div>

          {/* Countdown Timer */}
          <EventCountdown endTime={event.endTime} bannerColor={event.bannerColor} />
        </div>

        {/* Social Proof */}
        <EventSocialProof eventId={event.id} bannerColor={event.bannerColor} />
      </motion.div>
    </AnimatePresence>
  );
}

interface EventCountdownProps {
  endTime: string;
  bannerColor: string;
}

function EventCountdown({ endTime, bannerColor }: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Ending soon...');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Mark as urgent if less than 5 minutes
      setIsUrgent(diff < 5 * 60 * 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <motion.div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl',
        isUrgent && 'animate-pulse'
      )}
      style={{
        backgroundColor: `${bannerColor}20`,
        borderWidth: '1px',
        borderColor: `${bannerColor}60`,
      }}
      animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 1, repeat: Infinity }}
    >
      <Clock className="w-4 h-4" style={{ color: bannerColor }} />
      <span className="font-mono font-bold text-sm text-white">{timeLeft}</span>
    </motion.div>
  );
}

interface EventSocialProofProps {
  eventId: string;
  bannerColor: string;
}

function EventSocialProof({ eventId, bannerColor }: EventSocialProofProps) {
  const { data: stats } = useQuery({
    queryKey: ['eventStats', eventId],
    queryFn: () => eventsApi.getEventStats(eventId),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (!stats || stats.recentParticipants === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 mt-3 pt-3 border-t"
      style={{ borderColor: `${bannerColor}20` }}
    >
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
        style={{
          backgroundColor: `${bannerColor}15`,
          borderWidth: '1px',
          borderColor: `${bannerColor}30`,
        }}
      >
        <Sparkles className="w-3.5 h-3.5" style={{ color: bannerColor }} />
        <span className="text-xs font-semibold text-white">
          {stats.recentParticipants} {stats.recentParticipants === 1 ? 'player' : 'players'}{' '}
          claimed in the last hour
        </span>
      </div>
    </motion.div>
  );
}
