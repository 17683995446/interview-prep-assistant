import { useState, useEffect, useCallback } from 'react';
import { Filter } from 'lucide-react';
import ParticlesBackground from '@/components/ParticlesBackground';
import QuestionCard from '@/components/QuestionCard';
import FilterBar from '@/components/FilterBar';
import { QuestionCardSkeleton } from '@/components/Skeleton';
import { useAppStore, useFilteredQuestions } from '@/store';
import { useDebounce } from '@/hooks/useDebounce';

export default function Questions() {
  const { currentFilter, setFilter } = useAppStore();
  const questions = useFilteredQuestions();
  const [localSearch, setLocalSearch] = useState(currentFilter.search);
  const [isLoading, setIsLoading] = useState(true);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setFilter({ search: debouncedSearch });
  }, [debouncedSearch, setFilter]);

  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value);
  }, []);

  const handleCategoryChange = useCallback((value: string | null) => {
    setFilter({ category: value });
  }, [setFilter]);

  const handleDifficultyChange = useCallback((value: string | null) => {
    setFilter({ difficulty: value });
  }, [setFilter]);

  return (
    <div className="min-h-screen relative">
      <ParticlesBackground />
      
      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              题目列表
            </h1>
            <p className="text-gray-400">
              共 {questions.length} 道题目
            </p>
          </div>

          <FilterBar
            searchQuery={localSearch}
            onSearchChange={handleSearchChange}
            categoryFilter={currentFilter.category}
            onCategoryChange={handleCategoryChange}
            difficultyFilter={currentFilter.difficulty}
            onDifficultyChange={handleDifficultyChange}
          />

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <QuestionCardSkeleton key={i} />
              ))}
            </div>
          ) : questions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  searchQuery={localSearch}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass-effect rounded-2xl border border-white/10">
              <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">暂无题目</h3>
              <p className="text-gray-500">尝试调整筛选条件</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
