import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Coins, AlertCircle } from 'lucide-react';
import { gamesApi } from '@/services/api/games';
import { balanceApi } from '@/services/api/balance';
import { pageTransition } from '@/components/animations/variants';
import { ChipStack3D } from '../components/ChipStack3D';
import { cn, formatChips } from '@/lib/utils';

export function JoinGamePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [buyIn, setBuyIn] = useState(0);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fullCode = code.join('').toUpperCase();

  // Get user balance
  const { data: balanceData } = useQuery({
    queryKey: ['balance'],
    queryFn: () => balanceApi.getBalance(),
  });

  const balance = balanceData?.balance ?? 0;

  // Fetch game preview when code is complete
  const { data: gamePreview, error: previewError } = useQuery({
    queryKey: ['gamePreview', fullCode],
    queryFn: () => gamesApi.getByCode(fullCode),
    enabled: fullCode.length === 6,
    retry: false,
  });

  // Join game mutation
  const joinMutation = useMutation({
    mutationFn: () => gamesApi.join(fullCode, buyIn),
    onSuccess: (game) => {
      queryClient.invalidateQueries({ queryKey: ['activeGame'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      navigate(`/game/${game.id}`);
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to join game');
    },
  });

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const chars = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      const newCode = [...code];
      for (let i = 0; i < chars.length && index + i < 6; i++) {
        newCode[index + i] = chars[i];
      }
      setCode(newCode);
      const nextIndex = Math.min(index + chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const char = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const newCode = [...code];
      newCode[index] = char;
      setCode(newCode);
      if (char && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
    setError('');
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleJoin = () => {
    if (buyIn > balance) {
      setError('Insufficient balance');
      return;
    }
    joinMutation.mutate();
  };

  const buyInPresets = [0, 10, 25, 50, 100];

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen"
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
        <h1 className="text-2xl font-bold text-white">Join Game</h1>
        <p className="text-zinc-400 mt-1">Enter the 6-digit code to join</p>
      </div>

      <div className="px-6 space-y-6">
        {/* Code Input */}
        <div className="flex justify-center gap-2">
          {code.map((char, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              maxLength={6}
              value={char}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={cn(
                'w-12 h-14 text-center text-2xl font-mono font-bold',
                'bg-zinc-800/80 border-2 rounded-xl',
                'text-white placeholder-zinc-600',
                'focus:outline-none focus:border-emerald-500',
                'transition-colors',
                char ? 'border-zinc-600' : 'border-zinc-700'
              )}
              placeholder="·"
            />
          ))}
        </div>

        {/* Error */}
        <AnimatePresence>
          {(error || previewError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm">
                {error || 'Game not found or inactive'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Preview */}
        <AnimatePresence>
          {gamePreview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/5 rounded-2xl border border-white/10 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-zinc-400 text-sm">Game Found</p>
                  <h3 className="text-white text-lg font-bold">{gamePreview.name || 'Poker Night'}</h3>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{gamePreview.participants.length} players</span>
                </div>
              </div>

              <div className="text-sm text-zinc-500 mb-6">
                Host: <span className="text-zinc-300">{gamePreview.host.username}</span>
              </div>

              {/* Buy-in Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">Buy-in Amount</span>
                  <span className="text-zinc-500 text-sm">
                    Balance: {formatChips(balance)}
                  </span>
                </div>

                {/* 3D Chip Animation */}
                {buyIn > 0 && (
                  <ChipStack3D amount={buyIn} />
                )}

                {/* Buy-in presets */}
                <div className="flex gap-2">
                  {buyInPresets.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setBuyIn(amount)}
                      disabled={amount > balance}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                        buyIn === amount
                          ? 'bg-emerald-600 text-white'
                          : amount > balance
                          ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      )}
                    >
                      {amount === 0 ? 'Free' : `$${amount}`}
                    </button>
                  ))}
                </div>

                {/* Custom input */}
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="number"
                    value={buyIn || ''}
                    onChange={(e) => setBuyIn(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="Custom amount"
                    className={cn(
                      'w-full py-3 pl-12 pr-4 rounded-xl',
                      'bg-zinc-800 border border-zinc-700',
                      'text-white placeholder-zinc-500',
                      'focus:outline-none focus:border-emerald-500'
                    )}
                  />
                </div>

                {/* Join Button */}
                <button
                  onClick={handleJoin}
                  disabled={joinMutation.isPending || buyIn > balance}
                  className={cn(
                    'w-full py-4 rounded-xl font-semibold transition-colors',
                    buyIn > balance
                      ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  )}
                >
                  {joinMutation.isPending
                    ? 'Joining...'
                    : buyIn > 0
                    ? `Join with ${formatChips(buyIn)}`
                    : 'Join Game'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
