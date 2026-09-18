'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  UploadCloud,
  Grid,
  List,
  Copy,
  Check,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Media } from '@/db/schema/media';
import { MediaUploadDialog } from './MediaUploadDialog';
import { MediaDetailDrawer } from './MediaDetailDrawer';

interface MediaLibraryProps {
  initialItems: Media[];
  total: number;
  limit: number;
  offset: number;
  search?: string;
  mimeType?: string;
  status?: string;
  activeCount: number;
  archivedCount: number;
}

export function MediaLibrary({
  initialItems,
  total,
  limit,
  offset,
  search = '',
  mimeType = 'all',
  status = 'active',
  activeCount,
  archivedCount,
}: MediaLibraryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [items, setItems] = useState<Media[]>(initialItems);
  const [searchTerm, setSearchTerm] = useState(search);
  const [selectedMime, setSelectedMime] = useState(mimeType);
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState<Media | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync with prop updates
  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const updateFilters = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === 'all' && (key === 'mimeType' || key === 'status')) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset offset on filter change if not navigating page
    if (!newParams.offset) {
      params.delete('offset');
    }

    startTransition(() => {
      router.push(`/admin/media?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm, offset: '0' });
  };

  const handleCopyUrl = async (e: React.MouseEvent, item: Media) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.publicUrl);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCardClick = (item: Media) => {
    setActiveMedia(item);
    setIsDrawerOpen(true);
  };

  const handleUploadSuccess = (newMedia: Media) => {
    setItems((prev) => [newMedia, ...prev]);
    setActiveMedia(newMedia);
    setIsDrawerOpen(true);
    startTransition(() => {
      router.refresh();
    });
  };

  const handleMediaUpdated = (updatedMedia: Media) => {
    setItems((prev) => prev.map((m) => (m.id === updatedMedia.id ? updatedMedia : m)));
    setActiveMedia(updatedMedia);
  };

  const handleMediaDeletedOrArchived = () => {
    setIsDrawerOpen(false);
    setActiveMedia(null);
    startTransition(() => {
      router.refresh();
    });
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-4">
      {/* Control Bar & Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Search & Filter Dropdowns */}
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên file, alt text..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 transition-colors focus:border-cyan-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500"
            />
          </form>

          {/* MIME Type Select */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="mime-filter" className="sr-only">
              Lọc theo định dạng
            </label>
            <select
              id="mime-filter"
              value={selectedMime}
              onChange={(e) => {
                setSelectedMime(e.target.value);
                updateFilters({ mimeType: e.target.value, offset: '0' });
              }}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="all">Tất cả định dạng</option>
              <option value="image/webp">WebP</option>
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/gif">GIF</option>
              <option value="image/svg+xml">SVG (Tĩnh)</option>
            </select>
          </div>

          {/* Status Select */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="status-filter" className="sr-only">
              Lọc theo trạng thái
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                updateFilters({ status: e.target.value, offset: '0' });
              }}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="active">Đang hoạt động ({activeCount})</option>
              <option value="archived">Đã lưu trữ ({archivedCount})</option>
              <option value="all">Tất cả ({activeCount + archivedCount})</option>
            </select>
          </div>
        </div>

        {/* Right: View mode & Upload Button */}
        <div className="flex items-center gap-2.5 self-end lg:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-cyan-600 shadow-2xs dark:bg-slate-800 dark:text-cyan-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              aria-label="Xem dạng lưới"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-cyan-600 shadow-2xs dark:bg-slate-800 dark:text-cyan-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              aria-label="Xem dạng danh sách"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 transition-colors cursor-pointer"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Tải Lên Media</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {items.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 mb-3">
            <ImageIcon className="h-7 w-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Không tìm thấy tập tin media nào
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Không có kết quả phù hợp với điều kiện tìm kiếm hoặc bộ lọc hiện tại. Thử đổi từ khóa hoặc tải lên hình ảnh mới.
          </p>
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600"
          >
            <UploadCloud className="h-4 w-4" />
            Tải Lên Hình Ảnh Đầu Tiên
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Presentation */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item)}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-500"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-square w-full overflow-hidden bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-2">
                <img
                  src={item.thumbnailUrl || item.publicUrl}
                  alt={item.altText || item.filename}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
                />

                {/* Status or Format Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {item.status === 'archived' && (
                    <span className="rounded-md bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase shadow-xs">
                      Lưu trữ
                    </span>
                  )}
                  <span className="rounded-md bg-slate-900/70 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase backdrop-blur-xs">
                    {item.mimeType.split('/')[1] || 'IMG'}
                  </span>
                </div>

                {/* Quick Copy URL on hover */}
                <button
                  type="button"
                  onClick={(e) => handleCopyUrl(e, item)}
                  title="Sao chép URL công khai"
                  className="absolute top-2 right-2 rounded-lg bg-white/90 p-1.5 text-slate-600 shadow-sm opacity-0 group-hover:opacity-100 hover:bg-white hover:text-cyan-600 transition dark:bg-slate-900/90 dark:text-slate-300 dark:hover:text-cyan-400"
                >
                  {copiedId === item.id ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* Card Footer Info */}
              <div className="p-2.5 flex flex-col justify-between flex-1 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80">
                <div className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200" title={item.filename}>
                  {item.filename}
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{item.width ? `${item.width}×${item.height}` : 'Vector'}</span>
                  <span>{(item.fileSizeBytes / 1024).toFixed(0)} KB</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List / Table Presentation */
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="py-3 pl-4 pr-2 font-semibold">Ảnh</th>
                <th className="px-3 py-3 font-semibold">Tên tệp & Alt text</th>
                <th className="px-3 py-3 font-semibold">Định dạng</th>
                <th className="px-3 py-3 font-semibold">Kích thước</th>
                <th className="px-3 py-3 font-semibold">Dung lượng</th>
                <th className="px-3 py-3 font-semibold">Trạng thái</th>
                <th className="px-3 py-3 font-semibold">Ngày tạo</th>
                <th className="py-3 pr-4 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 pl-4 pr-2">
                    <div className="h-10 w-10 overflow-hidden rounded-md border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 flex items-center justify-center">
                      <img
                        src={item.thumbnailUrl || item.publicUrl}
                        alt={item.altText || item.filename}
                        className="h-full w-full object-contain p-0.5"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
                      {item.filename}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                      {item.altText ? `Alt: "${item.altText}"` : '— Chưa có alt text —'}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 uppercase font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {item.mimeType.split('/')[1]}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                    {item.width ? `${item.width}×${item.height}px` : 'Vector'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                    {(item.fileSizeBytes / 1024).toFixed(1)} KB
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        item.status === 'archived'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-400'
                      }`}
                    >
                      {item.status === 'archived' ? 'Lưu trữ' : 'Hoạt động'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                    {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(
                      new Date(item.createdAt)
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => handleCopyUrl(e, item)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Chép URL</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-white px-4 py-3 rounded-xl dark:border-slate-800 dark:bg-slate-900 text-xs">
          <div className="text-slate-500 dark:text-slate-400">
            Hiển thị <span className="font-semibold text-slate-900 dark:text-white">{offset + 1}</span> -{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{Math.min(offset + limit, total)}</span> trong{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{total}</span> tệp media
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1 || isPending}
              onClick={() => updateFilters({ offset: Math.max(0, offset - limit).toString() })}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Trước
            </button>

            <span className="px-2 text-slate-600 dark:text-slate-300 font-medium">
              Trang {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages || isPending}
              onClick={() => updateFilters({ offset: (offset + limit).toString() })}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Tiếp theo
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <MediaUploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Detail Drawer */}
      <MediaDetailDrawer
        media={activeMedia}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setActiveMedia(null);
        }}
        onMediaUpdated={handleMediaUpdated}
        onMediaDeletedOrArchived={handleMediaDeletedOrArchived}
      />
    </div>
  );
}
