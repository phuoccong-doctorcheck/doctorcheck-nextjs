import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { pageRepository } from '@/repositories';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { ContentType } from '@/lib/workflow/types';
import { PageEditorForm } from '@/components/admin/pages/PageEditorForm';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const page = await pageRepository.getAdminById(id);
  return {
    title: page ? `Chỉnh Sửa: ${page.title} | Doctor Check CMS` : 'Chỉnh Sửa Trang Tĩnh | Doctor Check CMS',
    robots: { index: false, follow: false },
  };
}

export default async function AdminEditPagePage({ params }: PageProps) {
  const { id } = await params;
  const guard = await guardAdminModule(Permission.PAGE_READ, `/admin/pages/${id}`);

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.PAGE_READ}
        userRoles={guard.user.roles}
        moduleName="Chỉnh sửa Trang tĩnh"
      />
    );
  }

  const page = await pageRepository.getAdminById(id);
  const activeRevision = await revisionRepository.getLatestByEntity(ContentType.PAGE, page?.id || id);

  if (!page && !activeRevision) {
    notFound();
  }

  return (
    <div>
      <PageEditorForm initialPage={page} initialRevision={activeRevision} isNew={false} />
    </div>
  );
}
