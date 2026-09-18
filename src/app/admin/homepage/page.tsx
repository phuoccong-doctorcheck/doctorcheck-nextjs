import React from 'react';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { homepageRepository } from '@/repositories';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { ContentType } from '@/lib/workflow/types';
import { HomepageEditorForm } from '@/components/admin/homepage/HomepageEditorForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cấu Hình Trang Chủ | DoctorCheck CMS',
  robots: { index: false, follow: false },
};

export default async function AdminHomepagePage() {
  const guard = await guardAdminModule(Permission.HOMEPAGE_EDIT, '/admin/homepage');

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.HOMEPAGE_EDIT}
        userRoles={guard.user.roles}
        moduleName="Cấu hình Trang chủ"
      />
    );
  }

  // Fetch canonical homepage configuration and latest draft revision
  const [homepageData, latestDraftRevision] = await Promise.all([
    homepageRepository.getHomepageData(),
    revisionRepository.getLatestByEntity(ContentType.HOMEPAGE, 'default'),
  ]);

  return (
    <div className="space-y-6">
      <HomepageEditorForm
        initialData={homepageData}
        latestDraftRevision={latestDraftRevision}
        userPermissions={guard.user.permissions}
      />
    </div>
  );
}
