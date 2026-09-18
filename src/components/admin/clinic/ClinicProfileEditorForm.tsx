'use client';

import React, { useState } from 'react';
import {
  Save,
  Send,
  CheckCircle2,
  AlertTriangle,
  History,
  Building2,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Globe,
  Loader2,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import {
  saveClinicDraftAction,
  submitClinicReviewAction,
  approveClinicAction,
  returnClinicToDraftAction,
  publishClinicAction,
  getClinicRevisionsAction,
  restoreClinicRevisionAction,
} from '@/actions/clinic-trust.actions';
import { ContentRevision } from '@/db/schema/workflow';
import { ClinicRevisionHistoryDrawer } from './ClinicRevisionHistoryDrawer';

interface ClinicProfileEditorFormProps {
  initialData: {
    id: string;
    name: string;
    legalName: string;
    licenseNumber: string;
    taxCode: string;
    hotline: string;
    emergencyPhone?: string | null;
    zaloUrl: string;
    email: string;
    addressStreet: string;
    addressWard: string;
    addressDistrict: string;
    addressCity: string;
    addressFull: string;
    latitude: string;
    longitude: string;
    workingHours?: { full?: string; short?: string };
    updatedAt: Date | string;
  };
  latestDraftRevision?: ContentRevision | null;
  userPermissions: string[];
}

export function ClinicProfileEditorForm({
  initialData,
  latestDraftRevision,
  userPermissions,
}: ClinicProfileEditorFormProps) {
  const initialPayload = (latestDraftRevision?.payload as typeof initialData) || initialData;

  const [formData, setFormData] = useState({
    name: initialPayload.name || '',
    legalName: initialPayload.legalName || '',
    licenseNumber: initialPayload.licenseNumber || '',
    taxCode: initialPayload.taxCode || '',
    hotline: initialPayload.hotline || '',
    emergencyPhone: initialPayload.emergencyPhone || '',
    zaloUrl: initialPayload.zaloUrl || '',
    email: initialPayload.email || '',
    addressStreet: initialPayload.addressStreet || '',
    addressWard: initialPayload.addressWard || '',
    addressDistrict: initialPayload.addressDistrict || '',
    addressCity: initialPayload.addressCity || '',
    addressFull: initialPayload.addressFull || '',
    latitude: initialPayload.latitude ? String(initialPayload.latitude) : '10.7751983',
    longitude: initialPayload.longitude ? String(initialPayload.longitude) : '106.6627364',
    workingHoursFull: (initialPayload.workingHours as { full?: string })?.full || 'Thứ 2 - Thứ 7: 07:30 - 17:00',
    workingHoursShort: (initialPayload.workingHours as { short?: string })?.short || 'T2 - T7: 07:30 - 17:00',
  });

  const [currentRevision, setCurrentRevision] = useState<ContentRevision | null>(
    latestDraftRevision || null
  );
  const [changeSummary, setChangeSummary] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [conflictDetail, setConflictDetail] = useState<{ message: string; currentVersion: number } | null>(null);

  const canEdit = userPermissions.includes('clinic.edit') || userPermissions.includes('super_admin');

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function buildPayload() {
    return {
      name: formData.name.trim(),
      legalName: formData.legalName.trim(),
      licenseNumber: formData.licenseNumber.trim(),
      taxCode: formData.taxCode.trim(),
      hotline: formData.hotline.trim(),
      emergencyPhone: formData.emergencyPhone.trim() || null,
      zaloUrl: formData.zaloUrl.trim(),
      email: formData.email.trim(),
      addressStreet: formData.addressStreet.trim(),
      addressWard: formData.addressWard.trim(),
      addressDistrict: formData.addressDistrict.trim(),
      addressCity: formData.addressCity.trim(),
      addressFull: formData.addressFull.trim(),
      latitude: formData.latitude.trim(),
      longitude: formData.longitude.trim(),
      workingHours: {
        full: formData.workingHoursFull.trim(),
        short: formData.workingHoursShort.trim(),
      },
    };
  }

  async function handleSaveDraft() {
    setIsSaving(true);
    setFeedback(null);
    setConflictDetail(null);

    try {
      const res = await saveClinicDraftAction({
        revisionId: currentRevision?.id,
        expectedVersion: currentRevision?.version,
        payload: buildPayload(),
        changeSummary: changeSummary.trim() || 'Cập nhật thông tin phòng khám',
      });

      if (res.success && res.data) {
        setCurrentRevision(res.data);
        setFeedback({ type: 'success', message: `Đã lưu bản nháp #${res.data.revisionNumber} thành công!` });
        setChangeSummary('');
      } else if (res.conflict) {
        setConflictDetail({
          message: res.conflict.message,
          currentVersion: res.conflict.currentVersion,
        });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Lỗi khi lưu bản nháp.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Lỗi kết nối máy chủ.' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmitReview() {
    if (!currentRevision) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await submitClinicReviewAction(currentRevision.id);
      if (res.success && res.data) {
        setCurrentRevision(res.data);
        setFeedback({ type: 'success', message: 'Đã gửi duyệt hồ sơ phòng khám thành công!' });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Gửi duyệt thất bại.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Lỗi kết nối.' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleApprove() {
    if (!currentRevision) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await approveClinicAction(currentRevision.id);
      if (res.success && res.data) {
        setCurrentRevision(res.data);
        setFeedback({ type: 'success', message: 'Đã phê duyệt hồ sơ phòng khám thành công!' });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Phê duyệt thất bại.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Lỗi kết nối.' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReturnDraft() {
    if (!currentRevision) return;
    const notes = prompt('Nhập lý do trả về bản nháp / yêu cầu chỉnh sửa:');
    if (notes === null) return;

    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await returnClinicToDraftAction(currentRevision.id, notes);
      if (res.success && res.data) {
        setCurrentRevision(res.data);
        setFeedback({ type: 'warning', message: 'Đã trả về bản nháp.' });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Thao tác thất bại.' });
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

    if (!confirm('Bạn có chắc chắn muốn xuất bản thông tin phòng khám này lên toàn bộ hệ thống website công khai?')) {
      return;
    }

    setIsPublishing(true);
    setFeedback(null);

    try {
      const res = await publishClinicAction(currentRevision.id);
      if (res.success && res.data) {
        setCurrentRevision(res.data);
        setFeedback({
          type: 'success',
          message: 'Xuất bản thành công! Thông tin phòng khám đã được cập nhật trên website công khai và làm mới bộ nhớ đệm.',
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

  return (
    <div className="space-y-6">
      {/* Concurrency Conflict Modal */}
      {conflictDetail && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-md animate-in fade-in">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Xung đột đồng thời (409 Conflict)</h4>
            <p className="text-xs mt-1">{conflictDetail.message}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
              >
                Tải lại phiên bản mới nhất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Workflow Status & Action Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Hồ Sơ Pháp Lý Phòng Khám
              </h2>
              {currentRevision && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Rev #{currentRevision.revisionNumber} ({currentRevision.status.toUpperCase()})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý thông tin pháp nhân, giấy phép hoạt động SYT, tọa độ bản đồ và kênh liên hệ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <History className="h-4 w-4" />
            <span>Lịch sử</span>
          </button>

          {canEdit && (
            <>
              <button
                type="button"
                disabled={isSaving || isPublishing}
                onClick={handleSaveDraft}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Lưu bản nháp</span>
              </button>

              {currentRevision?.status === 'draft' && (
                <button
                  type="button"
                  disabled={isSaving || isPublishing}
                  onClick={handleSubmitReview}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>Gửi duyệt</span>
                </button>
              )}

              {currentRevision?.status === 'in_review' && (
                <>
                  <button
                    type="button"
                    disabled={isSaving || isPublishing}
                    onClick={handleReturnDraft}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-50 transition-all"
                  >
                    <span>Yêu cầu sửa</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSaving || isPublishing}
                    onClick={handleApprove}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Phê duyệt</span>
                  </button>
                </>
              )}

              <button
                type="button"
                disabled={isSaving || isPublishing}
                onClick={handlePublish}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Xuất bản công khai</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : feedback.type === 'warning'
              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <FileCheck2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Legal & Medical Identity (High-Impact Regulated Data) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Pháp Lý & Giấy Phép Hoạt Động (Regulated Data)
              </h3>
              <p className="text-[11px] text-slate-500">Thông tin được thẩm định y tế & cơ quan quản lý</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tên phòng khám niêm yết *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Ví dụ: Phòng khám Doctor Check"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tên pháp nhân doanh nghiệp *
            </label>
            <input
              type="text"
              name="legalName"
              value={formData.legalName}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Ví dụ: Công ty TNHH Doctor Check"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Số Giấy phép hoạt động (GPHĐ) *
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 text-xs font-semibold text-emerald-900 dark:text-emerald-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="09789/HCM-GPHĐ"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mã số thuế (Tax Code) *
              </label>
              <input
                type="text"
                name="taxCode"
                value={formData.taxCode}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="0315729707"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Hotline */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Phone className="h-5 w-5 text-sky-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Tổng Đài & Kênh Tiếp Nhận
              </h3>
              <p className="text-[11px] text-slate-500">Hotline đặt lịch, cấp cứu và tư vấn Zalo OA</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hotline chính *
              </label>
              <input
                type="text"
                name="hotline"
                value={formData.hotline}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="028 5678 9999"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hotline khẩn cấp / Cấp cứu
              </label>
              <input
                type="text"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Tùy chọn"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email liên hệ *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="contact@doctorcheck.vn"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Đường dẫn Zalo Official Account *
            </label>
            <input
              type="text"
              name="zaloUrl"
              value={formData.zaloUrl}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="https://zalo.me/..."
            />
          </div>
        </div>

        {/* Section 3: Physical Address & Map Coordinates */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <MapPin className="h-5 w-5 text-rose-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Địa Chỉ Cơ Sở & Tọa Độ GPS
              </h3>
              <p className="text-[11px] text-slate-500">Đồng bộ dữ liệu định vị Schema MedicalClinic</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Địa chỉ đầy đủ (Full Address) *
            </label>
            <input
              type="text"
              name="addressFull"
              value={formData.addressFull}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="429 Tô Hiến Thành, Phường 14, Quận 10, TP. Hồ Chí Minh"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Số nhà & Đường
              </label>
              <input
                type="text"
                name="addressStreet"
                value={formData.addressStreet}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phường / Xã
              </label>
              <input
                type="text"
                name="addressWard"
                value={formData.addressWard}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quận / Huyện
              </label>
              <input
                type="text"
                name="addressDistrict"
                value={formData.addressDistrict}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tỉnh / Thành Phố
              </label>
              <input
                type="text"
                name="addressCity"
                value={formData.addressCity}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vĩ độ (Latitude) *
              </label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kinh độ (Longitude) *
              </label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Operating Hours & Change Notes */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Clock className="h-5 w-5 text-amber-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Thời Gian Khám & Ghi Chú Bản Nháp
              </h3>
              <p className="text-[11px] text-slate-500">Giờ làm việc hiển thị trên Header, Footer & Booking Form</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Thời gian làm việc đầy đủ *
            </label>
            <input
              type="text"
              name="workingHoursFull"
              value={formData.workingHoursFull}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              placeholder="Thứ 2 - Thứ 7: 07:30 - 17:00"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Thời gian làm việc rút gọn *
            </label>
            <input
              type="text"
              name="workingHoursShort"
              value={formData.workingHoursShort}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              placeholder="T2 - T7: 07:30 - 17:00"
            />
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mô tả thay đổi bản nháp (Audit Note)
            </label>
            <textarea
              rows={3}
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Ví dụ: Cập nhật hotline tổng đài mới..."
            />
          </div>
        </div>
      </div>

      {/* Revision History Drawer */}
      <ClinicRevisionHistoryDrawer
        title="Hồ Sơ Phòng Khám"
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        fetchRevisions={getClinicRevisionsAction}
        onRestoreRevision={restoreClinicRevisionAction}
        onRestored={(newRev) => {
          setCurrentRevision(newRev);
          const p = newRev.payload as typeof initialData;
          if (p) {
            setFormData({
              name: p.name || '',
              legalName: p.legalName || '',
              licenseNumber: p.licenseNumber || '',
              taxCode: p.taxCode || '',
              hotline: p.hotline || '',
              emergencyPhone: p.emergencyPhone || '',
              zaloUrl: p.zaloUrl || '',
              email: p.email || '',
              addressStreet: p.addressStreet || '',
              addressWard: p.addressWard || '',
              addressDistrict: p.addressDistrict || '',
              addressCity: p.addressCity || '',
              addressFull: p.addressFull || '',
              latitude: p.latitude ? String(p.latitude) : '10.7751983',
              longitude: p.longitude ? String(p.longitude) : '106.6627364',
              workingHoursFull: (p.workingHours as { full?: string })?.full || 'Thứ 2 - Thứ 7: 07:30 - 17:00',
              workingHoursShort: (p.workingHours as { short?: string })?.short || 'T2 - T7: 07:30 - 17:00',
            });
          }
        }}
      />
    </div>
  );
}
