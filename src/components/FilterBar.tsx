import { Search } from 'lucide-react';
import { categories } from '@/data/questions';
import { useCallback, memo } from 'react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string | null;
  onCategoryChange: (value: string | null) => void;
  difficultyFilter: string | null;
  onDifficultyChange: (value: string | null) => void;
}

const FilterBar = memo(({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  difficultyFilter,
  onDifficultyChange
}: FilterBarProps) => {
  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onCategoryChange(e.target.value || null);
  }, [onCategoryChange]);

  const handleDifficultyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onDifficultyChange(e.target.value || null);
  }, [onDifficultyChange]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  return (
    <div className="glass-effect rounded-2xl p-6 border border-white/10 mb-8 fade-in">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="搜索题目..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/30 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <select
            value={categoryFilter || ''}
            onChange={handleCategoryChange}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/30 transition-colors"
          >
            <option value="">全部分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={difficultyFilter || ''}
            onChange={handleDifficultyChange}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/30 transition-colors"
          >
            <option value="">全部难度</option>
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
      </div>
    </div>
  );
});

FilterBar.displayName = 'FilterBar';

export default FilterBar;
