'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { AdminBreadcrumbs } from './AdminBreadcrumbs';
import { AdminUserMenu } from './AdminUserMenu';

interface AdminHeaderProps {
  user: {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
  };
  onOpenMobileNav: () => void;
}

export function AdminHeader({ user, onOpenMobileNav }: AdminHeaderProps) {
  return (
    <header className="h-16 px-4 md:px-8 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left: Mobile Nav Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Mở menu điều hướng"
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <Menu className="w-5 h-5" />
        </button>

        <AdminBreadcrumbs />
      </div>

      {/* Right: User Profile Menu & Logout */}
      <div className="flex items-center gap-3 shrink-0">
        <AdminUserMenu user={user} />
      </div>
    </header>
  );
}
