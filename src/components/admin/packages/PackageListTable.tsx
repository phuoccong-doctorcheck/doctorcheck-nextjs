'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Package,
  Search,
  Plus,
  Filter,
  ExternalLink,
  Edit,
  History,
  CheckCircle2,
  Send,
  Save,
  Archive,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Clock,
} from 'lucide-react';
import { PackageListAdminResult } from '@/repositories/contracts/package.repository';
import { PackageRevisionHistoryDrawer } from './PackageRevisionHistoryDrawer';

interface PackageListTableProps {
  initialData: PackageListAdminResult;
}

export function PackageListTable({ initialData }: PackageListTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [historyEntityId, setHistoryEntityId] = useState<string | null>(null);

  const currentGender = searchParams.get('gender') || '';
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

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-500">
          <Archive className="h-3 w-3" /> Tạm Ngưng
        </span>
      );
    }

    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
            <Save className="h-3 w-3" /> Bản Nháp
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
            <Send className="h-3 w-3" /> Chờ Duyệt Bảng Giá
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
            <CheckCircle2 className="h-3 w-3" /> Đã Phê Duyệt
          </span>
        );
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 className="h-3 w-3" /> Đang Áp Dụng
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {status}
          </span>
        );
    }
  };

  const getGenderBadge = (gender: string) => {
    switch (gender) {
      case 'female':
        return (
          <span className="rounded-lg bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 text-xs font-medium text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-900">
            Nữ giới
          </span>
        );
      case 'male':
        return (
          <span className="rounded-lg bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 text-xs font-medium text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900">
            Nam giới
          </span>
        );
      default:
        return (
          <span className="rounded-lg bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
            Cả Nam & Nữ
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên gói khám, tagline..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
          />
        </form>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Gender Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={currentGender}
              onChange={(e) => updateFilters({ gender: e.target.value || null, page: '1' })}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:border-indigo-500 focus:outline-none shadow-sm"
            >
              <option value="">Tất cả đối tượng</option>
              <option value="both">Cả Nam & Nữ</option>
              <option value="female">Dành cho Nữ</option>
              <option value="male">Dành cho Nam</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={currentStatus}
            onChange={(e) => updateFilters({ status: e.target.value || null, page: '1' })}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:border-indigo-500 focus:outline-none shadow-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="published">Đang Áp Dụng</option>
            <option value="draft">Bản Nháp</option>
            <option value="in_review">Chờ Duyệt Bảng Giá</option>
          </select>

          {/* New Package Button */}
          <Link
            href="/admin/packages/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Tạo Gói Khám Mới
          </Link>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px]">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th scope="col" className="px-6 py-4">Gói Khám & Tagline</th>
                <th scope="col" className="px-6 py-4">Đối Tượng</th>
                <th scope="col" className="px-6 py-4">Giá Niêm Yết (VND)</th>
                <th scope="col" className="px-6 py-4">Phạm Vi Tầm Soát</th>
                <th scope="col" className="px-6 py-4">Trạng Thái</th>
                <th scope="col" className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {initialData.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Package className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                    Không tìm thấy gói khám nào phù hợp.
                  </td>
                </tr>
              ) : (
                initialData.items.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Name & Tagline */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/packages/${pkg.id}`}
                            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            {pkg.name}
                          </Link>
                          {pkg.isPopular && (
                            <span title="Gói khám phổ biến nhất">
                              <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                            </span>
                          )}
                        </div>
                        {pkg.tagline && (
                          <p className="text-xs text-slate-500 line-clamp-1 max-w-sm">
                            {pkg.tagline}
                          </p>
                        )}
                        <span className="text-xs text-slate-400 font-mono">
                          /{pkg.slug}/
                        </span>
                      </div>
                    </td>

                    {/* Gender */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getGenderBadge(pkg.gender)}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 font-sans">
                        <span>{pkg.priceFormatted || `${pkg.priceVnd.toLocaleString('vi-VN')}đ`}</span>
                      </div>
                    </td>

                    {/* Scope / Diseases */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        <div>
                          Phát hiện <span className="font-semibold text-indigo-600 dark:text-indigo-400">{pkg.diseasesCovered}</span> bệnh lý ({pkg.cancersCovered} loại K)
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>{pkg.duration}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(pkg.status, pkg.isActive)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Public Link */}
                        <Link
                          href={`/${pkg.slug}/`}
                          target="_blank"
                          title="Xem trang công khai"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>

                        {/* History Drawer Trigger */}
                        <button
                          onClick={() => setHistoryEntityId(pkg.id)}
                          title="Lịch sử phiên bản"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                        >
                          <History className="h-4 w-4" />
                        </button>

                        {/* Edit Button */}
                        <Link
                          href={`/admin/packages/${pkg.id}`}
                          title="Chỉnh sửa gói khám & bảng giá"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
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
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-6 py-3 text-xs text-slate-500">
            <div>
              Trang {currentPage} trên tổng số {initialData.totalPages} ({initialData.total} gói khám)
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1 || isPending}
                onClick={() => updateFilters({ page: String(currentPage - 1) })}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Trước
              </button>
              <button
                disabled={currentPage >= initialData.totalPages || isPending}
                onClick={() => updateFilters({ page: String(currentPage + 1) })}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Sau <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Revision History Drawer */}
      {historyEntityId && (
        <PackageRevisionHistoryDrawer
          entityId={historyEntityId}
          isOpen={Boolean(historyEntityId)}
          onClose={() => setHistoryEntityId(null)}
          onRestored={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
