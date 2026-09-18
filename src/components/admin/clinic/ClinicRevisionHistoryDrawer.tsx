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

interface ClinicRevisionHistoryDrawerProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  fetchRevisions: () => Promise<ContentRevision[]>;
  onRestoreRevision: (revisionId: string) => Promise<{ success: boolean; data?: ContentRevision; error?: string }>;
  onRestored?: (newRevision: ContentRevision) => void;
}

export function ClinicRevisionHistoryDrawer({
  title,
  isOpen,
  onClose,
  fetchRevisions,
  onRestoreRevision,
  onRestored,
}: ClinicRevisionHistoryDrawerProps) {
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
        `Bạn có chắc chắn muốn khôi phục lại dữ liệu từ Phiên bản #${revision.revisionNumber}? Thao tác này sẽ tạo một bản nháp mới kế thừa toàn bộ nội dung từ phiên bản này.`
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
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            <Archive className="h-3 w-3" /> Lưu trữ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Save className="h-3 w-3" /> Bản nháp
          </span>
        );
    }
  }

  if (!isOpen) return null;

  const selectedRev = revisions.find((r) => r.id === selectedRevId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Lịch sử phiên bản
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-hidden flex divide-x divide-slate-200 dark:divide-slate-800">
          {/* Left Column: Revision Timeline List */}
          <div className="w-1/2 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                <span className="text-xs">Đang tải lịch sử phiên bản...</span>
              </div>
            ) : error ? (
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            ) : revisions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Chưa có bản ghi lịch sử nào.
              </div>
            ) : (
              revisions.map((rev) => {
                const isSelected = rev.id === selectedRevId;
                return (
                  <div
                    key={rev.id}
                    onClick={() => setSelectedRevId(rev.id)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        Phiên bản #{rev.revisionNumber}
                      </span>
                      {getStatusBadge(rev.status)}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                      {rev.changeSummary || 'Không có mô tả thay đổi'}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(rev.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Selected Revision Details */}
          <div className="w-1/2 overflow-y-auto p-4 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/30">
            {selectedRev ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Chi tiết Phiên bản #{selectedRev.revisionNumber}
                    </h3>
                    {getStatusBadge(selectedRev.status)}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tạo lúc: {new Date(selectedRev.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <span className="font-medium text-slate-500 dark:text-slate-400 block mb-1">
                      Tóm tắt thay đổi:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200">
                      {selectedRev.changeSummary || 'Không có mô tả'}
                    </p>
                  </div>

                  {selectedRev.medicalReviewNotes && (
                    <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300">
                      <span className="font-medium block mb-1">Ghi chú thẩm định:</span>
                      <p>{selectedRev.medicalReviewNotes}</p>
                    </div>
                  )}

                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <span className="font-medium text-slate-500 dark:text-slate-400 block mb-1">
                      Dữ liệu snapshot:
                    </span>
                    <pre className="text-[10px] text-slate-700 dark:text-slate-300 max-h-48 overflow-y-auto p-2 bg-slate-100 dark:bg-slate-900 rounded font-mono">
                      {JSON.stringify(selectedRev.payload, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Restore Action */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={restoringId === selectedRev.id}
                    onClick={() => handleRestore(selectedRev)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                  >
                    {restoringId === selectedRev.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Đang khôi phục...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4" />
                        <span>Khôi phục thành Bản nháp mới</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-1.5">
                    Thao tác này tạo một bản nháp mới kế thừa toàn bộ nội dung từ phiên bản này mà
                    không xóa lịch sử hiện có.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                <FileText className="h-8 w-8 mb-2 opacity-30" />
                <span>Chọn một phiên bản để xem chi tiết</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
