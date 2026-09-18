'use client';

import React, { useState, useTransition } from 'react';
import type { AuditLogRow } from '@/repositories/contracts/audit.repository';
import { listAuditLogsAction, getAuditLogDetailAction } from '@/actions/audit-admin.actions';
import { AuditAction } from '@/lib/auth/audit-types';
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  FileText,
  User,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';

interface AuditLogViewerProps {
  initialLogs: AuditLogRow[];
  initialTotal: number;
  initialPage: number;
  initialLimit: number;
  initialTotalPages: number;
}

const ACTION_BADGES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  // Login / Auth
  [AuditAction.LOGIN_SUCCESS]: {
    label: 'Đăng nhập thành công',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  [AuditAction.LOGIN_FAILURE]: {
    label: 'Đăng nhập thất bại',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
  },
  [AuditAction.LOGOUT]: {
    label: 'Đăng xuất',
    bg: 'bg-slate-50 dark:bg-slate-900',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-800',
  },
  [AuditAction.PERMISSION_DENIED]: {
    label: 'Từ chối truy cập (403)',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
  },

  // User Admin
  [AuditAction.USER_CREATED]: {
    label: 'Tạo quản trị viên',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  [AuditAction.USER_UPDATED]: {
    label: 'Cập nhật người dùng',
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-700 dark:text-sky-400',
    border: 'border-sky-200 dark:border-sky-800',
  },
  [AuditAction.USER_DISABLED]: {
    label: 'Vô hiệu hóa tài khoản',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
  },
  [AuditAction.USER_ENABLED]: {
    label: 'Kích hoạt tài khoản',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  [AuditAction.USER_PASSWORD_RESET]: {
    label: 'Đặt lại mật khẩu',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
  },
  [AuditAction.USER_SESSION_REVOKED]: {
    label: 'Thu hồi phiên',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
  },
  [AuditAction.USER_ALL_SESSIONS_REVOKED]: {
    label: 'Thu hồi toàn bộ phiên',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
  },

  // Content Operations
  [AuditAction.CONTENT_PUBLISHED]: {
    label: 'Xuất bản nội dung',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
  },
  [AuditAction.CONTENT_UNPUBLISHED]: {
    label: 'Gỡ bài xuất bản',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
  },
  [AuditAction.CONTENT_APPROVED]: {
    label: 'Phê duyệt bài viết',
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
  },
};

export function AuditLogViewer({
  initialLogs,
  initialTotal,
  initialPage,
  initialLimit,
  initialTotalPages,
}: AuditLogViewerProps) {
  const [logsList, setLogsList] = useState<AuditLogRow[]>(initialLogs);
  const [totalLogs, setTotalLogs] = useState<number>(initialTotal);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);

  // Filter states
  const [actorEmail, setActorEmail] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');

  // Selected Detail Log
  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const refreshLogs = (
    page = currentPage,
    email = actorEmail,
    action = selectedAction,
    entityType = selectedEntityType
  ) => {
    startTransition(async () => {
      setErrorMessage(null);
      const res = await listAuditLogsAction({
        page,
        limit: initialLimit,
        actorEmail: email.trim() || undefined,
        action: action || undefined,
        entityType: entityType || undefined,
      });

      if (res.success && res.data) {
        setLogsList(res.data.logs);
        setTotalLogs(res.data.total);
        setCurrentPage(res.data.page);
        setTotalPages(res.data.totalPages);
      } else {
        setErrorMessage(res.error || 'Lỗi truy vấn nhật ký kiểm toán.');
      }
    });
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refreshLogs(1, actorEmail, selectedAction, selectedEntityType);
  };

  const handleActionChange = (action: string) => {
    setSelectedAction(action);
    refreshLogs(1, actorEmail, action, selectedEntityType);
  };

  const handleEntityTypeChange = (type: string) => {
    setSelectedEntityType(type);
    refreshLogs(1, actorEmail, selectedAction, type);
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-300 text-sm animate-fade-in">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1 font-medium">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-xs">
        <form onSubmit={handleFilterSubmit} className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm theo email quản trị viên..."
              value={actorEmail}
              onChange={(e) => setActorEmail(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <select
            value={selectedAction}
            onChange={(e) => handleActionChange(e.target.value)}
            className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Tất cả sự kiện</option>
            <option value={AuditAction.LOGIN_SUCCESS}>Đăng nhập thành công</option>
            <option value={AuditAction.LOGIN_FAILURE}>Đăng nhập thất bại</option>
            <option value={AuditAction.LOGOUT}>Đăng xuất</option>
            <option value={AuditAction.PERMISSION_DENIED}>Từ chối quyền (403)</option>
            <option value={AuditAction.USER_CREATED}>Tạo quản trị viên</option>
            <option value={AuditAction.USER_UPDATED}>Cập nhật quản trị viên</option>
            <option value={AuditAction.USER_DISABLED}>Vô hiệu hóa tài khoản</option>
            <option value={AuditAction.USER_ENABLED}>Kích hoạt tài khoản</option>
            <option value={AuditAction.USER_PASSWORD_RESET}>Đặt lại mật khẩu</option>
            <option value={AuditAction.CONTENT_PUBLISHED}>Xuất bản nội dung</option>
            <option value={AuditAction.CONTENT_UNPUBLISHED}>Gỡ bài xuất bản</option>
            <option value={AuditAction.CONTENT_APPROVED}>Phê duyệt nội dung</option>
          </select>

          <select
            value={selectedEntityType}
            onChange={(e) => handleEntityTypeChange(e.target.value)}
            className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Tất cả thực thể</option>
            <option value="User">User (Người dùng)</option>
            <option value="Session">Session (Phiên)</option>
            <option value="Article">Article (Bài viết)</option>
            <option value="Doctor">Doctor (Bác sĩ)</option>
            <option value="Package">Package (Gói khám)</option>
            <option value="Page">Page (Trang tĩnh)</option>
            <option value="Redirect">Redirect (Chuyển hướng)</option>
            <option value="Media">Media (Tệp tin)</option>
          </select>

          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors"
          >
            Lọc nhật ký
          </button>
        </form>

        <button
          onClick={() => refreshLogs()}
          disabled={isPending}
          className="p-2 border border-border text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
          title="Tải lại"
        >
          <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
              <tr>
                <th className="px-5 py-3">Thời Gian (VN)</th>
                <th className="px-5 py-3">Người Thực Hiện</th>
                <th className="px-5 py-3">Loại Sự Kiện</th>
                <th className="px-5 py-3">Thực Thể</th>
                <th className="px-5 py-3">IP / Thiết Bị</th>
                <th className="px-5 py-3 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">Không tìm thấy bản ghi kiểm toán nào.</p>
                  </td>
                </tr>
              ) : (
                logsList.map((log) => {
                  const badge = ACTION_BADGES[log.action] || {
                    label: log.action,
                    bg: 'bg-muted',
                    text: 'text-foreground',
                    border: 'border-border',
                  };

                  return (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      {/* Timestamp */}
                      <td className="px-5 py-3.5 text-xs text-muted-foreground font-mono">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </td>

                      {/* Actor */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium text-foreground text-xs">
                            {log.actorEmail || (log.actorId ? `ID: ${log.actorId}` : 'Hệ thống')}
                          </span>
                        </div>
                      </td>

                      {/* Event / Action */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Entity */}
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {log.entityType ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground">{log.entityType}</span>
                            {log.entityId && (
                              <span className="text-[10px] text-muted-foreground/70 font-mono">
                                ({log.entityId.slice(0, 8)}...)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </td>

                      {/* IP / User Agent */}
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        <span>{log.ipAddress || 'Internal'}</span>
                      </td>

                      {/* View Action */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md font-medium text-foreground transition-colors"
                        >
                          Xem
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-border bg-muted/20 text-xs text-muted-foreground">
          <div>
            Hiển thị <strong>{logsList.length}</strong> / <strong>{totalLogs}</strong> bản ghi (Trang {currentPage} / {totalPages || 1})
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshLogs(currentPage - 1)}
              disabled={currentPage <= 1 || isPending}
              className="flex items-center gap-1 px-3 py-1.5 bg-background border border-border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Trước</span>
            </button>
            <button
              onClick={() => refreshLogs(currentPage + 1)}
              disabled={currentPage >= totalPages || isPending}
              className="flex items-center gap-1 px-3 py-1.5 bg-background border border-border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
            >
              <span>Sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL DRAWER / MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-card w-full max-w-xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <FileText className="w-5 h-5 text-primary" />
                <span>Chi Tiết Nhật Ký Kiểm Toán</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs bg-muted/20 p-3.5 rounded-xl border border-border">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Mã sự kiện</span>
                  <span className="font-mono text-foreground font-semibold">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Thời gian tạo</span>
                  <span className="text-foreground">{new Date(selectedLog.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Hành động (Action)</span>
                  <span className="font-semibold text-primary">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Người thực hiện (Actor)</span>
                  <span className="text-foreground">{selectedLog.actorEmail || selectedLog.actorId || 'Hệ thống'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Loại thực thể</span>
                  <span className="text-foreground">{selectedLog.entityType || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Mã thực thể (Entity ID)</span>
                  <span className="font-mono text-foreground">{selectedLog.entityId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Địa chỉ IP</span>
                  <span className="font-mono text-foreground">{selectedLog.ipAddress || 'Internal'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-[11px]">User Agent</span>
                  <span className="text-foreground text-[11px] break-all">{selectedLog.userAgent || 'N/A'}</span>
                </div>
              </div>

              {/* Metadata JSON Inspector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span>Dữ liệu chi tiết (Metadata)</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-normal">
                    <Lock className="w-3 h-3" /> Đã khử trùng an toàn (Sanitized)
                  </span>
                </div>
                <pre className="p-4 bg-slate-950 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl text-[11px] text-muted-foreground flex items-center gap-2">
                <Info className="w-4 h-4 flex-shrink-0 text-primary" />
                <span>Nhật ký kiểm toán là tài liệu lưu trữ bất biến phục vụ truy vết an ninh và giám sát nghiệp vụ y tế.</span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium hover:bg-muted"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
