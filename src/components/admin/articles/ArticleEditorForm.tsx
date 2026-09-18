'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Send,
  CheckCircle2,
  Globe,
  RotateCcw,
  Archive,
  History,
  Eye,
  ImageIcon,
  AlertTriangle,
  FolderTree,
  User,
  Search,
  Check,
  X,
  Loader2,
  Link as LinkIcon,
  Code,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Heading4,
  Table as TableIcon,
} from 'lucide-react';
import { MediaPickerModal, MediaPickerSelection } from '@/components/admin/media/MediaPickerModal';
import { ArticleRevisionHistoryDrawer } from './ArticleRevisionHistoryDrawer';
import {
  saveArticleDraftAction,
  submitArticleReviewAction,
  returnArticleToDraftAction,
  approveArticleAction,
  publishArticleAction,
  archiveArticleAction,
} from '@/actions/article.actions';
import { CategoryItem } from '@/types/doctorcheck';
import { ContentRevision } from '@/db/schema/workflow';

interface ArticleEditorFormProps {
  initialArticle?: {
    id: string;
    slug: string;
    title: string;
    excerpt?: string | null;
    contentHtml: string;
    featuredImageId?: string | null;
    featuredImageUrl?: string | null;
    authorName?: string | null;
    authorTitle?: string | null;
    status: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    canonicalUrl?: string | null;
    categories: Array<{ id: string; name: string; slug: string; isPrimary?: boolean }>;
    toc?: Array<{ id: string; text: string; level: number }>;
  };
  activeRevision?: ContentRevision | null;
  allCategories: CategoryItem[];
  userRoles: string[];
  userPermissions: string[];
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

export function ArticleEditorForm({
  initialArticle,
  activeRevision,
  allCategories,
  userRoles,
  userPermissions,
}: ArticleEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isNew = !initialArticle;
  const [entityId] = useState(() => initialArticle?.id || `art-${Date.now().toString(36)}`);

  // Revision and concurrency state
  const [currentRevision, setCurrentRevision] = useState<ContentRevision | null>(
    activeRevision || null
  );
  const [expectedVersion, setExpectedVersion] = useState<number>(
    activeRevision?.version ?? 1
  );

  // Form fields
  const [title, setTitle] = useState(
    currentRevision?.payload ? (currentRevision.payload as Record<string, unknown>).title as string : initialArticle?.title || ''
  );
  const [slug, setSlug] = useState(
    currentRevision?.payload ? (currentRevision.payload as Record<string, unknown>).slug as string : initialArticle?.slug || ''
  );
  const [isSlugAuto, setIsSlugAuto] = useState(isNew);
  const [excerpt, setExcerpt] = useState(
    currentRevision?.payload
      ? (currentRevision.payload as Record<string, unknown>).excerpt as string || ''
      : initialArticle?.excerpt || ''
  );
  const [contentHtml, setContentHtml] = useState(
    currentRevision?.payload
      ? (currentRevision.payload as Record<string, unknown>).contentHtml as string || ''
      : initialArticle?.contentHtml || '<p>Nhập nội dung bài viết chuyên môn tại đây...</p>'
  );
  const [featuredImageId, setFeaturedImageId] = useState<string | null>(
    currentRevision?.payload
      ? (currentRevision.payload as Record<string, unknown>).featuredImageId as string || null
      : initialArticle?.featuredImageId || null
  );
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(
    currentRevision?.payload
      ? (currentRevision.payload as Record<string, unknown>).featuredImageUrl as string || null
      : initialArticle?.featuredImageUrl || null
  );
  const [authorName, setAuthorName] = useState(
    currentRevision?.payload
      ? (currentRevision.payload as Record<string, unknown>).authorName as string || ''
      : initialArticle?.authorName || 'Bác sĩ DoctorCheck'
  );
  const [authorTitle, setAuthorTitle] = useState(
    currentRevision?.payload
      ? (currentRevision.payload as Record<string, unknown>).authorTitle as string || ''
      : initialArticle?.authorTitle || 'Chuyên khoa Tiêu hóa - Nội soi'
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    currentRevision?.payload && Array.isArray((currentRevision.payload as Record<string, unknown>).categoryIds)
      ? ((currentRevision.payload as Record<string, unknown>).categoryIds as string[])
      : initialArticle?.categories?.map((c) => String(c.id)) || []
  );
  const [seoTitle, setSeoTitle] = useState(
    currentRevision?.payload
      ? (currentRevision.payload as Record<string, unknown>).seoTitle as string || ''
      : initialArticle?.seoTitle || ''
  );
  const [seoDescription, setSeoDescription] = useState(
    currentRevision?.payload
      ? (currentRevision.payload as Record<string, unknown>).seoDescription as string || ''
      : initialArticle?.seoDescription || ''
  );
  const [canonicalUrl, setCanonicalUrl] = useState(
    currentRevision?.payload
      ? (currentRevision.payload as Record<string, unknown>).canonicalUrl as string || ''
      : initialArticle?.canonicalUrl || ''
  );

  // Editor mode & tools
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Modals & Drawers
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerMode, setMediaPickerMode] = useState<'featured' | 'inline'>('featured');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // UI state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [concurrencyError, setConcurrencyError] = useState<string | null>(null);

  // Permissions
  const canEdit = userPermissions.includes('article.edit') || userPermissions.includes('article.write') || userRoles.includes('super_admin');
  const canApprove = userPermissions.includes('article.approve') || userPermissions.includes('medical.approve') || userRoles.includes('medical_reviewer') || userRoles.includes('super_admin');
  const canPublish = userPermissions.includes('article.publish') || userRoles.includes('publisher') || userRoles.includes('super_admin');

  // Track unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Sync contentHtml with contentEditable div when toggling mode
  useEffect(() => {
    if (!isHtmlMode && editorRef.current) {
      if (editorRef.current.innerHTML !== contentHtml) {
        editorRef.current.innerHTML = contentHtml;
      }
    }
  }, [isHtmlMode, contentHtml]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setHasUnsavedChanges(true);
    if (isSlugAuto) {
      setSlug(slugify(val));
    }
  };

  const handleCategoryToggle = (id: string) => {
    setHasUnsavedChanges(true);
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Rich Text Commands
  const executeCommand = (cmd: string, value: string | undefined = undefined) => {
    if (isHtmlMode) return;
    document.execCommand(cmd, false, value);
    if (editorRef.current) {
      setContentHtml(editorRef.current.innerHTML);
      setHasUnsavedChanges(true);
    }
  };

  const handleInsertHeading = (tag: 'h2' | 'h3' | 'h4' | 'p') => {
    if (isHtmlMode) {
      setContentHtml((prev) => `${prev}\n<${tag}>Tiêu đề mới</${tag}>\n`);
      return;
    }
    executeCommand('formatBlock', tag.toUpperCase());
  };

  const handleInsertTable = () => {
    const tableHtml = `
<table class="w-full border-collapse border border-slate-300 my-4">
  <thead>
    <tr class="bg-slate-100">
      <th class="border border-slate-300 p-2 text-left">Tiêu chuẩn</th>
      <th class="border border-slate-300 p-2 text-left">Nội dung chuyên môn</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="border border-slate-300 p-2 font-medium">Mục 1</td>
      <td class="border border-slate-300 p-2">Thông tin chi tiết...</td>
    </tr>
    <tr>
      <td class="border border-slate-300 p-2 font-medium">Mục 2</td>
      <td class="border border-slate-300 p-2">Thông tin chi tiết...</td>
    </tr>
  </tbody>
</table>
`;
    if (isHtmlMode) {
      setContentHtml((prev) => `${prev}\n${tableHtml}\n`);
    } else {
      executeCommand('insertHTML', tableHtml);
    }
    setHasUnsavedChanges(true);
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) return;
    const anchorHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-cyan-600 underline font-medium">${linkText || linkUrl}</a>`;
    if (isHtmlMode) {
      setContentHtml((prev) => `${prev}${anchorHtml}`);
    } else {
      executeCommand('insertHTML', anchorHtml);
    }
    setIsLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handleMediaSelect = (selection: MediaPickerSelection) => {
    if (mediaPickerMode === 'featured') {
      setFeaturedImageId(selection.id);
      setFeaturedImageUrl(selection.publicUrl);
      setHasUnsavedChanges(true);
    } else {
      // Inline image insertion
      const imgHtml = `
<figure class="my-6 text-center">
  <img src="${selection.publicUrl}" alt="${selection.altText || 'Hình ảnh y khoa DoctorCheck'}" class="mx-auto rounded-lg shadow-xs max-h-[480px] object-cover" />
  ${selection.altText ? `<figcaption class="text-xs text-slate-500 mt-2 italic">${selection.altText}</figcaption>` : ''}
</figure>
`;
      if (isHtmlMode) {
        setContentHtml((prev) => `${prev}\n${imgHtml}\n`);
      } else {
        executeCommand('insertHTML', imgHtml);
      }
      setHasUnsavedChanges(true);
    }
  };

  // Workflow Actions
  const handleSaveDraft = async () => {
    setFeedback(null);
    setConcurrencyError(null);

    const payload = {
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      excerpt: excerpt.trim() || null,
      contentHtml: isHtmlMode ? contentHtml : editorRef.current?.innerHTML || contentHtml,
      featuredImageId,
      featuredImageUrl,
      authorName: authorName.trim(),
      authorTitle: authorTitle.trim(),
      categoryIds: selectedCategoryIds,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      canonicalUrl: canonicalUrl.trim() || null,
    };

    if (!payload.title) {
      setFeedback({ type: 'error', message: 'Vui lòng nhập tiêu đề bài viết.' });
      return;
    }
    if (!payload.slug) {
      setFeedback({ type: 'error', message: 'Vui lòng nhập đường dẫn (slug).' });
      return;
    }

    startTransition(async () => {
      const res = await saveArticleDraftAction({
        entityId,
        revisionId: currentRevision?.id,
        expectedVersion: currentRevision ? expectedVersion : undefined,
        payload,
      });

      if (!res.success) {
        if (res.conflict) {
          setConcurrencyError(res.error || 'Xung đột phiên bản! Bản nháp đã được cập nhật ở nơi khác.');
        } else {
          setFeedback({ type: 'error', message: res.error || 'Lưu bản nháp thất bại.' });
        }
      } else if (res.data) {
        setCurrentRevision(res.data);
        setExpectedVersion(res.data.version);
        setHasUnsavedChanges(false);
        setFeedback({
          type: 'success',
          message: `Đã lưu bản nháp thành công (Phiên bản v${res.data.revisionNumber} - Đồng quy #${res.data.version}). Dữ liệu công khai chưa bị thay đổi.`,
        });

        if (isNew) {
          router.replace(`/admin/articles/${entityId}`);
        }
      }
    });
  };

  const handleSubmitForReview = async () => {
    if (!currentRevision) {
      setFeedback({ type: 'error', message: 'Vui lòng lưu bản nháp trước khi gửi duyệt.' });
      return;
    }

    startTransition(async () => {
      const res = await submitArticleReviewAction(currentRevision.id);
      if (!res.success) {
        setFeedback({ type: 'error', message: res.error || 'Gửi duyệt thất bại.' });
      } else if (res.data) {
        setCurrentRevision(res.data);
        setFeedback({ type: 'success', message: 'Đã gửi bài viết sang hàng đợi kiểm duyệt y khoa!' });
      }
    });
  };

  const handleReturnToDraft = async () => {
    if (!currentRevision) return;
    const notes = prompt('Nhập ghi chú yêu cầu chỉnh sửa (tùy chọn):');

    startTransition(async () => {
      const res = await returnArticleToDraftAction(currentRevision.id, notes || undefined);
      if (!res.success) {
        setFeedback({ type: 'error', message: res.error || 'Thao tác thất bại.' });
      } else if (res.data) {
        setCurrentRevision(res.data);
        setFeedback({ type: 'success', message: 'Đã chuyển trạng thái bài viết về Bản nháp.' });
      }
    });
  };

  const handleApprove = async () => {
    if (!currentRevision) return;
    const notes = prompt('Ghi chú phê duyệt chuyên môn y khoa (tùy chọn):');

    startTransition(async () => {
      const res = await approveArticleAction(currentRevision.id, notes || undefined);
      if (!res.success) {
        setFeedback({ type: 'error', message: res.error || 'Phê duyệt thất bại.' });
      } else if (res.data) {
        setCurrentRevision(res.data);
        setFeedback({ type: 'success', message: 'Đã phê duyệt chuyên môn y khoa thành công!' });
      }
    });
  };

  const handlePublish = async () => {
    if (!currentRevision) return;
    if (!confirm('Xác nhận xuất bản bài viết lên website công khai DoctorCheck.vn? Bản ghi canonical sẽ được cập nhật nguyên tử.')) {
      return;
    }

    startTransition(async () => {
      const res = await publishArticleAction(currentRevision.id);
      if (!res.success) {
        setFeedback({ type: 'error', message: res.error || 'Xuất bản thất bại.' });
      } else if (res.data) {
        setCurrentRevision(res.data);
        setFeedback({
          type: 'success',
          message: 'ĐÃ XUẤT BẢN THÀNH CÔNG! Bài viết đã có hiệu lực trên website công khai và bộ đệm đã được làm mới.',
        });
        router.refresh();
      }
    });
  };

  const handleArchive = async () => {
    if (!currentRevision) return;
    if (!confirm('Xác nhận lưu trữ / gỡ bài viết này khỏi website công khai?')) {
      return;
    }

    startTransition(async () => {
      const res = await archiveArticleAction(currentRevision.id);
      if (!res.success) {
        setFeedback({ type: 'error', message: res.error || 'Lưu trữ thất bại.' });
      } else if (res.data) {
        setCurrentRevision(res.data);
        setFeedback({ type: 'success', message: 'Đã lưu trữ và gỡ bài viết thành công.' });
        router.refresh();
      }
    });
  };

  const status = currentRevision?.status || initialArticle?.status || 'draft';

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner: Status & Action Bar */}
      <div className="sticky top-16 z-30 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Trạng thái:</span>
            {status === 'published' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Globe className="h-3.5 w-3.5" /> Đã xuất bản
              </span>
            ) : status === 'approved' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                <CheckCircle2 className="h-3.5 w-3.5" /> Đã duyệt y khoa
              </span>
            ) : status === 'in_review' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                <Send className="h-3.5 w-3.5" /> Đang kiểm duyệt
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                <Save className="h-3.5 w-3.5" /> Bản nháp ({currentRevision ? `v${currentRevision.revisionNumber}` : 'Mới'})
              </span>
            )}
          </div>

          {currentRevision && (
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400">
              Đồng quy #{expectedVersion}
            </span>
          )}

          {hasUnsavedChanges && (
            <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              Chưa lưu
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* History Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <History className="h-3.5 w-3.5" />
            Lịch Sử
          </button>

          {/* Preview Trigger */}
          <a
            href={`/admin/articles/${entityId}/preview`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <Eye className="h-3.5 w-3.5" />
            Xem Thử (Preview)
          </a>

          {/* Save Draft */}
          {canEdit && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 disabled:opacity-50 dark:bg-cyan-500 dark:hover:bg-cyan-600"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Lưu Bản Nháp
            </button>
          )}

          {/* Submit for review */}
          {status === 'draft' && canEdit && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleSubmitForReview}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              Gửi Duyệt Y Khoa
            </button>
          )}

          {/* In review actions */}
          {status === 'in_review' && (
            <>
              {canEdit && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleReturnToDraft}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Yêu Cầu Sửa
                </button>
              )}
              {canApprove && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleApprove}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Duyệt Y Khoa
                </button>
              )}
            </>
          )}

          {/* Approved -> Publish */}
          {status === 'approved' && canPublish && (
            <button
              type="button"
              disabled={isPending}
              onClick={handlePublish}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 animate-pulse"
            >
              <Globe className="h-3.5 w-3.5" />
              Xuất Bản Ngay
            </button>
          )}

          {/* Published -> Archive */}
          {status === 'published' && canPublish && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleArchive}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              title="Lưu trữ và gỡ bài viết khỏi website công khai"
            >
              <Archive className="h-3.5 w-3.5" />
              Gỡ Bài / Lưu Trữ
            </button>
          )}
        </div>
      </div>

      {/* Concurrency Conflict Alert */}
      {concurrencyError && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-900 dark:text-rose-100 mb-1">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            Xung Đột Phiên Bản Biên Tập (409 Conflict)
          </div>
          <p>{concurrencyError}</p>
          <p className="mt-2 text-[11px] text-rose-700 dark:text-rose-300">
            Để bảo toàn dữ liệu, hệ thống không ghi đè tự động. Vui lòng tải lại trang hoặc mở lịch sử phiên bản để đối chiếu các thay đổi mới nhất.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700"
          >
            Tải Lại Nội Dung Mới Nhất
          </button>
        </div>
      )}

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-lg p-4 text-xs font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Content & Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Editor & Main Fields (8 cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Title & Slug */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tiêu Đề Bài Viết Y Khoa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Nhập tiêu đề bài viết chuyên sâu..."
                className="w-full rounded-lg border border-slate-300 p-3 text-sm font-semibold text-slate-900 focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Đường dẫn (Slug) <span className="text-rose-500">*</span>
                </label>
                {initialArticle?.status === 'published' && (
                  <span className="text-[10px] text-amber-600 font-medium">
                    ⚠️ Lưu ý: Thay đổi slug bài viết đã xuất bản có thể ảnh hưởng SEO.
                  </span>
                )}
              </div>
              <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-950">
                <span className="text-xs font-mono text-slate-400">/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setIsSlugAuto(false);
                    setSlug(e.target.value.toLowerCase());
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full bg-transparent p-1 font-mono text-xs text-slate-900 focus:outline-hidden dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tóm tắt ngắn (Excerpt)
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Tóm tắt nội dung cốt lõi của bài viết..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* Rich Content Editor */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex flex-wrap items-center gap-1">
                {/* Headings */}
                <button
                  type="button"
                  onClick={() => handleInsertHeading('h2')}
                  className="rounded-md p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  title="Thẻ H2 (Mục lớn)"
                >
                  <Heading2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertHeading('h3')}
                  className="rounded-md p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  title="Thẻ H3 (Mục con)"
                >
                  <Heading3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertHeading('h4')}
                  className="rounded-md p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  title="Thẻ H4"
                >
                  <Heading4 className="h-4 w-4" />
                </button>

                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                {/* Inline Formats */}
                <button
                  type="button"
                  onClick={() => executeCommand('bold')}
                  className="rounded-md p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  title="In đậm (Bold)"
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('italic')}
                  className="rounded-md p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  title="In nghiêng (Italic)"
                >
                  <Italic className="h-4 w-4" />
                </button>

                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                {/* Lists */}
                <button
                  type="button"
                  onClick={() => executeCommand('insertUnorderedList')}
                  className="rounded-md p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  title="Danh sách gạch đầu dòng"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('insertOrderedList')}
                  className="rounded-md p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  title="Danh sách số thứ tự"
                >
                  <ListOrdered className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertHeading('p')}
                  className="rounded-md p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  title="Đoạn văn thường (Paragraph)"
                >
                  <Quote className="h-4 w-4" />
                </button>

                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                {/* Media & Links */}
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(true)}
                  className="rounded-md p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  title="Chèn liên kết"
                >
                  <LinkIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaPickerMode('inline');
                    setIsMediaPickerOpen(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-md bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-100 dark:bg-cyan-950/50 dark:text-cyan-300"
                  title="Chèn ảnh từ thư viện Media"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Chèn Ảnh Media
                </button>
                <button
                  type="button"
                  onClick={handleInsertTable}
                  className="rounded-md p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  title="Chèn bảng dữ liệu"
                >
                  <TableIcon className="h-4 w-4" />
                </button>
              </div>

              {/* HTML Mode Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (!isHtmlMode && editorRef.current) {
                    setContentHtml(editorRef.current.innerHTML);
                  }
                  setIsHtmlMode(!isHtmlMode);
                }}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  isHtmlMode
                    ? 'bg-cyan-600 text-white dark:bg-cyan-500'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                <Code className="h-3.5 w-3.5" />
                {isHtmlMode ? 'Chế độ Trực quan' : 'Mã HTML Nguồn'}
              </button>
            </div>

            {/* Editor Area */}
            {isHtmlMode ? (
              <textarea
                value={contentHtml}
                onChange={(e) => {
                  setContentHtml(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                rows={22}
                className="w-full bg-slate-950 p-4 font-mono text-xs text-cyan-300 focus:outline-hidden"
              />
            ) : (
              <div
                ref={editorRef}
                contentEditable
                onInput={() => {
                  if (editorRef.current) {
                    setContentHtml(editorRef.current.innerHTML);
                    setHasUnsavedChanges(true);
                  }
                }}
                className="min-h-[480px] p-6 text-sm leading-relaxed text-slate-800 focus:outline-hidden dark:text-slate-200 prose prose-slate max-w-none dark:prose-invert"
              />
            )}
          </div>
        </div>

        {/* Right Column: Sidebar Settings (4 cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Featured Image */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-cyan-600" />
              Ảnh Đại Diện (Featured Image)
            </h3>

            {featuredImageUrl ? (
              <div className="space-y-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
                  <img
                    src={featuredImageUrl}
                    alt="Featured preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setMediaPickerMode('featured');
                      setIsMediaPickerOpen(true);
                    }}
                    className="text-xs font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
                  >
                    Thay đổi ảnh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImageId(null);
                      setFeaturedImageUrl(null);
                      setHasUnsavedChanges(true);
                    }}
                    className="text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
                  >
                    Xóa ảnh
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  setMediaPickerMode('featured');
                  setIsMediaPickerOpen(true);
                }}
                className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/40"
              >
                <ImageIcon className="h-8 w-8 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Chọn ảnh từ Thư viện Media
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Hỗ trợ JPG, PNG, WebP</span>
              </div>
            )}
          </div>

          {/* Categories Multi-Select */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-cyan-600" />
              Chuyên Mục Bài Viết
            </h3>
            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {allCategories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(String(cat.id));
                return (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCategoryToggle(String(cat.id))}
                      className="rounded-sm border-slate-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {cat.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Author Info */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="h-4 w-4 text-cyan-600" />
              Thông Tin Tác Giả
            </h3>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Tên Tác giả / Bác sĩ
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => {
                  setAuthorName(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Chức danh chuyên môn
              </label>
              <input
                type="text"
                value={authorTitle}
                onChange={(e) => {
                  setAuthorTitle(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* SEO & Metadata */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="h-4 w-4 text-cyan-600" />
              Tối Ưu Hóa SEO
            </h3>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">SEO Title</label>
                <span className="text-[10px] text-slate-400">{seoTitle.length}/60</span>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => {
                  setSeoTitle(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder={title || 'Tiêu đề SEO hiển thị trên Google...'}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">SEO Description</label>
                <span className="text-[10px] text-slate-400">{seoDescription.length}/160</span>
              </div>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => {
                  setSeoDescription(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder={excerpt || 'Mô tả tóm tắt chuẩn SEO xuất hiện trong kết quả tìm kiếm...'}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Live SERP Preview */}
            <div className="mt-2 rounded-lg bg-slate-50 p-3 text-left dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Mô phỏng hiển thị Google
              </span>
              <div className="mt-1 text-xs font-semibold text-blue-700 hover:underline dark:text-blue-400 truncate">
                {seoTitle || title || 'Tiêu đề bài viết DoctorCheck'}
              </div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 truncate">
                https://doctorcheck.vn/{slug || 'duong-dan-bai-viet'}
              </div>
              <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                {seoDescription || excerpt || 'Mô tả bài viết y khoa chuyên sâu tại Trung tâm Tầm soát DoctorCheck...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Media Picker */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectMedia={handleMediaSelect}
        currentSelectedId={featuredImageId || undefined}
        title={mediaPickerMode === 'featured' ? 'Chọn Ảnh Đại Diện Bài Viết' : 'Chèn Hình Ảnh Vào Bài Viết'}
      />

      {/* Embedded Revision History Drawer */}
      <ArticleRevisionHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        entityId={entityId}
        onRestoredSuccess={(restoredRev) => {
          setCurrentRevision(restoredRev);
          setExpectedVersion(restoredRev.version);
          const payload = restoredRev.payload as Record<string, unknown>;
          if (payload) {
            if (payload.title) setTitle(String(payload.title));
            if (payload.slug) setSlug(String(payload.slug));
            if (payload.excerpt) setExcerpt(String(payload.excerpt));
            if (payload.contentHtml) setContentHtml(String(payload.contentHtml));
            if (payload.featuredImageId) setFeaturedImageId(String(payload.featuredImageId));
            if (payload.featuredImageUrl) setFeaturedImageUrl(String(payload.featuredImageUrl));
            if (payload.authorName) setAuthorName(String(payload.authorName));
            if (payload.authorTitle) setAuthorTitle(String(payload.authorTitle));
            if (Array.isArray(payload.categoryIds)) setSelectedCategoryIds(payload.categoryIds as string[]);
            if (payload.seoTitle) setSeoTitle(String(payload.seoTitle));
            if (payload.seoDescription) setSeoDescription(String(payload.seoDescription));
            if (payload.canonicalUrl) setCanonicalUrl(String(payload.canonicalUrl));
          }
          setHasUnsavedChanges(false);
          router.refresh();
        }}
      />

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Chèn Liên Kết</h3>
            <form onSubmit={handleLinkSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Đường dẫn URL</label>
                <input
                  type="url"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Văn bản hiển thị</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Văn bản liên kết..."
                  className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 dark:text-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 px-3 py-1.5 font-semibold text-white hover:bg-cyan-700"
                >
                  Chèn Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
