import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function AppShell() {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-100">
      <main className="pb-20 pt-safe">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
