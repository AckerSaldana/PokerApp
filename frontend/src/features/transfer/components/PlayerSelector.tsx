import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useFilteredPlayers } from '../hooks/useFilteredPlayers';
import { PlayerSearchInput } from './PlayerSearchInput';
import { PlayerCard } from './PlayerCard';
import type { User } from '@/lib/types';

interface PlayerSelectorProps {
  users: User[];
  selectedUser: User | null;
  onSelect: (user: User) => void;
  currentUserId: string | undefined;
}

export function PlayerSelector({ users, selectedUser, onSelect, currentUserId }: PlayerSelectorProps) {
  const {
    filteredUsers,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
  } = useFilteredPlayers({ users, currentUserId });

  return (
    <div>
      <p className="text-sm text-zinc-400 mb-3 uppercase tracking-wider">Select recipient</p>

      <PlayerSearchInput
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredUsers.map((user, i) => (
            <PlayerCard
              key={user.id}
              user={user}
              isSelected={selectedUser?.id === user.id}
              onSelect={() => onSelect(user)}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
