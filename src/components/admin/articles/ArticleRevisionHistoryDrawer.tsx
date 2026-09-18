'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  History,
  X,
  RotateCcw,
  Clock,
  User,
  CheckCircle2,
  FileEdit,
  Send,
  Archive,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ContentRevision } from '@/db/schema/workflow';
import { getArticleRevisionsAction, restoreArticleRevisionAction } from '@/actions/article.actions';

interface ArticleRevisionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  onRestoredSuccess?: (newRevision: ContentRevision) => void;
}

export function ArticleRevisionHistoryDrawer({
  isOpen,
  onClose,
  entityId,
  onRestoredSuccess,
}: ArticleRevisionHistoryDrawerProps) {
  const [revisions, setRevisions] = useState<ContentRevision[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRevId, setExpandedRevId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen || !entityId) return;

    let isMounted = true;
    startTransition(async () => {
      setIsLoading(true);
      setError(null);

      const res = await getArticleRevisionsAction(entityId);
      if (!isMounted) return;
      setIsLoading(false);
      if (res.success && res.data) {
        setRevisions(res.data);
      } else {
        setError(res.error || 'Không thể tải lịch sử phiên bản.');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, entityId]);

  if (!isOpen) return null;

  const handleRestore = (rev: ContentRevision) => {
    if (!confirm(`Bạn có chắc muốn khôi phục nội dung từ phiên bản v${rev.revisionNumber}? Thao tác này sẽ tạo một bản nháp mới kế thừa toàn bộ nội dung của phiên bản đã chọn.`)) {
      return;
    }

    startTransition(async () => {
      const res = await restoreArticleRevisionAction(rev.id);
      if (!res.success) {
        alert(res.error || 'Khôi phục phiên bản thất bại.');
      } else if (res.data) {
        alert(`Đã khôi phục thành công! Tạo bản nháp mới v${res.data.revisionNumber}.`);
        if (onRestoredSuccess) {
          onRestoredSuccess(res.data);
        }
        onClose();
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
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
            <FileEdit className="h-3 w-3" /> Bản nháp
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Lịch Sử Phiên Bản Bài Viết</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center gap-2 text-xs text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
              Đang tải lịch sử phiên bản...
            </div>
          ) : error ? (
            <div className="rounded-lg bg-rose-50 p-4 text-xs text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          ) : revisions.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              <History className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
              Chưa có lịch sử phiên bản workflow nào cho bài viết này.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6">
              {revisions.map((rev) => {
                const isExpanded = expandedRevId === rev.id;
                const payload = rev.payload as Record<string, unknown> | null;

                return (
                  <div key={rev.id} className="relative pl-6">
                    {/* Timeline bullet */}
                    <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-cyan-600 dark:border-slate-900" />

                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            v{rev.revisionNumber}
                          </span>
                          {getStatusBadge(rev.status)}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Phiên bản đồng quy #{rev.version}
                        </span>
                      </div>

                      {rev.changeSummary && (
                        <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                          {rev.changeSummary}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{rev.createdBy || 'Hệ thống'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(rev.createdAt).toLocaleString('vi-VN')}</span>
                        </div>
                      </div>

                      {/* Expand / Actions */}
                      <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-800/60 text-xs">
                        <button
                          type="button"
                          onClick={() => setExpandedRevId(isExpanded ? null : rev.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3 w-3" /> Thu gọn
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3" /> Xem chi tiết
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleRestore(rev)}
                          className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-[11px] font-semibold text-cyan-700 border border-slate-200 shadow-2xs hover:bg-cyan-50 dark:bg-slate-900 dark:text-cyan-300 dark:border-slate-700 dark:hover:bg-slate-800"
                          title="Tạo bản nháp mới kế thừa nội dung này"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Khôi phục về bản nháp
                        </button>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && payload && (
                        <div className="mt-3 rounded-lg bg-white p-3 text-[11px] border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-2 font-mono">
                          <div>
                            <span className="text-slate-400">Tiêu đề: </span>
                            <span className="text-slate-800 dark:text-slate-200 font-sans font-medium">
                              {String(payload.title || '')}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Đường dẫn: </span>
                            <span className="text-slate-600 dark:text-slate-300">
                              /{String(payload.slug || '')}
                            </span>
                          </div>
                          {Boolean(payload.authorName) && (
                            <div>
                              <span className="text-slate-400">Tác giả: </span>
                              <span className="text-slate-600 dark:text-slate-300">
                                {String(payload.authorName)}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-slate-400">Kích thước HTML: </span>
                            <span className="text-slate-600 dark:text-slate-300">
                              {String(payload.contentHtml || '').length} ký tự
                            </span>
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
  );
}
