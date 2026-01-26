import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, Sparkles } from 'lucide-react';
import { customizationApi, type AvatarFrame, type ProfileTitle } from '@/services/api/customization';
import { FramedAvatar } from '@/components/ui/FramedAvatar';
import { TitleBadge } from '@/components/ui/TitleBadge';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const rarityColors = {
  COMMON: {
    border: 'border-zinc-600',
    bg: 'bg-zinc-900/50',
    text: 'text-zinc-400',
    glow: '',
  },
  RARE: {
    border: 'border-blue-500/50',
    bg: 'bg-blue-950/30',
    text: 'text-blue-400',
    glow: 'shadow-lg shadow-blue-500/20',
  },
  EPIC: {
    border: 'border-purple-500/50',
    bg: 'bg-purple-950/30',
    text: 'text-purple-400',
    glow: 'shadow-xl shadow-purple-500/30',
  },
  LEGENDARY: {
    border: 'border-amber-500/50',
    bg: 'bg-gradient-to-br from-amber-950/30 to-orange-950/30',
    text: 'text-amber-400',
    glow: 'shadow-2xl shadow-amber-500/40',
  },
};

export function CustomizationCollection() {
  const [activeTab, setActiveTab] = useState<'frames' | 'titles'>('frames');
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const { data: frames, isLoading: framesLoading } = useQuery({
    queryKey: ['customization', 'frames'],
    queryFn: customizationApi.getUserFrames,
    staleTime: 60_000,
  });

  const { data: titles, isLoading: titlesLoading } = useQuery({
    queryKey: ['customization', 'titles'],
    queryFn: customizationApi.getUserTitles,
    staleTime: 60_000,
  });

  const equipFrameMutation = useMutation({
    mutationFn: customizationApi.equipFrame,
    onSuccess: (_, frameId) => {
      // Find the frame to get its CSS class
      const frame = frames?.find(f => f.id === frameId);

      // Update auth store immediately for instant UI feedback
      useAuthStore.getState().updateUser({
        equippedFrameId: frameId,
        equippedFrameCss: frame?.cssClass || null,
      });

      // Also invalidate queries to keep everything in sync
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['customization', 'frames'] });
    },
  });

  const equipTitleMutation = useMutation({
    mutationFn: customizationApi.equipTitle,
    onSuccess: (_, titleId) => {
      // Find the title to get its name and color
      const title = titles?.find(t => t.id === titleId);

      // Update auth store immediately for instant UI feedback
      useAuthStore.getState().updateUser({
        equippedTitleId: titleId,
        equippedTitleName: title?.name || null,
        equippedTitleColor: title?.color || null,
      });

      // Also invalidate queries to keep everything in sync
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['customization', 'titles'] });
    },
  });

  const handleEquipFrame = (frameId: string | null) => {
    equipFrameMutation.mutate(frameId);
  };

  const handleEquipTitle = (titleId: string | null) => {
    equipTitleMutation.mutate(titleId);
  };

  const isLoading = framesLoading || titlesLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-10 bg-white/5 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 bg-black/40 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('frames')}
          className={cn(
            'flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all',
            activeTab === 'frames'
              ? 'bg-[#d4af37] text-black'
              : 'text-zinc-400 hover:text-white'
          )}
        >
          Avatar Frames
        </button>
        <button
          onClick={() => setActiveTab('titles')}
          className={cn(
            'flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all',
            activeTab === 'titles'
              ? 'bg-[#d4af37] text-black'
              : 'text-zinc-400 hover:text-white'
          )}
        >
          Profile Titles
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'frames' && (
          <motion.div
            key="frames"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {frames && Object.entries(
              frames.reduce((acc, frame) => {
                if (!acc[frame.rarity]) acc[frame.rarity] = [];
                acc[frame.rarity].push(frame);
                return acc;
              }, {} as Record<string, AvatarFrame[]>)
            ).map(([rarity, rarityFrames]) => (
              <div key={rarity}>
                <h3 className={cn(
                  'text-sm font-bold uppercase tracking-wider mb-3',
                  rarityColors[rarity as keyof typeof rarityColors].text
                )}>
                  {rarity} ({rarityFrames.filter(f => f.isUnlocked).length}/{rarityFrames.length})
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {rarityFrames.map((frame) => (
                    <FrameItem
                      key={frame.id}
                      frame={frame}
                      isEquipped={user?.equippedFrameId === frame.id}
                      onEquip={() => handleEquipFrame(user?.equippedFrameId === frame.id ? null : frame.id)}
                      userName={user?.username || 'You'}
                      userAvatar={user?.avatarData}
                    />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'titles' && (
          <motion.div
            key="titles"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {titles && Object.entries(
              titles.reduce((acc, title) => {
                if (!acc[title.rarity]) acc[title.rarity] = [];
                acc[title.rarity].push(title);
                return acc;
              }, {} as Record<string, ProfileTitle[]>)
            ).map(([rarity, rarityTitles]) => (
              <div key={rarity}>
                <h3 className={cn(
                  'text-sm font-bold uppercase tracking-wider mb-3',
                  rarityColors[rarity as keyof typeof rarityColors].text
                )}>
                  {rarity} ({rarityTitles.filter(t => t.isUnlocked).length}/{rarityTitles.length})
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {rarityTitles.map((title) => (
                    <TitleItem
                      key={title.id}
                      title={title}
                      isEquipped={user?.equippedTitleId === title.id}
                      onEquip={() => handleEquipTitle(user?.equippedTitleId === title.id ? null : title.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FrameItemProps {
  frame: AvatarFrame;
  isEquipped: boolean;
  onEquip: () => void;
  userName: string;
  userAvatar?: string | null;
}

function FrameItem({ frame, isEquipped, onEquip, userName, userAvatar }: FrameItemProps) {
  const rarity = rarityColors[frame.rarity];

  return (
    <motion.div
      className={cn(
        'relative rounded-xl border-2 p-4 transition-all',
        rarity.border,
        rarity.bg,
        rarity.glow,
        frame.isUnlocked ? 'cursor-pointer' : 'opacity-50',
        isEquipped && 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-zinc-900'
      )}
      onClick={frame.isUnlocked ? onEquip : undefined}
      whileHover={frame.isUnlocked ? { scale: 1.02 } : {}}
      whileTap={frame.isUnlocked ? { scale: 0.98 } : {}}
    >
      {/* Locked overlay */}
      {!frame.isUnlocked && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">{frame.description}</p>
          </div>
        </div>
      )}

      {/* Equipped badge */}
      {isEquipped && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1 shadow-lg z-20">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Legendary sparkle */}
      {frame.rarity === 'LEGENDARY' && frame.isUnlocked && (
        <Sparkles className="absolute top-2 right-2 w-4 h-4 text-amber-400 animate-pulse" />
      )}

      {/* Preview */}
      <div className="flex flex-col items-center gap-3">
        <FramedAvatar
          src={userAvatar || undefined}
          name={userName}
          size="lg"
          frameClass={frame.isUnlocked ? frame.cssClass : undefined}
        />
        <div className="text-center">
          <p className={cn('font-bold text-sm', rarity.text)}>{frame.name}</p>
          {frame.isUnlocked && (
            <p className="text-xs text-zinc-500 mt-1">
              {isEquipped ? 'Equipped' : 'Tap to equip'}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface TitleItemProps {
  title: ProfileTitle;
  isEquipped: boolean;
  onEquip: () => void;
}

function TitleItem({ title, isEquipped, onEquip }: TitleItemProps) {
  const rarity = rarityColors[title.rarity];

  return (
    <motion.div
      className={cn(
        'relative rounded-xl border-2 p-4 transition-all',
        rarity.border,
        rarity.bg,
        rarity.glow,
        title.isUnlocked ? 'cursor-pointer' : 'opacity-50',
        isEquipped && 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-zinc-900'
      )}
      onClick={title.isUnlocked ? onEquip : undefined}
      whileHover={title.isUnlocked ? { scale: 1.02 } : {}}
      whileTap={title.isUnlocked ? { scale: 0.98 } : {}}
    >
      {/* Locked overlay */}
      {!title.isUnlocked && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">{title.description}</p>
          </div>
        </div>
      )}

      {/* Equipped badge */}
      {isEquipped && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1 shadow-lg z-20">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Legendary sparkle */}
      {title.rarity === 'LEGENDARY' && title.isUnlocked && (
        <Sparkles className="absolute top-3 right-3 w-4 h-4 text-amber-400 animate-pulse" />
      )}

      {/* Preview */}
      <div className="flex items-center justify-between">
        <div>
          <TitleBadge title={title.name} color={title.isUnlocked ? title.color : 'text-zinc-600'} size="md" />
          <p className={cn('text-xs mt-2', rarity.text)}>{title.description}</p>
        </div>
        {title.isUnlocked && (
          <p className="text-xs text-zinc-500">
            {isEquipped ? 'Equipped' : 'Tap to equip'}
          </p>
        )}
      </div>
    </motion.div>
  );
}
