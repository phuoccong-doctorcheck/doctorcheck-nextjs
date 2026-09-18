'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Save,
  CheckCircle2,
  AlertTriangle,
  History,
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  FileCheck2,
  Archive,
  BookOpen,
  Code,
  Eye,
} from 'lucide-react';
import {
  saveTestimonialDraftAction,
  publishTestimonialAction,
  archiveTestimonialAction,
  getTestimonialRevisionsAction,
  restoreClinicRevisionAction,
} from '@/actions/clinic-trust.actions';
import { ContentRevision } from '@/db/schema/workflow';
import { ClinicRevisionHistoryDrawer } from './ClinicRevisionHistoryDrawer';
import { MediaPickerModal } from '@/components/admin/media/MediaPickerModal';

interface CustomerStoryEditorFormProps {
  initialData?: {
    id: string;
    type: string;
    title: string;
    patientName: string;
    tag?: string | null;
    quote?: string | null;
    fullStory?: string | null;
    imageUrl?: string | null;
    sortOrder: number;
    isPublished: boolean;
  } | null;
  latestDraftRevision?: ContentRevision | null;
  userPermissions: string[];
}

export function CustomerStoryEditorForm({
  initialData,
  latestDraftRevision,
  userPermissions,
}: CustomerStoryEditorFormProps) {
  const router = useRouter();
  const isNew = !initialData?.id;

  const defaultValues = {
    id: initialData?.id || '',
    type: 'customer_story' as const,
    title: initialData?.title || '',
    patientName: initialData?.patientName || '',
    tag: initialData?.tag || 'Tầm soát Ung thư',
    quote: initialData?.quote || '',
    fullStory: initialData?.fullStory || '',
    imageUrl: initialData?.imageUrl || '',
    sortOrder: initialData?.sortOrder || 1,
    isPublished: initialData?.isPublished ?? true,
  };

  const initialPayload = latestDraftRevision?.payload
    ? (latestDraftRevision.payload as typeof defaultValues)
    : defaultValues;

  const [formData, setFormData] = useState({
    id: initialData?.id || initialPayload.id || '',
    type: 'customer_story' as const,
    title: initialPayload.title || '',
    patientName: initialPayload.patientName || '',
    tag: initialPayload.tag || 'Tầm soát Ung thư',
    quote: initialPayload.quote || '',
    fullStory: initialPayload.fullStory || '',
    imageUrl: initialPayload.imageUrl || '',
    sortOrder: initialPayload.sortOrder || 1,
    isPublished: initialPayload.isPublished ?? true,
  });

  const [currentRevision, setCurrentRevision] = useState<ContentRevision | null>(
    latestDraftRevision || null
  );
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [changeSummary, setChangeSummary] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [conflictDetail, setConflictDetail] = useState<{ message: string; currentVersion: number } | null>(null);

  const canEdit = userPermissions.includes('clinical_trust.edit') || userPermissions.includes('super_admin');

  function buildPayload() {
    return {
      type: 'customer_story' as const,
      title: formData.title.trim(),
      patientName: formData.patientName.trim(),
      tag: formData.tag.trim() || 'Tầm soát Ung thư',
      quote: formData.quote.trim() || null,
      fullStory: formData.fullStory.trim() || null,
      imageUrl: formData.imageUrl.trim() || null,
      sortOrder: Number(formData.sortOrder) || 1,
      isPublished: formData.isPublished,
    };
  }

  async function handleSaveDraft() {
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề câu chuyện.');
      return;
    }
    if (!formData.patientName.trim()) {
      alert('Vui lòng nhập tên khách hàng.');
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    setConflictDetail(null);

    const targetId = isNew ? formData.id.trim() || `story-${Date.now()}` : formData.id;

    try {
      const res = await saveTestimonialDraftAction({
        entityId: targetId,
        revisionId: currentRevision?.id,
        expectedVersion: currentRevision?.version,
        payload: buildPayload(),
        changeSummary: changeSummary.trim() || 'Cập nhật câu chuyện khách hàng',
      });

      if (res.success && res.data) {
        setCurrentRevision(res.data);
        setFeedback({ type: 'success', message: `Đã lưu bản nháp #${res.data.revisionNumber} thành công!` });
        setChangeSummary('');
        if (isNew) {
          router.replace(`/admin/clinic/stories/${res.data.entityId}`);
        }
      } else if (res.conflict) {
        setConflictDetail({
          message: res.conflict.message,
          currentVersion: res.conflict.currentVersion,
        });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Lỗi khi lưu bản nháp.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Lỗi kết nối.' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish() {
    if (!currentRevision) {
      alert('Vui lòng lưu bản nháp trước khi xuất bản.');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn xuất bản câu chuyện khách hàng này?')) return;

    setIsPublishing(true);
    setFeedback(null);

    try {
      const res = await publishTestimonialAction(currentRevision.id);
      if (res.success && res.data) {
        setCurrentRevision(res.data);
        setFeedback({
          type: 'success',
          message: 'Xuất bản thành công! Câu chuyện khách hàng đã được đồng bộ trên website công khai.',
        });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Xuất bản thất bại.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Lỗi kết nối khi xuất bản.' });
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleArchive() {
    if (!currentRevision) return;
    if (!confirm('Bạn có chắc chắn muốn tạm ẩn câu chuyện này?')) return;

    setIsArchiving(true);
    setFeedback(null);

    try {
      const res = await archiveTestimonialAction(currentRevision.id);
      if (res.success && res.data) {
        setCurrentRevision(res.data);
        setFormData((prev) => ({ ...prev, isPublished: false }));
        setFeedback({ type: 'warning', message: 'Đã tạm ẩn câu chuyện khách hàng.' });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Thao tác thất bại.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Lỗi kết nối.' });
    } finally {
      setIsArchiving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/clinic?tab=stories"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại danh sách câu chuyện khách hàng</span>
        </Link>

        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <History className="h-4 w-4" />
              <span>Lịch sử</span>
            </button>
          )}

          {canEdit && (
            <>
              <button
                type="button"
                disabled={isSaving || isPublishing}
                onClick={handleSaveDraft}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Lưu bản nháp</span>
              </button>

              <button
                type="button"
                disabled={isSaving || isPublishing}
                onClick={handlePublish}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Xuất bản</span>
              </button>

              {!isNew && (
                <button
                  type="button"
                  disabled={isArchiving}
                  onClick={handleArchive}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all disabled:opacity-50"
                >
                  <Archive className="h-4 w-4" />
                  <span>Ẩn bài</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Conflict Alert */}
      {conflictDetail && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <h4 className="font-semibold">Xung đột phiên bản đồng thời (409)</h4>
            <p className="mt-0.5">{conflictDetail.message}</p>
            <button onClick={() => window.location.reload()} className="mt-2 px-3 py-1 bg-amber-600 text-white font-semibold rounded">
              Tải lại trang
            </button>
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
            feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? <FileCheck2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Form Fields */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-teal-600" />
          <span>Biên Tập Câu Chuyện Trải Nghiệm Khách Hàng</span>
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tiêu đề câu chuyện *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            placeholder="Ví dụ: Có Người Nhà Bị Ung Thư Đại Tràng, Cô Liên Quyết Định Đến Doctor Check Để Tầm Soát Ung Thư"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tên bệnh nhân / Khách hàng *
            </label>
            <input
              type="text"
              value={formData.patientName}
              onChange={(e) => setFormData((p) => ({ ...p, patientName: e.target.value }))}
              placeholder="Ví dụ: Cô Ngọc Liên, Chú Hồng Anh..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nhãn chủ đề (Tag)
            </label>
            <input
              type="text"
              value={formData.tag}
              onChange={(e) => setFormData((p) => ({ ...p, tag: e.target.value }))}
              placeholder="Ví dụ: Tầm Soát Ung Thư, Bệnh Mạn Tính..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Hình ảnh minh họa *
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))}
              placeholder="https://... hoặc đường dẫn ảnh Media"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => setIsMediaPickerOpen(true)}
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors shrink-0"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Thư viện Media</span>
            </button>
          </div>
          {formData.imageUrl && (
            <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
              <img src={formData.imageUrl} alt="Xem trước" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Short Summary */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tóm tắt ngắn (Excerpt)
          </label>
          <textarea
            rows={2}
            value={formData.quote}
            onChange={(e) => setFormData((p) => ({ ...p, quote: e.target.value }))}
            placeholder="Tóm tắt hiển thị trên card câu chuyện..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Full Story Rich HTML with Code / Preview tabs */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nội dung câu chuyện chi tiết (Hỗ trợ HTML định dạng)
            </label>
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  activeTab === 'code' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Code className="h-3.5 w-3.5" />
                <span>Mã HTML</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  activeTab === 'preview' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Xem trước</span>
              </button>
            </div>
          </div>

          {activeTab === 'code' ? (
            <textarea
              rows={8}
              value={formData.fullStory}
              onChange={(e) => setFormData((p) => ({ ...p, fullStory: e.target.value }))}
              placeholder="<p>Cô Ngọc Liên, hiện đang sinh sống tại thành phố...</p>"
              className="w-full font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          ) : (
            <div
              className="w-full min-h-[192px] p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-xs prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: formData.fullStory || '<p class="text-slate-400">Chưa có nội dung xem trước</p>' }}
            />
          )}
        </div>

        {/* Sort Order & Status */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Thứ tự hiển thị
            </label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData((p) => ({ ...p, isPublished: e.target.checked }))}
              className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <label htmlFor="isPublished" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              Xuất bản hiển thị trên Website
            </label>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      {isMediaPickerOpen && (
        <MediaPickerModal
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelectMedia={(asset) => {
            setFormData((p) => ({ ...p, imageUrl: asset.publicUrl }));
            setIsMediaPickerOpen(false);
          }}
        />
      )}

      {/* History Drawer */}
      {!isNew && (
        <ClinicRevisionHistoryDrawer
          title={`Câu chuyện: ${formData.title}`}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          fetchRevisions={() => getTestimonialRevisionsAction(formData.id)}
          onRestoreRevision={restoreClinicRevisionAction}
          onRestored={(newRev) => {
            setCurrentRevision(newRev);
            const p = newRev.payload as typeof defaultValues;
            if (p) {
              setFormData((prev) => ({
                ...prev,
                title: p.title || prev.title,
                patientName: p.patientName || prev.patientName,
                tag: p.tag || prev.tag,
                quote: p.quote || prev.quote,
                fullStory: p.fullStory || prev.fullStory,
                imageUrl: p.imageUrl || prev.imageUrl,
                sortOrder: p.sortOrder || prev.sortOrder,
                isPublished: p.isPublished ?? prev.isPublished,
              }));
            }
          }}
        />
      )}
    </div>
  );
}
