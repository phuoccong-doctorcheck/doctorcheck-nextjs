'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { ADMIN_NAV_GROUPS } from './AdminNavConfig';

const ROUTE_NAME_MAP: Record<string, string> = {
  admin: 'Bảng Điều Khiển',
};

// Populate route map from navigation items
ADMIN_NAV_GROUPS.forEach((group) => {
  group.items.forEach((item) => {
    const slug = item.href.replace(/^\/admin\/?/, '');
    if (slug) {
      ROUTE_NAME_MAP[slug] = item.label;
    }
  });
});

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // If at root /admin
  if (segments.length <= 1) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-400 font-medium">
        <span className="flex items-center gap-1.5 text-slate-200">
          <Home className="w-3.5 h-3.5 text-sky-400" />
          <span>Bảng Điều Khiển</span>
        </span>
      </nav>
    );
  }

  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = ROUTE_NAME_MAP[segment] || decodeURIComponent(segment);
    const isLast = index === segments.length - 1;

    return {
      href,
      label,
      isLast,
    };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium overflow-x-auto">
      <Link
        href="/admin"
        className="flex items-center gap-1 hover:text-slate-200 transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5 text-slate-500 hover:text-sky-400" />
      </Link>

      {breadcrumbs.slice(1).map((crumb) => (
        <React.Fragment key={crumb.href}>
          <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
          {crumb.isLast ? (
            <span className="text-slate-200 font-semibold truncate max-w-[200px]" aria-current="page">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-slate-200 transition-colors truncate max-w-[150px]"
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
