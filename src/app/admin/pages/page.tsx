import React from 'react';
import { Metadata } from 'next';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { pageRepository } from '@/repositories';
import { PageListTable } from '@/components/admin/pages/PageListTable';
import { PageRouteType } from '@/lib/routing/page-route-policy';

export const metadata: Metadata = {
  title: 'Quản Lý Trang Tĩnh & Nội Soi | Doctor Check CMS',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    routeType?: string;
    status?: string;
  }>;
}

export default async function AdminPagesPage({ searchParams }: PageProps) {
  const guard = await guardAdminModule(Permission.PAGE_READ, '/admin/pages');

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.PAGE_READ}
        userRoles={guard.user.roles}
        moduleName="Quản lý Trang tĩnh"
      />
    );
  }

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10);
  const pageSize = parseInt(resolvedParams.pageSize || '15', 10);
  const search = resolvedParams.search || '';
  const routeType = (resolvedParams.routeType as PageRouteType | 'all') || 'all';
  const status = resolvedParams.status || 'all';

  const data = await pageRepository.listAdmin({
    page,
    pageSize,
    search,
    routeType,
    status,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Quản Lý Trang Tĩnh & Nội Soi
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Quản trị 55 trang tĩnh, chuyên khoa nội soi và landing pages theo chính sách định tuyến chuẩn.
        </p>
      </div>

      <PageListTable initialData={data} />
    </div>
  );
}
