import { Search, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SortOption } from '../hooks/useFilteredPlayers';

interface PlayerSearchInputProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

const sortOptions: { label: string; value: SortOption }[] = [
  { label: 'Name A-Z', value: 'name-asc' },
  { label: 'Name Z-A', value: 'name-desc' },
  { label: 'Balance: High', value: 'balance-high' },
  { label: 'Balance: Low', value: 'balance-low' },
];

export function PlayerSearchInput({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
}: PlayerSearchInputProps) {
  return (
    <div className="flex gap-2 mb-4">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            'w-full pl-10 pr-10 py-2.5 rounded-xl',
            'bg-zinc-900/80 border border-zinc-800',
            'text-white placeholder:text-zinc-500',
            'focus:outline-none focus:border-emerald-500/50',
            'transition-colors duration-200'
          )}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
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
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className={cn(
            'appearance-none pl-3 pr-8 py-2.5 rounded-xl',
            'bg-zinc-900/80 border border-zinc-800',
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
  );
}
