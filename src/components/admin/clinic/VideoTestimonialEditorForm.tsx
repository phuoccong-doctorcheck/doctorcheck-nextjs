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
  Play,
  Video,
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

interface VideoTestimonialEditorFormProps {
  initialData?: {
    id: string;
    type: string;
    title: string;
    patientName: string;
    patientAge?: number | null;
    videoId?: string | null;
    imageUrl?: string | null;
    quote?: string | null;
    sortOrder: number;
    isPublished: boolean;
  } | null;
  latestDraftRevision?: ContentRevision | null;
  userPermissions: string[];
}

export function VideoTestimonialEditorForm({
  initialData,
  latestDraftRevision,
  userPermissions,
}: VideoTestimonialEditorFormProps) {
  const router = useRouter();
  const isNew = !initialData?.id;

  const defaultValues = {
    id: initialData?.id || '',
    type: 'video' as const,
    title: initialData?.title || '',
    patientName: initialData?.patientName || '',
    patientAge: initialData?.patientAge || '',
    videoId: initialData?.videoId || '',
    imageUrl: initialData?.imageUrl || '',
    quote: initialData?.quote || '',
    sortOrder: initialData?.sortOrder || 1,
    isPublished: initialData?.isPublished ?? true,
  };

  const initialPayload = latestDraftRevision?.payload
    ? (latestDraftRevision.payload as typeof defaultValues)
    : defaultValues;

  const [formData, setFormData] = useState({
    id: initialData?.id || initialPayload.id || '',
    type: 'video' as const,
    title: initialPayload.title || '',
    patientName: initialPayload.patientName || '',
    patientAge: initialPayload.patientAge ? String(initialPayload.patientAge) : '',
    videoId: initialPayload.videoId || '',
    imageUrl: initialPayload.imageUrl || '',
    quote: initialPayload.quote || '',
    sortOrder: initialPayload.sortOrder || 1,
    isPublished: initialPayload.isPublished ?? true,
  });

  const [currentRevision, setCurrentRevision] = useState<ContentRevision | null>(
    latestDraftRevision || null
  );
  const [changeSummary, setChangeSummary] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [conflictDetail, setConflictDetail] = useState<{ message: string; currentVersion: number } | null>(null);

  const canEdit = userPermissions.includes('clinical_trust.edit') || userPermissions.includes('super_admin');

  function extractYoutubeId(val: string): string {
    const raw = val.trim();
    if (raw.includes('v=')) {
      return raw.split('v=')[1]?.split('&')[0] || raw;
    }
    if (raw.includes('youtu.be/')) {
      return raw.split('youtu.be/')[1]?.split('?')[0] || raw;
    }
    return raw;
  }

  function handleVideoIdBlur() {
    const cleaned = extractYoutubeId(formData.videoId);
    setFormData((p) => ({ ...p, videoId: cleaned }));
  }

  function buildPayload() {
    const cleanVid = extractYoutubeId(formData.videoId);
    return {
      type: 'video' as const,
      title: formData.title.trim(),
      patientName: formData.patientName.trim(),
      patientAge: formData.patientAge ? Number(formData.patientAge) : null,
      videoId: cleanVid || null,
      imageUrl: formData.imageUrl.trim() || null,
      quote: formData.quote.trim() || null,
      sortOrder: Number(formData.sortOrder) || 1,
      isPublished: formData.isPublished,
    };
  }

  async function handleSaveDraft() {
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề video.');
      return;
    }
    if (!formData.patientName.trim()) {
      alert('Vui lòng nhập tên khách hàng / bệnh nhân.');
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    setConflictDetail(null);

    const targetId = isNew ? formData.id.trim() || `vid-${Date.now()}` : formData.id;

    try {
      const res = await saveTestimonialDraftAction({
        entityId: targetId,
        revisionId: currentRevision?.id,
        expectedVersion: currentRevision?.version,
        payload: buildPayload(),
        changeSummary: changeSummary.trim() || 'Cập nhật video cảm nhận',
      });

      if (res.success && res.data) {
        setCurrentRevision(res.data);
        setFeedback({ type: 'success', message: `Đã lưu bản nháp #${res.data.revisionNumber} thành công!` });
        setChangeSummary('');
        if (isNew) {
          router.replace(`/admin/clinic/testimonials/${res.data.entityId}`);
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

    if (!confirm('Bạn có chắc chắn muốn xuất bản video cảm nhận này?')) return;

    setIsPublishing(true);
    setFeedback(null);

    try {
      const res = await publishTestimonialAction(currentRevision.id);
      if (res.success && res.data) {
        setCurrentRevision(res.data);
        setFeedback({
          type: 'success',
          message: 'Xuất bản thành công! Video cảm nhận đã được cập nhật trên website công khai.',
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
    if (!confirm('Bạn có chắc chắn muốn ẩn video cảm nhận này?')) return;

    setIsArchiving(true);
    setFeedback(null);

    try {
      const res = await archiveTestimonialAction(currentRevision.id);
      if (res.success && res.data) {
        setCurrentRevision(res.data);
        setFormData((prev) => ({ ...prev, isPublished: false }));
        setFeedback({ type: 'warning', message: 'Đã tạm ẩn video cảm nhận.' });
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
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/clinic?tab=videos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại danh sách video cảm nhận</span>
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
                  <span>Ẩn Video</span>
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
          <Video className="h-4 w-4 text-rose-500" />
          <span>Biên Tập Video Cảm Nhận Khách Hàng</span>
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tiêu đề video *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            placeholder="Ví dụ: Tiền Bạc Là Gì Khi Sức Khỏe Chẳng Còn - Câu Chuyện Của Anh Ken Võ"
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
              placeholder="Ví dụ: Chú Hồng Anh, Cô Ngọc Liên..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tuổi bệnh nhân (Tùy chọn)
            </label>
            <input
              type="number"
              value={formData.patientAge}
              onChange={(e) => setFormData((p) => ({ ...p, patientAge: e.target.value }))}
              placeholder="Ví dụ: 72"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* YouTube Video ID / URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Mã YouTube Video ID hoặc URL *
          </label>
          <input
            type="text"
            value={formData.videoId}
            onChange={(e) => setFormData((p) => ({ ...p, videoId: e.target.value }))}
            onBlur={handleVideoIdBlur}
            placeholder="Ví dụ: A4BCCgKqwVI hoặc https://www.youtube.com/watch?v=A4BCCgKqwVI"
            className="w-full font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          {formData.videoId && (
            <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 max-w-md bg-black">
              <div className="relative pt-[56.25%]">
                <iframe
                  src={`https://www.youtube.com/embed/${extractYoutubeId(formData.videoId)}`}
                  title="Xem trước Video"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail Image */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Hình ảnh thu nhỏ (Thumbnail tùy chọn)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))}
              placeholder="Để trống nếu muốn sử dụng thumbnail tự động từ YouTube"
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
        </div>

        {/* Quote / Summary */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Trích dẫn lời phát biểu nổi bật của khách hàng
          </label>
          <textarea
            rows={3}
            value={formData.quote}
            onChange={(e) => setFormData((p) => ({ ...p, quote: e.target.value }))}
            placeholder="Ví dụ: Bác sĩ tư vấn rất kỹ, cơ sở vật chất hiện đại giúp tôi yên tâm tầm soát..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
          />
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
          title={`Video: ${formData.title}`}
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
                patientAge: p.patientAge ? String(p.patientAge) : '',
                videoId: p.videoId || prev.videoId,
                imageUrl: p.imageUrl || prev.imageUrl,
                quote: p.quote || prev.quote,
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
