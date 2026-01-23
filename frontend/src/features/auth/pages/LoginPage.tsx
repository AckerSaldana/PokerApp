import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/services/api/auth';
import { useAuthStore } from '@/stores/authStore';
import { staggerContainer, staggerItem } from '@/components/animations/variants';
import { FallingCards3D } from '@/components/effects/FallingCards3D';
import { PixelCard } from '@/components/effects/PixelCard';
import type { Suit, Value } from '@/components/effects/pixelCardTexture';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      const result = await authApi.login(data);
      login(result.user, result.accessToken, result.refreshToken);
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message || 'Login failed');
    }
  };

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden bg-[var(--bg-app)] flex flex-col justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 3D Falling Cards Background */}
      <FallingCards3D className="absolute inset-0 opacity-40" cardCount={12} />

      {/* Background Texture & Effects */}
      <div className="absolute inset-0 felt-texture opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-emerald-950)] to-black/80 pointer-events-none" />

      {/* Animated Light Beams */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[500px] bg-[var(--color-emerald-500)]/20 blur-[100px] rounded-full opacity-50 pointer-events-none" />

      {/* Content */}
      <div className="relative w-full max-w-sm mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Poker Hand Logo */}
          <div className="flex flex-col items-center mb-12">
            <div className="relative flex items-end justify-center h-28 mb-6">
              {/* Glow effect under cards */}
              <motion.div
                className="absolute bottom-0 w-40 h-12 bg-[var(--color-gold-500)]/20 blur-xl rounded-full"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 0.6, 0.4], scale: [0.5, 1.1, 1] }}
                transition={{ duration: 1.5, delay: 0.8, times: [0, 0.6, 1] }}
              />

              {([
                { suit: 'spades' as Suit, value: '10' as Value, rotate: -24, x: -40, floatDelay: 0 },
                { suit: 'spades' as Suit, value: 'J' as Value, rotate: -12, x: -20, floatDelay: 0.3 },
                { suit: 'spades' as Suit, value: 'Q' as Value, rotate: 0, x: 0, floatDelay: 0.6 },
                { suit: 'spades' as Suit, value: 'K' as Value, rotate: 12, x: 20, floatDelay: 0.9 },
                { suit: 'spades' as Suit, value: 'A' as Value, rotate: 24, x: 40, floatDelay: 1.2 },
              ]).map((card, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ x: 0, y: 80, opacity: 0, rotate: 0, scale: 0.6 }}
                  animate={{
                    x: card.x,
                    y: [0, -4, 0],
                    opacity: 1,
                    rotate: 0,
                    scale: 1,
                  }}
                  transition={{
                    x: { type: 'spring', stiffness: 120, damping: 14, delay: 0.4 + i * 0.1 },
                    y: {
                      delay: 1.2 + card.floatDelay,
                      duration: 2.5,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                    },
                    opacity: { duration: 0.3, delay: 0.3 + i * 0.1 },
                    scale: { type: 'spring', stiffness: 150, damping: 12, delay: 0.4 + i * 0.1 },
                  }}
                >
                  <PixelCard suit={card.suit} value={card.value} rotateZ={card.rotate} size={40} />
                </motion.div>
              ))}
            </div>

            <motion.h1
              className="text-4xl font-display font-bold text-white text-center tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-gold-300)] to-[var(--color-gold-500)]">Back</span>
            </motion.h1>
            <motion.p
              className="text-[var(--text-secondary)] mt-3 text-center text-sm tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Your seat at the table is waiting.
            </motion.p>
          </div>

          {/* Login Form */}
          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {error && (
              <motion.div
                className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-200 text-sm text-center backdrop-blur-sm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                {error}
              </motion.div>
            )}

            <motion.div variants={staggerItem}>
              <Input
                {...register('email')}
                type="email"
                label="Email"
                placeholder="vip@pokerapp.com"
                leftIcon={<Mail className="w-5 h-5" />}
                error={errors.email?.message}
                className="bg-[var(--bg-surface)] border-[var(--glass-border)] focus:border-[var(--color-gold-500)]/50 transition-all"
              />
            </motion.div>

            <motion.div variants={staggerItem}>
              <Input
                {...register('password')}
                type="password"
                label="Password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-5 h-5" />}
                error={errors.password?.message}
                className="bg-[var(--bg-surface)] border-[var(--glass-border)] focus:border-[var(--color-gold-500)]/50 transition-all"
              />
            </motion.div>

            <motion.div variants={staggerItem} className="pt-2">
              <Button
                type="submit"
                variant="gold"
                className="w-full h-12 text-base shadow-[0_10px_20px_rgba(245,158,11,0.15)]"
                isLoading={isSubmitting}
              >
                Sign In
              </Button>
            </motion.div>
          </motion.form>

          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-[var(--text-muted)] text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-[var(--color-gold-400)] font-semibold hover:text-[var(--color-gold-300)] transition-colors underline decoration-[var(--color-gold-400)]/30 underline-offset-4">
                Join the Club
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
