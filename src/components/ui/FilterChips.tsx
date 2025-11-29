import React from 'react';

interface FilterChipsProps {
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({ filters, activeFilter, onFilterChange }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeFilter === filter
              ? 'bg-primary text-white shadow-sm'
              : 'bg-white text-text-main border border-border-soft hover:border-primary'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

