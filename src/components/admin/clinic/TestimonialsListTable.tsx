'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit,
  CheckCircle2,
  XCircle,
  Video,
  BookOpen,
  Play,
  X,
  AlertCircle,
} from 'lucide-react';
import { TestimonialRow } from '@/repositories/contracts/clinical-trust.repository';
import { reorderTestimonialsAction } from '@/actions/clinic-trust.actions';

interface TestimonialsListTableProps {
  initialItems: TestimonialRow[];
  activeType?: 'video' | 'customer_story';
  userPermissions: string[];
}

export function TestimonialsListTable({
  initialItems,
  activeType = 'video',
  userPermissions,
}: TestimonialsListTableProps) {
  const [items, setItems] = useState<TestimonialRow[]>(initialItems);
  const [currentType, setCurrentType] = useState<'video' | 'customer_story'>(activeType);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVideoId, setModalVideoId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const canEdit = userPermissions.includes('clinical_trust.edit') || userPermissions.includes('super_admin');

  const filteredItems = items
    .filter((item) => item.type === currentType)
    .filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.patientName.toLowerCase().includes(q) ||
        (item.tag && item.tag.toLowerCase().includes(q))
      );
    });

  async function handleMove(index: number, direction: 'up' | 'down') {
    const typeItems = items.filter((it) => it.type === currentType);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === typeItems.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newTypeItems = [...typeItems];
    const temp = newTypeItems[index];
    newTypeItems[index] = newTypeItems[targetIndex];
    newTypeItems[targetIndex] = temp;

    newTypeItems.forEach((it, idx) => {
      it.sortOrder = idx + 1;
    });

    const otherItems = items.filter((it) => it.type !== currentType);
    const combined = [...newTypeItems, ...otherItems];

    setItems(combined);
    setIsReordering(true);
    setFeedback(null);

    try {
      const res = await reorderTestimonialsAction(newTypeItems.map((it) => it.id));
      if (!res.success) {
        setFeedback(res.error || 'Lỗi khi sắp xếp lại.');
      }
    } catch {
      setFeedback('Lỗi kết nối khi lưu thứ tự.');
    } finally {
      setIsReordering(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Type Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCurrentType('video')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                currentType === 'video'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Video className="h-4 w-4 text-rose-500" />
              <span>Video Cảm Nhận</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentType('customer_story')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                currentType === 'customer_story'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="h-4 w-4 text-teal-500" />
              <span>Câu Chuyện Khách Hàng</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, tên bệnh nhân..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
            />
          </div>

          {canEdit && (
            <Link
              href={
                currentType === 'video'
                  ? '/admin/clinic/testimonials/new'
                  : '/admin/clinic/stories/new'
              }
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>{currentType === 'video' ? 'Thêm Video mới' : 'Thêm Câu chuyện mới'}</span>
            </Link>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-16 text-center">Thứ tự</th>
                <th className="py-3 px-4 w-24">Thumbnail</th>
                <th className="py-3 px-4">Tiêu đề & Khách hàng</th>
                {currentType === 'video' ? (
                  <th className="py-3 px-4 w-36">YouTube ID</th>
                ) : (
                  <th className="py-3 px-4 w-36">Chủ đề (Tag)</th>
                )}
                <th className="py-3 px-4 w-28 text-center">Trạng thái</th>
                <th className="py-3 px-4 w-28 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Không tìm thấy dữ liệu nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Sort Order */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-mono text-slate-500 font-bold w-4 text-center">
                          {item.sortOrder}
                        </span>
                        {canEdit && !searchQuery && (
                          <div className="flex flex-col">
                            <button
                              type="button"
                              disabled={index === 0 || isReordering}
                              onClick={() => handleMove(index, 'up')}
                              className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-20"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              disabled={index === filteredItems.length - 1 || isReordering}
                              onClick={() => handleMove(index, 'down')}
                              className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-20"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            {currentType === 'video' ? <Video className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                          </div>
                        )}
                        {item.videoId && (
                          <button
                            type="button"
                            onClick={() => setModalVideoId(item.videoId)}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                          >
                            <Play className="h-4 w-4 fill-white" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Title & Patient */}
                    <td className="py-3 px-4">
                      <Link
                        href={
                          currentType === 'video'
                            ? `/admin/clinic/testimonials/${item.id}`
                            : `/admin/clinic/stories/${item.id}`
                        }
                        className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 transition-colors line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-semibold">{item.patientName}</span>
                        {item.patientAge && <span> ({item.patientAge} tuổi)</span>}
                        {item.quote && <span className="italic"> — &ldquo;{item.quote.slice(0, 60)}...&rdquo;</span>}
                      </div>
                    </td>

                    {/* YouTube ID or Tag */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {currentType === 'video' ? (
                        <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {item.videoId || 'N/A'}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-[10px] font-medium border border-teal-200">
                          {item.tag || 'Tầm Soát'}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      {item.isPublished ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> Hiển thị
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                          <XCircle className="h-3 w-3" /> Tạm ẩn
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={
                          currentType === 'video'
                            ? `/admin/clinic/testimonials/${item.id}`
                            : `/admin/clinic/stories/${item.id}`
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-colors"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Sửa</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Video Modal Player */}
      {modalVideoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-black rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setModalVideoId(null)}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative pt-[56.25%]">
              <iframe
                src={`https://www.youtube.com/embed/${modalVideoId}?autoplay=1`}
                title="YouTube Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
