import React from 'react';
import { notFound } from 'next/navigation';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { ArticleEditorForm } from '@/components/admin/articles/ArticleEditorForm';
import { articleRepository, categoryRepository } from '@/repositories';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { ContentType } from '@/lib/workflow/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Biên Tập Bài Viết | DoctorCheck CMS',
  robots: { index: false, follow: false },
};

interface AdminArticleEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminArticleEditPage({ params }: AdminArticleEditPageProps) {
  const { id } = await params;
  const guard = await guardAdminModule(Permission.ARTICLE_READ, `/admin/articles/${id}`);

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.ARTICLE_READ}
        userRoles={guard.user.roles}
        moduleName="Biên tập Bài viết Y khoa"
      />
    );
  }

  // Fetch article from canonical table and latest active revision
  const [article, activeRevision, allCategories] = await Promise.all([
    articleRepository.getAdminById(id),
    revisionRepository.getLatestByEntity(ContentType.ARTICLE, id),
    categoryRepository.getAll(),
  ]);

  if (!article && !activeRevision) {
    notFound();
  }

  const initialArticle = article
    ? {
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        contentHtml: article.contentHtml,
        featuredImageId: article.featuredImageId,
        featuredImageUrl: article.featuredImageUrl,
        authorName: article.authorName,
        authorTitle: article.authorTitle,
        status: article.status,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        canonicalUrl: article.canonicalUrl,
        categories: article.categories,
        toc: article.toc,
      }
    : undefined;

  const displayTitle = activeRevision?.payload
    ? (activeRevision.payload as Record<string, unknown>).title as string
    : article?.title || 'Biên tập bài viết';

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Biên Tập: ${displayTitle}`}
        description="Chỉnh sửa nội dung bản nháp, quản lý hình ảnh, danh mục và tối ưu SEO trước khi gửi duyệt."
        iconName="FileText"
        phaseBadge="CMS-5"
        statusBadge={article?.status === 'published' ? 'Canonical: Đã xuất bản' : 'Trạng thái: Bản nháp'}
      />

      <ArticleEditorForm
        initialArticle={initialArticle}
        activeRevision={activeRevision}
        allCategories={allCategories}
        userRoles={guard.user.roles}
        userPermissions={guard.user.permissions}
      />
    </div>
  );
}
