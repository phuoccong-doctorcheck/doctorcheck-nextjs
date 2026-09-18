import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { clinicalTrustRepository } from '@/repositories';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { ContentType } from '@/lib/workflow/types';
import { CustomerStoryEditorForm } from '@/components/admin/clinic/CustomerStoryEditorForm';

interface StoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await clinicalTrustRepository.getCustomerStoryById(id);
  return {
    title: item ? `Chỉnh Sửa Câu Chuyện: ${item.title} | DoctorCheck CMS` : 'Chỉnh Sửa Câu Chuyện | DoctorCheck CMS',
    robots: { index: false, follow: false },
  };
}

export default async function AdminEditCustomerStoryPage({ params }: StoryPageProps) {
  const { id } = await params;
  const guard = await guardAdminModule(Permission.CLINIC_EDIT, `/admin/clinic/stories/${id}`);

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.CLINIC_EDIT}
        userRoles={guard.user.roles}
        moduleName="Chỉnh sửa Câu chuyện khách hàng"
      />
    );
  }

  const [item, activeRevision] = await Promise.all([
    clinicalTrustRepository.getCustomerStoryById(id),
    revisionRepository.getLatestByEntity(ContentType.TESTIMONIAL, id),
  ]);

  if (!item && !activeRevision) {
    notFound();
  }

  return (
    <div>
      <CustomerStoryEditorForm
        initialData={item}
        latestDraftRevision={activeRevision}
        userPermissions={guard.user.permissions}
      />
    </div>
  );
}
