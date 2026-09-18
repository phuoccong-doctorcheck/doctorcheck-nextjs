import React from 'react';
import type { Metadata } from 'next';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { packageRepository } from '@/repositories';
import { PackageListTable } from '@/components/admin/packages/PackageListTable';
import { Package } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Quản Lý Gói Khám & Bảng Giá | DoctorCheck Admin',
  robots: { index: false, follow: false },
};

interface AdminPackagesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    gender?: string;
    status?: string;
  }>;
}

export default async function AdminPackagesPage({ searchParams }: AdminPackagesPageProps) {
  const guard = await guardAdminModule(Permission.PACKAGE_READ, '/admin/packages');

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.PACKAGE_READ}
        userRoles={guard.user.roles}
        moduleName="Quản lý Gói Khám & Dịch Vụ"
      />
    );
  }

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search || '';
  const gender = params.gender || '';
  const status = params.status || '';

  const packageListResult = await packageRepository.listAdmin({
    page,
    pageSize: 15,
    search,
    gender,
    status,
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Package className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            Gói Khám & Bảng Giá Dịch Vụ
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý bảng giá niêm yết (VND), danh mục cận lâm sàng, đối tượng chỉ định và phạm vi tầm soát bệnh lý.
          </p>
        </div>
      </div>

      {/* Main Table */}
      <PackageListTable initialData={packageListResult} />
    </div>
  );
}
