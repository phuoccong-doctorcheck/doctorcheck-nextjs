'use client';

import React, { useState, useTransition } from 'react';
import type { SafeUser, SafeSessionMetadata } from '@/repositories/contracts/user.repository';
import { Role } from '@/lib/auth/rbac';
import {
  listUsersAction,
  createUserAction,
  updateUserAction,
  toggleUserStatusAction,
  adminResetPasswordAction,
  getUserSessionsAction,
  revokeUserSessionAction,
  revokeAllUserSessionsAction,
} from '@/actions/user-admin.actions';
import {
  Users,
  UserPlus,
  Search,
  KeyRound,
  Laptop,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Edit2,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
} from 'lucide-react';

interface UserManagerProps {
  initialUsers: SafeUser[];
  initialTotal: number;
  initialPage: number;
  initialLimit: number;
  initialTotalPages: number;
  currentUserRoles: string[];
  currentUserId: string;
}

const ROLE_LABELS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  [Role.SUPER_ADMIN]: {
    label: 'Super Admin',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
  },
  [Role.ADMIN]: {
    label: 'Admin',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
  },
  [Role.MEDICAL_REVIEWER]: {
    label: 'Medical Reviewer',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  [Role.EDITOR]: {
    label: 'Editor',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  [Role.DOCTOR]: {
    label: 'Doctor',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
  },
};

export function UserManager({
  initialUsers,
  initialTotal,
  initialPage,
  initialLimit,
  initialTotalPages,
  currentUserRoles,
  currentUserId,
}: UserManagerProps) {
  const [usersList, setUsersList] = useState<SafeUser[]>(initialUsers);
  const [totalUsers, setTotalUsers] = useState<number>(initialTotal);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);

  // Active user in action
  const [activeUser, setActiveUser] = useState<SafeUser | null>(null);
  const [activeSessions, setActiveSessions] = useState<SafeSessionMetadata[]>([]);

  // Add User Form State
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRoles, setNewRoles] = useState<string[]>([Role.EDITOR]);
  const [newIsActive, setNewIsActive] = useState(true);

  // Edit User Form State
  const [editFullName, setEditFullName] = useState('');
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [editIsActive, setEditIsActive] = useState(true);

  // Reset Password State
  const [resetPassword, setResetPassword] = useState('');

  // Status/Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isSuperAdmin = currentUserRoles.includes(Role.SUPER_ADMIN);

  // Fetch / Refresh users
  const refreshUsers = (page = currentPage, query = searchQuery, role = selectedRole, status = statusFilter) => {
    startTransition(async () => {
      setErrorMessage(null);
      const res = await listUsersAction({
        page,
        limit: initialLimit,
        query: query.trim() || undefined,
        role: role || undefined,
        isActive: status === 'all' ? undefined : status === 'active',
      });

      if (res.success && res.data) {
        setUsersList(res.data.users);
        setTotalUsers(res.data.total);
        setCurrentPage(res.data.page);
        setTotalPages(res.data.totalPages);
      } else {
        setErrorMessage(res.error || 'Lỗi tải danh sách người dùng.');
      }
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refreshUsers(1, searchQuery, selectedRole, statusFilter);
  };

  const handleRoleFilterChange = (role: string) => {
    setSelectedRole(role);
    refreshUsers(1, searchQuery, role, statusFilter);
  };

  const handleStatusFilterChange = (status: 'all' | 'active' | 'disabled') => {
    setStatusFilter(status);
    refreshUsers(1, searchQuery, selectedRole, status);
  };

  // Open Edit Modal
  const openEditUser = (user: SafeUser) => {
    setActiveUser(user);
    setEditFullName(user.fullName);
    setEditRoles(user.roles);
    setEditIsActive(user.isActive);
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowEditModal(true);
  };

  // Open Reset Password Modal
  const openResetPassword = (user: SafeUser) => {
    setActiveUser(user);
    setResetPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowPasswordModal(true);
  };

  // Open Sessions Modal
  const openSessionsModal = (user: SafeUser) => {
    setActiveUser(user);
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowSessionsModal(true);

    startTransition(async () => {
      const res = await getUserSessionsAction(user.id);
      if (res.success && res.data) {
        setActiveSessions(res.data);
      } else {
        setErrorMessage(res.error || 'Lỗi tải danh sách phiên.');
      }
    });
  };

  // Handle Add User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await createUserAction({
        email: newEmail,
        fullName: newFullName,
        password: newPassword,
        roleIds: newRoles,
        isActive: newIsActive,
      });

      if (res.success && res.data) {
        setSuccessMessage(`Đã tạo tài khoản thành công cho: ${res.data.email}`);
        setShowAddModal(false);
        setNewEmail('');
        setNewFullName('');
        setNewPassword('');
        setNewRoles([Role.EDITOR]);
        refreshUsers(1);
      } else {
        setErrorMessage(res.error || 'Tạo tài khoản thất bại.');
      }
    });
  };

  // Handle Update User
  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await updateUserAction(activeUser.id, {
        fullName: editFullName,
        roleIds: editRoles,
        isActive: editIsActive,
        expectedUpdatedAt: activeUser.updatedAt.toISOString(),
      });

      if (res.success && res.data) {
        setSuccessMessage(`Đã cập nhật thông tin tài khoản: ${res.data.email}`);
        setShowEditModal(false);
        refreshUsers();
      } else {
        setErrorMessage(res.error || 'Cập nhật tài khoản thất bại.');
      }
    });
  };

  // Handle Toggle Active Status directly
  const handleToggleStatus = (user: SafeUser) => {
    const nextStatus = !user.isActive;
    const confirmText = nextStatus
      ? `Bạn có chắc chắn muốn kích hoạt lại tài khoản ${user.email}?`
      : `Bạn có chắc chắn muốn vô hiệu hóa tài khoản ${user.email}? Tất cả các phiên đăng nhập đang hoạt động sẽ bị thu hồi ngay lập tức.`;

    if (!confirm(confirmText)) return;

    startTransition(async () => {
      const res = await toggleUserStatusAction(user.id, nextStatus);
      if (res.success && res.data) {
        setSuccessMessage(
          nextStatus
            ? `Đã kích hoạt lại tài khoản: ${res.data.email}`
            : `Đã vô hiệu hóa tài khoản và thu hồi các phiên làm việc của: ${res.data.email}`
        );
        refreshUsers();
      } else {
        setErrorMessage(res.error || 'Cập nhật trạng thái thất bại.');
      }
    });
  };

  // Handle Password Reset
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await adminResetPasswordAction(activeUser.id, resetPassword);
      if (res.success) {
        setSuccessMessage(`Đã đặt lại mật khẩu mới cho ${activeUser.email}. Tất cả phiên cũ đã bị thu hồi.`);
        setShowPasswordModal(false);
        setResetPassword('');
      } else {
        setErrorMessage(res.error || 'Đặt lại mật khẩu thất bại.');
      }
    });
  };

  // Handle Revoke Single Session
  const handleRevokeSession = (sessionId: string) => {
    if (!activeUser) return;
    startTransition(async () => {
      const res = await revokeUserSessionAction(activeUser.id, sessionId);
      if (res.success) {
        setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
        setSuccessMessage('Đã thu hồi phiên đăng nhập thành công.');
      } else {
        setErrorMessage(res.error || 'Thu hồi phiên thất bại.');
      }
    });
  };

  // Handle Revoke All Sessions
  const handleRevokeAllSessions = () => {
    if (!activeUser) return;
    if (!confirm(`Bạn có chắc chắn muốn thu hồi TẤT CẢ các phiên của ${activeUser.email}?`)) return;

    startTransition(async () => {
      const res = await revokeAllUserSessionsAction(activeUser.id);
      if (res.success) {
        setActiveSessions([]);
        setSuccessMessage(`Đã thu hồi toàn bộ ${res.count || 0} phiên đăng nhập.`);
      } else {
        setErrorMessage(res.error || 'Thu hồi toàn bộ phiên thất bại.');
      }
    });
  };

  // Generate secure random password
  const generateStrongPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
    let pwd = '';
    for (let i = 0; i < 16; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback Messages */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-300 text-sm animate-fade-in">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1 font-medium">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1 font-medium">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-xs">
        {/* Search & Filters */}
        <form onSubmit={handleSearchSubmit} className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm theo email hoặc họ tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => handleRoleFilterChange(e.target.value)}
            className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Tất cả vai trò</option>
            <option value={Role.SUPER_ADMIN}>Super Admin</option>
            <option value={Role.ADMIN}>Admin</option>
            <option value={Role.MEDICAL_REVIEWER}>Medical Reviewer</option>
            <option value={Role.EDITOR}>Editor</option>
            <option value={Role.DOCTOR}>Doctor</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value as 'all' | 'active' | 'disabled')}
            className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="disabled">Đã vô hiệu hóa</option>
          </select>

          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Create User Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshUsers()}
            disabled={isPending}
            className="p-2 border border-border text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
            title="Tải lại"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setShowAddModal(true);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Quản Trị Viên</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
              <tr>
                <th className="px-5 py-3">Quản Trị Viên</th>
                <th className="px-5 py-3">Vai Trò RBAC</th>
                <th className="px-5 py-3">Trạng Thái</th>
                <th className="px-5 py-3">Ngày Tạo</th>
                <th className="px-5 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usersList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">Không tìm thấy tài khoản quản trị nào.</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Thử thay đổi bộ lọc tìm kiếm hoặc vai trò.
                    </p>
                  </td>
                </tr>
              ) : (
                usersList.map((user) => {
                  const isCurrent = user.id === currentUserId;
                  const isTargetSuperAdmin = user.roles.includes(Role.SUPER_ADMIN);

                  return (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      {/* Name & Email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">{user.fullName}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 px-1.5 py-0.5 rounded-sm font-medium">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground block">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Roles */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {user.roles.map((rId) => {
                            const badge = ROLE_LABELS[rId] || {
                              label: rId,
                              bg: 'bg-muted',
                              text: 'text-foreground',
                              border: 'border-border',
                            };
                            return (
                              <span
                                key={rId}
                                className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                              >
                                {badge.label}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Active Status */}
                      <td className="px-5 py-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Tạm khóa
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Sessions */}
                          <button
                            onClick={() => openSessionsModal(user)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                            title="Quản lý phiên đăng nhập"
                          >
                            <Laptop className="w-4 h-4" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => openResetPassword(user)}
                            disabled={isTargetSuperAdmin && !isSuperAdmin}
                            className={`p-1.5 rounded-md transition-colors ${
                              isTargetSuperAdmin && !isSuperAdmin
                                ? 'text-muted-foreground/40 cursor-not-allowed'
                                : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                            }`}
                            title="Đặt lại mật khẩu"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Edit User */}
                          <button
                            onClick={() => openEditUser(user)}
                            disabled={isTargetSuperAdmin && !isSuperAdmin}
                            className={`p-1.5 rounded-md transition-colors ${
                              isTargetSuperAdmin && !isSuperAdmin
                                ? 'text-muted-foreground/40 cursor-not-allowed'
                                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                            }`}
                            title="Chỉnh sửa tài khoản"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Toggle Active / Disabled */}
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={(isTargetSuperAdmin && !isSuperAdmin) || (isCurrent && isTargetSuperAdmin)}
                            className={`p-1.5 rounded-md transition-colors ${
                              (isTargetSuperAdmin && !isSuperAdmin) || (isCurrent && isTargetSuperAdmin)
                                ? 'text-muted-foreground/40 cursor-not-allowed'
                                : user.isActive
                                ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                                : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                            }`}
                            title={user.isActive ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt lại'}
                          >
                            {user.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>
                        </div>
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
            Hiển thị <strong>{usersList.length}</strong> / <strong>{totalUsers}</strong> quản trị viên (Trang {currentPage} / {totalPages || 1})
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshUsers(currentPage - 1)}
              disabled={currentPage <= 1 || isPending}
              className="flex items-center gap-1 px-3 py-1.5 bg-background border border-border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Trước</span>
            </button>
            <button
              onClick={() => refreshUsers(currentPage + 1)}
              disabled={currentPage >= totalPages || isPending}
              className="flex items-center gap-1 px-3 py-1.5 bg-background border border-border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
            >
              <span>Sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD USER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <UserPlus className="w-5 h-5 text-primary" />
                <span>Thêm Quản Trị Viên Nội Bộ</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email đăng nhập *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@doctorcheck.vn"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Họ và tên *</label>
                <input
                  type="text"
                  required
                  placeholder="Bác sĩ / Quản trị viên"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Mật khẩu khởi tạo * (Tối thiểu 12 ký tự)</label>
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Tạo mật khẩu mạnh
                  </button>
                </div>
                <input
                  type="text"
                  required
                  minLength={12}
                  placeholder="Nhập hoặc tạo mật khẩu an toàn..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-mono bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Roles Multi-selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Phân bổ vai trò RBAC *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(Role).map(([key, val]) => {
                    const isSuper = val === Role.SUPER_ADMIN;
                    const disabled = isSuper && !isSuperAdmin;
                    const isChecked = newRoles.includes(val);

                    return (
                      <label
                        key={key}
                        className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-primary/5 border-primary text-foreground'
                            : 'bg-background border-border text-muted-foreground'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          disabled={disabled}
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewRoles([...newRoles, val]);
                            } else {
                              setNewRoles(newRoles.filter((r) => r !== val));
                            }
                          }}
                          className="mt-0.5 rounded-sm border-border text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="font-semibold text-foreground">{ROLE_LABELS[val]?.label || val}</div>
                          {isSuper && (
                            <div className="text-[10px] text-rose-500 font-medium">Cần quyền Super Admin</div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Active Switch */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-xs font-semibold text-foreground block">Kích hoạt ngay</span>
                  <span className="text-[11px] text-muted-foreground">Cho phép đăng nhập ngay sau khi tạo</span>
                </div>
                <input
                  type="checkbox"
                  checked={newIsActive}
                  onChange={(e) => setNewIsActive(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-primary border-border focus:ring-primary"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium shadow-xs"
                >
                  {isPending ? 'Đang tạo...' : 'Tạo Quản Trị Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER */}
      {showEditModal && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Edit2 className="w-5 h-5 text-primary" />
                <span>Chỉnh Sửa Quản Trị Viên</span>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email đăng nhập</label>
                <input
                  type="email"
                  disabled
                  value={activeUser.email}
                  className="w-full px-3.5 py-2 text-sm bg-muted/50 border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Roles Multi-selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Phân bổ vai trò RBAC *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(Role).map(([key, val]) => {
                    const isSuper = val === Role.SUPER_ADMIN;
                    const disabled = isSuper && !isSuperAdmin;
                    const isChecked = editRoles.includes(val);

                    return (
                      <label
                        key={key}
                        className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-primary/5 border-primary text-foreground'
                            : 'bg-background border-border text-muted-foreground'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          disabled={disabled}
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditRoles([...editRoles, val]);
                            } else {
                              setEditRoles(editRoles.filter((r) => r !== val));
                            }
                          }}
                          className="mt-0.5 rounded-sm border-border text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="font-semibold text-foreground">{ROLE_LABELS[val]?.label || val}</div>
                          {isSuper && (
                            <div className="text-[10px] text-rose-500 font-medium">Cần quyền Super Admin</div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Active Switch */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-xs font-semibold text-foreground block">Trạng thái tài khoản</span>
                  <span className="text-[11px] text-muted-foreground">
                    Tắt trạng thái sẽ thu hồi toàn bộ các phiên hoạt động
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-primary border-border focus:ring-primary"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium shadow-xs"
                >
                  {isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESET PASSWORD */}
      {showPasswordModal && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <span>Đặt Lại Mật Khẩu Quản Trị</span>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                <p className="font-semibold mb-1">Cảnh báo bảo mật:</p>
                <p>
                  Đặt lại mật khẩu cho <strong>{activeUser.email}</strong> sẽ ngay lập tức thu hồi toàn bộ các phiên làm việc đang mở trên tất cả các thiết bị.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Mật khẩu mới * (Tối thiểu 12 ký tự)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
                      let pwd = '';
                      for (let i = 0; i < 16; i++) {
                        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      setResetPassword(pwd);
                    }}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Tạo mật khẩu mạnh
                  </button>
                </div>
                <input
                  type="text"
                  required
                  minLength={12}
                  placeholder="Nhập mật khẩu mới..."
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-mono bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isPending || resetPassword.length < 12}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium shadow-xs disabled:opacity-50"
                >
                  {isPending ? 'Đang cập nhật...' : 'Xác Nhận Đặt Lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SESSIONS DRAWER */}
      {showSessionsModal && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Laptop className="w-5 h-5 text-primary" />
                <span>Phiên Làm Việc ({activeUser.email})</span>
              </div>
              <button
                onClick={() => setShowSessionsModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Hiện có <strong>{activeSessions.length}</strong> phiên đăng nhập đang hoạt động
                </span>

                {activeSessions.length > 0 && (
                  <button
                    onClick={handleRevokeAllSessions}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 rounded-lg text-xs font-medium border border-rose-200 dark:border-rose-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Thu hồi tất cả phiên</span>
                  </button>
                )}
              </div>

              {activeSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  Không có phiên làm việc nào đang mở cho tài khoản này.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">
                            {session.ipAddress || 'Địa chỉ IP không xác định'}
                          </span>
                          {session.isExpired ? (
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-sm text-muted-foreground font-medium">
                              Đã hết hạn
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded-sm font-medium">
                              Đang hoạt động
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-md">
                          {session.userAgent || 'Trình duyệt tiêu chuẩn'}
                        </div>
                        <div className="text-[10px] text-muted-foreground/70">
                          Hoạt động gần nhất: {new Date(session.lastActiveAt).toLocaleString('vi-VN')} • Tạo lúc:{' '}
                          {new Date(session.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={isPending}
                        className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800 font-medium transition-colors flex-shrink-0"
                      >
                        Thu hồi
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-end">
              <button
                onClick={() => setShowSessionsModal(false)}
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
