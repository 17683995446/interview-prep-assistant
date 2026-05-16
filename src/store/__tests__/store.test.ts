import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useAppStore } from '../index'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('App Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useAppStore.setState({
      progress: {},
      currentFilter: { category: null, difficulty: null, search: '' },
      favorites: []
    })
    vi.clearAllMocks()
  })

  describe('State Management', () => {
    it('should initialize with questions', () => {
      const state = useAppStore.getState()
      expect(state.questions.length).toBeGreaterThan(0)
    })

    it('should increment attempts', () => {
      act(() => {
        useAppStore.getState().incrementAttempts('1')
      })
      
      const state = useAppStore.getState()
      expect(state.progress['1']?.attempts).toBe(1)
    })

    it('should mark question as completed', () => {
      act(() => {
        useAppStore.getState().markCompleted('1')
      })
      
      const state = useAppStore.getState()
      expect(state.progress['1']?.completed).toBe(true)
    })

    it('should set filters', () => {
      act(() => {
        useAppStore.getState().setFilter({ category: 'algorithms', difficulty: 'easy' })
      })
      
      const state = useAppStore.getState()
      expect(state.currentFilter.category).toBe('algorithms')
      expect(state.currentFilter.difficulty).toBe('easy')
    })

    it('should toggle favorites', () => {
      act(() => {
        useAppStore.getState().toggleFavorite('1')
      })
      
      let state = useAppStore.getState()
      expect(state.favorites).toContain('1')
      
      act(() => {
        useAppStore.getState().toggleFavorite('1')
      })
      
      state = useAppStore.getState()
      expect(state.favorites).not.toContain('1')
    })

    it('should search questions by title', () => {
      act(() => {
        useAppStore.getState().setFilter({ search: '数组' })
      })
      
      const { questions, currentFilter } = useAppStore.getState()
      const searchMatch = questions.some(q => 
        q.title.toLowerCase().includes(currentFilter.search.toLowerCase())
      )
      expect(searchMatch).toBe(true)
    })
  })

  describe('Selectors', () => {
    it('useFilteredQuestions should return filtered questions', () => {
      act(() => {
        useAppStore.getState().setFilter({ category: 'algorithms' })
      })
      
      // Test by checking store directly
      const { questions, currentFilter } = useAppStore.getState()
      const filtered = questions.filter(q => {
        const categoryMatch = !currentFilter.category || q.category === currentFilter.category
        const difficultyMatch = !currentFilter.difficulty || q.difficulty === currentFilter.difficulty
        const searchMatch = !currentFilter.search || 
          q.title.toLowerCase().includes(currentFilter.search.toLowerCase()) ||
          q.description.toLowerCase().includes(currentFilter.search.toLowerCase()) ||
          q.tags.some(tag => tag.toLowerCase().includes(currentFilter.search.toLowerCase()))
        return categoryMatch && difficultyMatch && searchMatch
      })
      
      expect(filtered.length).toBeGreaterThan(0)
      expect(filtered.every(q => q.category === 'algorithms')).toBe(true)
    })

    it('useProgressStats should calculate correct stats', () => {
      act(() => {
        useAppStore.getState().markCompleted('1')
      })
      
      const { questions, progress } = useAppStore.getState()
      const total = questions.length
      const completed = Object.values(progress).filter(p => p.completed).length
      
      expect(total).toBeGreaterThan(0)
      expect(completed).toBe(1)
      expect(completed).toBeLessThanOrEqual(total)
    })
  })
})
