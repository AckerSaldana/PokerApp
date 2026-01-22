import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Trophy, Gamepad2, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Trophy, label: 'Ranks', path: '/leaderboard' },
  { icon: Gamepad2, label: 'Game', path: '/game' },
  { icon: Calendar, label: 'History', path: '/history' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-6 left-4 right-4 z-50">
      <motion.div
        className="mx-auto max-w-md bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-white/10 px-2 h-16 flex justify-between items-center"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3, ease: 'easeOut' }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center flex-1 h-full"
            >
              <motion.div
                className={cn(
                  'flex flex-col items-center justify-center p-2 transition-colors duration-200',
                  isActive ? 'text-[var(--color-gold-400)]' : 'text-zinc-500 hover:text-zinc-300'
                )}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.1 }}
              >
                <Icon
                  className="w-5 h-5"
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    className="absolute bottom-2 w-1 h-1 rounded-full bg-[var(--color-gold-400)]"
                    layoutId="activeNavDot"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </motion.div>
    </nav>
  );
}
