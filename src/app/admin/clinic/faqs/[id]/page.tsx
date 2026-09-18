import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { clinicalTrustRepository } from '@/repositories';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { ContentType } from '@/lib/workflow/types';
import { FaqEditorForm } from '@/components/admin/clinic/FaqEditorForm';

interface FaqPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: FaqPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await clinicalTrustRepository.getFaqById(id);
  return {
    title: item ? `Chỉnh Sửa FAQ: ${item.question.slice(0, 40)}... | DoctorCheck CMS` : 'Chỉnh Sửa FAQ | DoctorCheck CMS',
    robots: { index: false, follow: false },
  };
}

export default async function AdminEditFaqPage({ params }: FaqPageProps) {
  const { id } = await params;
  const guard = await guardAdminModule(Permission.CLINIC_EDIT, `/admin/clinic/faqs/${id}`);

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.CLINIC_EDIT}
        userRoles={guard.user.roles}
        moduleName="Chỉnh sửa Câu hỏi thường gặp"
      />
    );
  }

  const [item, activeRevision] = await Promise.all([
    clinicalTrustRepository.getFaqById(id),
    revisionRepository.getLatestByEntity(ContentType.FAQ, id),
  ]);

  if (!item && !activeRevision) {
    notFound();
  }

  return (
    <div>
      <FaqEditorForm
        initialData={item}
        latestDraftRevision={activeRevision}
        userPermissions={guard.user.permissions}
      />
    </div>
  );
}
