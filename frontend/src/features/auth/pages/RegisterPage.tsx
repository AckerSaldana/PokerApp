import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/services/api/auth';
import { useAuthStore } from '@/stores/authStore';
import { staggerContainer, staggerItem } from '@/components/animations/variants';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

// Floating card suit symbols
const cardSuits = [
  { symbol: '\u2660', x: '85%', y: '10%', delay: 0 },    // Spade
  { symbol: '\u2665', x: '10%', y: '20%', delay: 0.5, isRed: true },  // Heart
  { symbol: '\u2666', x: '90%', y: '70%', delay: 1, isRed: true },    // Diamond
  { symbol: '\u2663', x: '15%', y: '85%', delay: 1.5 },  // Club
];

export function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError('');
      const result = await authApi.register(data);
      login(result.user, result.accessToken, result.refreshToken);
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message || 'Registration failed');
    }
  };

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden bg-zinc-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating card suit symbols */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {cardSuits.map((suit, i) => (
          <motion.div
            key={i}
            className={`absolute text-6xl ${suit.isRed ? 'text-red-500/20' : 'text-zinc-800/30'}`}
            style={{ left: suit.x, top: suit.y }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, -5, 5, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 4 + i,
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
      <div className="relative flex flex-col justify-center min-h-screen px-6 py-12">
        <motion.div
          className="mx-auto w-full max-w-sm"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Premium logo */}
          <div className="flex flex-col items-center mb-10">
            <motion.div
              className="relative w-20 h-20 mb-6"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-amber-500 rounded-2xl blur-xl opacity-30" />

              {/* Logo container */}
              <div className="relative w-full h-full bg-gradient-to-br from-amber-500 to-amber-600
                              rounded-2xl flex items-center justify-center
                              shadow-2xl shadow-amber-600/30 border border-amber-400/20">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <motion.h1
              className="text-3xl font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Join the table
            </motion.h1>
            <motion.p
              className="text-zinc-400 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Create your poker account
            </motion.p>
          </div>

          {/* Form with staggered inputs */}
          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {error && (
              <motion.div
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <motion.div variants={staggerItem}>
              <Input
                {...register('email')}
                type="email"
                label="Email"
                placeholder="you@example.com"
                leftIcon={<Mail className="w-5 h-5" />}
                error={errors.email?.message}
              />
            </motion.div>

            <motion.div variants={staggerItem}>
              <Input
                {...register('username')}
                type="text"
                label="Username"
                placeholder="Choose a username"
                leftIcon={<User className="w-5 h-5" />}
                error={errors.username?.message}
              />
            </motion.div>

            <motion.div variants={staggerItem}>
              <Input
                {...register('password')}
                type="password"
                label="Password"
                placeholder="Create a password"
                leftIcon={<Lock className="w-5 h-5" />}
                error={errors.password?.message}
              />
            </motion.div>

            <motion.div variants={staggerItem}>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                variant="gold"
                isLoading={isSubmitting}
              >
                Create account
              </Button>
            </motion.div>
          </motion.form>

          <motion.p
            className="mt-8 text-center text-zinc-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
