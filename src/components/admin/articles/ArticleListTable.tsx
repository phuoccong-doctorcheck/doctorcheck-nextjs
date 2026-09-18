'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  FileText,
  Search,
  Plus,
  Filter,
  ExternalLink,
  Edit,
  History,
  Eye,
  CheckCircle2,
  Send,
  Save,
  Archive,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FolderTree,
  User,
  Clock,
} from 'lucide-react';
import { AdminArticleListItem, AdminArticleListResult } from '@/repositories/contracts/article.repository';
import { CategoryItem } from '@/types/doctorcheck';
import { ArticleRevisionHistoryDrawer } from './ArticleRevisionHistoryDrawer';

interface ArticleListTableProps {
  initialData: AdminArticleListResult;
  categories: CategoryItem[];
}

export function ArticleListTable({ initialData, categories }: ArticleListTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [historyEntityId, setHistoryEntityId] = useState<string | null>(null);

  const currentCategory = searchParams.get('categoryId') || '';
  const currentStatus = searchParams.get('status') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  const updateFilters = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (v === null || v === '' || (k === 'page' && v === '1')) {
        newParams.delete(k);
      } else {
        newParams.set(k, v);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${newParams.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm.trim(), page: '1' });
  };

  const getStatusBadge = (status: string, revStatus?: string | null) => {
    const activeStatus = revStatus || status;

    switch (activeStatus) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> Đã xuất bản
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            <CheckCircle2 className="h-3 w-3" /> Đã duyệt y khoa
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            <Send className="h-3 w-3" /> Đang kiểm duyệt
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <Archive className="h-3 w-3" /> Lưu trữ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            <Save className="h-3 w-3" /> Bản nháp
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tiêu đề, đường dẫn slug..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-cyan-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </form>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <FolderTree className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={currentCategory}
              onChange={(e) => updateFilters({ categoryId: e.target.value || null, page: '1' })}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="">Tất cả chuyên mục</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={currentStatus}
              onChange={(e) => updateFilters({ status: e.target.value || null, page: '1' })}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
              <option value="in_review">Đang kiểm duyệt</option>
              <option value="approved">Đã duyệt y khoa</option>
              <option value="archived">Đã lưu trữ</option>
            </select>
          </div>

          {/* Create Button */}
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 transition-colors dark:bg-cyan-500 dark:hover:bg-cyan-600"
          >
            <Plus className="h-4 w-4" />
            Tạo Bài Viết Mới
          </Link>
        </div>
      </div>

      {/* Articles Table */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-2xs dark:bg-slate-900/50">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3.5 w-14">Ảnh</th>
                <th className="px-4 py-3.5">Tiêu Đề & Đường Dẫn (Slug)</th>
                <th className="px-4 py-3.5">Chuyên Mục</th>
                <th className="px-4 py-3.5">Trạng Thái Workflow</th>
                <th className="px-4 py-3.5">Tác Giả & Cập Nhật</th>
                <th className="px-4 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {initialData.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <FileText className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                    Không tìm thấy bài viết nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                initialData.items.map((art: AdminArticleListItem) => (
                  <tr
                    key={art.id}
                    className="hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Thumbnail */}
                    <td className="px-4 py-3">
                      <div className="relative h-10 w-12 overflow-hidden rounded-md border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
                        {art.featuredImageUrl ? (
                          <img
                            src={art.featuredImageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <FileText className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title & Slug */}
                    <td className="px-4 py-3 max-w-sm">
                      <Link
                        href={`/admin/articles/${art.id}`}
                        className="font-semibold text-slate-900 hover:text-cyan-600 dark:text-white dark:hover:text-cyan-400 line-clamp-1 text-xs"
                      >
                        {art.title}
                      </Link>
                      <div className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-slate-400">
                        <span>/{art.slug}</span>
                      </div>
                    </td>

                    {/* Categories */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {art.categories.length > 0 ? (
                          art.categories.map((c) => (
                            <span
                              key={c.id}
                              className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {c.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Chưa gán</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <div>
                        {getStatusBadge(art.status, art.latestRevision?.status)}
                        {art.latestRevision && (
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            Rev v{art.latestRevision.revisionNumber}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Author & Update Date */}
                    <td className="px-4 py-3 text-[11px]">
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                        <User className="h-3 w-3 text-slate-400" />
                        <span>{art.authorName || 'DoctorCheck'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-[10px] mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{art.updatedAt ? new Date(art.updatedAt).toLocaleDateString('vi-VN') : '—'}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Public Link if published */}
                        {art.status === 'published' && (
                          <a
                            href={`/${art.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            title="Xem trang công khai"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}

                        {/* Preview */}
                        <a
                          href={`/admin/articles/${art.id}/preview`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                          title="Xem thử bản nháp"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </a>

                        {/* History */}
                        <button
                          type="button"
                          onClick={() => setHistoryEntityId(art.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-cyan-600 dark:hover:bg-slate-800 dark:hover:text-cyan-400"
                          title="Lịch sử phiên bản"
                        >
                          <History className="h-3.5 w-3.5" />
                        </button>

                        {/* Edit */}
                        <Link
                          href={`/admin/articles/${art.id}`}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 dark:text-slate-400 dark:hover:bg-cyan-950/50 dark:hover:text-cyan-300"
                          title="Chỉnh sửa bài viết"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {initialData.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/30 text-xs text-slate-600 dark:text-slate-400">
            <div>
              Hiển thị {(currentPage - 1) * initialData.limit + 1} -{' '}
              {Math.min(currentPage * initialData.limit, initialData.total)} trong tổng số{' '}
              <strong className="text-slate-900 dark:text-white">{initialData.total}</strong> bài viết
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || isPending}
                onClick={() => updateFilters({ page: String(currentPage - 1) })}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Trước
              </button>
              <span className="px-2 font-medium">
                Trang {currentPage} / {initialData.totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= initialData.totalPages || isPending}
                onClick={() => updateFilters({ page: String(currentPage + 1) })}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                Sau <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History Drawer Modal */}
      {historyEntityId && (
        <ArticleRevisionHistoryDrawer
          isOpen={Boolean(historyEntityId)}
          onClose={() => setHistoryEntityId(null)}
          entityId={historyEntityId}
          onRestoredSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
