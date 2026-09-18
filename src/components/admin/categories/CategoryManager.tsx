'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Shield,
  FileText,
  Check,
  X,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { CategoryItem } from '@/types/doctorcheck';
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from '@/actions/category.actions';

const PROTECTED_SLUGS = new Set([
  'kien-thuc-ung-thu-da-day',
  'kien-thuc-ung-thu-dai-trang',
]);

interface CategoryManagerProps {
  initialCategories: CategoryItem[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const categories = initialCategories;
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);

  // Form states for Create / Edit
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDescription, setFormSeoDescription] = useState('');
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const openCreateModal = () => {
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormSeoTitle('');
    setFormSeoDescription('');
    setFormSortOrder(categories.length);
    setIsSlugManuallyEdited(false);
    setFormError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description || '');
    setFormSeoTitle(cat.seoTitle || '');
    setFormSeoDescription(cat.seoDescription || '');
    setFormSortOrder(cat.sortOrder || 0);
    setIsSlugManuallyEdited(true);
    setFormError(null);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!isSlugManuallyEdited && isCreateOpen) {
      setFormSlug(slugify(val));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Vui lòng nhập tên chuyên mục.');
      return;
    }
    if (!formSlug.trim()) {
      setFormError('Vui lòng nhập đường dẫn (slug).');
      return;
    }

    startTransition(async () => {
      const res = await createCategoryAction({
        name: formName.trim(),
        slug: formSlug.trim().toLowerCase(),
        description: formDescription.trim() || undefined,
        seoTitle: formSeoTitle.trim() || undefined,
        seoDescription: formSeoDescription.trim() || undefined,
        sortOrder: Number(formSortOrder),
      });

      if (!res.success) {
        setFormError(res.error || 'Tạo chuyên mục thất bại.');
      } else {
        setFeedback({ type: 'success', message: `Đã tạo chuyên mục "${res.data?.name}" thành công.` });
        setIsCreateOpen(false);
        router.refresh();
      }
    });
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Vui lòng nhập tên chuyên mục.');
      return;
    }

    startTransition(async () => {
      const res = await updateCategoryAction(String(editingCategory.id), {
        name: formName.trim(),
        slug: formSlug.trim().toLowerCase(),
        description: formDescription.trim() || undefined,
        seoTitle: formSeoTitle.trim() || undefined,
        seoDescription: formSeoDescription.trim() || undefined,
        sortOrder: Number(formSortOrder),
      });

      if (!res.success) {
        setFormError(res.error || 'Cập nhật chuyên mục thất bại.');
      } else {
        setFeedback({ type: 'success', message: `Đã cập nhật chuyên mục "${res.data?.name}" thành công.` });
        setEditingCategory(null);
        router.refresh();
      }
    });
  };

  const handleDeleteSubmit = async () => {
    if (!deletingCategory) return;
    setFormError(null);

    startTransition(async () => {
      const res = await deleteCategoryAction(String(deletingCategory.id));
      if (!res.success) {
        setFormError(res.error || 'Xóa chuyên mục thất bại.');
      } else {
        setFeedback({ type: 'success', message: `Đã xóa chuyên mục "${deletingCategory.name}".` });
        setDeletingCategory(null);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-lg p-4 text-sm font-medium transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <Check className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="rounded-sm p-1 opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên chuyên mục, đường dẫn..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-cyan-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 transition-colors dark:bg-cyan-500 dark:hover:bg-cyan-600"
          >
            <Plus className="h-4 w-4" />
            Thêm Chuyên Mục Mới
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Tên Chuyên Mục</th>
                <th className="px-5 py-3.5">Đường Dẫn (Slug)</th>
                <th className="px-5 py-3.5 text-center">Số Bài Viết</th>
                <th className="px-5 py-3.5">Mô Tả & SEO</th>
                <th className="px-5 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    <FolderTree className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                    Không tìm thấy chuyên mục nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const isProtected = PROTECTED_SLUGS.has(cat.slug);
                  const usageCount = cat.totalArticles || 0;

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <FolderTree className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                          <span>{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span>/{cat.slug}</span>
                          {isProtected && (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                              <Shield className="h-3 w-3" />
                              Bảo vệ va chạm
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            usageCount > 0
                              ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <FileText className="h-3 w-3" />
                          {usageCount} bài viết
                        </span>
                      </td>
                      <td className="px-5 py-3.5 max-w-xs truncate text-slate-500 dark:text-slate-400">
                        {cat.seoTitle || cat.description || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/chuyen-muc/${cat.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            title="Xem trang công khai"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <button
                            onClick={() => openEditModal(cat)}
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-cyan-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-cyan-400"
                            title="Chỉnh sửa chuyên mục"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingCategory(cat)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                            title="Xóa chuyên mục"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Category */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-cyan-600" />
                Thêm Chuyên Mục Mới
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              {formError && (
                <div className="rounded-lg bg-rose-50 p-3 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Chuyên Mục <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: Nội soi Dạ dày - Đại tràng"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Đường dẫn (Slug) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-2.5 dark:border-slate-700 dark:bg-slate-950">
                  <span className="text-slate-400 font-mono">/</span>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => {
                      setIsSlugManuallyEdited(true);
                      setFormSlug(e.target.value.toLowerCase());
                    }}
                    placeholder="noi-soi-da-day-dai-trang"
                    className="w-full bg-transparent p-2 text-slate-900 font-mono focus:outline-hidden dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mô tả Chuyên mục</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Mô tả ngắn về phân loại bài viết này..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={formSeoTitle}
                    onChange={(e) => setFormSeoTitle(e.target.value)}
                    placeholder="Tiêu đề SEO (tùy chọn)"
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Thứ tự sắp xếp</label>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-white shadow-xs hover:bg-cyan-700 disabled:opacity-50"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Tạo Chuyên Mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Category */}
      {editingCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-cyan-600" />
                Chỉnh Sửa Chuyên Mục: {editingCategory.name}
              </h3>
              <button onClick={() => setEditingCategory(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="mt-4 space-y-4 text-xs">
              {formError && (
                <div className="rounded-lg bg-rose-50 p-3 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                  {formError}
                </div>
              )}

              {PROTECTED_SLUGS.has(editingCategory.slug) && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                  <Shield className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-semibold">Từ khóa đường dẫn được bảo vệ:</span> Chuyên mục này liên quan đến định tuyến SEO cốt lõi của website. Đường dẫn (slug) đã bị khóa chỉnh sửa để ngăn ngừa đứt gãy liên kết.
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Chuyên Mục <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Đường dẫn (Slug) {PROTECTED_SLUGS.has(editingCategory.slug) ? '(Đã khóa)' : ''}
                </label>
                <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-2.5 dark:border-slate-700 dark:bg-slate-950">
                  <span className="text-slate-400 font-mono">/</span>
                  <input
                    type="text"
                    disabled={PROTECTED_SLUGS.has(editingCategory.slug)}
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value.toLowerCase())}
                    className="w-full bg-transparent p-2 text-slate-900 font-mono focus:outline-hidden disabled:opacity-60 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mô tả Chuyên mục</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={formSeoTitle}
                    onChange={(e) => setFormSeoTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Thứ tự sắp xếp</label>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-white shadow-xs hover:bg-cyan-700 disabled:opacity-50"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Category Confirmation */}
      {deletingCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-xs">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/60">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Xác Nhận Xóa Chuyên Mục</h3>
                <p className="text-slate-500 dark:text-slate-400">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            {formError && (
              <div className="rounded-lg bg-rose-50 p-3 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 mb-4">
                {formError}
              </div>
            )}

            {PROTECTED_SLUGS.has(deletingCategory.slug) ? (
              <div className="rounded-lg bg-amber-50 p-3 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 mb-4">
                <p className="font-semibold">Không thể xóa chuyên mục này!</p>
                <p className="mt-1">
                  Chuyên mục <strong>&apos;{deletingCategory.name}&apos;</strong> là danh mục gốc cốt lõi của website DoctorCheck.
                </p>
              </div>
            ) : (deletingCategory.totalArticles || 0) > 0 ? (
              <div className="rounded-lg bg-rose-50 p-3 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 mb-4">
                <p className="font-semibold">Không thể xóa vì đang có ràng buộc dữ liệu!</p>
                <p className="mt-1">
                  Đang có <strong>{deletingCategory.totalArticles} bài viết</strong> liên kết với chuyên mục{' '}
                  <strong>&apos;{deletingCategory.name}&apos;</strong>. Vui lòng chuyển các bài viết sang chuyên mục khác trước khi xóa.
                </p>
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Bạn có chắc chắn muốn xóa vĩnh viễn chuyên mục <strong>&apos;{deletingCategory.name}&apos;</strong> (/{deletingCategory.slug})?
              </p>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setDeletingCategory(null);
                  setFormError(null);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={
                  isPending ||
                  PROTECTED_SLUGS.has(deletingCategory.slug) ||
                  (deletingCategory.totalArticles || 0) > 0
                }
                onClick={handleDeleteSubmit}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white shadow-xs hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Xóa Chuyên Mục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
