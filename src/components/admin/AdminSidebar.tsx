'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminNavGroup } from './AdminNavConfig';
import { AdminIcon } from './AdminIcons';
import { ShieldCheck, ExternalLink } from 'lucide-react';

interface AdminSidebarProps {
  navGroups: AdminNavGroup[];
  className?: string;
}

export function AdminSidebar({ navGroups, className = '' }: AdminSidebarProps) {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin' || pathname === '/admin/';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0 ${className}`}
      aria-label="Admin Primary Sidebar"
    >
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              DoctorCheck <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 border border-sky-800 text-sky-300">CMS</span>
            </div>
            <div className="text-[10px] text-slate-400">Quản Trị Y Khoa Nội Bộ</div>
          </div>
        </Link>
      </div>

      {/* Navigation Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {navGroups.map((group) => (
          <div key={group.id} className="space-y-1">
            <div className="px-3 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              {group.label}
            </div>

            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const active = isLinkActive(item.href);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <AdminIcon
                        name={item.icon}
                        className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                        active
                          ? 'bg-sky-700/60 text-sky-100'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {item.phaseTag}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer: Live Site Preview Link */}
      <div className="p-3 border-t border-slate-800 shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors"
        >
          <span className="truncate">Xem Website Công Khai</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </a>
      </div>
    </aside>
  );
}
