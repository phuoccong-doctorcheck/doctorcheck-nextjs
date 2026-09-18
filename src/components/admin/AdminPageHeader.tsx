import React from 'react';
import { AdminIcon } from './AdminIcons';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  iconName: string;
  phaseBadge?: string;
  statusBadge?: string;
  children?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  iconName,
  phaseBadge,
  statusBadge = 'Đã Khóa Bảo Mật',
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-800/80">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
          <AdminIcon name={iconName} className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
            {phaseBadge && (
              <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300 font-mono text-[11px] font-semibold">
                {phaseBadge}
              </span>
            )}
            {statusBadge && (
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 font-mono text-[11px]">
                {statusBadge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">{description}</p>
          )}
        </div>
      </div>

      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </div>
  );
}
