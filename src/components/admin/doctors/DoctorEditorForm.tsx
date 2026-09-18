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
  ShieldCheck,
  Image as ImageIcon,
  Sparkles,
  RotateCcw,
  FileCheck,
} from 'lucide-react';
import { DoctorAdminDetail, SpecialtyItem } from '@/repositories/contracts/doctor.repository';
import { ContentRevision } from '@/db/schema/workflow';
import {
  saveDoctorDraftAction,
  submitDoctorReviewAction,
  returnDoctorToDraftAction,
  approveDoctorAction,
  publishDoctorAction,
} from '@/actions/doctor.actions';
import { MediaPickerModal } from '@/components/admin/media/MediaPickerModal';
import { DoctorRevisionHistoryDrawer } from './DoctorRevisionHistoryDrawer';

interface DoctorEditorFormProps {
  initialDoctor?: DoctorAdminDetail | null;
  activeRevision?: ContentRevision | null;
  specialties: SpecialtyItem[];
  userRoles: string[];
  userPermissions: string[];
}

export function DoctorEditorForm({
  initialDoctor,
  activeRevision,
  specialties,
  userRoles,
}: DoctorEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [entityId] = useState<string>(() => initialDoctor?.id || `doc-${Date.now()}`);
  const [revisionId, setRevisionId] = useState<string | undefined>(activeRevision?.id);
  const [expectedVersion, setExpectedVersion] = useState<number>(
    activeRevision?.revisionNumber ?? (initialDoctor ? 1 : 1)
  );
  const [workflowStatus, setWorkflowStatus] = useState<string>(
    activeRevision?.status || initialDoctor?.status || 'draft'
  );

  // Extract snapshot payload or fallback to canonical record
  const payload = activeRevision?.payload as Record<string, unknown> | null;

  // Form states
  const [name, setName] = useState<string>((payload?.name as string) || initialDoctor?.name || '');
  const [slug, setSlug] = useState<string>((payload?.slug as string) || initialDoctor?.slug || '');
  const [title, setTitle] = useState<string>((payload?.title as string) || initialDoctor?.title || '');
  const [cchn, setCchn] = useState<string>((payload?.cchn as string) || initialDoctor?.cchn || '');
  const [specialtySummary, setSpecialtySummary] = useState<string>(
    (payload?.specialtySummary as string) || initialDoctor?.specialtySummary || ''
  );
  const [clinicalScope, setClinicalScope] = useState<string>(
    (payload?.clinicalScope as string) || initialDoctor?.clinicalScope || ''
  );
  const [hospital, setHospital] = useState<string>(
    (payload?.hospital as string) || initialDoctor?.hospital || ''
  );
  const [experienceYears, setExperienceYears] = useState<number>(
    Number(payload?.experienceYears ?? initialDoctor?.experienceYears ?? 10)
  );
  const [imageUrl, setImageUrl] = useState<string>(
    (payload?.imageUrl as string) || initialDoctor?.imageUrl || ''
  );
  const [description, setDescription] = useState<string>(
    (payload?.description as string) || initialDoctor?.description || ''
  );
  const [detailedBioHtml, setDetailedBioHtml] = useState<string>(
    (payload?.detailedBioHtml as string) || initialDoctor?.detailedBioHtml || ''
  );
  const [schedule, setSchedule] = useState<string>(
    (payload?.schedule as string) || initialDoctor?.schedule || 'Thứ 2 - Thứ 7 (Theo lịch hẹn)'
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(
    Boolean(payload?.isFeatured ?? initialDoctor?.isFeatured ?? true)
  );
  const [sortOrder, setSortOrder] = useState<number>(
    Number(payload?.sortOrder ?? initialDoctor?.sortOrder ?? 0)
  );
  const [specialtyIds, setSpecialtyIds] = useState<string[]>(
    (payload?.specialtyIds as string[]) || initialDoctor?.specialtyIds || []
  );
  const [seoTitle, setSeoTitle] = useState<string>(
    (payload?.seoTitle as string) || initialDoctor?.seoTitle || ''
  );
  const [seoDescription, setSeoDescription] = useState<string>(
    (payload?.seoDescription as string) || initialDoctor?.seoDescription || ''
  );

  // Modals & Drawers
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Slug generator
  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialDoctor && !slug) {
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

  const handleSpecialtyToggle = (specId: string) => {
    setSpecialtyIds((prev) =>
      prev.includes(specId) ? prev.filter((id) => id !== specId) : [...prev, specId]
    );
  };

  const constructPayload = () => ({
    name: name.trim(),
    slug: slug.trim(),
    title: title.trim(),
    cchn: cchn.trim(),
    specialtySummary: specialtySummary.trim(),
    clinicalScope: clinicalScope.trim(),
    hospital: hospital.trim(),
    experienceYears: Number(experienceYears) || 0,
    imageUrl: imageUrl.trim(),
    description: description.trim(),
    detailedBioHtml: detailedBioHtml.trim(),
    schedule: schedule.trim(),
    isFeatured,
    sortOrder: Number(sortOrder) || 0,
    specialtyIds,
    seoTitle: seoTitle.trim() || undefined,
    seoDescription: seoDescription.trim() || undefined,
  });

  // Action: Save Draft
  const handleSaveDraft = async () => {
    setActionMessage(null);
    setConflictError(null);

    const payloadData = constructPayload();
    if (!payloadData.name || !payloadData.slug || !payloadData.cchn) {
      setActionMessage({ text: 'Vui lòng điền đầy đủ Tên bác sĩ, Đường dẫn (slug) và Giấy phép CCHN.', type: 'error' });
      return;
    }

    startTransition(async () => {
      const res = await saveDoctorDraftAction({
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
          `Xung đột phiên bản: Người khác đã chỉnh sửa hồ sơ này (Phiên bản hiện tại: v${res.conflict.currentVersion}). Vui lòng tải lại trang để xem thay đổi mới nhất.`
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
      const res = await submitDoctorReviewAction(revisionId);
      if (res.success && res.data) {
        setWorkflowStatus(res.data.status);
        setActionMessage({ text: 'Đã gửi hồ sơ bác sĩ để thẩm định CCHN!', type: 'success' });
        router.refresh();
      } else {
        setActionMessage({ text: res.error || 'Gửi thẩm định thất bại.', type: 'error' });
      }
    });
  };

  // Action: Return to Draft
  const handleReturnToDraft = async () => {
    if (!revisionId) return;
    const note = prompt('Nhập lý do / ghi chú yêu cầu chỉnh sửa:');
    if (note === null) return;

    startTransition(async () => {
      const res = await returnDoctorToDraftAction(revisionId, note);
      if (res.success && res.data) {
        setWorkflowStatus(res.data.status);
        setActionMessage({ text: 'Đã trả hồ sơ về trạng thái Bản Nháp!', type: 'success' });
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
      const res = await approveDoctorAction(revisionId);
      if (res.success && res.data) {
        setWorkflowStatus(res.data.status);
        setActionMessage({ text: 'Đã phê duyệt CCHN và hồ sơ chuyên môn của Bác sĩ!', type: 'success' });
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

    if (!confirm('Bạn có chắc chắn muốn xuất bản hồ sơ bác sĩ này lên trang web chính thức?')) {
      return;
    }

    startTransition(async () => {
      const res = await publishDoctorAction(revisionId);
      if (res.success && res.data) {
        setWorkflowStatus(res.data.status);
        setActionMessage({ text: 'Xuất bản hồ sơ Bác sĩ thành công!', type: 'success' });
        router.refresh();
      } else {
        setActionMessage({ text: res.error || 'Xuất bản thất bại.', type: 'error' });
      }
    });
  };

  const isSuperAdmin = userRoles.includes('super_admin');
  const isMedicalReviewer = userRoles.includes('medical_reviewer') || isSuperAdmin;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Workflow Bar */}
      <div className="sticky top-0 z-30 -mx-6 -mt-6 mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-6 py-4 backdrop-blur shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/doctors"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {name || 'Hồ Sơ Bác Sĩ Mới'}
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
          {initialDoctor && (
            <Link
              href={`/admin/doctors/${entityId}/preview`}
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
              Gửi Duyệt CCHN
            </button>
          )}

          {/* Reviewer Actions */}
          {workflowStatus === 'in_review' && isMedicalReviewer && (
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
                Phê Duyệt CCHN
              </button>
            </>
          )}

          {/* Publish */}
          {(workflowStatus === 'approved' || (isMedicalReviewer && workflowStatus === 'in_review')) && (
            <button
              type="button"
              disabled={isPending}
              onClick={handlePublish}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              Xuất Bản Chính Thức
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
        {/* Left 2 Columns: Core Information */}
        <div className="space-y-6 lg:col-span-2">
          {/* Box 1: Essential Doctor Data */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Thông Tin Định Danh & Chức Danh
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Họ và tên Bác sĩ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: BSCKII Trịnh Ái Nhi"
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
                  placeholder="trinh-ai-nhi"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Học vị & Chức danh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Bác Sĩ Chuyên Khoa II"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* CCHN with Medical Authority indicator */}
              <div>
                <label className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>Số Giấy phép CCHN <span className="text-rose-500">*</span></span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-normal">
                    <ShieldCheck className="h-3 w-3" /> Kiểm duyệt Y khoa
                  </span>
                </label>
                <input
                  type="text"
                  value={cchn}
                  onChange={(e) => setCchn(e.target.value)}
                  placeholder="040144/HCM-CCHN"
                  className="w-full rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20 px-3.5 py-2 text-sm font-mono font-semibold text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tóm tắt Chuyên khoa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={specialtySummary}
                  onChange={(e) => setSpecialtySummary(e.target.value)}
                  placeholder="Nội Tổng Hợp - Nội Soi Tiêu Hóa"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nơi công tác / Bệnh viện <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="BV Chợ Rẫy, BV Đại Học Y Dược..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Phạm vi hoạt động chuyên môn theo CCHN <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={clinicalScope}
                onChange={(e) => setClinicalScope(e.target.value)}
                placeholder="Khám bệnh, chữa bệnh chuyên khoa Nội tổng hợp (thực hiện các kỹ thuật Nội soi tiêu hóa)..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Box 2: Biography & Scope */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Tiểu Sử & Kinh Nghiệm
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tóm tắt giới thiệu (Description) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bác sĩ CKII Trịnh Ái Nhi có hơn 20 năm kinh nghiệm trong lĩnh vực..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nội dung giới thiệu chi tiết (HTML / Semantic Content)
              </label>
              <textarea
                rows={8}
                value={detailedBioHtml}
                onChange={(e) => setDetailedBioHtml(e.target.value)}
                placeholder="<p>Bác sĩ có nhiều công trình nghiên cứu...</p>"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Nội dung HTML mới được tự động khử trùng chống tấn công Stored XSS bằng chính sách nghiêm ngặt.
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Metadata, Photo & Taxonomy */}
        <div className="space-y-6">
          {/* Photo & Media Picker */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Ảnh Chân Dung
            </h2>

            <div className="flex flex-col items-center justify-center gap-3">
              <div className="relative h-32 w-32 overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
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
              <label className="block text-[11px] text-slate-400 mb-1">Đường dẫn ảnh trực tiếp</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/sites/.../trinh-ai-nhi.webp"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Specialties Multi-Select */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Chuyên Khoa Liên Kết
            </h2>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {specialties.length === 0 ? (
                <p className="text-xs text-slate-400">Không có chuyên khoa nào trong hệ thống.</p>
              ) : (
                specialties.map((spec) => {
                  const isChecked = specialtyIds.includes(spec.id);
                  return (
                    <label
                      key={spec.id}
                      className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-medium'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSpecialtyToggle(spec.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span>{spec.name}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Configuration & Schedule */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Lịch Khám & Cấu Hình
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Lịch làm việc / Khám bệnh
              </label>
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="Thứ 3: 6h00 - 17h00"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Năm kinh nghiệm
                </label>
                <input
                  type="number"
                  min={0}
                  max={70}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Thứ tự sắp xếp
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Hiển thị nổi bật trên Trang Chủ
                </span>
              </label>
            </div>
          </div>

          {/* SEO Controls */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Tối Ưu Hóa Tìm Kiếm (SEO)
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tiêu đề SEO (Tùy chọn)
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Tự động tạo theo chuẩn Physician"
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
                placeholder="Mô tả tóm tắt..."
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
      <DoctorRevisionHistoryDrawer
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
