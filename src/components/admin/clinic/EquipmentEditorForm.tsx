'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Save,
  Send,
  CheckCircle2,
  AlertTriangle,
  History,
  ArrowLeft,
  Image as ImageIcon,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  FileCheck2,
  Archive,
  Eye,
} from 'lucide-react';
import {
  saveEquipmentDraftAction,
  publishEquipmentAction,
  archiveEquipmentAction,
  getEquipmentRevisionsAction,
  restoreClinicRevisionAction,
} from '@/actions/clinic-trust.actions';
import { ContentRevision } from '@/db/schema/workflow';
import { ClinicRevisionHistoryDrawer } from './ClinicRevisionHistoryDrawer';
import { MediaPickerModal } from '@/components/admin/media/MediaPickerModal';

interface EquipmentEditorFormProps {
  initialData?: {
    id: string;
    name: string;
    origin: string;
    manufacturer: string;
    imageUrl: string;
    description: string;
    features: string[];
    sortOrder: number;
    isActive: boolean;
  } | null;
  latestDraftRevision?: ContentRevision | null;
  userPermissions: string[];
}

export function EquipmentEditorForm({
  initialData,
  latestDraftRevision,
  userPermissions,
}: EquipmentEditorFormProps) {
  const router = useRouter();
  const isNew = !initialData?.id;

  const defaultValues = {
    id: initialData?.id || '',
    name: initialData?.name || '',
    origin: initialData?.origin || 'Nhật Bản',
    manufacturer: initialData?.manufacturer || '',
    imageUrl: initialData?.imageUrl || '',
    description: initialData?.description || '',
    features: (initialData?.features as string[]) || [],
    sortOrder: initialData?.sortOrder || 1,
    isActive: initialData?.isActive ?? true,
  };

  const initialPayload = latestDraftRevision?.payload
    ? (latestDraftRevision.payload as typeof defaultValues)
    : defaultValues;

  const [formData, setFormData] = useState({
    id: initialData?.id || initialPayload.id || '',
    name: initialPayload.name || '',
    origin: initialPayload.origin || 'Nhật Bản',
    manufacturer: initialPayload.manufacturer || '',
    imageUrl: initialPayload.imageUrl || '',
    description: initialPayload.description || '',
    features: Array.isArray(initialPayload.features) ? initialPayload.features : [],
    sortOrder: initialPayload.sortOrder || 1,
    isActive: initialPayload.isActive ?? true,
  });

  const [currentRevision, setCurrentRevision] = useState<ContentRevision | null>(
    latestDraftRevision || null
  );
  const [changeSummary, setChangeSummary] = useState('');
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [conflictDetail, setConflictDetail] = useState<{ message: string; currentVersion: number } | null>(null);

  const canEdit = userPermissions.includes('clinic.edit') || userPermissions.includes('super_admin');

  function handleAddFeature() {
    const text = newFeatureInput.trim();
    if (!text) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, text],
    }));
    setNewFeatureInput('');
  }

  function handleRemoveFeature(index: number) {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, idx) => idx !== index),
    }));
  }

  function buildPayload() {
    return {
      name: formData.name.trim(),
      origin: formData.origin.trim(),
      manufacturer: formData.manufacturer.trim(),
      imageUrl: formData.imageUrl.trim(),
      description: formData.description.trim(),
      features: formData.features,
      sortOrder: Number(formData.sortOrder) || 1,
      isActive: formData.isActive,
    };
  }

  async function handleSaveDraft() {
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên thiết bị.');
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    setConflictDetail(null);

    const targetId = isNew
      ? formData.id.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : formData.id;

    try {
      const res = await saveEquipmentDraftAction({
        entityId: targetId,
        revisionId: currentRevision?.id,
        expectedVersion: currentRevision?.version,
        payload: buildPayload(),
        changeSummary: changeSummary.trim() || 'Cập nhật thiết bị',
      });

      if (res.success && res.data) {
        setCurrentRevision(res.data);
        setFeedback({ type: 'success', message: `Đã lưu bản nháp #${res.data.revisionNumber} thành công!` });
        setChangeSummary('');
        if (isNew) {
          router.replace(`/admin/clinic/equipment/${res.data.entityId}`);
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

    if (!confirm('Bạn có chắc chắn muốn xuất bản thông tin thiết bị này lên website công khai?')) {
      return;
    }

    setIsPublishing(true);
    setFeedback(null);

    try {
      const res = await publishEquipmentAction(currentRevision.id);
      if (res.success && res.data) {
        setCurrentRevision(res.data);
        setFeedback({
          type: 'success',
          message: 'Xuất bản thành công! Thông tin thiết bị đã được đồng bộ và làm mới bộ nhớ đệm.',
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
    if (!confirm('Bạn có chắc chắn muốn lưu trữ/tạm ẩn thiết bị này? Hệ thống sẽ kiểm tra xem thiết bị có đang được sử dụng tại Trang chủ hay không.')) {
      return;
    }

    setIsArchiving(true);
    setFeedback(null);

    try {
      const res = await archiveEquipmentAction(currentRevision.id);
      if (res.success && res.data) {
        setCurrentRevision(res.data);
        setFormData((prev) => ({ ...prev, isActive: false }));
        setFeedback({ type: 'warning', message: 'Đã lưu trữ thiết bị thành công.' });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Lưu trữ thất bại.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Lỗi kết nối.' });
    } finally {
      setIsArchiving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/clinic?tab=equipment"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại danh sách trang thiết bị</span>
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
                  <span>Lưu trữ</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Concurrency Conflict Alert */}
      {conflictDetail && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <h4 className="font-semibold">Xung đột phiên bản đồng thời (409)</h4>
            <p className="mt-0.5">{conflictDetail.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-amber-600 text-white font-semibold rounded"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? <FileCheck2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Form Fields */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800">
          Thông Tin Trang Thiết Bị Y Tế
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mã định danh (ID / Slug) *
            </label>
            <input
              type="text"
              disabled={!isNew}
              value={formData.id}
              onChange={(e) => setFormData((p) => ({ ...p, id: e.target.value }))}
              placeholder="ví dụ: olympus-evis-x1"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tên máy / Hệ thống thiết bị *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="ví dụ: Hệ Thống Máy Nội Soi Olympus EVIS-X1"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hãng sản xuất *
            </label>
            <input
              type="text"
              value={formData.manufacturer}
              onChange={(e) => setFormData((p) => ({ ...p, manufacturer: e.target.value }))}
              placeholder="ví dụ: Olympus, Fujifilm, Siemens..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Xuất xứ quốc gia *
            </label>
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => setFormData((p) => ({ ...p, origin: e.target.value }))}
              placeholder="ví dụ: Nhật Bản, Đức, Mỹ..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Image / Media Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Hình ảnh thiết bị *
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))}
              placeholder="/sites/doctorcheck-vn/root/images/equipment/... hoặc URL hình ảnh"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => setIsMediaPickerOpen(true)}
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shrink-0"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Thư viện Media</span>
            </button>
          </div>
          {formData.imageUrl && (
            <div className="mt-2 w-32 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
              <img src={formData.imageUrl} alt="Xem trước" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Mô tả thiết bị & vai trò lâm sàng *
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            placeholder="Mô tả công nghệ và lợi ích đối với chẩn đoán bệnh lý tiêu hóa..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Feature Specs List */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Đặc tính / Thông số kỹ thuật nổi bật
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newFeatureInput}
              onChange={(e) => setNewFeatureInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
              placeholder="Nhập thông số (ví dụ: Công nghệ NBI nhuộm màu ảo quang học)..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            {formData.features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <span>{feat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sort Order & Status */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Thứ tự hiển thị (Sort Order)
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
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
              className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <label htmlFor="isActive" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              Đang hoạt động (Hiển thị trên Trang chủ & Trang thiết bị)
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
          title={`Thiết bị: ${formData.name}`}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          fetchRevisions={() => getEquipmentRevisionsAction(formData.id)}
          onRestoreRevision={restoreClinicRevisionAction}
          onRestored={(newRev) => {
            setCurrentRevision(newRev);
            const p = newRev.payload as typeof defaultValues;
            if (p) {
              setFormData((prev) => ({
                ...prev,
                name: p.name || prev.name,
                origin: p.origin || prev.origin,
                manufacturer: p.manufacturer || prev.manufacturer,
                imageUrl: p.imageUrl || prev.imageUrl,
                description: p.description || prev.description,
                features: p.features || prev.features,
                sortOrder: p.sortOrder || prev.sortOrder,
                isActive: p.isActive ?? prev.isActive,
              }));
            }
          }}
        />
      )}
    </div>
  );
}
