import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { ChipBalanceCard } from '../components/ChipBalanceCard';
import { QuickStats } from '../components/QuickStats';
import { pageTransition } from '@/components/animations/variants';
import { Skeleton } from '@/components/ui/Skeleton';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  // Build the greeting - show skeleton while loading
  const greeting = isLoading ? null : `Hey, ${user?.username || 'Player'}`;

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {isLoading ? (
        <div className="px-6 py-6">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      ) : (
        <PageHeader
          title={greeting!}
          subtitle="Ready for poker night?"
        />
      )}

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
