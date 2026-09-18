'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  Plus,
  Edit,
  Eye,
  History,
  CheckCircle2,
  Send,
  Save,
  Archive,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  Globe,
  ExternalLink,
  Layers,
  Lock,
} from 'lucide-react';
import { PageListAdminResult } from '@/repositories/contracts/page.repository';
import { PageRevisionHistoryDrawer } from './PageRevisionHistoryDrawer';
import { PageRouteType } from '@/lib/routing/page-route-policy';

interface PageListTableProps {
  initialData: PageListAdminResult;
}

export function PageListTable({ initialData }: PageListTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState('');
  const [routeTypeFilter, setRouteTypeFilter] = useState<PageRouteType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [historyDrawerEntityId, setHistoryDrawerEntityId] = useState<string | null>(null);

  function handleFilterChange(newSearch: string, newType: string, newStatus: string) {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newType !== 'all') params.set('routeType', newType);
    if (newStatus !== 'all') params.set('status', newStatus);
    params.set('page', '1');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(window.location.search);
    params.set('page', String(newPage));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function getRouteTypeBadge(type: PageRouteType) {
    switch (type) {
      case 'ROOT':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Globe className="h-3 w-3" /> Trang Root (/[slug]/)
          </span>
        );
      case 'ENDOSCOPY_CHILD':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            <Layers className="h-3 w-3" /> Con Nội Soi (/noi-soi/...)
          </span>
        );
      case 'INTERNAL':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Lock className="h-3 w-3" /> Nội bộ (Internal)
          </span>
        );
    }
  }

  function getStatusBadge(workflowStatus?: string) {
    switch (workflowStatus) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-3 w-3" /> Đã xuất bản
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <CheckCircle2 className="h-3 w-3" /> Đã phê duyệt
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Send className="h-3 w-3" /> Chờ thẩm định
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Archive className="h-3 w-3" /> Đã lưu trữ
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Save className="h-3 w-3" /> Bản nháp
          </span>
        );
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, slug, đường dẫn..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleFilterChange(e.target.value, routeTypeFilter, statusFilter);
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-none shadow-xs"
            />
          </div>

          {/* Route Type Filter */}
          <select
            value={routeTypeFilter}
            onChange={(e) => {
              const val = e.target.value as PageRouteType | 'all';
              setRouteTypeFilter(val);
              handleFilterChange(searchTerm, val, statusFilter);
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 focus:border-indigo-500 focus:outline-none shadow-xs"
          >
            <option value="all">Tất cả Loại Trang</option>
            <option value="ROOT">Trang Root (/[slug]/)</option>
            <option value="ENDOSCOPY_CHILD">Trang Con Nội Soi</option>
            <option value="INTERNAL">Nội bộ (Internal)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              const val = e.target.value;
              setStatusFilter(val);
              handleFilterChange(searchTerm, routeTypeFilter, val);
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 focus:border-indigo-500 focus:outline-none shadow-xs"
          >
            <option value="all">Tất cả Trạng Thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
            <option value="in_review">Chờ duyệt</option>
            <option value="archived">Đã lưu trữ</option>
          </select>
        </div>

        {/* Action Button */}
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          Tạo Trang Mới
        </Link>
      </div>

      {/* Table Container */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xs">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/40 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Tên Trang & Tiêu Đề</th>
                <th className="px-4 py-3.5 font-semibold">Loại Trang</th>
                <th className="px-4 py-3.5 font-semibold">Đường Dẫn Công Khai (Path)</th>
                <th className="px-4 py-3.5 font-semibold">Trạng Thái</th>
                <th className="px-4 py-3.5 font-semibold">Cập Nhật</th>
                <th className="px-5 py-3.5 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {initialData.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    Không tìm thấy trang tĩnh nào phù hợp với điều kiện lọc.
                  </td>
                </tr>
              ) : (
                initialData.items.map((page) => (
                  <tr
                    key={page.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Title & Slug */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/pages/${page.id}`}
                            className="font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1 text-sm"
                          >
                            {page.title}
                          </Link>
                          <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                            ID: {page.id} | slug: {page.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Route Type */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getRouteTypeBadge(page.routeType)}
                    </td>

                    {/* Canonical Path */}
                    <td className="px-4 py-3.5">
                      <a
                        href={page.path}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-xs text-indigo-600 dark:text-indigo-400 hover:underline max-w-xs truncate"
                        title={page.path}
                      >
                        <Globe className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="truncate">{page.path}</span>
                        <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </a>
                    </td>

                    {/* Workflow Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getStatusBadge(page.workflowStatus)}
                    </td>

                    {/* Updated Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-400 font-mono">
                      {new Date(page.updatedAt).toLocaleDateString('vi-VN')}
                    </td>

                    {/* Quick Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/pages/${page.id}`}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                          title="Chỉnh sửa trang"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/pages/${page.id}/preview`}
                          target="_blank"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                          title="Xem trước bản nháp"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setHistoryDrawerEntityId(page.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                          title="Lịch sử phiên bản"
                        >
                          <History className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div>
            Hiển thị <span className="font-semibold text-slate-900 dark:text-slate-100">{initialData.items.length}</span> trên tổng số{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100">{initialData.total}</span> trang tĩnh
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={initialData.page <= 1}
              onClick={() => handlePageChange(initialData.page - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Trước
            </button>

            <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
              Trang {initialData.page} / {initialData.totalPages}
            </span>

            <button
              type="button"
              disabled={initialData.page >= initialData.totalPages}
              onClick={() => handlePageChange(initialData.page + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              Sau <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* History Drawer Modal */}
      {historyDrawerEntityId && (
        <PageRevisionHistoryDrawer
          entityId={historyDrawerEntityId}
          isOpen={Boolean(historyDrawerEntityId)}
          onClose={() => setHistoryDrawerEntityId(null)}
          onRestored={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
