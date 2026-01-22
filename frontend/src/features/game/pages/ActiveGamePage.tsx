import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Users, Plus, X, Crown } from 'lucide-react';
import { gamesApi } from '@/services/api/games';
import { usersApi } from '@/services/api/users';
import { useAuthStore } from '@/stores/authStore';
import { pageTransition, staggerContainer, staggerItem } from '@/components/animations/variants';
import { ParticipantRow } from '../components/ParticipantRow';
import { RebuyModal } from '../components/RebuyModal';
import { CloseGameModal } from '../components/CloseGameModal';
import { cn, formatChips } from '@/lib/utils';

export function ActiveGamePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [copiedCode, setCopiedCode] = useState(false);
  const [showRebuyModal, setShowRebuyModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Fetch game details
  const { data: game, isLoading, isError, error } = useQuery({
    queryKey: ['game', id],
    queryFn: () => gamesApi.getById(id!),
    enabled: !!id,
    refetchInterval: (query) => query.state.data?.isActive ? 5000 : false,
    retry: 1,
  });

  // Get user balance
  const { data: balanceData } = useQuery({
    queryKey: ['balance', user?.id],
    queryFn: () => usersApi.getBalance(user!.id),
    enabled: !!user?.id,
  });

  const balance = balanceData?.balance || 0;
  const isHost = game?.hostId === user?.id;
  const myParticipation = game?.participants.find((p) => p.userId === user?.id);

  // Rebuy mutation
  const rebuyMutation = useMutation({
    mutationFn: (amount: number) => gamesApi.rebuy(id!, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', id] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      setShowRebuyModal(false);
    },
  });

  // Leave game mutation
  const leaveMutation = useMutation({
    mutationFn: () => gamesApi.leave(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeGame'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      navigate('/game');
    },
  });

  const handleCopyCode = async () => {
    if (game?.joinCode) {
      await navigator.clipboard.writeText(game.joinCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">{isError ? 'Failed to load game' : 'Game not found'}</p>
          {isError && <p className="text-zinc-600 text-sm mt-1">{(error as Error)?.message}</p>}
          <button
            onClick={() => navigate('/game')}
            className="mt-4 text-emerald-400 hover:text-emerald-300"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  const totalPot = game.participants.reduce((sum, p) => sum + p.buyIn, 0);

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen pb-24"
    >
      {/* Header */}
      <div className="px-6 py-6">
        <button
          onClick={() => navigate('/game')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{game.name || 'Poker Night'}</h1>
              {game.isActive && (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                  Live
                </span>
              )}
            </div>
            <p className="text-zinc-400 mt-1">
              Hosted by {game.host.username}
              {isHost && <span className="text-emerald-400"> (You)</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Join Code (if active) */}
        {game.isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-500 text-xs mb-1">Join Code</p>
                <span className="text-white text-xl font-mono font-bold tracking-widest">
                  {game.joinCode}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-3 rounded-xl bg-zinc-700/50 hover:bg-zinc-700 transition-colors"
              >
                {copiedCode ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Copy className="w-5 h-5 text-zinc-400" />
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Players</span>
            </div>
            <p className="text-2xl font-bold text-white">{game.participants.length}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <span className="text-xs">Total Pot</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{formatChips(totalPot)}</p>
          </div>
        </div>

        {/* Participants */}
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
            Players
          </h2>
          <motion.div
            className="space-y-2"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {game.participants.map((participant) => (
              <motion.div key={participant.id} variants={staggerItem}>
                <ParticipantRow
                  participant={participant}
                  isHost={participant.userId === game.hostId}
                  isCurrentUser={participant.userId === user?.id}
                  gameActive={game.isActive}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* My Buy-in (if in game and active) */}
        {myParticipation && game.isActive && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-500 text-sm">Your Buy-in</p>
                <p className="text-xl font-bold text-white">{formatChips(myParticipation.buyIn)}</p>
              </div>
              <button
                onClick={() => setShowRebuyModal(true)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl',
                  'bg-emerald-600 hover:bg-emerald-500',
                  'text-white font-medium transition-colors'
                )}
              >
                <Plus className="w-4 h-4" />
                Rebuy
              </button>
            </div>
          </div>
        )}

        {/* Game Results (if closed) */}
        {!game.isActive && myParticipation && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-zinc-500 text-sm mb-2">Your Result</p>
            <div className="flex items-baseline gap-2">
              <p
                className={cn(
                  'text-2xl font-bold',
                  myParticipation.netResult >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}
              >
                {myParticipation.netResult >= 0 ? '+' : ''}
                {formatChips(myParticipation.netResult)}
              </p>
            </div>
            <div className="flex gap-4 mt-2 text-sm text-zinc-500">
              <span>Buy-in: {formatChips(myParticipation.buyIn)}</span>
              <span>Cash-out: {formatChips(myParticipation.cashOut)}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        {game.isActive && (
          <div className="space-y-3">
            {isHost && (
              <button
                onClick={() => setShowCloseModal(true)}
                className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors"
              >
                End Game
              </button>
            )}
            {!isHost && (
              <button
                onClick={() => leaveMutation.mutate()}
                disabled={leaveMutation.isPending}
                className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-colors"
              >
                {leaveMutation.isPending ? 'Leaving...' : 'Leave Game'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <RebuyModal
        isOpen={showRebuyModal}
        onClose={() => setShowRebuyModal(false)}
        onConfirm={(amount) => rebuyMutation.mutate(amount)}
        balance={balance}
        isPending={rebuyMutation.isPending}
      />

      <CloseGameModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        game={game}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['game', id] });
          queryClient.invalidateQueries({ queryKey: ['balance'] });
          setShowCloseModal(false);
        }}
      />
    </motion.div>
  );
}
