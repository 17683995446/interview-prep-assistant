import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Question, Progress } from '@/types';
import { questions } from '@/data/questions';

type QuestionsState = {
  questions: Question[];
  progress: Record<string, Progress>;
  favorites: string[];
  filter: {
    category: string | null;
    difficulty: 'easy' | 'medium' | 'hard' | null;
    search: string;
  };
};

type QuestionsActions = {
  setFilter: (filter: Partial<QuestionsState['filter']>) => void;
  toggleFavorite: (questionId: string) => void;
  markCompleted: (questionId: string, timeSpent?: number, correct?: boolean) => void;
  incrementAttempts: (questionId: string) => void;
  resetProgress: () => void;
  getFilteredQuestions: () => Question[];
  getProgress: (questionId: string) => Progress | undefined;
  getCategoryStats: () => Record<string, { total: number; completed: number }>;
};

const initialState: QuestionsState = {
  questions,
  progress: {},
  favorites: [],
  filter: {
    category: null,
    difficulty: null,
    search: '',
  },
};

export const useQuestionsStore = create<QuestionsState & QuestionsActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setFilter: (filter) =>
        set((state) => ({
          filter: { ...state.filter, ...filter },
        })),

      toggleFavorite: (questionId) =>
        set((state) => ({
          favorites: state.favorites.includes(questionId)
            ? state.favorites.filter((id) => id !== questionId)
            : [...state.favorites, questionId],
        })),

      markCompleted: (questionId, timeSpent, correct) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [questionId]: {
              ...state.progress[questionId],
              completed: true,
              completedAt: new Date().toISOString(),
              lastAttempt: new Date().toISOString(),
              attempts: (state.progress[questionId]?.attempts || 0) + 1,
              timeSpent,
              correct,
            },
          },
        })),

      incrementAttempts: (questionId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [questionId]: {
              ...state.progress[questionId],
              attempts: (state.progress[questionId]?.attempts || 0) + 1,
              lastAttempt: new Date().toISOString(),
            },
          },
        })),

      resetProgress: () =>
        set(() => ({
          progress: {},
          favorites: [],
        })),

      getFilteredQuestions: () => {
        const { questions, filter } = get();
        return questions.filter((q) => {
          if (filter.category && q.category !== filter.category) return false;
          if (filter.difficulty && q.difficulty !== filter.difficulty) return false;
          if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            return (
              q.title.toLowerCase().includes(searchLower) ||
              q.description.toLowerCase().includes(searchLower) ||
              q.tags.some((tag) => tag.toLowerCase().includes(searchLower))
            );
          }
          return true;
        });
      },

      getProgress: (questionId) => get().progress[questionId],

      getCategoryStats: () => {
    const { questions, progress } = get();
    const stats = {
      algorithms: { total: 0, completed: 0 },
      'machine-learning': { total: 0, completed: 0 },
      'deep-learning': { total: 0, completed: 0 },
      'system-design': { total: 0, completed: 0 },
      'data-structures': { total: 0, completed: 0 },
      python: { total: 0, completed: 0 },
      sql: { total: 0, completed: 0 },
    } as Record<string, { total: number; completed: number }>;
    
    questions.forEach((q) => {
      if (stats[q.category]) {
        stats[q.category].total++;
        if (progress[q.id]?.completed) {
          stats[q.category].completed++;
        }
      }
    });
    
    return stats;
  },
    }),
    {
      name: 'questions-store',
      partialize: (state) => ({
        progress: state.progress,
        favorites: state.favorites,
      }),
    },
  ),
);
