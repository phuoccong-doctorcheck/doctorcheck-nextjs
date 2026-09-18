import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { packageRepository } from '@/repositories';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { ContentType } from '@/lib/workflow/types';
import { PackageEditorForm } from '@/components/admin/packages/PackageEditorForm';

export const metadata: Metadata = {
  title: 'Chỉnh Sửa Gói Khám | DoctorCheck Admin',
  robots: { index: false, follow: false },
};

interface AdminPackageEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPackageEditPage({ params }: AdminPackageEditPageProps) {
  const { id } = await params;
  const guard = await guardAdminModule(Permission.PACKAGE_READ, `/admin/packages/${id}`);

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.PACKAGE_READ}
        userRoles={guard.user.roles}
        moduleName="Chỉnh sửa Gói Khám"
      />
    );
  }

  // Load canonical package and latest workflow revision in parallel
  const [canonicalPackage, latestRevision] = await Promise.all([
    packageRepository.getAdminById(id),
    revisionRepository.getLatestByEntity(ContentType.PACKAGE, id),
  ]);

  if (!canonicalPackage && !latestRevision) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PackageEditorForm
        initialPackage={canonicalPackage}
        activeRevision={latestRevision}
        userRoles={guard.user.roles}
        userPermissions={guard.user.permissions}
      />
    </div>
  );
}
