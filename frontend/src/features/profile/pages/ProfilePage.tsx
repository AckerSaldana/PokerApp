import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { LogOut, TrendingUp, TrendingDown, Gamepad2, Send, Download, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { usersApi } from '@/services/api/users';
import { formatChips, formatDate } from '@/lib/utils';
import { pageTransition, staggerDepth, staggerDepthItem } from '@/components/animations/variants';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => usersApi.getStats(user!.id),
    enabled: !!user?.id,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const gameStats = [
    {
      icon: Gamepad2,
      label: 'Games Played',
      value: stats?.gameStats.totalGames || 0,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      gradient: 'from-blue-500/10 to-transparent',
    },
    {
      icon: TrendingUp,
      label: 'Total Winnings',
      value: formatChips(stats?.gameStats.totalWinnings || 0),
      prefix: (stats?.gameStats.totalWinnings || 0) >= 0 ? '+' : '',
      color: (stats?.gameStats.totalWinnings || 0) >= 0 ? 'text-emerald-400' : 'text-red-400',
      bgColor: (stats?.gameStats.totalWinnings || 0) >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
      gradient: (stats?.gameStats.totalWinnings || 0) >= 0 ? 'from-emerald-500/10 to-transparent' : 'from-red-500/10 to-transparent',
    },
    {
      icon: TrendingUp,
      label: 'Biggest Win',
      value: formatChips(stats?.gameStats.biggestWin || 0),
      prefix: '+',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      gradient: 'from-amber-500/10 to-transparent',
    },
    {
      icon: TrendingDown,
      label: 'Biggest Loss',
      value: formatChips(stats?.gameStats.biggestLoss || 0),
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      gradient: 'from-red-500/10 to-transparent',
    },
  ];

  const transferStats = [
    {
      icon: Send,
      label: 'Total Sent',
      value: formatChips(stats?.transferStats.totalSent || 0),
      subtext: `${stats?.transferStats.transfersSentCount || 0} transfers`,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      gradient: 'from-orange-500/10 to-transparent',
    },
    {
      icon: Download,
      label: 'Total Received',
      value: formatChips(stats?.transferStats.totalReceived || 0),
      subtext: `${stats?.transferStats.transfersReceivedCount || 0} transfers`,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      gradient: 'from-purple-500/10 to-transparent',
    },
  ];

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <PageHeader title="Profile" />

      <div className="px-6 space-y-8 pb-32">
        {/* Premium User Header */}
        <Card variant="premium" className="p-8 relative overflow-hidden">
          {/* Decorative gradient orbs */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-500 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-500 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="relative flex items-center gap-6">
            {/* Avatar with glow */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full blur-lg opacity-30" />
              <Avatar
                name={user?.username || 'U'}
                size="xl"
                className="w-20 h-20 text-2xl ring-4 ring-emerald-500/20"
              />
            </motion.div>

            <div>
              <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
              <p className="text-zinc-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <CalendarDays className="w-4 h-4 text-zinc-500" />
                <p className="text-zinc-500 text-sm">
                  Joined {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Game Stats */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Game Statistics</h3>
          <motion.div
            className="grid grid-cols-2 gap-4"
            variants={staggerDepth}
            initial="initial"
            animate="animate"
          >
            {gameStats.map((stat, i) => {
               const suit = i === 0 ? '\u2663' : i === 1 ? '\u2666' : i === 2 ? '\u2660' : '\u2665';
               const isRed = i === 1 || i === 3;
               return (
              <motion.div key={stat.label} variants={staggerDepthItem}>
                <Card className="p-5 group hover:border-[var(--color-gold-500)]/30 transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl border-zinc-800/60 rounded-[2rem]">
                   {/* Suit Watermark */}
                  <div className={`absolute -right-4 -bottom-4 text-9xl font-serif opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 rotate-0 select-none pointer-events-none ${isRed ? 'text-red-500' : 'text-white'}`}>
                    {suit}
                  </div>

                  {/* Hover glow */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100
                                  bg-gradient-to-br ${stat.gradient}
                                  transition-opacity duration-500`} />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <motion.div
                        className={`w-12 h-12 ${stat.bgColor} rounded-xl
                                   flex items-center justify-center border border-white/5 shadow-xl backdrop-blur-sm`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </motion.div>
                      
                       {/* Mini Card Suit Indicator */}
                      <span className={`text-xl font-serif opacity-30 ${isRed ? 'text-red-400' : 'text-zinc-400'}`}>{suit}</span>
                    </div>

                    <p className="text-[var(--color-gold-400)] text-xs uppercase tracking-widest font-semibold mb-1 opacity-90">{stat.label}</p>
                    <motion.p
                      className={`text-3xl font-display font-bold ${stat.color} tabular-nums tracking-tight`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                    >
                      {stat.prefix}{stat.value}
                    </motion.p>
                  </div>
                </Card>
              </motion.div>
            )})}
          </motion.div>
        </div>

        {/* Transfer Stats */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Transfer Activity</h3>
          <motion.div
            className="grid grid-cols-2 gap-4"
            variants={staggerDepth}
            initial="initial"
            animate="animate"
          >
            {transferStats.map((stat, i) => {
               const suit = i === 0 ? '\u2663' : '\u2660'; 
               return (
              <motion.div key={stat.label} variants={staggerDepthItem}>
                <Card className="p-5 group hover:border-[var(--color-gold-500)]/30 transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl border-zinc-800/60 rounded-[2rem]">
                  {/* Suit Watermark */}
                  <div className="absolute -right-6 -top-6 text-9xl font-serif text-white/[0.03] group-hover:text-white/[0.06] transition-colors duration-500 rotate-12 select-none pointer-events-none">
                    {suit}
                  </div>
                  
                  {/* Hover glow */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100
                                  bg-gradient-to-br ${stat.gradient}
                                  transition-opacity duration-500`} />

                  <div className="relative">
                    <motion.div
                      className={`w-12 h-12 ${stat.bgColor} rounded-xl
                                 flex items-center justify-center mb-4
                                 border border-white/5 shadow-2xl backdrop-blur-sm`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </motion.div>

                    <p className="text-[var(--color-gold-400)] text-xs uppercase tracking-widest font-semibold mb-1 opacity-90">{stat.label}</p>
                    <p className="text-3xl font-display font-bold text-white tabular-nums tracking-tight">{stat.value}</p>
                    <p className="text-xs text-zinc-500 mt-1 font-medium">{stat.subtext}</p>
                  </div>
                </Card>
              </motion.div>
            )})}
          </motion.div>
        </div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="danger"
            className="w-full"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-5 h-5" />}
          >
            Sign out
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
