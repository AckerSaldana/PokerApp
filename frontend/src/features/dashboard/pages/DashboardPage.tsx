import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { ChipBalanceCard } from '../components/ChipBalanceCard';
import { QuickStats } from '../components/QuickStats';
import { pageTransition } from '@/components/animations/variants';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <PageHeader
        title={`Hey, ${user?.username || 'Player'}`}
        subtitle="Ready for poker night?"
      />

      <div className="px-6 space-y-8">
        <ChipBalanceCard />
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-widest pl-1 mb-4">Performance</h2>
          <QuickStats />
        </div>
      </div>
    </motion.div>
  );
}
