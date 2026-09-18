'use client';

import React, { useState, useTransition } from 'react';
import { Redirect, RevalidationOperation } from '@/db/schema/settings';
import {
  disableRedirectAction,
  enableRedirectAction,
  createManualRedirectAction,
  retryRevalidationAction,
} from '@/actions/redirect.actions';
import {
  ArrowRight,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Compass,
  Layers,
  PowerOff,
  Power,
} from 'lucide-react';

interface RedirectsManagerProps {
  initialRedirects: Redirect[];
  initialTotalRedirects: number;
  initialOperations: RevalidationOperation[];
  initialTotalOperations: number;
}

export function RedirectsManager({
  initialRedirects,
  initialTotalRedirects,
  initialOperations,
  initialTotalOperations,
}: RedirectsManagerProps) {
  const [activeTab, setActiveTab] = useState<'redirects' | 'revalidation'>('redirects');

  // Redirects state
  const [redirectList, setRedirectList] = useState<Redirect[]>(initialRedirects);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  // Manual redirect form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Operations state
  const [operations, setOperations] = useState<RevalidationOperation[]>(initialOperations);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  // Filtered redirects
  const filteredRedirects = redirectList.filter((r) => {
    const matchesSearch =
      r.sourcePath.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetPath.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.entityType && r.entityType.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? r.isActive
        : !r.isActive;

    return matchesSearch && matchesStatus;
  });

  // Toggle redirect status
  const handleToggleStatus = (redirectItem: Redirect) => {
    startTransition(async () => {
      if (redirectItem.isActive) {
        const res = await disableRedirectAction(redirectItem.id);
        if (res.success) {
          setRedirectList((prev) =>
            prev.map((item) =>
              item.id === redirectItem.id ? { ...item, isActive: false, disabledAt: new Date() } : item
            )
          );
        } else {
          alert(res.error || 'Vô hiệu hóa chuyển hướng thất bại.');
        }
      } else {
        const res = await enableRedirectAction(redirectItem.id);
        if (res.success) {
          setRedirectList((prev) =>
            prev.map((item) =>
              item.id === redirectItem.id ? { ...item, isActive: true, disabledAt: null } : item
            )
          );
        } else {
          alert(res.error || 'Kích hoạt lại chuyển hướng thất bại.');
        }
      }
    });
  };

  // Create manual redirect
  const handleCreateRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    startTransition(async () => {
      const res = await createManualRedirectAction(newSource, newTarget);
      if (res.success && res.data) {
        setRedirectList((prev) => [res.data!, ...prev.filter((item) => item.id !== res.data!.id)]);
        setFormSuccess(`Đã tạo chuyển hướng thành công: ${res.data.sourcePath} -> ${res.data.targetPath}`);
        setNewSource('');
        setNewTarget('');
        setShowAddForm(false);
      } else {
        setFormError(res.error || 'Tạo chuyển hướng thất bại.');
      }
    });
  };

  // Retry revalidation
  const handleRetryReval = (opId: string) => {
    setRetryingId(opId);
    startTransition(async () => {
      const res = await retryRevalidationAction(opId);
      setRetryingId(null);
      if (res.success) {
        setOperations((prev) =>
          prev.map((op) =>
            op.id === opId
              ? {
                  ...op,
                  status: 'completed',
                  attempts: op.attempts + 1,
                  resolvedAt: new Date(),
                  lastError: null,
                }
              : op
          )
        );
      } else {
        alert(res.error || 'Thử lại revalidation thất bại.');
        setOperations((prev) =>
          prev.map((op) =>
            op.id === opId
              ? {
                  ...op,
                  status: 'failed',
                  attempts: op.attempts + 1,
                  lastError: res.error || 'Thất bại',
                }
              : op
          )
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Compass className="w-7 h-7 text-sky-600" />
            Điều Hướng & Vận Hành Xuất Bản
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản trị vòng đời chuyển hướng 301, lịch sử đổi đường dẫn (slug) và hàng đợi thử lại revalidation cache.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('redirects')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'redirects'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Chuyển Hướng 301 ({initialTotalRedirects})
          </button>
          <button
            onClick={() => setActiveTab('revalidation')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'revalidation'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Hàng Đợi Revalidation ({initialTotalOperations})
          </button>
        </div>
      </div>

      {formSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* TAB 1: REDIRECTS */}
      {activeTab === 'redirects' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo đường dẫn nguồn, đích hoặc phân hệ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'disabled')}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="disabled">Đã tắt</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm Chuyển Hướng Thủ Công
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreateRedirect}
              className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3"
            >
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Thêm Quy Tắc Chuyển Hướng (Redirect Rule) Mới
              </div>

              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Đường dẫn nguồn (Source Path) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="/duong-dan-cu/"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Đường dẫn đích (Destination Path) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="/duong-dan-moi/"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
                >
                  {isPending ? 'Đang lưu...' : 'Lưu Quy Tắc'}
                </button>
              </div>
            </form>
          )}

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4">Đường Dẫn Nguồn</th>
                    <th className="py-3 px-4">Đường Dẫn Đích</th>
                    <th className="py-3 px-4">Mã HTTP</th>
                    <th className="py-3 px-4">Nguồn Gốc (Provenance)</th>
                    <th className="py-3 px-4">Ngày Tạo</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredRedirects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        Không tìm thấy bản ghi chuyển hướng nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredRedirects.map((r) => (
                      <tr
                        key={r.id}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                          !r.isActive ? 'opacity-60 bg-slate-50/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                          {r.sourcePath}
                        </td>
                        <td className="py-3 px-4 font-mono text-sky-600 dark:text-sky-400 font-medium">
                          <div className="flex items-center gap-1.5">
                            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{r.targetPath}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold">
                            {r.statusCode || 301}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {r.entityType ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-[11px]">
                              {r.entityType}
                              {r.entityId ? `: ${r.entityId.slice(0, 8)}...` : ''}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Thủ công</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '—'}
                        </td>
                        <td className="py-3 px-4">
                          {r.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              Đã tắt
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleStatus(r)}
                            disabled={isPending}
                            title={r.isActive ? 'Vô hiệu hóa chuyển hướng' : 'Kích hoạt lại chuyển hướng'}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                              r.isActive
                                ? 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300'
                            }`}
                          >
                            {r.isActive ? (
                              <PowerOff className="w-3.5 h-3.5" />
                            ) : (
                              <Power className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REVALIDATION OUTBOX */}
      {activeTab === 'revalidation' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Hàng Đợi Ghi Nhận Lỗi Cache Revalidation (Post-Commit Outbox)
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Các tác vụ xuất bản thành công vào cơ sở dữ liệu nhưng gặp lỗi làm mới bộ nhớ đệm (ISR/CDN) được lưu trữ tại đây để thử lại an toàn mà không cần xuất bản lại.
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4">Thực Thể</th>
                    <th className="py-3 px-4">Đường Dẫn Cần Làm Mới</th>
                    <th className="py-3 px-4">Cache Tags</th>
                    <th className="py-3 px-4">Lần Thử</th>
                    <th className="py-3 px-4">Lỗi Gần Nhất</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {operations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        Không có lỗi revalidation nào đang chờ xử lý. Hệ thống cache hoạt động tối ưu.
                      </td>
                    </tr>
                  ) : (
                    operations.map((op) => {
                      const paths = (op.paths as string[]) || [];
                      const tags = (op.tags as string[]) || [];

                      return (
                        <tr key={op.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
                              {op.entityType}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] max-w-xs truncate text-slate-700 dark:text-slate-300">
                            {paths.join(', ') || '—'}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] max-w-xs truncate text-slate-500">
                            {tags.join(', ') || '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                            {op.attempts}
                          </td>
                          <td className="py-3 px-4 max-w-sm">
                            {op.lastError ? (
                              <div className="text-rose-600 dark:text-rose-400 text-[11px] font-mono truncate" title={op.lastError}>
                                {op.lastError}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {op.status === 'completed' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Đã hoàn thành
                              </span>
                            ) : op.status === 'failed' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[11px] font-semibold">
                                <AlertTriangle className="w-3 h-3 text-rose-500" />
                                Thất bại
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold">
                                <Clock className="w-3 h-3 text-amber-500" />
                                Đang chờ
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {op.status !== 'completed' && (
                              <button
                                onClick={() => handleRetryReval(op.id)}
                                disabled={retryingId === op.id || isPending}
                                className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100 text-xs font-semibold transition-colors inline-flex items-center gap-1 shadow-sm disabled:opacity-50"
                              >
                                <RefreshCw className={`w-3 h-3 ${retryingId === op.id ? 'animate-spin' : ''}`} />
                                Thử lại
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
