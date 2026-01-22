import { motion } from 'framer-motion';
import { Users, Search, X, ChevronDown } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Avatar } from '@/components/ui/Avatar';
import { useFilteredPlayers, type SortOption } from '../hooks/useFilteredPlayers';
import { formatChips, cn } from '@/lib/utils';
import type { User } from '@/lib/types';

const sortOptions: { label: string; value: SortOption }[] = [
  { label: 'Name A-Z', value: 'name-asc' },
  { label: 'Name Z-A', value: 'name-desc' },
  { label: 'Balance: High', value: 'balance-high' },
  { label: 'Balance: Low', value: 'balance-low' },
];

interface PlayerSelectorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  selectedUser: User | null;
  onSelect: (user: User) => void;
  currentUserId: string | undefined;
}

export function PlayerSelectorSheet({
  isOpen,
  onClose,
  users,
  selectedUser,
  onSelect,
  currentUserId,
}: PlayerSelectorSheetProps) {
  const {
    filteredUsers,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
  } = useFilteredPlayers({ users, currentUserId });

  const handleSelect = (user: User) => {
    onSelect(user);
    onClose();
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center pb-2">
          <h2 className="text-xl font-bold text-white">Select Recipient</h2>
          <p className="text-zinc-400 text-sm mt-1">Choose who to send chips to</p>
        </div>

        {/* Search and Sort */}
        <div className="flex gap-2">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-10 pr-10 py-3 rounded-xl',
                'bg-zinc-800/80 border border-zinc-700',
                'text-white placeholder:text-zinc-500',
                'focus:outline-none focus:border-emerald-500/50',
                'transition-colors duration-200'
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-700 transition-colors"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className={cn(
                'appearance-none h-full pl-3 pr-8 rounded-xl',
                'bg-zinc-800/80 border border-zinc-700',
                'text-white text-sm',
                'focus:outline-none focus:border-emerald-500/50',
                'transition-colors duration-200 cursor-pointer'
              )}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        {/* Player count */}
        <p className="text-xs text-zinc-500 px-1">
          {filteredUsers.length} player{filteredUsers.length !== 1 ? 's' : ''} found
        </p>

        {/* Players list */}
        {filteredUsers.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-zinc-800/50 flex items-center justify-center">
              <Users className="w-6 h-6 text-zinc-600" />
            </div>
            <p className="text-zinc-400 text-sm">
              {searchQuery ? 'No players found' : 'No other players yet'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-emerald-400 text-sm mt-2 hover:underline"
              >
                Clear search
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pb-20">
            {filteredUsers.map((user, index) => (
              <motion.button
                key={user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => handleSelect(user)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl',
                  'border transition-all duration-200',
                  selectedUser?.id === user.id
                    ? 'bg-emerald-600/20 border-emerald-500'
                    : 'bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800'
                )}
              >
                <Avatar
                  src={user.avatarData || undefined}
                  name={user.username}
                  size="md"
                  className={cn(selectedUser?.id === user.id && 'ring-2 ring-emerald-500')}
                />
                <div className="flex-1 text-left">
                  <p className="text-white font-medium">{user.username}</p>
                  <p className={cn(
                    'text-sm font-display tabular-nums',
                    user.chipBalance >= 0 ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {formatChips(user.chipBalance)} chips
                  </p>
                </div>
                {selectedUser?.id === user.id && (
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </Sheet>
  );
}
