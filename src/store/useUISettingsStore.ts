import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light' | 'system';

type UISettingsState = {
  theme: Theme;
  sidebarCollapsed: boolean;
  notificationsEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  lineHeight: 'tight' | 'normal' | 'relaxed';
  showCodeLineNumbers: boolean;
};

type UISettingsActions = {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setFontSize: (size: UISettingsState['fontSize']) => void;
  setLineHeight: (height: UISettingsState['lineHeight']) => void;
  setShowCodeLineNumbers: (show: boolean) => void;
};

const initialState: UISettingsState = {
  theme: 'dark',
  sidebarCollapsed: false,
  notificationsEnabled: true,
  fontSize: 'medium',
  lineHeight: 'normal',
  showCodeLineNumbers: true,
};

export const useUISettingsStore = create<UISettingsState & UISettingsActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setTheme: (theme) => set({ theme }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

      setFontSize: (size) => set({ fontSize: size }),

      setLineHeight: (height) => set({ lineHeight: height }),

      setShowCodeLineNumbers: (show) => set({ showCodeLineNumbers: show }),
    }),
    {
      name: 'ui-settings-store',
    },
  ),
);
