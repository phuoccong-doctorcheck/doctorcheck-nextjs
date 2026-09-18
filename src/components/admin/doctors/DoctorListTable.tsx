'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  UserCheck,
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
  Hospital,
  ShieldCheck,
  Award,
  Sparkles,
} from 'lucide-react';
import { DoctorListAdminResult, SpecialtyItem } from '@/repositories/contracts/doctor.repository';
import { DoctorRevisionHistoryDrawer } from './DoctorRevisionHistoryDrawer';

interface DoctorListTableProps {
  initialData: DoctorListAdminResult;
  specialties: SpecialtyItem[];
}

export function DoctorListTable({ initialData, specialties }: DoctorListTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [historyEntityId, setHistoryEntityId] = useState<string | null>(null);

  const currentSpecialty = searchParams.get('specialtyId') || '';
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

  const getStatusBadge = (status: string) => {
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
            <Send className="h-3 w-3" /> Chờ Duyệt CCHN
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
            <CheckCircle2 className="h-3 w-3" /> Đã Phê Duyệt CCHN
          </span>
        );
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 className="h-3 w-3" /> Đang Hoạt Động
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            <Archive className="h-3 w-3" /> Tạm Dừng
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
            placeholder="Tìm theo tên bác sĩ, CCHN, chức danh..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
          />
        </form>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Specialty Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={currentSpecialty}
              onChange={(e) => updateFilters({ specialtyId: e.target.value || null, page: '1' })}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:border-indigo-500 focus:outline-none shadow-sm"
            >
              <option value="">Tất cả chuyên khoa</option>
              {specialties.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={currentStatus}
            onChange={(e) => updateFilters({ status: e.target.value || null, page: '1' })}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:border-indigo-500 focus:outline-none shadow-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="published">Đang Hoạt Động</option>
            <option value="draft">Bản Nháp</option>
            <option value="in_review">Chờ Duyệt CCHN</option>
            <option value="approved">Đã Phê Duyệt CCHN</option>
          </select>

          {/* New Doctor Button */}
          <Link
            href="/admin/doctors/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm Bác Sĩ Mới
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
                <th scope="col" className="px-6 py-4">Bác Sĩ & Chức Danh</th>
                <th scope="col" className="px-6 py-4">Giấy Phép CCHN</th>
                <th scope="col" className="px-6 py-4">Chuyên Khoa & Bệnh Viện</th>
                <th scope="col" className="px-6 py-4">Kinh Nghiệm</th>
                <th scope="col" className="px-6 py-4">Trạng Thái</th>
                <th scope="col" className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {initialData.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <UserCheck className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                    Không tìm thấy bác sĩ nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                initialData.items.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Name & Photo */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {doc.imageUrl ? (
                            <img
                              src={doc.imageUrl}
                              alt={doc.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <UserCheck className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/admin/doctors/${doc.id}`}
                              className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                              {doc.name}
                            </Link>
                            {doc.isFeatured && (
                              <span title="Bác sĩ tiêu biểu trên trang chủ">
                                <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                            {doc.title}
                          </p>
                          <span className="text-xs text-slate-400">
                            /doctor/{doc.slug}/
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* CCHN */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg w-fit border border-slate-200 dark:border-slate-700">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{doc.cchn || 'Chưa cập nhật CCHN'}</span>
                      </div>
                    </td>

                    {/* Specialty & Hospital */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                          {doc.specialtySummary}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Hospital className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-[200px]">{doc.hospital}</span>
                        </div>
                      </div>
                    </td>

                    {/* Experience */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <Award className="h-3.5 w-3.5 text-amber-600" />
                        <span>{doc.experienceYears} năm</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(doc.status)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Preview / Live */}
                        <Link
                          href={`/doctor/${doc.slug}/`}
                          target="_blank"
                          title="Xem trang công khai"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>

                        {/* History Drawer Trigger */}
                        <button
                          onClick={() => setHistoryEntityId(doc.id)}
                          title="Lịch sử phiên bản"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                        >
                          <History className="h-4 w-4" />
                        </button>

                        {/* Edit Button */}
                        <Link
                          href={`/admin/doctors/${doc.id}`}
                          title="Chỉnh sửa hồ sơ"
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
              Trang {currentPage} trên tổng số {initialData.totalPages} ({initialData.total} bác sĩ)
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

      {/* Revision History Drawer Modal */}
      {historyEntityId && (
        <DoctorRevisionHistoryDrawer
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
