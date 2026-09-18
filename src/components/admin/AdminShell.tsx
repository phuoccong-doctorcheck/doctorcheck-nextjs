'use client';

import React, { useState } from 'react';
import { AdminNavGroup } from './AdminNavConfig';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminMobileNav } from './AdminMobileNav';

interface AdminShellProps {
  user: {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
    permissions: string[];
  };
  navGroups: AdminNavGroup[];
  children: React.ReactNode;
}

export function AdminShell({ user, navGroups, children }: AdminShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-row">
      {/* Desktop Persistent Sidebar */}
      <AdminSidebar navGroups={navGroups} className="hidden lg:flex" />

      {/* Mobile Drawer */}
      <AdminMobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        navGroups={navGroups}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          user={user}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
