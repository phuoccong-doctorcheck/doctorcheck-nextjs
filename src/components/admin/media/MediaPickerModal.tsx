'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Search,
  Check,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { Media } from '@/db/schema/media';
import { MediaUploadDialog } from './MediaUploadDialog';

export interface MediaPickerSelection {
  id: string;
  publicUrl: string;
  altText: string;
  width: number | null;
  height: number | null;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (selection: MediaPickerSelection) => void;
  currentSelectedId?: string;
  title?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelectMedia,
  currentSelectedId,
  title = 'Chọn Hình Ảnh Từ Thư Viện Media',
}: MediaPickerModalProps) {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [search, setSearch] = useState('');
  const [mimeType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const loadMedia = useCallback(async (searchTerm = search) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (mimeType !== 'all') params.set('mimeType', mimeType);
      params.set('limit', '50');

      const res = await fetch(`/api/admin/media/list?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMediaList(data.items || []);
        if (currentSelectedId && !selectedMedia) {
          const found = (data.items || []).find((m: Media) => m.id === currentSelectedId);
          if (found) setSelectedMedia(found);
        }
      }
    } catch (err) {
      console.warn('Failed to load media list for picker:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, mimeType, currentSelectedId, selectedMedia]);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen, loadMedia]);

  if (!isOpen) return null;

  const handleConfirmSelection = () => {
    if (!selectedMedia) return;
    onSelectMedia({
      id: selectedMedia.id,
      publicUrl: selectedMedia.publicUrl,
      altText: selectedMedia.altText || '',
      width: selectedMedia.width,
      height: selectedMedia.height,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="relative flex h-[85vh] w-full max-w-4xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400">
              <ImageIcon className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-6 py-3 dark:border-slate-800 dark:bg-slate-950/30">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadMedia(search)}
              placeholder="Tìm kiếm hình ảnh theo tên, alt text..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* Quick upload trigger */}
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 shadow-2xs"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Tải Ảnh Mới
          </button>
        </div>

        {/* Grid of Media */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center gap-2 text-xs text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
              Đang tải danh sách media...
            </div>
          ) : mediaList.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-8">
              <ImageIcon className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Không tìm thấy hình ảnh nào
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Thử tìm kiếm từ khóa khác hoặc tải lên hình ảnh mới.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {mediaList.map((item) => {
                const isSelected = selectedMedia?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className={`group relative flex flex-col overflow-hidden rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-cyan-500 ring-2 ring-cyan-500/30 dark:border-cyan-400'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs dark:border-slate-800 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-950/60">
                      <img
                        src={item.thumbnailUrl || item.publicUrl}
                        alt={item.altText || item.filename}
                        className="h-full w-full object-contain p-1 transition-transform group-hover:scale-105"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-600 text-white shadow-md">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-2 bg-white dark:bg-slate-900 text-[11px]">
                      <div className="truncate font-semibold text-slate-800 dark:text-slate-200">
                        {item.filename}
                      </div>
                      <div className="text-slate-400 text-[10px] mt-0.5">
                        {item.width ? `${item.width}×${item.height}` : 'Vector'} • {(item.fileSizeBytes / 1024).toFixed(0)}KB
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {selectedMedia ? (
              <span className="font-medium text-slate-900 dark:text-white">
                Đã chọn: <span className="text-cyan-600 dark:text-cyan-400">{selectedMedia.filename}</span>
              </span>
            ) : (
              'Chọn một hình ảnh từ danh sách ở trên'
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmSelection}
              disabled={!selectedMedia}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-cyan-500 dark:hover:bg-cyan-600"
            >
              <Check className="h-3.5 w-3.5" />
              Sử Dụng Hình Ảnh Này
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Upload Dialog */}
      <MediaUploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={(newMedia) => {
          setMediaList((prev) => [newMedia, ...prev]);
          setSelectedMedia(newMedia);
          setIsUploadOpen(false);
        }}
      />
    </div>
  );
}
