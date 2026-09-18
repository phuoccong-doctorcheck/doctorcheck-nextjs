'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  Clock,
  User,
  RotateCcw,
  CheckCircle2,
  Send,
  Save,
  Archive,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { ContentRevision } from '@/db/schema/workflow';
import { getPageRevisionsAction, restorePageRevisionAction } from '@/actions/page.actions';

interface PageRevisionHistoryDrawerProps {
  entityId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestored?: (newRevision: ContentRevision) => void;
}

export function PageRevisionHistoryDrawer({
  entityId,
  isOpen,
  onClose,
  onRestored,
}: PageRevisionHistoryDrawerProps) {
  const [revisions, setRevisions] = useState<ContentRevision[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [selectedRevId, setSelectedRevId] = useState<string | null>(null);

  const loadRevisions = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getPageRevisionsAction(entityId);
      if (res.success && res.data) {
        setRevisions(res.data);
        if (res.data.length > 0 && !selectedRevId) {
          setSelectedRevId(res.data[0].id);
        }
      } else {
        setError(res.error || 'Không thể tải lịch sử phiên bản.');
      }
    } catch {
      setError('Lỗi kết nối khi tải lịch sử.');
    } finally {
      setIsLoading(false);
    }
  }, [entityId, selectedRevId]);

  useEffect(() => {
    if (isOpen && entityId) {
      loadRevisions();
    }
  }, [isOpen, entityId, loadRevisions]);

  async function handleRestore(revision: ContentRevision) {
    if (
      !confirm(
        `Bạn có chắc chắn muốn khôi phục lại dữ liệu từ Phiên bản #${revision.revisionNumber}? Thao tác này sẽ tạo một bản nháp mới kế thừa toàn bộ nội dung từ phiên bản này.`
      )
    ) {
      return;
    }

    setRestoringId(revision.id);
    try {
      const res = await restorePageRevisionAction(revision.id);
      if (res.success && res.data) {
        alert(`Đã khôi phục thành công! Tạo bản nháp mới #${res.data.revisionNumber}.`);
        onRestored?.(res.data);
        onClose();
      } else {
        alert(res.error || 'Khôi phục phiên bản thất bại.');
      }
    } catch {
      alert('Đã xảy ra lỗi khi khôi phục phiên bản.');
    } finally {
      setRestoringId(null);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-3 w-3" /> Đã xuất bản
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <CheckCircle2 className="h-3 w-3" /> Đã phê duyệt
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Send className="h-3 w-3" /> Chờ thẩm định
          </span>
        );
      case 'changes_requested':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="h-3 w-3" /> Yêu cầu sửa
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Archive className="h-3 w-3" /> Đã lưu trữ
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Save className="h-3 w-3" /> Bản nháp
          </span>
        );
    }
  }

  function getActionIcon(status: string) {
    switch (status) {
      case 'published':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      case 'in_review':
        return <Send className="h-4 w-4 text-amber-600" />;
      case 'changes_requested':
        return <AlertCircle className="h-4 w-4 text-rose-600" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-slate-500" />;
      default:
        return <Save className="h-4 w-4 text-slate-500" />;
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Lịch Sử Phiên Bản Trang Tĩnh
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <Loader2 className="h-7 w-7 animate-spin mb-2 text-indigo-600" />
                <span className="text-xs">Đang tải danh sách phiên bản...</span>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-400">
                {error}
              </div>
            ) : revisions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Chưa có bản ghi phiên bản nào cho trang tĩnh này.
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {revisions.map((rev) => {
                  const isSelected = selectedRevId === rev.id;
                  const isRestoring = restoringId === rev.id;
                  const payload = rev.payload as Record<string, unknown> | null;

                  return (
                    <div key={rev.id} className="relative group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 group-hover:scale-110 transition-transform">
                        {getActionIcon(rev.status)}
                      </div>

                      {/* Card Container */}
                      <div
                        onClick={() => setSelectedRevId(rev.id)}
                        className={`cursor-pointer rounded-xl border p-4 transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-slate-400" />
                            Phiên bản #{rev.revisionNumber}
                          </span>
                          {getStatusBadge(rev.status)}
                        </div>

                        {rev.changeSummary && (
                          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                            {rev.changeSummary}
                          </p>
                        )}

                        {/* Restore Action */}
                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] text-slate-400">
                            Version: {rev.version}
                          </span>

                          <button
                            type="button"
                            disabled={isRestoring}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestore(rev);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline disabled:opacity-50"
                          >
                            {isRestoring ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="h-3.5 w-3.5" />
                            )}
                            Khôi phục
                          </button>
                        </div>

                        {/* Meta Footer */}
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(rev.createdAt).toLocaleString('vi-VN')}
                          </span>
                          {rev.createdBy && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              ID: {String(rev.createdBy).slice(0, 8)}...
                            </span>
                          )}
                        </div>

                        {/* Expanded Details for Selected Revision */}
                        {isSelected && payload && (
                          <div className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3 text-xs space-y-1 font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <div>
                              <span className="text-slate-400">Tiêu đề: </span>
                              <span className="font-sans font-medium text-slate-900 dark:text-slate-100">
                                {String(payload.title || '')}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400">Đường dẫn (Path): </span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                {String(payload.path || '')}
                              </span>
                            </div>
                            {Boolean(payload.subpath) && (
                              <div>
                                <span className="text-slate-400">Subpath: </span>
                                <span>{String(payload.subpath)}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-slate-400">Loại trang: </span>
                              <span>{payload.isRoot ? 'Trang Root' : 'Trang Con Nội Soi'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
