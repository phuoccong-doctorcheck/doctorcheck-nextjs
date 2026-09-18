import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { clinicalTrustRepository } from '@/repositories';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { ContentType } from '@/lib/workflow/types';
import { EquipmentEditorForm } from '@/components/admin/clinic/EquipmentEditorForm';

interface EquipmentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: EquipmentPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await clinicalTrustRepository.getEquipmentById(id);
  return {
    title: item ? `Chỉnh Sửa: ${item.name} | DoctorCheck CMS` : 'Chỉnh Sửa Thiết Bị | DoctorCheck CMS',
    robots: { index: false, follow: false },
  };
}

export default async function AdminEditEquipmentPage({ params }: EquipmentPageProps) {
  const { id } = await params;
  const guard = await guardAdminModule(Permission.CLINIC_EDIT, `/admin/clinic/equipment/${id}`);

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.CLINIC_EDIT}
        userRoles={guard.user.roles}
        moduleName="Chỉnh sửa Trang thiết bị"
      />
    );
  }

  const [item, activeRevision] = await Promise.all([
    clinicalTrustRepository.getEquipmentById(id),
    revisionRepository.getLatestByEntity(ContentType.EQUIPMENT, id),
  ]);

  if (!item && !activeRevision) {
    notFound();
  }

  return (
    <div>
      <EquipmentEditorForm
        initialData={
          item
            ? {
                ...item,
                features: Array.isArray(item.features)
                  ? (item.features as string[])
                  : [],
              }
            : null
        }
        latestDraftRevision={activeRevision}
        userPermissions={guard.user.permissions}
      />
    </div>
  );
}
