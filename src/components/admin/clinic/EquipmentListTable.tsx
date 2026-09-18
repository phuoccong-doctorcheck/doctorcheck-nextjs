'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { EquipmentRow } from '@/repositories/contracts/clinical-trust.repository';
import { reorderEquipmentAction } from '@/actions/clinic-trust.actions';

interface EquipmentListTableProps {
  initialItems: EquipmentRow[];
  userPermissions: string[];
}

export function EquipmentListTable({ initialItems, userPermissions }: EquipmentListTableProps) {
  const [items, setItems] = useState<EquipmentRow[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [isReordering, setIsReordering] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const canEdit = userPermissions.includes('clinic.edit') || userPermissions.includes('super_admin');

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.manufacturer.toLowerCase().includes(q) ||
      item.origin.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  });

  async function handleMove(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Recalculate sortOrders
    newItems.forEach((it, idx) => {
      it.sortOrder = idx + 1;
    });

    setItems(newItems);
    setIsReordering(true);
    setFeedback(null);

    try {
      const res = await reorderEquipmentAction(newItems.map((it) => it.id));
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
      {/* Top Search & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm thiết bị theo tên, hãng sản xuất, xuất xứ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
          />
        </div>

        {canEdit && (
          <Link
            href="/admin/clinic/equipment/new"
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm thiết bị mới</span>
          </Link>
        )}
      </div>

      {feedback && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Equipment Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-16 text-center">Thứ tự</th>
                <th className="py-3 px-4 w-20">Hình ảnh</th>
                <th className="py-3 px-4">Tên thiết bị & Thông số</th>
                <th className="py-3 px-4 w-36">Hãng & Xuất xứ</th>
                <th className="py-3 px-4 w-28 text-center">Trạng thái</th>
                <th className="py-3 px-4 w-28 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Không tìm thấy thiết bị nào phù hợp.
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
                        {canEdit && !searchQuery && (
                          <div className="flex flex-col">
                            <button
                              type="button"
                              disabled={index === 0 || isReordering}
                              onClick={() => handleMove(index, 'up')}
                              className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              disabled={index === items.length - 1 || isReordering}
                              onClick={() => handleMove(index, 'down')}
                              className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Image Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Stethoscope className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Name & Specs */}
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/clinic/equipment/${item.id}`}
                        className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                      {Array.isArray(item.features) && item.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(item.features as string[]).slice(0, 2).map((feat, fIdx) => (
                            <span
                              key={fIdx}
                              className="inline-block px-1.5 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              {feat}
                            </span>
                          ))}
                          {(item.features as string[]).length > 2 && (
                            <span className="text-[10px] text-slate-400">
                              +{(item.features as string[]).length - 2} thông số
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Manufacturer & Origin */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <div className="font-semibold text-[11px]">{item.manufacturer}</div>
                      <div className="text-[10px] text-slate-400">{item.origin}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="h-3 w-3" /> Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400 border border-slate-200">
                          <XCircle className="h-3 w-3" /> Tạm ẩn
                        </span>
                      )}
                    </td>

                    {/* Action Link */}
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/clinic/equipment/${item.id}`}
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
