'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  History,
  Eye,
  Loader2,
  Image as ImageIcon,
  FileCheck,
  Globe,
  Code,
  FileText,
} from 'lucide-react';
import { PageAdminDetail } from '@/repositories/contracts/page.repository';
import { ContentRevision } from '@/db/schema/workflow';
import {
  savePageDraftAction,
  submitPageReviewAction,
  approvePageAction,
  publishPageAction,
} from '@/actions/page.actions';
import { MediaPickerModal } from '@/components/admin/media/MediaPickerModal';
import { PageRevisionHistoryDrawer } from './PageRevisionHistoryDrawer';
import { PageRouteType, computePagePath } from '@/lib/routing/page-route-policy';

interface PageEditorFormProps {
  initialPage?: PageAdminDetail | null;
  initialRevision?: ContentRevision | null;
  isNew?: boolean;
}

export function PageEditorForm({
  initialPage,
  initialRevision,
  isNew = false,
}: PageEditorFormProps) {
  const router = useRouter();

  // Active snapshot payload if continuing an active revision
  const payload = initialRevision?.payload as Record<string, unknown> | null;

  // Form State
  const [entityId] = useState<string>(
    initialPage?.id || initialRevision?.entityId || `page-${Date.now()}`
  );
  const [revisionId, setRevisionId] = useState<string | undefined>(initialRevision?.id);
  const [expectedVersion, setExpectedVersion] = useState<number>(initialRevision?.version ?? 1);
  const [workflowStatus, setWorkflowStatus] = useState<string>(
    initialRevision?.status || initialPage?.workflowStatus || 'draft'
  );

  const [title, setTitle] = useState<string>(
    (payload?.title as string) || initialPage?.title || ''
  );
  const [slug, setSlug] = useState<string>(
    (payload?.slug as string) || initialPage?.slug || ''
  );
  const [routeType, setRouteType] = useState<PageRouteType>(
    (payload?.isRoot === false || (payload?.subpath as string)
      ? 'ENDOSCOPY_CHILD'
      : (payload?.status as string) === 'internal'
      ? 'INTERNAL'
      : initialPage?.routeType || 'ROOT')
  );
  const [subpath, setSubpath] = useState<string>(
    (payload?.subpath as string) || initialPage?.subpath || ''
  );
  const [excerpt, setExcerpt] = useState<string>(
    (payload?.excerpt as string) || initialPage?.excerpt || ''
  );
  const [contentHtml, setContentHtml] = useState<string>(
    (payload?.contentHtml as string) || initialPage?.contentHtml || ''
  );
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string>(
    (payload?.featuredImageUrl as string) || initialPage?.featuredImageUrl || ''
  );
  const [isUxBuilder, setIsUxBuilder] = useState<boolean>(
    Boolean(payload?.isUxBuilder ?? initialPage?.isUxBuilder ?? false)
  );
  const [seoTitle, setSeoTitle] = useState<string>(
    (payload?.seoTitle as string) || initialPage?.seoTitle || ''
  );
  const [seoDescription, setSeoDescription] = useState<string>(
    (payload?.seoDescription as string) || initialPage?.seoDescription || ''
  );

  // Editor View Mode: HTML Code vs Live Preview
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals & Drawers
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [concurrencyConflict, setConcurrencyConflict] = useState<{
    currentVersion: number;
    expectedVersion: number;
    message: string;
  } | null>(null);

  // Live calculated path
  const canonicalPath = computePagePath(routeType, slug, subpath);

  // Auto-generate slug from title if new and slug untouched
  function handleTitleChange(val: string) {
    setTitle(val);
    if (isNew && !slug) {
      const generated = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setSlug(generated);
    }
  }

  async function handleSaveDraft() {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setConcurrencyConflict(null);

    try {
      const res = await savePageDraftAction({
        entityId,
        revisionId,
        expectedVersion,
        title,
        slug,
        routeType,
        subpath,
        excerpt,
        contentHtml,
        featuredImageUrl,
        isUxBuilder,
        seoTitle,
        seoDescription,
        changeSummary: 'Lưu chỉnh sửa bản nháp trang tĩnh',
      });

      if (res.success && res.data) {
        setRevisionId(res.data.id);
        setExpectedVersion(res.data.version);
        setWorkflowStatus(res.data.status);
        setSuccessMessage('Đã lưu bản nháp trang tĩnh thành công!');
        if (isNew) {
          router.push(`/admin/pages/${entityId}`);
        }
      } else if (res.conflict) {
        setConcurrencyConflict(res.conflict);
      } else {
        setErrorMessage(res.error || 'Lỗi khi lưu bản nháp.');
      }
    } catch {
      setErrorMessage('Đã xảy ra lỗi khi lưu bản nháp.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmitReview() {
    if (!revisionId) {
      alert('Vui lòng Lưu Bản Nháp trước khi gửi thẩm định.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await submitPageReviewAction(revisionId);
      if (res.success && res.data) {
        setWorkflowStatus(res.data.status);
        setSuccessMessage('Đã gửi bản nháp đi thẩm định thành công!');
      } else {
        setErrorMessage(res.error || 'Lỗi khi gửi thẩm định.');
      }
    } catch {
      setErrorMessage('Đã xảy ra lỗi khi gửi thẩm định.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleApprove() {
    if (!revisionId) return;

    setIsApproving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await approvePageAction(revisionId);
      if (res.success && res.data) {
        setWorkflowStatus(res.data.status);
        setSuccessMessage('Đã phê duyệt bản ghi trang tĩnh thành công!');
      } else {
        setErrorMessage(res.error || 'Lỗi khi phê duyệt.');
      }
    } catch {
      setErrorMessage('Đã xảy ra lỗi khi phê duyệt.');
    } finally {
      setIsApproving(false);
    }
  }

  async function handlePublish() {
    if (!revisionId) {
      alert('Vui lòng Lưu Bản Nháp trước khi xuất bản.');
      return;
    }

    if (
      !confirm(
        'Bạn có chắc chắn muốn xuất bản trang tĩnh này lên website chính thức? Dữ liệu công khai sẽ được cập nhật đồng thời.'
      )
    ) {
      return;
    }

    setIsPublishing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await publishPageAction(revisionId);
      if (res.success && res.data) {
        setWorkflowStatus(res.data.status);
        setSuccessMessage('Đã xuất bản trang tĩnh lên website thành công!');
        router.refresh();
      } else {
        setErrorMessage(res.error || 'Lỗi khi xuất bản trang tĩnh.');
      }
    } catch {
      setErrorMessage('Đã xảy ra lỗi khi xuất bản.');
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner Notifications */}
      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-3 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-3 shadow-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {/* Concurrency Conflict Modal (409) */}
      {concurrencyConflict && (
        <div className="rounded-2xl border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/50 p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold text-sm">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            Phát Hiện Xung Đột Dữ Liệu (409 Conflict)
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            {concurrencyConflict.message} (Phiên bản của bạn: v{concurrencyConflict.expectedVersion}, Phiên bản trên máy chủ: v{concurrencyConflict.currentVersion}).
          </p>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => router.refresh()}
              className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 shadow-xs"
            >
              Làm Mới & Tải Lại Bản Mới Nhất
            </button>
            <button
              type="button"
              onClick={() => setConcurrencyConflict(null)}
              className="rounded-xl border border-amber-300 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-200"
            >
              Bỏ Qua
            </button>
          </div>
        </div>
      )}

      {/* Main Action Bar */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 shadow-xs">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                {title || (isNew ? 'Tạo Trang Tĩnh Mới' : 'Chỉnh Sửa Trang Tĩnh')}
              </h1>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                v{expectedVersion}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono">ID: {entityId}</span>
              <span>•</span>
              <span className="font-semibold capitalize">{workflowStatus}</span>
            </div>
          </div>
        </div>

        {/* Workflow Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* History Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsHistoryDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <History className="h-4 w-4 text-slate-400" />
            Lịch Sử
          </button>

          {/* Preview Draft */}
          <a
            href={`/admin/pages/${entityId}/preview`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Eye className="h-4 w-4 text-slate-400" />
            Xem Trước
          </a>

          {/* Save Draft */}
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            ) : (
              <Save className="h-4 w-4 text-slate-500" />
            )}
            Lưu Bản Nháp
          </button>

          {/* Submit Review */}
          <button
            type="button"
            disabled={isSubmitting || workflowStatus === 'in_review'}
            onClick={handleSubmitReview}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 px-3.5 py-2 text-xs font-semibold text-amber-800 dark:text-amber-200 hover:bg-amber-100 transition-colors shadow-xs disabled:opacity-40"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
            ) : (
              <Send className="h-4 w-4 text-amber-600" />
            )}
            Gửi Duyệt
          </button>

          {/* Approve Action */}
          <button
            type="button"
            disabled={isApproving || workflowStatus === 'approved'}
            onClick={handleApprove}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-3.5 py-2 text-xs font-semibold text-blue-800 dark:text-blue-200 hover:bg-blue-100 transition-colors shadow-xs disabled:opacity-40"
          >
            {isApproving ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <FileCheck className="h-4 w-4 text-blue-600" />
            )}
            Phê Duyệt
          </button>

          {/* Publish Action */}
          <button
            type="button"
            disabled={isPublishing}
            onClick={handlePublish}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50"
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Xuất Bản (Publish)
          </button>
        </div>
      </div>

      {/* Grid Layout: Left 2 Cols (Content), Right 1 Col (Metadata & Route Settings) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Core Content & HTML */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Title & Excerpt */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tiêu Đề Trang Tĩnh (Title) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Nhập tiêu đề trang tĩnh (Ví dụ: Về Chúng Tôi - Doctor Check)..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-base font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tóm Tắt / Giới Thiệu Ngắn (Excerpt)
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Tóm tắt ngắn gọn nội dung trang..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* HTML Content Editor */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
            {/* Editor Header Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Nội Dung Trang (HTML An Toàn)
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeTab === 'code'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Code className="h-3 w-3" /> Mã Nguồn HTML
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Eye className="h-3 w-3" /> Xem Trước
                </button>
              </div>
            </div>

            {/* Editor Body */}
            <div className="p-6">
              {activeTab === 'code' ? (
                <textarea
                  rows={20}
                  value={contentHtml}
                  onChange={(e) => setContentHtml(e.target.value)}
                  placeholder="<p>Nhập mã nguồn HTML an toàn của trang...</p>"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 font-mono text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                />
              ) : (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none min-h-[400px] rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: contentHtml || '<p class="text-slate-400 italic">Chưa có nội dung xem trước.</p>' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Routing, SEO & Metadata Settings */}
        <div className="space-y-6">
          {/* Route Policy & Hierarchy Settings */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-600" />
              Cấu Hình Định Tuyến (Route Policy)
            </h2>

            {/* Route Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Phân Loại Route Trang <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                <label className={`flex items-center gap-2.5 rounded-xl border p-2.5 cursor-pointer text-xs transition-colors ${
                  routeType === 'ROOT'
                    ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="routeType"
                    value="ROOT"
                    checked={routeType === 'ROOT'}
                    onChange={() => setRouteType('ROOT')}
                    className="text-indigo-600"
                  />
                  <div>
                    <span className="font-semibold block">Trang Gốc (Root Page)</span>
                    <span className="text-[11px] text-slate-400 block font-normal">Định tuyến trực tiếp tại domain gốc (/[slug]/)</span>
                  </div>
                </label>

                <label className={`flex items-center gap-2.5 rounded-xl border p-2.5 cursor-pointer text-xs transition-colors ${
                  routeType === 'ENDOSCOPY_CHILD'
                    ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/20 text-purple-900 dark:text-purple-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="routeType"
                    value="ENDOSCOPY_CHILD"
                    checked={routeType === 'ENDOSCOPY_CHILD'}
                    onChange={() => setRouteType('ENDOSCOPY_CHILD')}
                    className="text-purple-600"
                  />
                  <div>
                    <span className="font-semibold block">Trang Con Chuyên Khoa Nội Soi</span>
                    <span className="text-[11px] text-slate-400 block font-normal">Nằm dưới /trung-tam-noi-soi-tieu-hoa-doctor-check/...</span>
                  </div>
                </label>

                <label className={`flex items-center gap-2.5 rounded-xl border p-2.5 cursor-pointer text-xs transition-colors ${
                  routeType === 'INTERNAL'
                    ? 'border-slate-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="routeType"
                    value="INTERNAL"
                    checked={routeType === 'INTERNAL'}
                    onChange={() => setRouteType('INTERNAL')}
                    className="text-slate-600"
                  />
                  <div>
                    <span className="font-semibold block">Trang Nội Bộ (Internal / Non-public)</span>
                    <span className="text-[11px] text-slate-400 block font-normal">Trang quản trị nội bộ không lập chỉ mục sitemap</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Đường dẫn tĩnh (Slug) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="ve-chung-toi"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 font-mono text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Subpath (for Endoscopy nested hierarchy) */}
            {routeType === 'ENDOSCOPY_CHILD' && (
              <div>
                <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Đường dẫn phân cấp phụ (Subpath) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={subpath}
                  onChange={(e) => setSubpath(e.target.value.toLowerCase())}
                  placeholder="tam-soat-ung-thu-da-day-tai-doctor-check/kien-thuc-ung-thu-da-day"
                  className="w-full rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20 px-3.5 py-2 font-mono text-xs text-purple-900 dark:text-purple-100 focus:border-purple-500 focus:outline-none"
                />
              </div>
            )}

            {/* Live Calculated Canonical Path Display */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-xs space-y-1 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
                Đường dẫn URL công khai dự kiến:
              </span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold break-all block">
                {canonicalPath}
              </span>
            </div>

            {/* UX Builder Option */}
            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUxBuilder}
                  onChange={(e) => setIsUxBuilder(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span>Đánh dấu Trang Render Khung Tĩnh (isUxBuilder)</span>
              </label>
            </div>
          </div>

          {/* Featured Image */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Ảnh Đại Diện Trang (Hero / OG Image)
            </h2>

            <div className="flex flex-col items-center justify-center gap-3">
              <div className="relative h-28 w-full overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                {featuredImageUrl ? (
                  <img src={featuredImageUrl} alt={title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 text-xs">
                    <ImageIcon className="h-8 w-8 mb-1" />
                    Chưa có ảnh đại diện
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <ImageIcon className="h-4 w-4 text-indigo-600" />
                Chọn ảnh từ Thư Viện Media
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Đường dẫn ảnh</label>
              <input
                type="text"
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                placeholder="https://.../banner.webp"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none"
              />
            </div>
          </div>

          {/* SEO Controls */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Tối Ưu Hóa Tìm Kiếm (SEO)
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tiêu đề SEO (Title Tag)
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Về chúng tôi | Doctor Check"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Thẻ mô tả SEO (Meta Description)
              </label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Tìm hiểu về phòng khám Doctor Check..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectMedia={(mediaItem) => {
          setFeaturedImageUrl(mediaItem.publicUrl);
          setIsMediaPickerOpen(false);
        }}
      />

      {/* Revision History Drawer */}
      <PageRevisionHistoryDrawer
        entityId={entityId}
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        onRestored={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
