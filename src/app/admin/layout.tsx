import type { Metadata } from 'next';
import React from 'react';
import { getCurrentUser } from '@/services/auth.service';
import { getFilteredNavigation } from '@/components/admin/AdminNavConfig';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: 'DoctorCheck CMS Administration',
  description: 'Hệ thống Quản trị Nội dung Y khoa Nội bộ DoctorCheck Vietnam',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If unauthenticated (e.g. at /admin/login), render children directly without admin shell
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
        {children}
      </div>
    );
  }

  // Derive role-filtered navigation items server-side
  const navGroups = getFilteredNavigation(user.roles, user.permissions);

  return (
    <AdminShell user={user} navGroups={navGroups}>
      {children}
    </AdminShell>
  );
}
