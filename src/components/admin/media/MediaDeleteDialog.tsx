'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Archive, AlertTriangle, ShieldAlert, CheckCircle2, Loader2, X } from 'lucide-react';
import { Media } from '@/db/schema/media';
import { MediaReference } from '@/repositories/contracts/media.repository';
import { deleteMediaAction, archiveMediaAction, checkMediaReferencesAction } from '@/actions/media.actions';

interface MediaDeleteDialogProps {
  media: Media | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (action: 'deleted' | 'archived') => void;
}

export function MediaDeleteDialog({ media, isOpen, onClose, onSuccess }: MediaDeleteDialogProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [references, setReferences] = useState<MediaReference[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && media) {
      setIsChecking(true);
      setErrorMessage(null);
      checkMediaReferencesAction(media.id)
        .then((refs) => setReferences(refs))
        .catch((err) => {
          console.error('Reference check error:', err);
          setReferences([]);
        })
        .finally(() => setIsChecking(false));
    }
  }, [isOpen, media]);

  if (!isOpen || !media) return null;

  const isLegacy = media.storageProvider === 'legacy_public' || media.storagePath.startsWith('/sites/');
  const isReferenced = references.length > 0;

  const handleDelete = async () => {
    if (isLegacy || isReferenced) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await deleteMediaAction(media.id);
      if (!result.success) {
        throw new Error(result.error || 'Xóa media thất bại.');
      }
      onSuccess('deleted');
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Lỗi khi xóa media.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchive = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await archiveMediaAction(media.id);
      if (!result.success) {
        throw new Error(result.error || 'Lưu trữ media thất bại.');
      }
      onSuccess('archived');
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Lỗi khi lưu trữ media.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h2 id="delete-dialog-title" className="text-base font-bold text-slate-900 dark:text-white">
                Xóa hoặc Lưu Trữ Media
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kiểm tra toàn vẹn liên kết và bảo vệ tài nguyên
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Media Preview summary */}
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <img
              src={media.thumbnailUrl || media.publicUrl}
              alt={media.altText || media.filename}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
              {media.filename}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {(media.fileSizeBytes / 1024).toFixed(1)} KB • {media.width ? `${media.width}×${media.height}px` : 'N/A'} • {media.storageProvider}
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Reference Checking Status */}
        <div className="mt-4">
          {isChecking ? (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
              Đang quét liên kết sử dụng trên 8 phân hệ website...
            </div>
          ) : isLegacy ? (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <div className="font-semibold">Tập tin tĩnh hệ thống (Legacy Asset)</div>
                <div className="mt-1 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300/90">
                  Tập tin này thuộc cấu trúc tĩnh của website và được bảo vệ bất biến. Không được phép xóa vật lý. Bạn có thể chọn <strong>Lưu trữ (Archive)</strong> nếu không muốn hiển thị trong bộ lọc hoạt động.
                </div>
              </div>
            </div>
          ) : isReferenced ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <div className="flex items-center gap-2 font-semibold text-red-800 dark:text-red-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Không thể xóa! Đang được sử dụng tại {references.length} vị trí:
              </div>
              <ul className="mt-2 max-h-36 space-y-1.5 overflow-y-auto pl-2 text-[11px] text-red-800 dark:text-red-300/90">
                {references.map((ref, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="font-bold">•</span>
                    <span>{ref.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-900 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <div className="font-semibold">Tập tin an toàn để xóa</div>
                <div className="text-[11px] text-green-800 dark:text-green-300/90 mt-0.5">
                  Không tìm thấy liên kết sử dụng nào trong cơ sở dữ liệu.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Hủy
          </button>

          {/* Archive Button */}
          {media.status !== 'archived' && (
            <button
              type="button"
              onClick={handleArchive}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/60"
            >
              <Archive className="h-3.5 w-3.5" />
              Lưu Trữ (Archive)
            </button>
          )}

          {/* Physical Delete Button (Only for unreferenced non-legacy) */}
          {!isLegacy && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isReferenced || isChecking || isProcessing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-red-500 dark:hover:bg-red-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  Xóa Vĩnh Viễn
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
