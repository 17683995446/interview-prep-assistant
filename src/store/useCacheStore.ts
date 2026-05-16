import { create } from 'zustand';

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

type CacheState = {
  codeExecutionResults: Map<string, CacheEntry<unknown>>;
  questionDetails: Map<string, CacheEntry<unknown>>;
  searchResults: Map<string, CacheEntry<unknown[]>>;
};

type CacheActions = {
  setCodeExecutionResult: (key: string, data: unknown, ttl?: number) => void;
  getCodeExecutionResult: <T>(key: string) => T | null;
  setQuestionDetails: (questionId: string, data: unknown, ttl?: number) => void;
  getQuestionDetails: <T>(questionId: string) => T | null;
  setSearchResults: (query: string, data: unknown[], ttl?: number) => void;
  getSearchResults: <T>(query: string) => T[] | null;
  clearExpired: () => void;
  clearAll: () => void;
};

const DEFAULT_TTL = 5 * 60 * 1000; // 5分钟

const initialState: CacheState = {
  codeExecutionResults: new Map(),
  questionDetails: new Map(),
  searchResults: new Map(),
};

export const useCacheStore = create<CacheState & CacheActions>()((set, get) => ({
  ...initialState,

  setCodeExecutionResult: (key, data, ttl = DEFAULT_TTL) =>
    set((state) => ({
      codeExecutionResults: new Map(state.codeExecutionResults).set(key, {
        data,
        timestamp: Date.now(),
        ttl,
      }),
    })),

  getCodeExecutionResult: <T>(key: string): T | null => {
    const entry = get().codeExecutionResults.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      set((state) => {
        const newMap = new Map(state.codeExecutionResults);
        newMap.delete(key);
        return { codeExecutionResults: newMap };
      });
      return null;
    }
    return entry.data;
  },

  setQuestionDetails: (questionId, data, ttl = DEFAULT_TTL * 6) =>
    set((state) => ({
      questionDetails: new Map(state.questionDetails).set(questionId, {
        data,
        timestamp: Date.now(),
        ttl,
      }),
    })),

  getQuestionDetails: <T>(questionId: string): T | null => {
    const entry = get().questionDetails.get(questionId) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      set((state) => {
        const newMap = new Map(state.questionDetails);
        newMap.delete(questionId);
        return { questionDetails: newMap };
      });
      return null;
    }
    return entry.data;
  },

  setSearchResults: (query, data, ttl = DEFAULT_TTL * 2) =>
    set((state) => ({
      searchResults: new Map(state.searchResults).set(query, {
        data,
        timestamp: Date.now(),
        ttl,
      }),
    })),

  getSearchResults: <T>(query: string): T[] | null => {
    const entry = get().searchResults.get(query) as CacheEntry<T[]> | undefined;
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      set((state) => {
        const newMap = new Map(state.searchResults);
        newMap.delete(query);
        return { searchResults: newMap };
      });
      return null;
    }
    return entry.data;
  },

  clearExpired: () =>
    set((state) => {
      const now = Date.now();
      const prune = <T>(map: Map<string, CacheEntry<T>>) => {
        const newMap = new Map(map);
        newMap.forEach((entry, key) => {
          if (now - entry.timestamp > entry.ttl) {
            newMap.delete(key);
          }
        });
        return newMap;
      };
      return {
        codeExecutionResults: prune(state.codeExecutionResults),
        questionDetails: prune(state.questionDetails),
        searchResults: prune(state.searchResults),
      };
    }),

  clearAll: () => set(initialState),
}));
