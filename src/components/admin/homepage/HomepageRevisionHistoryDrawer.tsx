'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  Clock,
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

interface HomepageRevisionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  fetchRevisions: () => Promise<ContentRevision[]>;
  onRestoreRevision: (revisionId: string) => Promise<{ success: boolean; data?: ContentRevision; error?: string }>;
  onRestored?: (newRevision: ContentRevision) => void;
}

export function HomepageRevisionHistoryDrawer({
  isOpen,
  onClose,
  fetchRevisions,
  onRestoreRevision,
  onRestored,
}: HomepageRevisionHistoryDrawerProps) {
  const [revisions, setRevisions] = useState<ContentRevision[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [selectedRevId, setSelectedRevId] = useState<string | null>(null);

  const loadRevisions = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRevisions();
      setRevisions(data);
      if (data.length > 0 && !selectedRevId) {
        setSelectedRevId(data[0].id);
      }
    } catch {
      setError('Lỗi kết nối khi tải lịch sử.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchRevisions, selectedRevId]);

  useEffect(() => {
    if (isOpen) {
      loadRevisions();
    }
  }, [isOpen, loadRevisions]);

  async function handleRestore(revision: ContentRevision) {
    if (
      !confirm(
        `Bạn có chắc chắn muốn khôi phục lại dữ liệu Trang chủ từ Phiên bản #${revision.revisionNumber}? Thao tác này sẽ tạo một bản nháp mới kế thừa toàn bộ nội dung từ phiên bản này mà không làm gián đoạn trang chủ đang chạy.`
      )
    ) {
      return;
    }

    setRestoringId(revision.id);
    try {
      const res = await onRestoreRevision(revision.id);
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
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 text-[11px] font-medium text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
            <CheckCircle2 className="h-3 w-3" /> Đã duyệt
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Send className="h-3 w-3" /> Chờ duyệt
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Archive className="h-3 w-3" /> Lưu trữ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 dark:bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Save className="h-3 w-3" /> Bản nháp
          </span>
        );
    }
  }

  if (!isOpen) return null;

  const selectedRev = revisions.find((r) => r.id === selectedRevId);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Lịch sử phiên bản: Cấu hình Trang chủ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Toàn bộ lịch sử các lần lưu nháp và xuất bản Trang chủ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden grid grid-cols-5 divide-x divide-slate-200 dark:divide-slate-800">
          {/* Left Column: Revision List */}
          <div className="col-span-2 overflow-y-auto p-4 space-y-2">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <span className="text-xs">Đang tải lịch sử...</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isLoading && !error && revisions.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                Chưa có phiên bản nào được ghi nhận.
              </div>
            )}

            {!isLoading &&
              revisions.map((rev) => {
                const isSelected = rev.id === selectedRevId;
                return (
                  <button
                    key={rev.id}
                    onClick={() => setSelectedRevId(rev.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-500 dark:border-teal-500/60 ring-1 ring-teal-500'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        Phiên bản #{rev.revisionNumber}
                      </span>
                      {getStatusBadge(rev.status)}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-1">
                      {rev.changeSummary || 'Không có mô tả thay đổi'}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(rev.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Right Column: Revision Details & Actions */}
          <div className="col-span-3 overflow-y-auto p-5 flex flex-col">
            {selectedRev ? (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Chi tiết Phiên bản #{selectedRev.revisionNumber}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Tạo ngày {new Date(selectedRev.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRestore(selectedRev)}
                    disabled={restoringId === selectedRev.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
                  >
                    {restoringId === selectedRev.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                    <span>Khôi phục bản này</span>
                  </button>
                </div>

                <div className="space-y-3 flex-1 text-xs">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">
                      Mô tả tóm tắt thay đổi:
                    </span>
                    <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      {selectedRev.changeSummary || 'Không có mô tả chi tiết'}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">
                      Xem trước dữ liệu cấu hình snapshot (JSON):
                    </span>
                    <pre className="p-3 rounded-lg bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
                      {JSON.stringify(selectedRev.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
                <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                <span>Chọn một phiên bản bên trái để xem nội dung chi tiết.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
