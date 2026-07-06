'use client';

import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';

export function DashboardClient() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome to CampusOS. Your AI Operating System for Education.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Ask questions across all your connected systems.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <h3 className="font-semibold">Quick Actions</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Common tasks and shortcuts.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <h3 className="font-semibold">System Status</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                All connected systems operational.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
