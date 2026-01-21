import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Spade } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/services/api/auth';
import { useAuthStore } from '@/stores/authStore';
import { staggerContainer, staggerItem } from '@/components/animations/variants';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

// Floating card suit symbols
const cardSuits = [
  { symbol: '\u2660', x: '15%', y: '10%', delay: 0 },    // Spade
  { symbol: '\u2665', x: '85%', y: '15%', delay: 0.5, isRed: true },  // Heart
  { symbol: '\u2666', x: '10%', y: '75%', delay: 1, isRed: true },    // Diamond
  { symbol: '\u2663', x: '80%', y: '80%', delay: 1.5 },  // Club
];

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
      {/* Background Texture & Effects */}
      <div className="absolute inset-0 felt-texture opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-emerald-950)] to-black/80 pointer-events-none" />
      
      {/* Animated Light Beams */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[500px] bg-[var(--color-emerald-500)]/20 blur-[100px] rounded-full opacity-50 pointer-events-none" />

      {/* Floating card suit symbols */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {cardSuits.map((suit, i) => (
          <motion.div
            key={i}
            className={`absolute text-6xl font-display ${suit.isRed ? 'text-[var(--color-card-red)]/10' : 'text-zinc-800/30'}`}
            style={{ left: suit.x, top: suit.y }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: suit.delay,
              ease: 'easeInOut'
            }}
          >
            {suit.symbol}
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative w-full max-w-sm mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-12">
            <motion.div
              className="relative w-24 h-24 mb-6"
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-[var(--color-gold-500)] rounded-[2rem] blur-2xl opacity-20 animate-pulse" />
              <div className="relative w-full h-full bg-gradient-to-br from-[var(--color-emerald-800)] to-[var(--color-emerald-950)]
                              rounded-[2rem] flex items-center justify-center
                              shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-[var(--color-gold-500)]/30">
                <div className="absolute inset-0 rounded-[2rem] border border-[var(--color-emerald-500)]/20 pointer-events-none" />
                <Spade className="w-12 h-12 text-[var(--color-gold-400)] drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]" />
              </div>
            </motion.div>

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
