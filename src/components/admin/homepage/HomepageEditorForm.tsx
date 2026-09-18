'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Send,
  CheckCircle2,
  Globe,
  History,
  Eye,
  AlertCircle,
  Loader2,
  ImageIcon,
  Sparkles,
  Sliders,
  Shield,
  Layers,
  PhoneCall,
  DollarSign,
  HelpCircle,
  Users,
  Film,
} from 'lucide-react';
import { ContentRevision } from '@/db/schema/workflow';
import { Permission, hasPermission } from '@/lib/auth/rbac';
import { MediaPickerModal } from '@/components/admin/media/MediaPickerModal';
import { HomepageRevisionHistoryDrawer } from './HomepageRevisionHistoryDrawer';
import {
  saveHomepageDraftAction,
  submitHomepageReviewAction,
  approveHomepageAction,
  publishHomepageAction,
  restoreHomepageRevisionAction,
  getHomepageRevisionsAction,
} from '@/actions/homepage.actions';
import type { HomepageData } from '@/lib/data/homepage';

interface HomepageEditorFormProps {
  initialData: HomepageData;
  latestDraftRevision?: ContentRevision | null;
  userPermissions?: string[];
}

export function HomepageEditorForm({
  initialData,
  latestDraftRevision,
  userPermissions = [],
}: HomepageEditorFormProps) {
  const router = useRouter();

  // Active Draft payload (if a draft revision exists and has payload)
  const initialPayload = (latestDraftRevision?.payload as HomepageData) || initialData;

  const [formData, setFormData] = useState<HomepageData>(initialPayload);
  const [currentRevision, setCurrentRevision] = useState<ContentRevision | null>(latestDraftRevision || null);
  const [activeTab, setActiveTab] = useState<'hero' | 'concerns' | 'pricing' | 'sections' | 'banner'>('hero');

  // Media Picker state
  const [mediaPickerTarget, setMediaPickerTarget] = useState<string | null>(null);

  // History Drawer state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Action status state
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const canEdit = hasPermission([], userPermissions, Permission.HOMEPAGE_EDIT);
  const canPublish = hasPermission([], userPermissions, Permission.HOMEPAGE_PUBLISH);

  const currentVersion = currentRevision?.version ?? 1;
  const workflowStatus = currentRevision?.status || 'published';

  // Handle Save Draft
  async function handleSaveDraft() {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setConflictError(null);

    try {
      const res = await saveHomepageDraftAction({
        revisionId: currentRevision?.id,
        expectedVersion: currentRevision?.version,
        payload: formData,
        changeSummary: 'Lưu bản nháp cấu hình Trang chủ',
      });

      if (!res.success) {
        if (res.conflict) {
          setConflictError(res.error || 'Xung đột phiên bản: Dữ liệu đã bị chỉnh sửa bởi một quản trị viên khác.');
        } else {
          setErrorMessage(res.error || 'Lưu bản nháp thất bại.');
        }
      } else if (res.data) {
        setCurrentRevision(res.data);
        setSuccessMessage(`Đã lưu bản nháp thành công! (Phiên bản #${res.data.revisionNumber})`);
      }
    } catch {
      setErrorMessage('Đã xảy ra lỗi kết nối khi lưu bản nháp.');
    } finally {
      setIsSaving(false);
    }
  }

  // Handle Submit Review
  async function handleSubmitReview() {
    if (!currentRevision) {
      alert('Vui lòng lưu bản nháp trước khi gửi duyệt.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await submitHomepageReviewAction(currentRevision.id);
      if (!res.success) {
        setErrorMessage(res.error || 'Gửi duyệt thất bại.');
      } else if (res.data) {
        setCurrentRevision(res.data);
        setSuccessMessage('Đã gửi bản nháp sang trạng thái chờ duyệt (IN_REVIEW).');
      }
    } catch {
      setErrorMessage('Lỗi khi gửi duyệt bản nháp.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Approve
  async function handleApprove() {
    if (!currentRevision) return;
    setIsApproving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await approveHomepageAction(currentRevision.id);
      if (!res.success) {
        setErrorMessage(res.error || 'Phê duyệt thất bại.');
      } else if (res.data) {
        setCurrentRevision(res.data);
        setSuccessMessage('Đã phê duyệt bản nháp thành công (APPROVED).');
      }
    } catch {
      setErrorMessage('Lỗi khi phê duyệt bản nháp.');
    } finally {
      setIsApproving(false);
    }
  }

  // Handle Publish
  async function handlePublish() {
    if (!currentRevision) {
      alert('Vui lòng lưu bản nháp trước khi xuất bản.');
      return;
    }

    if (
      !confirm(
        'Bạn có chắc chắn muốn XUẤT BẢN cấu hình này lên trang chủ chính thức? Thao tác này sẽ cập nhật trực tiếp dữ liệu công khai trên Website.'
      )
    ) {
      return;
    }

    setIsPublishing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setConflictError(null);

    try {
      const res = await publishHomepageAction(currentRevision.id, currentRevision.version);
      if (!res.success) {
        if (res.conflict) {
          setConflictError(res.error || 'Xung đột phiên bản: Dữ liệu đã thay đổi trên máy chủ.');
        } else {
          setErrorMessage(res.error || 'Xuất bản thất bại.');
        }
      } else if (res.data) {
        setCurrentRevision(res.data);
        setSuccessMessage('🎉 Đã XUẤT BẢN cấu hình Trang chủ thành công lên hệ thống công khai!');
        router.refresh();
      }
    } catch {
      setErrorMessage('Lỗi kết nối khi xuất bản Trang chủ.');
    } finally {
      setIsPublishing(false);
    }
  }

  // Open Media Picker for field
  function openMediaPicker(targetField: string) {
    setMediaPickerTarget(targetField);
  }

  // Handle Media selected
  function handleMediaSelect(publicUrl: string) {
    if (!mediaPickerTarget) return;

    if (mediaPickerTarget === 'hero.desktopBanner') {
      setFormData((p) => ({ ...p, hero: { ...p.hero, desktopBanner: publicUrl } }));
    } else if (mediaPickerTarget === 'hero.mobileBanner') {
      setFormData((p) => ({ ...p, hero: { ...p.hero, mobileBanner: publicUrl } }));
    } else if (mediaPickerTarget === 'benefits.bannerImage') {
      setFormData((p) => ({ ...p, benefits: { ...p.benefits, bannerImage: publicUrl } }));
    } else if (mediaPickerTarget === 'bannerCta.desktopImage') {
      setFormData((p) => ({ ...p, bannerCta: { ...p.bannerCta, desktopImage: publicUrl } }));
    } else if (mediaPickerTarget === 'bannerCta.mobileImage') {
      setFormData((p) => ({ ...p, bannerCta: { ...p.bannerCta, mobileImage: publicUrl } }));
    } else if (mediaPickerTarget.startsWith('pricing.male.')) {
      const idx = Number(mediaPickerTarget.split('.')[2]);
      setFormData((p) => {
        const list = [...p.pricing.malePackages];
        if (list[idx]) list[idx] = { ...list[idx], image: publicUrl };
        return { ...p, pricing: { ...p.pricing, malePackages: list } };
      });
    } else if (mediaPickerTarget.startsWith('pricing.female.')) {
      const idx = Number(mediaPickerTarget.split('.')[2]);
      setFormData((p) => {
        const list = [...p.pricing.femalePackages];
        if (list[idx]) list[idx] = { ...list[idx], image: publicUrl };
        return { ...p, pricing: { ...p.pricing, femalePackages: list } };
      });
    }

    setMediaPickerTarget(null);
  }

  return (
    <div className="space-y-6">
      {/* Top Workflow Status & Action Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-16 z-30 backdrop-blur-md bg-white/95 dark:bg-slate-900/95">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Biên Tập Nội Dung Trang Chủ (CMS-9)
              </h2>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  workflowStatus === 'published'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : workflowStatus === 'approved'
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800'
                    : workflowStatus === 'in_review'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {workflowStatus === 'published'
                  ? '● Đang xuất bản'
                  : workflowStatus === 'approved'
                  ? '✓ Đã phê duyệt'
                  : workflowStatus === 'in_review'
                  ? '⌛ Đang chờ duyệt'
                  : '✎ Bản nháp'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">v{currentVersion}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kiến trúc 3 tầng: Dữ liệu thực thể (A) + Cấu hình khối (B). Khóa mã nguồn layout React (C).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* History Button */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <History className="h-3.5 w-3.5" />
            <span>Lịch sử</span>
          </button>

          {/* Preview Button */}
          <a
            href="/admin/homepage/preview"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Xem trước</span>
          </a>

          {/* Save Draft Button */}
          {canEdit && (
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-teal-600 dark:border-teal-500 text-teal-600 dark:text-teal-400 text-xs font-medium hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Lưu nháp</span>
            </button>
          )}

          {/* Submit Review */}
          {canEdit && workflowStatus === 'draft' && (
            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              <span>Gửi duyệt</span>
            </button>
          )}

          {/* Approve */}
          {canPublish && workflowStatus === 'in_review' && (
            <button
              type="button"
              onClick={handleApprove}
              disabled={isApproving}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {isApproving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              <span>Phê duyệt</span>
            </button>
          )}

          {/* Publish */}
          {canPublish && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
              <span>Xuất bản Trang chủ</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {conflictError && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{conflictError}</span>
          </div>
          <button
            onClick={() => router.refresh()}
            className="px-2.5 py-1 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-semibold"
          >
            Tải lại dữ liệu mới nhất
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-6 overflow-x-auto pb-px">
          {[
            { id: 'hero', label: '1. Hero Banner', icon: Sparkles },
            { id: 'concerns', label: '2. Nỗi Lo & Quyền Lợi', icon: Shield },
            { id: 'pricing', label: '3. Gói Khám & Bảng Giá', icon: DollarSign },
            { id: 'sections', label: '4. Tiêu Đề Khối Thực Thể', icon: Layers },
            { id: 'banner', label: '5. Banner Kêu Gọi CTA', icon: PhoneCall },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab 1: Hero Banner */}
      {activeTab === 'hero' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-600" />
              Khối Hero Banner (Above-the-fold)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Văn bản thông điệp chính và ảnh nền banner hiển thị đầu tiên khi khách hàng vào trang.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tiêu đề chính Hero (Title) *
              </label>
              <input
                type="text"
                value={formData.hero.title}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, hero: { ...p.hero, title: e.target.value } }))
                }
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tiêu đề phụ / Trích dẫn (Subtitle) *
              </label>
              <textarea
                rows={2}
                value={formData.hero.subtitle}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, hero: { ...p.hero, subtitle: e.target.value } }))
                }
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ảnh Banner Desktop (2560x1038) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.hero.desktopBanner}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, hero: { ...p.hero, desktopBanner: e.target.value } }))
                    }
                    className="flex-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => openMediaPicker('hero.desktopBanner')}
                    className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Chọn</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ảnh Banner Mobile (856x1256) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.hero.mobileBanner}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, hero: { ...p.hero, mobileBanner: e.target.value } }))
                    }
                    className="flex-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => openMediaPicker('hero.mobileBanner')}
                    className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Chọn</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Liên kết nút bấm CTA (Destination Target) *
              </label>
              <input
                type="text"
                value={formData.hero.ctaTarget}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, hero: { ...p.hero, ctaTarget: e.target.value } }))
                }
                placeholder="VD: #tu-van hoặc /tam-soat-ung-thu/"
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono"
              />
              <span className="text-[11px] text-slate-400">
                Chấp nhận thẻ neo (VD: #tu-van) hoặc đường dẫn nội bộ (VD: /bang-gia-dich-vu/).
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Nỗi Lo & Quyền Lợi */}
      {activeTab === 'concerns' && (
        <div className="space-y-6">
          {/* Pain Points Block */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Shield className="h-4 w-4 text-teal-600" />
                Khối 4 Nỗi Lo Khách Hàng (Section Confuse)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Các tiêu đề nỗi lo thực tế khách hàng hay băn khoăn trước khi tầm soát.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu đề khối *
                </label>
                <input
                  type="text"
                  value={formData.painPoints.title}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      painPoints: { ...p.painPoints, title: e.target.value },
                    }))
                  }
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu đề phụ / Mô tả ngắn *
                </label>
                <input
                  type="text"
                  value={formData.painPoints.subtitle}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      painPoints: { ...p.painPoints, subtitle: e.target.value },
                    }))
                  }
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>
            </div>

            {/* Pain Point Items */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Danh sách các nỗi lo (Items):
              </label>
              {formData.painPoints.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 text-center text-xs font-semibold text-slate-400">
                    #{item.num}
                  </span>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...formData.painPoints.items];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      setFormData((p) => ({
                        ...p,
                        painPoints: { ...p.painPoints, items: updated },
                      }));
                    }}
                    className="flex-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Block */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-600" />
                Khối 5 Quyền Lợi & Video Banner (Section Advanced)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Các quyền lợi vượt trội khi tầm soát bệnh tại Doctor Check.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu đề khối quyền lợi *
                </label>
                <input
                  type="text"
                  value={formData.benefits.title}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      benefits: { ...p.benefits, title: e.target.value },
                    }))
                  }
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Đường dẫn Xem thêm (More URL)
                </label>
                <input
                  type="text"
                  value={formData.benefits.moreUrl}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      benefits: { ...p.benefits, moreUrl: e.target.value },
                    }))
                  }
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nhãn nút Xem thêm (More Label)
                </label>
                <input
                  type="text"
                  value={formData.benefits.moreLabel}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      benefits: { ...p.benefits, moreLabel: e.target.value },
                    }))
                  }
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ảnh Banner quyền lợi *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.benefits.bannerImage}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        benefits: { ...p.benefits, bannerImage: e.target.value },
                      }))
                    }
                    className="flex-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => openMediaPicker('benefits.bannerImage')}
                    className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium flex items-center gap-1.5"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Chọn</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  YouTube Video ID Banner *
                </label>
                <input
                  type="text"
                  value={formData.benefits.bannerVideoId}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      benefits: { ...p.benefits, bannerVideoId: e.target.value },
                    }))
                  }
                  placeholder="VD: VnL1iSrq7CY hoặc URL YouTube"
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono"
                />
              </div>
            </div>

            {/* Benefit Items Accordion Content */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Chi tiết 5 quyền lợi (Items):
              </label>
              {formData.benefits.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-600">Quyền lợi #{item.num}</span>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const list = [...formData.benefits.items];
                        list[idx] = { ...list[idx], title: e.target.value };
                        setFormData((p) => ({
                          ...p,
                          benefits: { ...p.benefits, items: list },
                        }));
                      }}
                      className="flex-1 text-xs font-semibold rounded border border-slate-300 dark:border-slate-600 px-2.5 py-1.5 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={item.desc}
                    onChange={(e) => {
                      const list = [...formData.benefits.items];
                      list[idx] = { ...list[idx], desc: e.target.value };
                      setFormData((p) => ({
                        ...p,
                        benefits: { ...p.benefits, items: list },
                      }));
                    }}
                    className="w-full text-xs rounded border border-slate-300 dark:border-slate-600 px-2.5 py-1.5 bg-white dark:bg-slate-900"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Gói Khám & Bảng Giá */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          {/* Pricing Matrix */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-teal-600" />
                Ma Trận Gói Khám Tổng Quát (Section Pricing)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Các gói khám nổi bật chia theo Tab Nam và Nữ trên trang chủ.
              </p>
            </div>

            {/* Male Packages */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                Gói Khám Dành Cho Nam:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.pricing.malePackages.map((pkg, idx) => (
                  <div
                    key={pkg.id || idx}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2"
                  >
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Tên gói</label>
                      <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) => {
                          const list = [...formData.pricing.malePackages];
                          list[idx] = { ...list[idx], name: e.target.value };
                          setFormData((p) => ({
                            ...p,
                            pricing: { ...p.pricing, malePackages: list },
                          }));
                        }}
                        className="w-full text-xs font-semibold rounded border border-slate-300 dark:border-slate-600 px-2 py-1 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Giá hiển thị</label>
                      <input
                        type="text"
                        value={pkg.price}
                        onChange={(e) => {
                          const list = [...formData.pricing.malePackages];
                          list[idx] = { ...list[idx], price: e.target.value };
                          setFormData((p) => ({
                            ...p,
                            pricing: { ...p.pricing, malePackages: list },
                          }));
                        }}
                        className="w-full text-xs font-semibold text-teal-600 rounded border border-slate-300 dark:border-slate-600 px-2 py-1 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Mô tả phụ</label>
                      <input
                        type="text"
                        value={pkg.sub}
                        onChange={(e) => {
                          const list = [...formData.pricing.malePackages];
                          list[idx] = { ...list[idx], sub: e.target.value };
                          setFormData((p) => ({
                            ...p,
                            pricing: { ...p.pricing, malePackages: list },
                          }));
                        }}
                        className="w-full text-xs rounded border border-slate-300 dark:border-slate-600 px-2 py-1 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Đường dẫn chi tiết</label>
                      <input
                        type="text"
                        value={pkg.slug}
                        onChange={(e) => {
                          const list = [...formData.pricing.malePackages];
                          list[idx] = { ...list[idx], slug: e.target.value };
                          setFormData((p) => ({
                            ...p,
                            pricing: { ...p.pricing, malePackages: list },
                          }));
                        }}
                        className="w-full text-xs font-mono rounded border border-slate-300 dark:border-slate-600 px-2 py-1 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Ảnh gói</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={pkg.image}
                          onChange={(e) => {
                            const list = [...formData.pricing.malePackages];
                            list[idx] = { ...list[idx], image: e.target.value };
                            setFormData((p) => ({
                              ...p,
                              pricing: { ...p.pricing, malePackages: list },
                            }));
                          }}
                          className="flex-1 text-[11px] font-mono rounded border border-slate-300 dark:border-slate-600 px-2 py-1 bg-white dark:bg-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => openMediaPicker(`pricing.male.${idx}`)}
                          className="p-1.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Female Packages */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Gói Khám Dành Cho Nữ:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.pricing.femalePackages.map((pkg, idx) => (
                  <div
                    key={pkg.id || idx}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2"
                  >
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Tên gói</label>
                      <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) => {
                          const list = [...formData.pricing.femalePackages];
                          list[idx] = { ...list[idx], name: e.target.value };
                          setFormData((p) => ({
                            ...p,
                            pricing: { ...p.pricing, femalePackages: list },
                          }));
                        }}
                        className="w-full text-xs font-semibold rounded border border-slate-300 dark:border-slate-600 px-2 py-1 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Giá hiển thị</label>
                      <input
                        type="text"
                        value={pkg.price}
                        onChange={(e) => {
                          const list = [...formData.pricing.femalePackages];
                          list[idx] = { ...list[idx], price: e.target.value };
                          setFormData((p) => ({
                            ...p,
                            pricing: { ...p.pricing, femalePackages: list },
                          }));
                        }}
                        className="w-full text-xs font-semibold text-rose-600 rounded border border-slate-300 dark:border-slate-600 px-2 py-1 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Mô tả phụ</label>
                      <input
                        type="text"
                        value={pkg.sub}
                        onChange={(e) => {
                          const list = [...formData.pricing.femalePackages];
                          list[idx] = { ...list[idx], sub: e.target.value };
                          setFormData((p) => ({
                            ...p,
                            pricing: { ...p.pricing, femalePackages: list },
                          }));
                        }}
                        className="w-full text-xs rounded border border-slate-300 dark:border-slate-600 px-2 py-1 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Đường dẫn chi tiết</label>
                      <input
                        type="text"
                        value={pkg.slug}
                        onChange={(e) => {
                          const list = [...formData.pricing.femalePackages];
                          list[idx] = { ...list[idx], slug: e.target.value };
                          setFormData((p) => ({
                            ...p,
                            pricing: { ...p.pricing, femalePackages: list },
                          }));
                        }}
                        className="w-full text-xs font-mono rounded border border-slate-300 dark:border-slate-600 px-2 py-1 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Ảnh gói</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={pkg.image}
                          onChange={(e) => {
                            const list = [...formData.pricing.femalePackages];
                            list[idx] = { ...list[idx], image: e.target.value };
                            setFormData((p) => ({
                              ...p,
                              pricing: { ...p.pricing, femalePackages: list },
                            }));
                          }}
                          className="flex-1 text-[11px] font-mono rounded border border-slate-300 dark:border-slate-600 px-2 py-1 bg-white dark:bg-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => openMediaPicker(`pricing.female.${idx}`)}
                          className="p-1.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cancer Screening Block */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Shield className="h-4 w-4 text-teal-600" />
                Khối Khuyến Cáo Tầm Soát Ung Thư (Section Suggest)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Khối tối màu khuyến cáo tầm soát ung thư dạ dày và đại tràng định kỳ.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu đề khối ung thư *
                </label>
                <input
                  type="text"
                  value={formData.cancerScreening.title}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      cancerScreening: { ...p.cancerScreening, title: e.target.value },
                    }))
                  }
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mô tả khối ung thư *
                </label>
                <textarea
                  rows={3}
                  value={formData.cancerScreening.description}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      cancerScreening: { ...p.cancerScreening, description: e.target.value },
                    }))
                  }
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Đường dẫn nút CTA
                  </label>
                  <input
                    type="text"
                    value={formData.cancerScreening.ctaUrl}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        cancerScreening: { ...p.cancerScreening, ctaUrl: e.target.value },
                      }))
                    }
                    className="w-full text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nhãn nút CTA
                  </label>
                  <input
                    type="text"
                    value={formData.cancerScreening.ctaLabel}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        cancerScreening: { ...p.cancerScreening, ctaLabel: e.target.value },
                      }))
                    }
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
              </div>

              {/* Featured Cards */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Thẻ dịch vụ nổi bật (Dạ dày & Đại tràng):
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.cancerScreening.featuredCards.map((card, idx) => (
                    <div
                      key={card.id || idx}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2"
                    >
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => {
                          const list = [...formData.cancerScreening.featuredCards];
                          list[idx] = { ...list[idx], title: e.target.value };
                          setFormData((p) => ({
                            ...p,
                            cancerScreening: { ...p.cancerScreening, featuredCards: list },
                          }));
                        }}
                        className="w-full text-xs font-semibold rounded border border-slate-300 dark:border-slate-600 px-2 py-1 bg-white dark:bg-slate-900"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={card.price}
                          onChange={(e) => {
                            const list = [...formData.cancerScreening.featuredCards];
                            list[idx] = { ...list[idx], price: e.target.value };
                            setFormData((p) => ({
                              ...p,
                              cancerScreening: { ...p.cancerScreening, featuredCards: list },
                            }));
                          }}
                          className="text-xs text-rose-600 font-bold rounded border border-slate-300 dark:border-slate-600 px-2 py-1 bg-white dark:bg-slate-900"
                        />
                        <input
                          type="text"
                          value={card.slug}
                          onChange={(e) => {
                            const list = [...formData.cancerScreening.featuredCards];
                            list[idx] = { ...list[idx], slug: e.target.value };
                            setFormData((p) => ({
                              ...p,
                              cancerScreening: { ...p.cancerScreening, featuredCards: list },
                            }));
                          }}
                          className="text-xs font-mono rounded border border-slate-300 dark:border-slate-600 px-2 py-1 bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Tiêu Đề Khối Thực Thể (Sections Meta) */}
      {activeTab === 'sections' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="h-4 w-4 text-teal-600" />
              Tiêu Đề & CTA Các Khối Thực Thể (Sections Meta)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý tiêu đề và văn bản dẫn nhập cho các khối hiển thị Bác sĩ, Trang thiết bị, Câu chuyện, Video, Hỏi đáp và Đặt hẹn.
            </p>
          </div>

          <div className="space-y-6 pt-2">
            {/* 1. Doctors Section Header */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-teal-600" />
                Khối Đội Ngũ Bác Sĩ (Section Doctor)
              </h4>
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.sectionsMeta.doctorsHeader.title}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      sectionsMeta: {
                        ...p.sectionsMeta,
                        doctorsHeader: { ...p.sectionsMeta.doctorsHeader, title: e.target.value },
                      },
                    }))
                  }
                  className="w-full text-xs font-semibold rounded border border-slate-300 dark:border-slate-600 px-3 py-1.5 bg-white dark:bg-slate-900"
                  placeholder="Tiêu đề khối bác sĩ"
                />
                <textarea
                  rows={2}
                  value={formData.sectionsMeta.doctorsHeader.subtitle}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      sectionsMeta: {
                        ...p.sectionsMeta,
                        doctorsHeader: { ...p.sectionsMeta.doctorsHeader, subtitle: e.target.value },
                      },
                    }))
                  }
                  className="w-full text-xs rounded border border-slate-300 dark:border-slate-600 px-3 py-1.5 bg-white dark:bg-slate-900"
                  placeholder="Mô tả phụ khối bác sĩ"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formData.sectionsMeta.doctorsHeader.ctaUrl}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        sectionsMeta: {
                          ...p.sectionsMeta,
                          doctorsHeader: { ...p.sectionsMeta.doctorsHeader, ctaUrl: e.target.value },
                        },
                      }))
                    }
                    className="text-xs font-mono rounded border border-slate-300 dark:border-slate-600 px-3 py-1.5 bg-white dark:bg-slate-900"
                    placeholder="URL nút tìm hiểu thêm"
                  />
                  <input
                    type="text"
                    value={formData.sectionsMeta.doctorsHeader.ctaLabel}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        sectionsMeta: {
                          ...p.sectionsMeta,
                          doctorsHeader: { ...p.sectionsMeta.doctorsHeader, ctaLabel: e.target.value },
                        },
                      }))
                    }
                    className="text-xs rounded border border-slate-300 dark:border-slate-600 px-3 py-1.5 bg-white dark:bg-slate-900"
                    placeholder="Nhãn nút tìm hiểu thêm"
                  />
                </div>
              </div>
            </div>

            {/* 2. Equipment Section Header */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-teal-600" />
                Khối Trang Thiết Bị (Section Facilities)
              </h4>
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.sectionsMeta.equipmentHeader.title}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      sectionsMeta: {
                        ...p.sectionsMeta,
                        equipmentHeader: { ...p.sectionsMeta.equipmentHeader, title: e.target.value },
                      },
                    }))
                  }
                  className="w-full text-xs font-semibold rounded border border-slate-300 dark:border-slate-600 px-3 py-1.5 bg-white dark:bg-slate-900"
                  placeholder="Tiêu đề trang thiết bị"
                />
                <textarea
                  rows={2}
                  value={formData.sectionsMeta.equipmentHeader.description}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      sectionsMeta: {
                        ...p.sectionsMeta,
                        equipmentHeader: { ...p.sectionsMeta.equipmentHeader, description: e.target.value },
                      },
                    }))
                  }
                  className="w-full text-xs rounded border border-slate-300 dark:border-slate-600 px-3 py-1.5 bg-white dark:bg-slate-900"
                  placeholder="Mô tả trang thiết bị"
                />
              </div>
            </div>

            {/* 3. Customer Stories Header */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-teal-600" />
                Khối Câu Chuyện Khách Hàng (Section Customer)
              </h4>
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.sectionsMeta.customerStoriesHeader.title}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      sectionsMeta: {
                        ...p.sectionsMeta,
                        customerStoriesHeader: { ...p.sectionsMeta.customerStoriesHeader, title: e.target.value },
                      },
                    }))
                  }
                  className="w-full text-xs font-semibold rounded border border-slate-300 dark:border-slate-600 px-3 py-1.5 bg-white dark:bg-slate-900"
                  placeholder="Tiêu đề câu chuyện khách hàng"
                />
                <textarea
                  rows={2}
                  value={formData.sectionsMeta.customerStoriesHeader.subtitle}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      sectionsMeta: {
                        ...p.sectionsMeta,
                        customerStoriesHeader: { ...p.sectionsMeta.customerStoriesHeader, subtitle: e.target.value },
                      },
                    }))
                  }
                  className="w-full text-xs rounded border border-slate-300 dark:border-slate-600 px-3 py-1.5 bg-white dark:bg-slate-900"
                  placeholder="Mô tả phụ câu chuyện khách hàng"
                />
                <input
                  type="text"
                  value={formData.sectionsMeta.customerStoriesHeader.viewAllUrl}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      sectionsMeta: {
                        ...p.sectionsMeta,
                        customerStoriesHeader: { ...p.sectionsMeta.customerStoriesHeader, viewAllUrl: e.target.value },
                      },
                    }))
                  }
                  className="w-full text-xs font-mono rounded border border-slate-300 dark:border-slate-600 px-3 py-1.5 bg-white dark:bg-slate-900"
                  placeholder="URL Xem tất cả câu chuyện"
                />
              </div>
            </div>

            {/* 4. Video Testimonials Header */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Film className="h-3.5 w-3.5 text-teal-600" />
                Khối Video Cảm Nhận Khách Hàng (Video Carousel)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <textarea
                  rows={2}
                  value={formData.sectionsMeta.videoTestimonialsHeader.titleDesktop}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      sectionsMeta: {
                        ...p.sectionsMeta,
                        videoTestimonialsHeader: { ...p.sectionsMeta.videoTestimonialsHeader, titleDesktop: e.target.value },
                      },
                    }))
                  }
                  className="w-full text-xs font-semibold rounded border border-slate-300 dark:border-slate-600 px-3 py-1.5 bg-white dark:bg-slate-900"
                  placeholder="Tiêu đề trên Desktop"
                />
                <textarea
                  rows={2}
                  value={formData.sectionsMeta.videoTestimonialsHeader.titleMobile}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      sectionsMeta: {
                        ...p.sectionsMeta,
                        videoTestimonialsHeader: { ...p.sectionsMeta.videoTestimonialsHeader, titleMobile: e.target.value },
                      },
                    }))
                  }
                  className="w-full text-xs rounded border border-slate-300 dark:border-slate-600 px-3 py-1.5 bg-white dark:bg-slate-900"
                  placeholder="Tiêu đề trên Mobile"
                />
              </div>
            </div>

            {/* 5. FAQ Header & Booking Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-teal-600" />
                  Tiêu Đề Khối Câu Hỏi Thường Gặp (FAQ)
                </h4>
                <input
                  type="text"
                  value={formData.sectionsMeta.faqHeader.title}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      sectionsMeta: {
                        ...p.sectionsMeta,
                        faqHeader: { ...p.sectionsMeta.faqHeader, title: e.target.value },
                      },
                    }))
                  }
                  className="w-full text-xs font-semibold rounded border border-slate-300 dark:border-slate-600 px-3 py-1.5 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <PhoneCall className="h-3.5 w-3.5 text-teal-600" />
                  Tiêu Đề Khối Tư Vấn & Đặt Hẹn (#tu-van)
                </h4>
                <input
                  type="text"
                  value={formData.sectionsMeta.bookingHeader.title}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      sectionsMeta: {
                        ...p.sectionsMeta,
                        bookingHeader: { ...p.sectionsMeta.bookingHeader, title: e.target.value },
                      },
                    }))
                  }
                  className="w-full text-xs font-semibold rounded border border-slate-300 dark:border-slate-600 px-3 py-1.5 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Banner Kêu Gọi CTA */}
      {activeTab === 'banner' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-teal-600" />
              Khối Banner Kêu Gọi CTA Chân Trang (Banner CTA)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Banner lớn gần chân trang hiển thị khung giờ làm việc và nút đặt hẹn nhanh.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Thương hiệu (Brand) *
                </label>
                <input
                  type="text"
                  value={formData.bannerCta.brand}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      bannerCta: { ...p.bannerCta, brand: e.target.value },
                    }))
                  }
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu đề thông điệp *
                </label>
                <input
                  type="text"
                  value={formData.bannerCta.title}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      bannerCta: { ...p.bannerCta, title: e.target.value },
                    }))
                  }
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu đề giờ làm việc
                </label>
                <input
                  type="text"
                  value={formData.bannerCta.workingHoursTitle}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      bannerCta: { ...p.bannerCta, workingHoursTitle: e.target.value },
                    }))
                  }
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Giờ Thứ 2 - Thứ 7
                </label>
                <input
                  type="text"
                  value={formData.bannerCta.workingHoursWeekday}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      bannerCta: { ...p.bannerCta, workingHoursWeekday: e.target.value },
                    }))
                  }
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Giờ Chủ nhật
                </label>
                <input
                  type="text"
                  value={formData.bannerCta.workingHoursSunday}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      bannerCta: { ...p.bannerCta, workingHoursSunday: e.target.value },
                    }))
                  }
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Văn bản nút bấm *
                </label>
                <input
                  type="text"
                  value={formData.bannerCta.buttonText}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      bannerCta: { ...p.bannerCta, buttonText: e.target.value },
                    }))
                  }
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Đích liên kết nút bấm *
                </label>
                <input
                  type="text"
                  value={formData.bannerCta.buttonTarget}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      bannerCta: { ...p.bannerCta, buttonTarget: e.target.value },
                    }))
                  }
                  className="w-full text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ảnh nền Desktop (1709x795) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.bannerCta.desktopImage}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        bannerCta: { ...p.bannerCta, desktopImage: e.target.value },
                      }))
                    }
                    className="flex-1 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => openMediaPicker('bannerCta.desktopImage')}
                    className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium flex items-center gap-1.5"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Chọn</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ảnh nền Mobile (545x963) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.bannerCta.mobileImage}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        bannerCta: { ...p.bannerCta, mobileImage: e.target.value },
                      }))
                    }
                    className="flex-1 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => openMediaPicker('bannerCta.mobileImage')}
                    className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium flex items-center gap-1.5"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Chọn</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {mediaPickerTarget && (
        <MediaPickerModal
          isOpen={!!mediaPickerTarget}
          onClose={() => setMediaPickerTarget(null)}
          onSelectMedia={(asset) => handleMediaSelect(asset.publicUrl)}
        />
      )}

      {/* History Drawer */}
      <HomepageRevisionHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        fetchRevisions={getHomepageRevisionsAction}
        onRestoreRevision={restoreHomepageRevisionAction}
        onRestored={(newRev) => {
          setCurrentRevision(newRev);
          const p = newRev.payload as HomepageData;
          if (p) setFormData(p);
        }}
      />
    </div>
  );
}
