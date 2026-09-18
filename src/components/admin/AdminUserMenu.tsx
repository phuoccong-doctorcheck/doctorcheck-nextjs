'use client';

import React, { useState, useRef, useEffect } from 'react';
import { logoutAction } from '@/actions/auth.actions';
import { LogOut, ChevronDown } from 'lucide-react';

export interface AdminUserMenuProps {
  user: {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
  };
}

export function AdminUserMenu({ user }: AdminUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const primaryRole = user.roles[0] || 'staff';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Tùy chọn tài khoản quản trị"
        className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
      >
        <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-300 flex items-center justify-center font-bold text-xs shrink-0">
          {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="hidden sm:block">
          <div className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[120px]">
            {user.fullName}
          </div>
          <div className="text-[10px] text-slate-400 font-mono leading-tight uppercase">
            {primaryRole}
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in-50 zoom-in-95"
        >
          {/* User Details */}
          <div className="px-3 py-2.5 border-b border-slate-800 mb-1">
            <p className="text-xs font-semibold text-slate-200">{user.fullName}</p>
            <p className="text-[11px] text-slate-400 font-mono truncate">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {user.roles.map((role) => (
                <span
                  key={role}
                  className="px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-[10px] font-mono text-sky-300 uppercase"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          {/* Logout Action */}
          <form action={logoutAction}>
            <button
              type="submit"
              role="menuitem"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-300 hover:text-red-200 hover:bg-red-950/60 rounded-lg transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Đăng Xuất Khỏi CMS</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
