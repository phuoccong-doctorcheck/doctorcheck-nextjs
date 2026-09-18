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
  Loader2,
  AlertCircle,
  FileCheck2,
  Archive,
  Code,
  Eye,
} from 'lucide-react';
import {
  saveFaqDraftAction,
  publishFaqAction,
  archiveFaqAction,
  getFaqRevisionsAction,
  restoreClinicRevisionAction,
} from '@/actions/clinic-trust.actions';
import { ContentRevision } from '@/db/schema/workflow';
import { ClinicRevisionHistoryDrawer } from './ClinicRevisionHistoryDrawer';

interface FaqEditorFormProps {
  initialData?: {
    id: string;
    question: string;
    answer: string;
    category: string;
    sortOrder: number;
    isPublished: boolean;
  } | null;
  latestDraftRevision?: ContentRevision | null;
  userPermissions: string[];
}

export function FaqEditorForm({
  initialData,
  latestDraftRevision,
  userPermissions,
}: FaqEditorFormProps) {
  const router = useRouter();
  const isNew = !initialData?.id;

  const defaultValues = {
    id: initialData?.id || '',
    question: initialData?.question || '',
    answer: initialData?.answer || '',
    category: initialData?.category || 'general',
    sortOrder: initialData?.sortOrder || 1,
    isPublished: initialData?.isPublished ?? true,
  };

  const initialPayload = latestDraftRevision?.payload
    ? (latestDraftRevision.payload as typeof defaultValues)
    : defaultValues;

  const [formData, setFormData] = useState({
    id: initialData?.id || initialPayload.id || '',
    question: initialPayload.question || '',
    answer: initialPayload.answer || '',
    category: initialPayload.category || 'general',
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
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [conflictDetail, setConflictDetail] = useState<{ message: string; currentVersion: number } | null>(null);

  const canEdit = userPermissions.includes('clinical_trust.edit') || userPermissions.includes('super_admin');

  function buildPayload() {
    return {
      question: formData.question.trim(),
      answer: formData.answer.trim(),
      category: formData.category.trim() || 'general',
      sortOrder: Number(formData.sortOrder) || 1,
      isPublished: formData.isPublished,
    };
  }

  async function handleSaveDraft() {
    if (!formData.question.trim()) {
      alert('Vui lòng nhập câu hỏi.');
      return;
    }
    if (!formData.answer.trim()) {
      alert('Vui lòng nhập nội dung giải đáp.');
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    setConflictDetail(null);

    const targetId = isNew ? formData.id.trim() || `faq-${Date.now()}` : formData.id;

    try {
      const res = await saveFaqDraftAction({
        entityId: targetId,
        revisionId: currentRevision?.id,
        expectedVersion: currentRevision?.version,
        payload: buildPayload(),
        changeSummary: changeSummary.trim() || 'Cập nhật FAQ',
      });

      if (res.success && res.data) {
        setCurrentRevision(res.data);
        setFeedback({ type: 'success', message: `Đã lưu bản nháp #${res.data.revisionNumber} thành công!` });
        setChangeSummary('');
        if (isNew) {
          router.replace(`/admin/clinic/faqs/${res.data.entityId}`);
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

    if (!confirm('Bạn có chắc chắn muốn xuất bản câu hỏi thường gặp này?')) {
      return;
    }

    setIsPublishing(true);
    setFeedback(null);

    try {
      const res = await publishFaqAction(currentRevision.id);
      if (res.success && res.data) {
        setCurrentRevision(res.data);
        setFeedback({
          type: 'success',
          message: 'Xuất bản thành công! FAQs đã được cập nhật trên website công khai.',
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
    if (!confirm('Bạn có chắc chắn muốn ẩn câu hỏi này khỏi website công khai?')) return;

    setIsArchiving(true);
    setFeedback(null);

    try {
      const res = await archiveFaqAction(currentRevision.id);
      if (res.success && res.data) {
        setCurrentRevision(res.data);
        setFormData((prev) => ({ ...prev, isPublished: false }));
        setFeedback({ type: 'warning', message: 'Đã tạm ẩn câu hỏi thường gặp.' });
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
          href="/admin/clinic?tab=faqs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại danh sách câu hỏi thường gặp (FAQs)</span>
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
                  <span>Ẩn FAQ</span>
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
          Biên Tập Câu Hỏi & Nội Dung Giải Đáp
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Câu hỏi thường gặp *
          </label>
          <input
            type="text"
            value={formData.question}
            onChange={(e) => setFormData((p) => ({ ...p, question: e.target.value }))}
            placeholder="Ví dụ: Các việc cần chuẩn bị trước khi đi tầm soát bệnh là gì?"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phân nhóm / Danh mục FAQ
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              placeholder="ví dụ: general, noi-soi, bao-hiem..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

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
        </div>

        {/* Answer with Code and Preview Tabs */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nội dung trả lời (Hỗ trợ HTML định dạng) *
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
              value={formData.answer}
              onChange={(e) => setFormData((p) => ({ ...p, answer: e.target.value }))}
              placeholder="<p>Nhịn ăn ít nhất 6 tiếng trước khi khám...</p><ul><li>...</li></ul>"
              className="w-full font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          ) : (
            <div
              className="w-full min-h-[192px] p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-xs prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: formData.answer || '<p class="text-slate-400">Chưa có nội dung xem trước</p>' }}
            />
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
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

      {/* History Drawer */}
      {!isNew && (
        <ClinicRevisionHistoryDrawer
          title={`FAQ: ${formData.question}`}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          fetchRevisions={() => getFaqRevisionsAction(formData.id)}
          onRestoreRevision={restoreClinicRevisionAction}
          onRestored={(newRev) => {
            setCurrentRevision(newRev);
            const p = newRev.payload as typeof defaultValues;
            if (p) {
              setFormData((prev) => ({
                ...prev,
                question: p.question || prev.question,
                answer: p.answer || prev.answer,
                category: p.category || prev.category,
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
