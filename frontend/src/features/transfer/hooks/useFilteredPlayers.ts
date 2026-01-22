import { useMemo, useState } from 'react';
import type { User } from '@/lib/types';

export type SortOption = 'name-asc' | 'name-desc' | 'balance-high' | 'balance-low';

interface UseFilteredPlayersOptions {
  users: User[];
  currentUserId: string | undefined;
}

interface UseFilteredPlayersResult {
  filteredUsers: User[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
}

export function useFilteredPlayers({ users, currentUserId }: UseFilteredPlayersOptions): UseFilteredPlayersResult {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');

  const filteredUsers = useMemo(() => {
    // Filter out current user
    let result = users.filter((u) => u.id !== currentUserId);

    // Apply search filter (case-insensitive)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((u) => u.username.toLowerCase().includes(query));
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.username.localeCompare(b.username);
        case 'name-desc':
          return b.username.localeCompare(a.username);
        case 'balance-high':
          return b.chipBalance - a.chipBalance;
        case 'balance-low':
          return a.chipBalance - b.chipBalance;
        default:
          return 0;
      }
    });

    return result;
  }, [users, currentUserId, searchQuery, sortOption]);

  return {
    filteredUsers,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
  };
}
