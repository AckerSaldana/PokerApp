import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Users, Plus } from 'lucide-react';
import { gamesApi } from '@/services/api/games';
import { balanceApi } from '@/services/api/balance';
import { useAuthStore } from '@/stores/authStore';
import { pageTransition } from '@/components/animations/variants';
import { ParticipantRow } from '../components/ParticipantRow';
import { RebuyModal } from '../components/RebuyModal';
import { CloseGameModal } from '../components/CloseGameModal';
import { EarlyCashOutModal } from '../components/EarlyCashOutModal';
import { PlayerProfileSheet } from '@/features/profile/components/PlayerProfileSheet';
import { GameNotificationChecker } from '../components/GameNotificationChecker';
import { cn, formatChips } from '@/lib/utils';
import type { GameParticipant } from '@/lib/types';

export function ActiveGamePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [copiedCode, setCopiedCode] = useState(false);
  const [showRebuyModal, setShowRebuyModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showEarlyCashOutModal, setShowEarlyCashOutModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<GameParticipant | null>(null);
  const [selectedPlayerProfile, setSelectedPlayerProfile] = useState<{ id: string; name: string } | null>(null);

  const handlePlayerTap = (playerId: string, playerName: string) => {
    setSelectedPlayerProfile({ id: playerId, name: playerName });
  };

  // Fetch game details with real-time polling
  const { data: game, isLoading, isError, error } = useQuery({
    queryKey: ['game', id],
    queryFn: () => gamesApi.getById(id!),
    enabled: !!id,
    refetchInterval: (query) => query.state.data?.isActive ? 3000 : false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
    retry: 1,
  });

  // Get user balance
  const { data: balanceData } = useQuery({
    queryKey: ['balance'],
    queryFn: () => balanceApi.getBalance(),
  });

  const balance = balanceData?.balance ?? 0;
  const isHost = game?.hostId === user?.id;
  const myParticipation = game?.participants.find((p) => p.userId === user?.id);
  const amICashedOut = !!myParticipation?.cashedOutAt;
  const haveIRequestedLeave = !!myParticipation?.leaveRequestedAt && !amICashedOut;

  // Rebuy mutation
  const rebuyMutation = useMutation({
    mutationFn: (amount: number) => gamesApi.rebuy(id!, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', id] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      setShowRebuyModal(false);
    },
  });

  // Request leave mutation
  const requestLeaveMutation = useMutation({
    mutationFn: () => gamesApi.requestLeave(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', id] });
    },
  });

  // Early cash-out mutation
  const earlyCashOutMutation = useMutation({
    mutationFn: ({ participantUserId, cashOut }: { participantUserId: string; cashOut: number }) =>
      gamesApi.earlyCashOut(id!, participantUserId, cashOut),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', id] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      setShowEarlyCashOutModal(false);
      setSelectedParticipant(null);
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

  // Calculate available pot (for early cash-outs)
  const totalEarlyCashOuts = game.participants
    .filter((p) => p.cashedOutAt)
    .reduce((sum, p) => sum + p.cashOut, 0);
  const availablePot = totalPot - totalEarlyCashOuts;

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
              <span className="text-xs">{totalEarlyCashOuts > 0 ? 'Remaining Pot' : 'Total Pot'}</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{formatChips(availablePot)}</p>
            {totalEarlyCashOuts > 0 && (
              <p className="text-xs text-zinc-500 mt-1">
                {formatChips(totalEarlyCashOuts)} cashed out
              </p>
            )}
          </div>
        </div>

        {/* Participants */}
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
            Players
          </h2>
          <div className="space-y-2">
            {game.participants.map((participant) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ParticipantRow
                  participant={participant}
                  isHost={participant.userId === game.hostId}
                  isCurrentUser={participant.userId === user?.id}
                  gameActive={game.isActive}
                  showCashOutButton={
                    isHost &&
                    participant.userId !== user?.id &&
                    !participant.cashedOutAt
                  }
                  onCashOut={() => {
                    setSelectedParticipant(participant);
                    setShowEarlyCashOutModal(true);
                  }}
                  onPlayerTap={handlePlayerTap}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* My Buy-in (if in game, active, and NOT cashed out) */}
        {myParticipation && game.isActive && !amICashedOut && (
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

        {/* Game Results (if closed OR if cashed out early) */}
        {((!game.isActive && myParticipation) || amICashedOut) && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-zinc-500 text-sm mb-2">
              {amICashedOut && game.isActive ? 'You Cashed Out' : 'Your Result'}
            </p>
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

        {/* Leave Request Waiting State */}
        {haveIRequestedLeave && game.isActive && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <p className="text-amber-400 text-sm">
              Leave requested. Waiting for host to cash you out.
            </p>
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
            {!isHost && !amICashedOut && !haveIRequestedLeave && (
              <button
                onClick={() => requestLeaveMutation.mutate()}
                disabled={requestLeaveMutation.isPending}
                className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-colors"
              >
                {requestLeaveMutation.isPending ? 'Requesting...' : 'Request Leave'}
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
          queryClient.invalidateQueries({ queryKey: ['myGames'] });
          queryClient.invalidateQueries({ queryKey: ['activeGame'] });
          queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
          setShowCloseModal(false);
        }}
      />

      <EarlyCashOutModal
        isOpen={showEarlyCashOutModal}
        onClose={() => {
          setShowEarlyCashOutModal(false);
          setSelectedParticipant(null);
        }}
        onConfirm={(amount) => {
          if (selectedParticipant) {
            earlyCashOutMutation.mutate({
              participantUserId: selectedParticipant.userId,
              cashOut: amount,
            });
          }
        }}
        participant={selectedParticipant}
        availablePot={availablePot}
        isPending={earlyCashOutMutation.isPending}
      />

      {/* Player Profile Sheet */}
      <PlayerProfileSheet
        isOpen={!!selectedPlayerProfile}
        onClose={() => setSelectedPlayerProfile(null)}
        playerId={selectedPlayerProfile?.id || null}
        playerName={selectedPlayerProfile?.name}
      />

      {/* Game Notifications */}
      <GameNotificationChecker
        game={game}
        userId={user?.id}
        isHost={isHost}
      />
    </motion.div>
  );
}
