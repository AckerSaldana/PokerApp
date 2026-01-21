import { useEffect } from 'react';
import { QueryProvider } from './providers/QueryProvider';
import { AppRouter } from './Router';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { authApi } from '@/services/api/auth';

function AuthInitializer() {
  const { accessToken, login, logout, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (accessToken) {
        try {
          const user = await authApi.getMe();
          login(user, accessToken, useAuthStore.getState().refreshToken || '');
        } catch {
          logout();
        }
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return null;
}

function ThemeInitializer() {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return null;
}

export default function App() {
  return (
    <QueryProvider>
      <AuthInitializer />
      <ThemeInitializer />
      <AppRouter />
    </QueryProvider>
  );
}
