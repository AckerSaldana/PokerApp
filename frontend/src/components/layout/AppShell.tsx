import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function AppShell() {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-100">
      {/* Subtle noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] felt-texture" />

      {/* Main content */}
      <main className="relative z-10 pb-24 pt-safe">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
