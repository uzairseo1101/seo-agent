import React from 'react';
import DashboardSidebar from '@/components/dashboard-sidebar';
import AuthGuard from '@/components/auth-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAdmin={false}>
      <div className="flex h-screen overflow-hidden bg-surface-bg text-surface-text">
        {/* Permanent Sidebar */}
        <DashboardSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <main className="flex-1 pb-16">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
