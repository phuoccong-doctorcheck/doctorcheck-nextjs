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
  FileCheck,
} from 'lucide-react';
import { ContentRevision } from '@/db/schema/workflow';
import { getDoctorRevisionsAction, restoreDoctorRevisionAction } from '@/actions/doctor.actions';

interface DoctorRevisionHistoryDrawerProps {
  entityId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestored?: (newRevision: ContentRevision) => void;
}

export function DoctorRevisionHistoryDrawer({
  entityId,
  isOpen,
  onClose,
  onRestored,
}: DoctorRevisionHistoryDrawerProps) {
  const [revisions, setRevisions] = useState<ContentRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [selectedRevision, setSelectedRevision] = useState<ContentRevision | null>(null);

  useEffect(() => {
    if (!isOpen || !entityId) return;

    let mounted = true;
    async function loadRevisions() {
      setLoading(true);
      setError(null);
      try {
        const res = await getDoctorRevisionsAction(entityId);
        if (mounted) {
          if (res.success && res.data) {
            setRevisions(res.data);
            if (res.data.length > 0) {
              setSelectedRevision(res.data[0]);
            }
          } else {
            setError(res.error || 'Không thể tải lịch sử phiên bản.');
          }
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadRevisions();

    return () => {
      mounted = false;
    };
  }, [isOpen, entityId]);

  if (!isOpen) return null;

  const handleRestore = async (revisionId: string) => {
    if (!confirm('Bạn có chắc chắn muốn khôi phục bản ghi lịch sử này thành một bản nháp mới?')) {
      return;
    }

    setRestoringId(revisionId);
    setError(null);
    try {
      const res = await restoreDoctorRevisionAction(revisionId);
      if (res.success && res.data) {
        alert(`Khôi phục thành công! Tạo mới Bản Nháp v${res.data.revisionNumber}.`);
        onRestored?.(res.data);
        onClose();
      } else {
        setError(res.error || 'Khôi phục phiên bản thất bại.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRestoringId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
            <Save className="h-3 w-3" /> Bản Nháp
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
            <Send className="h-3 w-3" /> Chờ Duyệt CCHN
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
            <FileCheck className="h-3 w-3" /> Đã Phê Duyệt CCHN
          </span>
        );
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Đang Xuất Bản
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-400">
            <Archive className="h-3 w-3" /> Lưu Trữ
          </span>
        );
      default:
        return (
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {status}
          </span>
        );
    }
  };

  const payload = selectedRevision?.payload as Record<string, unknown> | null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Lịch Sử Phiên Bản Hồ Sơ Bác Sĩ
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="m-4 flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 p-3 text-sm text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mb-3 text-indigo-600" />
                <span>Đang tải lịch sử phiên bản...</span>
              </div>
            ) : revisions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center text-slate-500">
                Chưa có bản ghi lịch sử phiên bản nào cho bác sĩ này.
              </div>
            ) : (
              <div className="space-y-4">
                {revisions.map((rev) => {
                  const isSelected = selectedRevision?.id === rev.id;
                  const isRestoring = restoringId === rev.id;

                  return (
                    <div
                      key={rev.id}
                      onClick={() => setSelectedRevision(rev)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              Phiên bản v{rev.revisionNumber}
                            </span>
                            {getStatusBadge(rev.status)}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {rev.changeSummary || 'Không có ghi chú thay đổi'}
                          </p>
                        </div>

                        {/* Restore Button */}
                        {rev.status !== 'draft' && (
                          <button
                            disabled={isRestoring}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestore(rev.id);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                          >
                            {isRestoring ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="h-3.5 w-3.5" />
                            )}
                            Khôi phục
                          </button>
                        )}
                      </div>

                      {/* Meta Footer */}
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(rev.createdAt).toLocaleString('vi-VN')}
                        </span>
                        {Boolean(rev.createdBy) && (
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            ID: {String(rev.createdBy).slice(0, 8)}...
                          </span>
                        )}
                      </div>

                      {/* Expanded Details for Selected Revision */}
                      {isSelected && payload && (
                        <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3 text-xs space-y-1.5 font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <div>
                            <span className="text-slate-400">Bác sĩ: </span>
                            <span className="font-sans font-medium text-slate-900 dark:text-slate-100">
                              {String(payload.name || '')}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Chức danh: </span>
                            <span className="font-sans">{String(payload.title || '')}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">CCHN: </span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {String(payload.cchn || '')}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Chuyên khoa: </span>
                            <span>{String(payload.specialtySummary || '')}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Bệnh viện: </span>
                            <span>{String(payload.hospital || '')}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Kinh nghiệm: </span>
                            <span>{String(payload.experienceYears || '10')} năm</span>
                          </div>
                        </div>
                      )}
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
