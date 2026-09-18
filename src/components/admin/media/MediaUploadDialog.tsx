'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, AlertTriangle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Media } from '@/db/schema/media';

interface MediaUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (media: Media) => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export function MediaUploadDialog({ isOpen, onClose, onUploadSuccess }: MediaUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [isDecorative, setIsDecorative] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelection = (selectedFile: File) => {
    setErrorMessage(null);

    // 1. SVG check
    if (selectedFile.name.toLowerCase().endsWith('.svg') || selectedFile.type === 'image/svg+xml') {
      setErrorMessage(
        'Tải lên tệp SVG không được hỗ trợ vì lý do an toàn bảo mật (phòng ngừa XSS / XML Injection). Vui lòng sử dụng WebP, PNG, JPEG hoặc GIF.'
      );
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    // 2. Size limit check
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (selectedFile.size / (1024 * 1024)).toFixed(2);
      setErrorMessage(`Dung lượng tệp vượt quá giới hạn cho phép 10MB (${sizeMb}MB).`);
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    // 3. MIME check
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setErrorMessage('Định dạng tệp không hợp lệ. Chỉ chấp nhận ảnh: WebP, PNG, JPEG, GIF, AVIF.');
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Default friendly alt text from filename
    if (!altText) {
      const defaultAlt = selectedFile.name
        .replace(/\.[^.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim();
      setAltText(defaultAlt);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Vui lòng chọn một tệp hình ảnh để tải lên.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', isDecorative ? '' : altText);
      if (caption.trim()) {
        formData.append('caption', caption.trim());
      }

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Tải lên hình ảnh thất bại.');
      }

      onUploadSuccess(data.media);
      handleClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setAltText('');
    setCaption('');
    setIsDecorative(false);
    setErrorMessage(null);
    setIsUploading(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-dialog-title"
    >
      <div className="relative w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h2 id="upload-dialog-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Tải Lên Hình Ảnh Mới
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hỗ trợ WebP, PNG, JPEG, GIF (Tối đa 10MB)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Dropzone */}
          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-cyan-500 bg-cyan-50/50 dark:border-cyan-400 dark:bg-cyan-950/20'
                  : 'border-slate-300 hover:border-cyan-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-cyan-500 dark:hover:bg-slate-800/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileSelection(e.target.files[0]);
                  }
                }}
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 mb-3">
                <ImageIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Kéo & thả hình ảnh vào đây hoặc nhấp để chọn tệp
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                WebP, PNG, JPG, GIF (Tự động tối ưu WebP thumbnail)
              </p>
            </div>
          ) : (
            <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {file.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {(file.size / 1024).toFixed(1)} KB • {file.type || 'image'}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                    disabled={isUploading}
                    className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Chọn tệp khác
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Alt Text Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="alt-text"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Văn bản thay thế (Alt Text)
              </label>
              <span className="text-[11px] text-slate-400">
                {isDecorative ? 'Ảnh trang trí' : `${altText.length}/255 ký tự`}
              </span>
            </div>
            <input
              id="alt-text"
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value.slice(0, 255))}
              disabled={isDecorative || isUploading}
              placeholder="Mô tả nội dung ảnh y khoa (Chuẩn SEO & Trợ năng Screen Reader)"
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors dark:text-white dark:placeholder-slate-500 ${
                isDecorative
                  ? 'border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-800'
                  : 'border-slate-300 bg-white focus:border-cyan-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950'
              }`}
            />
            <div className="flex items-center gap-2 pt-1">
              <input
                id="is-decorative"
                type="checkbox"
                checked={isDecorative}
                onChange={(e) => setIsDecorative(e.target.checked)}
                disabled={isUploading}
                className="h-4 w-4 rounded-sm border-slate-300 text-cyan-600 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-950"
              />
              <label
                htmlFor="is-decorative"
                className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none"
              >
                Ảnh thuần trang trí (Không cần alt text, screen reader sẽ bỏ qua)
              </label>
            </div>
          </div>

          {/* Caption Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="caption"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Chú thích ảnh (Caption - Tùy chọn)
            </label>
            <textarea
              id="caption"
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={isUploading}
              placeholder="Hiển thị dưới chân hình ảnh trong bài viết chuyên khoa nếu có..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-cyan-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!file || isUploading}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-cyan-500 dark:hover:bg-cyan-600"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải lên & xử lý...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  Tải Lên Thư Viện
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
