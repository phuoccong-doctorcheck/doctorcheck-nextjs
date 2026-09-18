import React from 'react';
import { Metadata } from 'next';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission, Role } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { redirectRepository } from '@/repositories/postgres/postgres-redirect.repository';
import { revalidationService } from '@/services/revalidation.service';
import { RedirectsManager } from '@/components/admin/redirects/RedirectsManager';

export const metadata: Metadata = {
  title: 'Quản Trị Điều Hướng & Vận Hành Xuất Bản | Doctor Check CMS',
  robots: { index: false, follow: false },
};

export default async function AdminRedirectsPage() {
  const guard = await guardAdminModule(Permission.REDIRECTS_MANAGE, '/admin/redirects');

  // Also permit Super Admin and Admin roles even if specific permission flag is checking
  const isAuthorized =
    guard.isAuthorized ||
    guard.user.roles.includes(Role.SUPER_ADMIN) ||
    guard.user.roles.includes(Role.ADMIN);

  if (!isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.REDIRECTS_MANAGE}
        userRoles={guard.user.roles}
        moduleName="Quản trị Điều hướng & Xuất bản"
      />
    );
  }

  const [redirectResult, opResult] = await Promise.all([
    redirectRepository.list({ page: 1, limit: 100 }),
    revalidationService.listOperations({ page: 1, limit: 100 }),
  ]);

  return (
    <RedirectsManager
      initialRedirects={redirectResult.redirects}
      initialTotalRedirects={redirectResult.total}
      initialOperations={opResult.operations}
      initialTotalOperations={opResult.total}
    />
  );
}
