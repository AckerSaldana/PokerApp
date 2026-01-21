import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface UIState {
  theme: Theme;
  hapticEnabled: boolean;
  animationsEnabled: boolean;

  setTheme: (theme: Theme) => void;
  toggleHaptics: () => void;
  toggleAnimations: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      hapticEnabled: true,
      animationsEnabled: true,

      setTheme: (theme) => {
        set({ theme });
        if (theme === 'system') {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        } else {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },

      toggleHaptics: () => set((state) => ({ hapticEnabled: !state.hapticEnabled })),

      toggleAnimations: () => set((state) => ({ animationsEnabled: !state.animationsEnabled })),
    }),
    {
      name: 'poker-ui',
    }
  )
);
