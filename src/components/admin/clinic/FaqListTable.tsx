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
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { FaqRow } from '@/repositories/contracts/clinical-trust.repository';
import { reorderFaqsAction } from '@/actions/clinic-trust.actions';

interface FaqListTableProps {
  initialItems: FaqRow[];
  userPermissions: string[];
}

export function FaqListTable({ initialItems, userPermissions }: FaqListTableProps) {
  const [items, setItems] = useState<FaqRow[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isReordering, setIsReordering] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const canEdit = userPermissions.includes('clinical_trust.edit') || userPermissions.includes('super_admin');

  const categories = Array.from(new Set(items.map((i) => i.category || 'general')));

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
    const matchCat = selectedCategory === 'ALL' || (item.category || 'general') === selectedCategory;
    return matchQuery && matchCat;
  });

  async function handleMove(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    newItems.forEach((it, idx) => {
      it.sortOrder = idx + 1;
    });

    setItems(newItems);
    setIsReordering(true);
    setFeedback(null);

    try {
      const res = await reorderFaqsAction(newItems.map((it) => it.id));
      if (!res.success) {
        setFeedback(res.error || 'Lỗi khi sắp xếp lại FAQs.');
      }
    } catch {
      setFeedback('Lỗi kết nối khi lưu thứ tự FAQs.');
    } finally {
      setIsReordering(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi, nội dung giải đáp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 outline-none shadow-sm"
          >
            <option value="ALL">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {canEdit && (
          <Link
            href="/admin/clinic/faqs/new"
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm câu hỏi mới</span>
          </Link>
        )}
      </div>

      {feedback && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* FAQ Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-16 text-center">Thứ tự</th>
                <th className="py-3 px-4">Câu hỏi & Câu trả lời</th>
                <th className="py-3 px-4 w-36">Danh mục</th>
                <th className="py-3 px-4 w-28 text-center">Trạng thái</th>
                <th className="py-3 px-4 w-28 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Không tìm thấy câu hỏi thường gặp nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Sort Order Controls */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-mono text-slate-500 font-bold w-4 text-center">
                          {item.sortOrder}
                        </span>
                        {canEdit && !searchQuery && selectedCategory === 'ALL' && (
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
                              disabled={index === items.length - 1 || isReordering}
                              onClick={() => handleMove(index, 'down')}
                              className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-20"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Question & Answer Preview */}
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/clinic/faqs/${item.id}`}
                        className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 transition-colors"
                      >
                        {item.question}
                      </Link>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {item.answer.replace(/<[^>]*>?/gm, '')}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300">
                        {item.category || 'general'}
                      </span>
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
                        href={`/admin/clinic/faqs/${item.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-colors"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Chỉnh sửa</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
