'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Save,
  Trash2,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Media } from '@/db/schema/media';
import { updateMediaMetadataAction } from '@/actions/media.actions';
import { MediaDeleteDialog } from './MediaDeleteDialog';

interface MediaDetailDrawerProps {
  media: Media | null;
  isOpen: boolean;
  onClose: () => void;
  onMediaUpdated: (updatedMedia: Media) => void;
  onMediaDeletedOrArchived: () => void;
}

export function MediaDetailDrawer({
  media,
  isOpen,
  onClose,
  onMediaUpdated,
  onMediaDeletedOrArchived,
}: MediaDetailDrawerProps) {
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [isDecorative, setIsDecorative] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedChecksum, setCopiedChecksum] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (media) {
      setAltText(media.altText || '');
      setCaption(media.caption || '');
      setIsDecorative(!media.altText);
      setSaveSuccess(false);
      setSaveError(null);
    }
  }, [media]);

  if (!isOpen || !media) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(media.publicUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyChecksum = async () => {
    if (!media.checksum) return;
    try {
      await navigator.clipboard.writeText(media.checksum);
      setCopiedChecksum(true);
      setTimeout(() => setCopiedChecksum(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const finalAltText = isDecorative ? '' : altText.trim();
      const finalCaption = caption.trim() || null;

      const result = await updateMediaMetadataAction(media.id, {
        altText: finalAltText,
        caption: finalCaption,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Cập nhật thất bại.');
      }

      setSaveSuccess(true);
      onMediaUpdated(result.data);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Lỗi cập nhật metadata.');
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(media.createdAt));

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl transition-transform dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Chi tiết tập tin media"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Chi Tiết Tập Tin Media
            </h2>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                media.status === 'archived'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                  : 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-400'
              }`}
            >
              {media.status === 'archived' ? 'Đã lưu trữ' : 'Đang hoạt động'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Đóng bảng chi tiết"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Image Preview Box */}
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] dark:border-slate-800 dark:bg-[radial-gradient(#334155_1px,transparent_1px)]">
            <img
              src={media.publicUrl}
              alt={media.altText || media.filename}
              className="max-h-full max-w-full object-contain drop-shadow-sm p-2"
            />
          </div>

          {/* Copy Public URL Banner */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Đường dẫn công khai (Public URL):
              </div>
              <div className="truncate text-xs font-mono font-semibold text-slate-900 dark:text-cyan-400 mt-0.5">
                {media.publicUrl}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-1.5 shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {copiedUrl ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  <span className="text-green-600 dark:text-green-400">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="text-slate-500 dark:text-slate-400">Kích thước ảnh</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                {media.width ? `${media.width} × ${media.height} px` : 'Tệp Vector / N/A'}
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="text-slate-500 dark:text-slate-400">Dung lượng tập tin</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                {(media.fileSizeBytes / 1024).toFixed(1)} KB ({media.fileSizeBytes.toLocaleString()} bytes)
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="text-slate-500 dark:text-slate-400">Định dạng MIME</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-1 uppercase font-mono">
                {media.mimeType}
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="text-slate-500 dark:text-slate-400">Nguồn lưu trữ</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-1 capitalize">
                {media.storageProvider === 'legacy_public' ? 'Tĩnh Hệ Thống (Public)' : 'Tải lên CMS (Local)'}
              </div>
            </div>
          </div>

          {/* Checksum & Date */}
          <div className="space-y-2 text-xs">
            {media.checksum && (
              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Mã băm toàn vẹn (SHA-256):</span>
                  <button
                    type="button"
                    onClick={handleCopyChecksum}
                    className="text-[11px] font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
                  >
                    {copiedChecksum ? 'Đã chép SHA-256' : 'Sao chép mã băm'}
                  </button>
                </div>
                <div className="mt-1 truncate font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  {media.checksum}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
              <span>Ngày tạo: {formattedDate}</span>
              <span>Tên tệp gốc: {media.originalFilename || media.filename}</span>
            </div>
          </div>

          {/* Edit Metadata Form */}
          <form onSubmit={handleSave} className="space-y-4 border-t border-slate-100 pt-5 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              Chỉnh Sửa Thông Tin SEO & Chú Thích
            </h3>

            {saveSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-800 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                Đã cập nhật thông tin media thành công!
              </div>
            )}

            {saveError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                {saveError}
              </div>
            )}

            {/* Alt Text Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="drawer-alt-text"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Văn bản thay thế (Alt Text)
                </label>
                <span className="text-[11px] text-slate-400">
                  {isDecorative ? 'Ảnh trang trí' : `${altText.length}/255 ký tự`}
                </span>
              </div>
              <input
                id="drawer-alt-text"
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value.slice(0, 255))}
                disabled={isDecorative || isSaving}
                placeholder="Mô tả nội dung hình ảnh y khoa..."
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 transition-colors dark:text-white ${
                  isDecorative
                    ? 'border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-800'
                    : 'border-slate-300 bg-white focus:border-cyan-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950'
                }`}
              />
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="drawer-is-decorative"
                  type="checkbox"
                  checked={isDecorative}
                  onChange={(e) => setIsDecorative(e.target.checked)}
                  disabled={isSaving}
                  className="h-4 w-4 rounded-sm border-slate-300 text-cyan-600 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-950"
                />
                <label
                  htmlFor="drawer-is-decorative"
                  className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none"
                >
                  Đánh dấu là ảnh trang trí (Decorative image - bỏ qua alt text)
                </label>
              </div>
            </div>

            {/* Caption Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="drawer-caption"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Chú thích ảnh (Caption)
              </label>
              <textarea
                id="drawer-caption"
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={isSaving}
                placeholder="Hiển thị dưới chân hình ảnh trong bài viết nếu có..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Action Bar inside Form */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline dark:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Xóa hoặc Lưu trữ
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 disabled:opacity-50 transition-colors dark:bg-cyan-500 dark:hover:bg-cyan-600"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Lưu Thay Đổi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <MediaDeleteDialog
        media={media}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={() => {
          setIsDeleteDialogOpen(false);
          onMediaDeletedOrArchived();
          onClose();
        }}
      />
    </>
  );
}
