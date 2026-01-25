import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuthStore } from '@/stores/authStore';
import { usersApi, type ProfitDataPoint } from '@/services/api/users';
import { formatChips } from '@/lib/utils';
import { cn } from '@/lib/utils';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ProfitDataPoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const isPositive = data.netResult >= 0;

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-zinc-400 mb-1">
        {data.gameName || formatDate(data.date)}
      </p>
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-sm font-semibold",
          isPositive ? "text-emerald-400" : "text-red-400"
        )}>
          {isPositive ? '+' : ''}{formatChips(data.netResult)}
        </span>
        {isPositive ? (
          <TrendingUp className="w-3 h-3 text-emerald-400" />
        ) : (
          <TrendingDown className="w-3 h-3 text-red-400" />
        )}
      </div>
      <p className="text-xs text-zinc-500 mt-1">
        Total: {formatChips(data.cumulativeProfit)}
      </p>
    </div>
  );
}

export function ProfitChart() {
  const user = useAuthStore((state) => state.user);

  const { data: history, isLoading } = useQuery({
    queryKey: ['profitHistory', user?.id],
    queryFn: () => usersApi.getProfitHistory(user!.id, 30),
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 h-48 animate-pulse" />
    );
  }

  // Add starting point at 0
  const chartData = history && history.length > 0
    ? [{ date: '', gameName: null, netResult: 0, cumulativeProfit: 0 }, ...history]
    : [];

  const latestProfit = chartData.length > 1
    ? chartData[chartData.length - 1].cumulativeProfit
    : 0;

  const isPositive = latestProfit >= 0;

  if (chartData.length <= 1) {
    return (
      <motion.div
        className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <TrendingUp className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
        <p className="text-zinc-400 font-medium">No games yet</p>
        <p className="text-zinc-600 text-sm mt-1">Play some games to see your profit chart!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="rounded-2xl bg-white/5 border border-white/10 p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-400">Profit History</h3>
          <p className={cn(
            "text-xl font-bold",
            isPositive ? "text-emerald-400" : "text-red-400"
          )}>
            {isPositive ? '+' : ''}{formatChips(latestProfit)}
          </p>
        </div>
        <div className={cn(
          "p-2 rounded-lg",
          isPositive ? "bg-emerald-500/10" : "bg-red-500/10"
        )}>
          {isPositive ? (
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-400" />
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isPositive ? '#10b981' : '#ef4444'}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={isPositive ? '#10b981' : '#ef4444'}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={(value) => value ? formatDate(value) : ''}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 10 }}
              tickFormatter={(value) => formatChips(value)}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="cumulativeProfit"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              fill="url(#profitGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
