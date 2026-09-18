import React from 'react';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { ArticleListTable } from '@/components/admin/articles/ArticleListTable';
import { articleRepository, categoryRepository } from '@/repositories';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản Lý Bài Viết Y Khoa | DoctorCheck CMS',
  robots: { index: false, follow: false },
};

interface AdminArticlesPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    categoryId?: string;
    page?: string;
    limit?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }>;
}

export default async function AdminArticlesPage({ searchParams }: AdminArticlesPageProps) {
  const guard = await guardAdminModule(Permission.ARTICLE_READ, '/admin/articles');

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.ARTICLE_READ}
        userRoles={guard.user.roles}
        moduleName="Bài viết Y khoa"
      />
    );
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 20;

  const [articlesData, categories] = await Promise.all([
    articleRepository.listAdmin({
      page,
      limit,
      search: params.search,
      status: params.status,
      categoryId: params.categoryId,
      sort: params.sort as 'publishedAt' | 'updatedAt' | 'title' | 'viewsCount' | undefined,
      order: params.order,
    }),
    categoryRepository.getAll(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản Lý Bài Viết Y Khoa"
        description="Quản lý kho 108 bài viết chuyên khoa tiêu hóa, quy trình tầm soát và nội soi không đau"
        iconName="FileText"
        phaseBadge="CMS-5"
        statusBadge={`Tổng số: ${articlesData.total} bài viết`}
      />

      <ArticleListTable initialData={articlesData} categories={categories} />
    </div>
  );
}
