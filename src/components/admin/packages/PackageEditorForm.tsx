'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  Send,
  CheckCircle2,
  AlertTriangle,
  History,
  Eye,
  ArrowLeft,
  Loader2,
  DollarSign,
  Image as ImageIcon,
  Sparkles,
  RotateCcw,
  FileCheck,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
} from 'lucide-react';
import { PackageAdminDetail } from '@/repositories/contracts/package.repository';
import { ContentRevision } from '@/db/schema/workflow';
import {
  savePackageDraftAction,
  submitPackageReviewAction,
  returnPackageToDraftAction,
  approvePackageAction,
  publishPackageAction,
} from '@/actions/package.actions';
import { MediaPickerModal } from '@/components/admin/media/MediaPickerModal';
import { PackageRevisionHistoryDrawer } from './PackageRevisionHistoryDrawer';

interface PackageEditorFormProps {
  initialPackage?: PackageAdminDetail | null;
  activeRevision?: ContentRevision | null;
  userRoles: string[];
  userPermissions: string[];
}

export function PackageEditorForm({
  initialPackage,
  activeRevision,
  userRoles,
}: PackageEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [entityId] = useState<string>(() => initialPackage?.id || `pkg-${Date.now()}`);
  const [revisionId, setRevisionId] = useState<string | undefined>(activeRevision?.id);
  const [expectedVersion, setExpectedVersion] = useState<number>(
    activeRevision?.revisionNumber ?? (initialPackage ? 1 : 1)
  );
  const [workflowStatus, setWorkflowStatus] = useState<string>(
    activeRevision?.status || initialPackage?.status || 'draft'
  );

  // Extract snapshot payload or fallback to canonical record
  const payload = activeRevision?.payload as Record<string, unknown> | null;

  // Form states
  const [name, setName] = useState<string>((payload?.name as string) || initialPackage?.name || '');
  const [slug, setSlug] = useState<string>((payload?.slug as string) || initialPackage?.slug || '');
  const [gender, setGender] = useState<'male' | 'female' | 'both'>(
    (payload?.gender as 'male' | 'female' | 'both') || initialPackage?.gender || 'both'
  );
  const [priceVnd, setPriceVnd] = useState<number>(
    Number(payload?.priceVnd ?? initialPackage?.priceVnd ?? 0)
  );
  const [tagline, setTagline] = useState<string>(
    (payload?.tagline as string) || initialPackage?.tagline || ''
  );
  const [diseasesCovered, setDiseasesCovered] = useState<number>(
    Number(payload?.diseasesCovered ?? initialPackage?.diseasesCovered ?? 0)
  );
  const [cancersCovered, setCancersCovered] = useState<number>(
    Number(payload?.cancersCovered ?? initialPackage?.cancersCovered ?? 0)
  );
  const [duration, setDuration] = useState<string>(
    (payload?.duration as string) || initialPackage?.duration || '120 - 180 phút'
  );
  const [isPopular, setIsPopular] = useState<boolean>(
    Boolean(payload?.isPopular ?? initialPackage?.isPopular ?? false)
  );
  const [recommendedFor, setRecommendedFor] = useState<string>(
    (payload?.recommendedFor as string) || initialPackage?.recommendedFor || ''
  );
  const [features, setFeatures] = useState<string[]>(
    (payload?.features as string[]) || initialPackage?.features || []
  );
  const [newFeatureText, setNewFeatureText] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>(
    (payload?.imageUrl as string) || initialPackage?.imageUrl || ''
  );
  const [sortOrder, setSortOrder] = useState<number>(
    Number(payload?.sortOrder ?? initialPackage?.sortOrder ?? 0)
  );
  const [isActive, setIsActive] = useState<boolean>(
    Boolean(payload?.isActive ?? initialPackage?.isActive ?? true)
  );
  const [seoTitle, setSeoTitle] = useState<string>(
    (payload?.seoTitle as string) || initialPackage?.seoTitle || ''
  );
  const [seoDescription, setSeoDescription] = useState<string>(
    (payload?.seoDescription as string) || initialPackage?.seoDescription || ''
  );

  // Modals & Drawers
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Slug generator
  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialPackage && !slug) {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generatedSlug);
    }
  };

  // Feature list item operations
  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleMoveFeature = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= features.length) return;
    const newFeatures = [...features];
    const temp = newFeatures[idx];
    newFeatures[idx] = newFeatures[targetIdx];
    newFeatures[targetIdx] = temp;
    setFeatures(newFeatures);
  };

  const constructPayload = () => ({
    name: name.trim(),
    slug: slug.trim(),
    gender,
    priceVnd: Number(priceVnd) || 0,
    priceFormatted: `${(Number(priceVnd) || 0).toLocaleString('vi-VN')}đ`,
    tagline: tagline.trim() || undefined,
    diseasesCovered: Number(diseasesCovered) || 0,
    cancersCovered: Number(cancersCovered) || 0,
    duration: duration.trim(),
    isPopular,
    recommendedFor: recommendedFor.trim(),
    features,
    imageUrl: imageUrl.trim() || undefined,
    sortOrder: Number(sortOrder) || 0,
    isActive,
    seoTitle: seoTitle.trim() || undefined,
    seoDescription: seoDescription.trim() || undefined,
  });

  // Action: Save Draft
  const handleSaveDraft = async () => {
    setActionMessage(null);
    setConflictError(null);

    const payloadData = constructPayload();
    if (!payloadData.name || !payloadData.slug || !payloadData.recommendedFor) {
      setActionMessage({ text: 'Vui lòng điền đầy đủ Tên gói khám, Đường dẫn (slug) và Đối tượng khuyến nghị.', type: 'error' });
      return;
    }

    startTransition(async () => {
      const res = await savePackageDraftAction({
        entityId,
        revisionId,
        expectedVersion,
        payload: payloadData,
      });

      if (res.success && res.data) {
        setRevisionId(res.data.id);
        setExpectedVersion(res.data.revisionNumber);
        setWorkflowStatus(res.data.status);
        setActionMessage({ text: `Lưu bản nháp thành công! (Phiên bản v${res.data.revisionNumber})`, type: 'success' });
        router.refresh();
      } else if (res.conflict) {
        setConflictError(
          `Xung đột phiên bản: Người khác đã chỉnh sửa gói khám này (Phiên bản hiện tại: v${res.conflict.currentVersion}). Vui lòng tải lại trang.`
        );
      } else {
        setActionMessage({ text: res.error || 'Lưu bản nháp thất bại.', type: 'error' });
      }
    });
  };

  // Action: Submit for Review
  const handleSubmitReview = async () => {
    if (!revisionId) {
      await handleSaveDraft();
    }
    if (!revisionId) return;

    startTransition(async () => {
      const res = await submitPackageReviewAction(revisionId);
      if (res.success && res.data) {
        setWorkflowStatus(res.data.status);
        setActionMessage({ text: 'Đã gửi gói khám để thẩm định bảng giá & danh mục!', type: 'success' });
        router.refresh();
      } else {
        setActionMessage({ text: res.error || 'Gửi thẩm định thất bại.', type: 'error' });
      }
    });
  };

  // Action: Return to Draft
  const handleReturnToDraft = async () => {
    if (!revisionId) return;
    const note = prompt('Nhập lý do / ghi chú yêu cầu điều chỉnh giá hoặc danh mục:');
    if (note === null) return;

    startTransition(async () => {
      const res = await returnPackageToDraftAction(revisionId, note);
      if (res.success && res.data) {
        setWorkflowStatus(res.data.status);
        setActionMessage({ text: 'Đã trả gói khám về trạng thái Bản Nháp!', type: 'success' });
        router.refresh();
      } else {
        setActionMessage({ text: res.error || 'Trả về bản nháp thất bại.', type: 'error' });
      }
    });
  };

  // Action: Approve
  const handleApprove = async () => {
    if (!revisionId) return;
    startTransition(async () => {
      const res = await approvePackageAction(revisionId);
      if (res.success && res.data) {
        setWorkflowStatus(res.data.status);
        setActionMessage({ text: 'Đã phê duyệt bảng giá và danh mục gói khám!', type: 'success' });
        router.refresh();
      } else {
        setActionMessage({ text: res.error || 'Phê duyệt thất bại.', type: 'error' });
      }
    });
  };

  // Action: Publish
  const handlePublish = async () => {
    if (!revisionId) {
      alert('Vui lòng lưu bản nháp và thực hiện quy trình duyệt trước khi xuất bản.');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn xuất bản gói khám này lên Bảng giá chính thức?')) {
      return;
    }

    startTransition(async () => {
      const res = await publishPackageAction(revisionId);
      if (res.success && res.data) {
        setWorkflowStatus(res.data.status);
        setActionMessage({ text: 'Xuất bản gói khám thành công!', type: 'success' });
        router.refresh();
      } else {
        setActionMessage({ text: res.error || 'Xuất bản thất bại.', type: 'error' });
      }
    });
  };

  const isSuperAdmin = userRoles.includes('super_admin');
  const canPublish = userRoles.includes('admin') || userRoles.includes('medical_reviewer') || isSuperAdmin;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Workflow Bar */}
      <div className="sticky top-0 z-30 -mx-6 -mt-6 mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-6 py-4 backdrop-blur shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/packages"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {name || 'Gói Khám Mới'}
              <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {workflowStatus.toUpperCase()} (v{expectedVersion})
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              ID Định danh: <code className="font-mono">{entityId}</code>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* History Drawer */}
          <button
            type="button"
            onClick={() => setIsHistoryDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
          >
            <History className="h-4 w-4 text-slate-500" />
            Lịch Sử
          </button>

          {/* Preview Draft */}
          {initialPackage && (
            <Link
              href={`/admin/packages/${entityId}/preview`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
            >
              <Eye className="h-4 w-4 text-slate-500" />
              Xem Thử
            </Link>
          )}

          {/* Save Draft */}
          <button
            type="button"
            disabled={isPending}
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Lưu Bản Nháp
          </button>

          {/* Submit Review */}
          {workflowStatus === 'draft' && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleSubmitReview}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Gửi Duyệt Giá
            </button>
          )}

          {/* Reviewer Actions */}
          {workflowStatus === 'in_review' && canPublish && (
            <>
              <button
                type="button"
                disabled={isPending}
                onClick={handleReturnToDraft}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Trả Về
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleApprove}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                <FileCheck className="h-4 w-4" />
                Phê Duyệt
              </button>
            </>
          )}

          {/* Publish */}
          {(workflowStatus === 'approved' || (canPublish && workflowStatus === 'in_review')) && (
            <button
              type="button"
              disabled={isPending}
              onClick={handlePublish}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              Xuất Bản Bảng Giá
            </button>
          )}
        </div>
      </div>

      {/* Action Messages */}
      {actionMessage && (
        <div
          className={`flex items-center gap-2 rounded-xl p-4 text-sm font-medium ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Concurrency Conflict Alert */}
      {conflictError && (
        <div className="flex items-center justify-between rounded-xl bg-rose-50 dark:bg-rose-950/50 p-4 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">{conflictError}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
          >
            Tải lại trang
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Core Package Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Box 1: Essential Info */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Thông Tin Gói Khám & Bảng Giá
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tên Gói Khám <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: Gói Khám Chuyên Sâu Dành Cho Nữ"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Đường dẫn (Slug) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="goi-tam-soat-chuyen-sau-danh-cho-nu"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Pricing Field */}
              <div>
                <label className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>Giá Niêm Yết (VND) <span className="text-rose-500">*</span></span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {priceVnd.toLocaleString('vi-VN')}đ
                  </span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={priceVnd}
                    onChange={(e) => setPriceVnd(Number(e.target.value))}
                    className="w-full rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20 pl-9 pr-4 py-2 text-sm font-bold text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Đối Tượng Áp Dụng <span className="text-rose-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'both')}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="both">Cả Nam & Nữ</option>
                  <option value="female">Dành riêng cho Nữ</option>
                  <option value="male">Dành riêng cho Nam</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Khẩu hiệu / Điểm nổi bật (Tagline)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Gói khám chuẩn mực được chọn nhiều nhất cho phụ nữ hiện đại (39 hạng mục)"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Khuyến nghị chỉ định (Recommended For) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={recommendedFor}
                onChange={(e) => setRecommendedFor(e.target.value)}
                placeholder="Phụ nữ từ 25 - 50 tuổi cần kiểm tra chuyên sâu tuyến giáp, gan mật, phụ khoa..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Box 2: Features & Examination Items List */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Danh Mục Cận Lâm Sàng & Quyền Lợi ({features.length} Hạng Mục)
              </h2>
            </div>

            {/* Feature Add Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="Nhập hạng mục khám mới (Ví dụ: Siêu âm ổ bụng tổng quát màu)..."
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Thêm Hạng Mục
              </button>
            </div>

            {/* Ordered Features List */}
            <div className="space-y-2">
              {features.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  Chưa có hạng mục khám nào trong gói này.
                </p>
              ) : (
                features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {idx + 1}
                      </span>
                      <span>{feat}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveFeature(idx, 'up')}
                        className="rounded p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                      >
                        <MoveUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === features.length - 1}
                        onClick={() => handleMoveFeature(idx, 'down')}
                        className="rounded p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                      >
                        <MoveDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="rounded p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Metadata & Settings */}
        <div className="space-y-6">
          {/* Scope Statistics */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Thông Số Tầm Soát
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Số Bệnh Lý Tầm Soát
                </label>
                <input
                  type="number"
                  min={0}
                  value={diseasesCovered}
                  onChange={(e) => setDiseasesCovered(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Số Loại Ung Thư
                </label>
                <input
                  type="number"
                  min={0}
                  value={cancersCovered}
                  onChange={(e) => setCancersCovered(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Thời Lượng Khám
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60 - 90 phút"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Thứ Tự Sắp Xếp (Sort Order)
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 space-y-2">
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Đánh dấu Gói Khám Phổ Biến Nhất
                </span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span>Đang Mở Bán / Áp Dụng</span>
              </label>
            </div>
          </div>

          {/* Banner Image & Media Picker */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Ảnh Đại Diện Gói Khám
            </h2>

            <div className="flex flex-col items-center justify-center gap-3">
              <div className="relative h-28 w-full overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                {imageUrl ? (
                  <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 text-xs">
                    <ImageIcon className="h-8 w-8 mb-1" />
                    Chưa có ảnh
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <ImageIcon className="h-4 w-4 text-indigo-600" />
                Chọn ảnh từ Thư Viện Media
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Đường dẫn ảnh</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://.../khuyen-cao-nu.webp"
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
                Tiêu đề SEO
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Gói Khám Sức Khỏe... | Doctor Check"
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
                placeholder="Bảng giá gói khám..."
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
          setImageUrl(mediaItem.publicUrl);
          setIsMediaPickerOpen(false);
        }}
      />

      {/* Revision History Drawer */}
      <PackageRevisionHistoryDrawer
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
