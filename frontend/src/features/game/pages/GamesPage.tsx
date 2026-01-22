import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, History, Copy, Check } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { gamesApi } from '@/services/api/games';
import { pageTransition, staggerContainer, staggerItem } from '@/components/animations/variants';
import { GameCard } from '../components/GameCard';
import { cn } from '@/lib/utils';

export function GamesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copiedCode, setCopiedCode] = useState(false);

  // Check for active game
  const { data: activeGame, isLoading: loadingActive } = useQuery({
    queryKey: ['activeGame'],
    queryFn: () => gamesApi.getActive(),
    staleTime: 10_000,
  });

  // Get game history
  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ['myGames'],
    queryFn: () => gamesApi.getMyGames(1, 5),
    staleTime: 30_000,
  });

  // Create game mutation
  const createGameMutation = useMutation({
    mutationFn: () => gamesApi.create({ name: 'Poker Night' }),
    onSuccess: (game) => {
      queryClient.invalidateQueries({ queryKey: ['activeGame'] });
      navigate(`/game/${game.id}`);
    },
    onError: (error) => {
      console.error('Failed to create game:', error);
    },
  });

  const handleCopyCode = async () => {
    if (activeGame?.joinCode) {
      await navigator.clipboard.writeText(activeGame.joinCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const recentGames = historyData?.games?.filter(g => !g.isActive).slice(0, 5) || [];

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <PageHeader title="Game" subtitle="Start or join a poker night" />

      <div className="px-6 space-y-6">
        {/* Active Game Card */}
        {activeGame && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-5 border border-emerald-500/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Active Game</p>
                <h3 className="text-white text-xl font-bold">{activeGame.name || 'Poker Night'}</h3>
              </div>
              <div className="flex items-center gap-2 text-emerald-100">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{activeGame.participants.length}</span>
              </div>
            </div>

            {/* Join Code */}
            <div className="bg-black/20 rounded-xl p-3 mb-4">
              <p className="text-emerald-200 text-xs mb-1">Join Code</p>
              <div className="flex items-center justify-between">
                <span className="text-white text-2xl font-mono font-bold tracking-widest">
                  {activeGame.joinCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {copiedCode ? (
                    <Check className="w-5 h-5 text-emerald-300" />
                  ) : (
                    <Copy className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate(`/game/${activeGame.id}`)}
              className="w-full py-3 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
            >
              View Game
            </button>
          </motion.div>
        )}

        {/* Action Buttons */}
        {!activeGame && (
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => createGameMutation.mutate()}
              disabled={createGameMutation.isPending}
              className={cn(
                'flex flex-col items-center gap-2 p-5 rounded-2xl',
                'bg-emerald-600 hover:bg-emerald-500',
                'border border-emerald-500/50',
                'transition-colors'
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-semibold">
                {createGameMutation.isPending ? 'Creating...' : 'Start Game'}
              </span>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              onClick={() => navigate('/game/join')}
              className={cn(
                'flex flex-col items-center gap-2 p-5 rounded-2xl',
                'bg-white/5 hover:bg-white/10',
                'border border-white/10',
                'transition-colors'
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-semibold">Join Game</span>
            </motion.button>
          </div>
        )}

        {/* Recent Games */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
              Recent Games
            </h2>
            {recentGames.length > 0 && (
              <button
                onClick={() => navigate('/history')}
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                View All
              </button>
            )}
          </div>

          {loadingHistory ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentGames.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white/5 rounded-2xl border border-white/10"
            >
              <History className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 font-medium">No games yet</p>
              <p className="text-zinc-600 text-sm mt-1">Start your first poker night!</p>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-3"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {recentGames.map((game) => (
                <motion.div key={game.id} variants={staggerItem}>
                  <GameCard game={game} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
