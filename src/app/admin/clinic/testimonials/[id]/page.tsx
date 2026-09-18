import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { clinicalTrustRepository } from '@/repositories';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { ContentType } from '@/lib/workflow/types';
import { VideoTestimonialEditorForm } from '@/components/admin/clinic/VideoTestimonialEditorForm';

interface TestimonialPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: TestimonialPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await clinicalTrustRepository.getVideoTestimonialById(id);
  return {
    title: item ? `Chỉnh Sửa Video: ${item.title} | DoctorCheck CMS` : 'Chỉnh Sửa Video | DoctorCheck CMS',
    robots: { index: false, follow: false },
  };
}

export default async function AdminEditVideoTestimonialPage({ params }: TestimonialPageProps) {
  const { id } = await params;
  const guard = await guardAdminModule(Permission.CLINIC_EDIT, `/admin/clinic/testimonials/${id}`);

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.CLINIC_EDIT}
        userRoles={guard.user.roles}
        moduleName="Chỉnh sửa Video cảm nhận"
      />
    );
  }

  const [item, activeRevision] = await Promise.all([
    clinicalTrustRepository.getVideoTestimonialById(id),
    revisionRepository.getLatestByEntity(ContentType.TESTIMONIAL, id),
  ]);

  if (!item && !activeRevision) {
    notFound();
  }

  return (
    <div>
      <VideoTestimonialEditorForm
        initialData={item}
        latestDraftRevision={activeRevision}
        userPermissions={guard.user.permissions}
      />
    </div>
  );
}
