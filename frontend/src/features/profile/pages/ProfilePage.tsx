import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { LogOut, TrendingUp, TrendingDown, Gamepad2, Send, Download, CalendarDays, Pencil, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { FramedAvatar } from '@/components/ui/FramedAvatar';
import { TitleBadge } from '@/components/ui/TitleBadge';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { usersApi } from '@/services/api/users';
import { formatChips, formatDate, cn } from '@/lib/utils';
import { pageTransition } from '@/components/animations/variants';
import { EditProfileSheet } from '../components/EditProfileSheet';
import { CustomizationSheet } from '@/features/customization/components/CustomizationSheet';
import { ProfileAchievementsBadges } from '@/features/achievements/components/ProfileAchievementsBadges';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showCustomizationSheet, setShowCustomizationSheet] = useState(false);

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
    },
    {
      icon: TrendingUp,
      label: 'Total Winnings',
      value: formatChips(stats?.gameStats.totalWinnings || 0),
      prefix: (stats?.gameStats.totalWinnings || 0) >= 0 ? '+' : '',
      color: (stats?.gameStats.totalWinnings || 0) >= 0 ? 'text-emerald-400' : 'text-red-400',
      bgColor: (stats?.gameStats.totalWinnings || 0) >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Biggest Win',
      value: formatChips(stats?.gameStats.biggestWin || 0),
      prefix: '+',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      icon: TrendingDown,
      label: 'Biggest Loss',
      value: formatChips(stats?.gameStats.biggestLoss || 0),
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
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
    },
    {
      icon: Download,
      label: 'Total Received',
      value: formatChips(stats?.transferStats.totalReceived || 0),
      subtext: `${stats?.transferStats.transfersReceivedCount || 0} transfers`,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
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
        {/* User Header */}
        <motion.div
          className="rounded-xl bg-white/5 border border-white/10 p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-5">
            <div className="relative">
              <FramedAvatar
                src={user?.avatarData || undefined}
                name={user?.username || 'U'}
                size="xl"
                frameClass={user?.equippedFrameCss || undefined}
                className="w-16 h-16 text-xl"
              />
              <button
                onClick={() => setShowEditSheet(true)}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg"
              >
                <Pencil className="w-3 h-3 text-white" />
              </button>
            </div>

            <div className="flex-1 space-y-1">
              <h2 className="text-xl font-bold text-white">{user?.username}</h2>
              {user?.equippedTitleName && (
                <div>
                  <TitleBadge
                    title={user.equippedTitleName}
                    color={user.equippedTitleColor || 'text-zinc-400'}
                    size="sm"
                  />
                </div>
              )}
              <p className="text-zinc-400 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-zinc-500" />
                <p className="text-zinc-500 text-xs">
                  Joined {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Customize Button */}
          <button
            onClick={() => setShowCustomizationSheet(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-black font-semibold hover:shadow-lg hover:shadow-[#d4af37]/20 transition-all"
          >
            <Sparkles className="w-5 h-5" />
            Customize Appearance
          </button>
        </motion.div>

        {/* Game Stats */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-widest pl-1 mb-4">
            Game Statistics
          </h3>
          <div className="space-y-3">
            {gameStats.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl bg-white/5 border border-white/10 p-4"
                whileHover={{ scale: 1.01, borderColor: 'rgba(255, 255, 255, 0.15)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat.bgColor)}>
                      <stat.icon className={cn('w-5 h-5', stat.color)} />
                    </div>
                    <span className="text-zinc-400 text-sm font-medium">{stat.label}</span>
                  </div>
                  <span className={cn('text-2xl font-display font-bold tabular-nums', stat.color)}>
                    {stat.prefix}{stat.value}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Transfer Stats */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-widest pl-1 mb-4">
            Transfer Activity
          </h3>
          <div className="space-y-3">
            {transferStats.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl bg-white/5 border border-white/10 p-4"
                whileHover={{ scale: 1.01, borderColor: 'rgba(255, 255, 255, 0.15)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat.bgColor)}>
                      <stat.icon className={cn('w-5 h-5', stat.color)} />
                    </div>
                    <div>
                      <span className="text-zinc-400 text-sm font-medium block">{stat.label}</span>
                      <span className="text-zinc-500 text-xs">{stat.subtext}</span>
                    </div>
                  </div>
                  <span className="text-2xl font-display font-bold text-white tabular-nums">
                    {stat.value}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <ProfileAchievementsBadges />

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
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

      {/* Edit Profile Sheet */}
      {user && (
        <EditProfileSheet
          isOpen={showEditSheet}
          onClose={() => setShowEditSheet(false)}
          user={user}
        />
      )}

      {/* Customization Sheet */}
      <CustomizationSheet
        isOpen={showCustomizationSheet}
        onClose={() => setShowCustomizationSheet(false)}
      />
    </motion.div>
  );
}
