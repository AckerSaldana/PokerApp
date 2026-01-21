import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Trophy, Send, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Trophy, label: 'Ranks', path: '/leaderboard' },
  { icon: Send, label: 'Send', path: '/transfer' },
  { icon: Calendar, label: 'History', path: '/history' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-6 left-4 right-4 z-50">
      <div className="mx-auto max-w-md bg-[var(--bg-surface-elevated)] backdrop-blur-xl border border-[var(--glass-border)] rounded-full shadow-2xl shadow-black/50 px-6 h-16 flex justify-between items-center relative overflow-hidden">
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 opacity-50" />
        
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative z-10 flex flex-col items-center justify-center w-12 h-full"
            >
              <motion.div
                className={cn(
                  'flex flex-col items-center justify-center gap-1 transition-all duration-300',
                  isActive ? 'text-[var(--color-gold-400)]' : 'text-zinc-500 hover:text-zinc-300'
                )}
                whileTap={{ scale: 0.9 }}
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-300",
                  isActive && "bg-[var(--color-emerald-900)] shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                )}>
                  <Icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]")} strokeWidth={isActive ? 2.5 : 2} />
                </div>
              </motion.div>
              {isActive && (
                <motion.div
                  className="absolute bottom-2 w-1 h-1 bg-[var(--color-gold-400)] rounded-full shadow-[0_0_8px_var(--color-gold-400)]"
                  layoutId="activeTabDot"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
