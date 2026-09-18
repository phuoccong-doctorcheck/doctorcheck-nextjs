import React from 'react';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { UserManager } from '@/components/admin/users/UserManager';
import { userRepository } from '@/repositories';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản Lý Người Dùng & Phân Quyền | DoctorCheck CMS',
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const guard = await guardAdminModule(Permission.USER_MANAGE, '/admin/users');

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.USER_MANAGE}
        userRoles={guard.user.roles}
        moduleName="Quản trị Người dùng"
      />
    );
  }

  // Fetch initial bounded list of users
  const initialResult = await userRepository.listUsers({ page: 1, limit: 20 });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản Lý Người Dùng & Phân Quyền Hệ Thống"
        description="Quản lý tài khoản quản trị viên nội bộ, phân bổ vai trò RBAC và kiểm soát trạng thái kích hoạt tài khoản"
        iconName="Users"
        phaseBadge="CMS-11"
        statusBadge="PostgreSQL: users, roles, user_roles"
      />

      <UserManager
        initialUsers={initialResult.users}
        initialTotal={initialResult.total}
        initialPage={initialResult.page}
        initialLimit={initialResult.limit}
        initialTotalPages={initialResult.totalPages}
        currentUserRoles={guard.user.roles}
        currentUserId={guard.user.id}
      />
    </div>
  );
}

