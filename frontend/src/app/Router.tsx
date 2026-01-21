import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { LeaderboardPage } from '@/features/leaderboard/pages/LeaderboardPage';
import { TransferPage } from '@/features/transfer/pages/TransferPage';
import { HistoryPage } from '@/features/history/pages/HistoryPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!isAuthenticated && !accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);

  if (isAuthenticated || accessToken) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/transfer" element={<TransferPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
