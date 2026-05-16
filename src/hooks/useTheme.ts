import { useEffect } from 'react';
import { useAppStore } from '@/store';

type Theme = 'light' | 'dark';

export function useTheme() {
  const { theme, toggleTheme } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('interview-prep-storage');
    if (!savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark && theme !== 'dark') {
        toggleTheme();
      }
    }
  }, []);

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };
} 