import 'server-only';
import { db } from '@/db';
import { userRepository, type SafeUser, type UserListOptions, type UserListResult, type SafeSessionMetadata } from '@/repositories';
import { Role, RoleId, Permission, hasRole, hasPermission } from '@/lib/auth/rbac';
import { hashPassword, validatePasswordPolicy } from '@/lib/auth/password';
import { logAuditEvent, AuditAction } from '@/lib/auth/audit';
import type { UserWithRoles } from './auth.service';

export interface CreateUserPayload {
  email: string;
  fullName: string;
  password: string;
  roleIds: string[];
  avatarUrl?: string | null;
  isActive?: boolean;
}

export interface UpdateUserProfilePayload {
  fullName?: string;
  avatarUrl?: string | null;
  roleIds?: string[];
  isActive?: boolean;
  expectedUpdatedAt?: string;
}

const VALID_ROLE_IDS = new Set(Object.values(Role));

export class UserAdminService {
  /**
   * Lists administrative users with bounded pagination and filtering.
   */
  async listUsers(options: UserListOptions, actor: UserWithRoles): Promise<UserListResult> {
    if (!hasPermission(actor.roles, actor.permissions, Permission.USER_MANAGE)) {
      throw new Error('Bạn không có quyền xem danh sách quản trị viên.');
    }

    return await userRepository.listUsers(options);
  }

  /**
   * Retrieves single safe user profile by ID.
   */
  async getUserDetail(userId: string, actor: UserWithRoles): Promise<{ user: SafeUser; sessions: SafeSessionMetadata[] }> {
    if (!hasPermission(actor.roles, actor.permissions, Permission.USER_MANAGE)) {
      throw new Error('Bạn không có quyền xem chi tiết quản trị viên.');
    }

    const user = await userRepository.getById(userId);
    if (!user) {
      throw new Error(`Không tìm thấy quản trị viên với ID: ${userId}`);
    }

    const sessions = await userRepository.getUserSessions(userId);

    return { user, sessions };
  }

  /**
   * Creates a new administrative user securely with Argon2id password hashing.
   */
  async createUser(payload: CreateUserPayload, actor: UserWithRoles): Promise<SafeUser> {
    if (!hasPermission(actor.roles, actor.permissions, Permission.USER_MANAGE)) {
      throw new Error('Bạn không có quyền tạo tài khoản quản trị.');
    }

    const normalizedEmail = (payload.email || '').toLowerCase().trim();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw new Error('Email không hợp lệ.');
    }

    const trimmedFullName = (payload.fullName || '').trim();
    if (!trimmedFullName || trimmedFullName.length < 2) {
      throw new Error('Họ và tên phải có ít nhất 2 ký tự.');
    }

    // Role validation
    if (!Array.isArray(payload.roleIds) || payload.roleIds.length === 0) {
      throw new Error('Vui lòng gán ít nhất 1 vai trò cho người dùng.');
    }

    for (const rId of payload.roleIds) {
      if (!VALID_ROLE_IDS.has(rId as RoleId)) {
        throw new Error(`Vai trò không hợp lệ: ${rId}`);
      }
    }

    // Privilege escalation protection: Only SUPER_ADMIN can assign SUPER_ADMIN role
    const isAssigningSuperAdmin = payload.roleIds.includes(Role.SUPER_ADMIN);
    const actorIsSuperAdmin = hasRole(actor.roles, Role.SUPER_ADMIN);

    if (isAssigningSuperAdmin && !actorIsSuperAdmin) {
      throw new Error('Chỉ Super Admin mới có quyền gán vai trò Super Admin cho tài khoản khác.');
    }

    // Check email uniqueness
    const existing = await userRepository.getByEmail(normalizedEmail);
    if (existing) {
      throw new Error(`Email "${normalizedEmail}" đã được sử dụng bởi một tài khoản khác.`);
    }

    // Validate password policy
    const policyCheck = validatePasswordPolicy(payload.password);
    if (!policyCheck.valid) {
      throw new Error(policyCheck.error || 'Mật khẩu không đáp ứng tiêu chuẩn an toàn.');
    }

    // Hash password with Argon2id
    const passwordHash = await hashPassword(payload.password);

    // Create user in transactional block
    const newUser = await db.transaction(async (tx) => {
      const created = await userRepository.create(
        {
          email: normalizedEmail,
          fullName: trimmedFullName,
          passwordHash,
          avatarUrl: payload.avatarUrl || null,
          roleIds: payload.roleIds,
          isActive: payload.isActive !== undefined ? payload.isActive : true,
        },
        tx
      );

      return created;
    });

    // Write immutable audit log (NEVER include plain password or password hash)
    await logAuditEvent({
      actorId: actor.id,
      actorEmail: actor.email,
      action: AuditAction.USER_CREATED,
      entityType: 'User',
      entityId: newUser.id,
      metadata: {
        email: newUser.email,
        fullName: newUser.fullName,
        roles: newUser.roles,
        isActive: newUser.isActive,
      },
    });

    return newUser;
  }

  /**
   * Updates user details, assigned roles, and active status safely.
   */
  async updateUser(userId: string, payload: UpdateUserProfilePayload, actor: UserWithRoles): Promise<SafeUser> {
    if (!hasPermission(actor.roles, actor.permissions, Permission.USER_MANAGE)) {
      throw new Error('Bạn không có quyền chỉnh sửa tài khoản quản trị.');
    }

    const targetUser = await userRepository.getById(userId);
    if (!targetUser) {
      throw new Error(`Không tìm thấy tài khoản với ID: ${userId}`);
    }

    const actorIsSuperAdmin = hasRole(actor.roles, Role.SUPER_ADMIN);
    const targetIsSuperAdmin = targetUser.roles.includes(Role.SUPER_ADMIN);

    // Concurrency check if expectedUpdatedAt timestamp provided
    if (payload.expectedUpdatedAt) {
      const expectedTime = new Date(payload.expectedUpdatedAt).getTime();
      const actualTime = new Date(targetUser.updatedAt).getTime();
      if (Math.abs(expectedTime - actualTime) > 1000) {
        throw new Error('Dữ liệu tài khoản đã bị thay đổi bởi quản trị viên khác. Vui lòng tải lại trang.');
      }
    }

    // Target protection: Non-super_admin cannot edit a super_admin user
    if (targetIsSuperAdmin && !actorIsSuperAdmin) {
      throw new Error('Bạn không có quyền chỉnh sửa tài khoản của Super Admin.');
    }

    // If roles are being changed
    if (payload.roleIds !== undefined) {
      if (!Array.isArray(payload.roleIds) || payload.roleIds.length === 0) {
        throw new Error('Tài khoản phải có ít nhất một vai trò.');
      }

      for (const rId of payload.roleIds) {
        if (!VALID_ROLE_IDS.has(rId as RoleId)) {
          throw new Error(`Vai trò không hợp lệ: ${rId}`);
        }
      }

      const willBeSuperAdmin = payload.roleIds.includes(Role.SUPER_ADMIN);

      // Privilege escalation protection
      if (willBeSuperAdmin && !actorIsSuperAdmin) {
        throw new Error('Chỉ Super Admin mới có quyền nâng cấp tài khoản lên vai trò Super Admin.');
      }

      // Final Super Admin Protection against demotion
      if (targetIsSuperAdmin && !willBeSuperAdmin) {
        const activeSuperAdminCount = await userRepository.countActiveSuperAdmins();
        if (activeSuperAdminCount <= 1 && targetUser.isActive) {
          throw new Error('Không thể tước quyền Super Admin của quản trị viên cấp cao duy nhất đang hoạt động.');
        }
      }
    }

    // Final Super Admin Protection against disable
    if (payload.isActive === false && targetIsSuperAdmin) {
      const activeSuperAdminCount = await userRepository.countActiveSuperAdmins();
      if (activeSuperAdminCount <= 1) {
        throw new Error('Không thể vô hiệu hóa Super Admin duy nhất đang hoạt động.');
      }
    }

    // Perform update in transaction
    const updatedUser = await db.transaction(async (tx) => {
      const updated = await userRepository.update(
        userId,
        {
          fullName: payload.fullName,
          avatarUrl: payload.avatarUrl,
          roleIds: payload.roleIds,
          isActive: payload.isActive,
        },
        tx
      );

      // If user was disabled, revoke all active sessions immediately
      if (payload.isActive === false) {
        await userRepository.revokeAllUserSessions(userId, tx);
      }

      return updated;
    });

    // Write audit log
    await logAuditEvent({
      actorId: actor.id,
      actorEmail: actor.email,
      action: AuditAction.USER_UPDATED,
      entityType: 'User',
      entityId: updatedUser.id,
      metadata: {
        previousRoles: targetUser.roles,
        newRoles: updatedUser.roles,
        previousIsActive: targetUser.isActive,
        newIsActive: updatedUser.isActive,
        fullName: updatedUser.fullName,
      },
    });

    return updatedUser;
  }

  /**
   * Enables or disables a user account with immediate session revocation.
   */
  async toggleUserStatus(userId: string, isActive: boolean, actor: UserWithRoles): Promise<SafeUser> {
    if (!hasPermission(actor.roles, actor.permissions, Permission.USER_MANAGE)) {
      throw new Error('Bạn không có quyền kích hoạt / vô hiệu hóa tài khoản.');
    }

    const targetUser = await userRepository.getById(userId);
    if (!targetUser) {
      throw new Error(`Không tìm thấy tài khoản với ID: ${userId}`);
    }

    const actorIsSuperAdmin = hasRole(actor.roles, Role.SUPER_ADMIN);
    const targetIsSuperAdmin = targetUser.roles.includes(Role.SUPER_ADMIN);

    if (targetIsSuperAdmin && !actorIsSuperAdmin) {
      throw new Error('Bạn không có quyền thay đổi trạng thái của Super Admin.');
    }

    // Final Super Admin Protection
    if (!isActive && targetIsSuperAdmin) {
      const activeSuperAdminCount = await userRepository.countActiveSuperAdmins();
      if (activeSuperAdminCount <= 1) {
        throw new Error('Không thể vô hiệu hóa Super Admin duy nhất đang hoạt động trong hệ thống.');
      }
    }

    // Atomic transaction for status change and session revocation
    await db.transaction(async (tx) => {
      await userRepository.setStatus(userId, isActive, tx);
      if (!isActive) {
        // Immediate session revocation on disable
        await userRepository.revokeAllUserSessions(userId, tx);
      }
    });

    // Log immutable audit log
    await logAuditEvent({
      actorId: actor.id,
      actorEmail: actor.email,
      action: isActive ? AuditAction.USER_ENABLED : AuditAction.USER_DISABLED,
      entityType: 'User',
      entityId: userId,
      metadata: {
        targetEmail: targetUser.email,
        isActive,
      },
    });

    const refreshed = await userRepository.getById(userId);
    if (!refreshed) {
      throw new Error('Không thể tải lại thông tin tài khoản sau khi cập nhật.');
    }

    return refreshed;
  }

  /**
   * Resets a user's password securely with Argon2id and invalidates all existing sessions.
   */
  async adminResetPassword(userId: string, newPassword: string, actor: UserWithRoles): Promise<boolean> {
    if (!hasPermission(actor.roles, actor.permissions, Permission.USER_MANAGE)) {
      throw new Error('Bạn không có quyền đặt lại mật khẩu cho người dùng.');
    }

    const targetUser = await userRepository.getById(userId);
    if (!targetUser) {
      throw new Error(`Không tìm thấy tài khoản với ID: ${userId}`);
    }

    const actorIsSuperAdmin = hasRole(actor.roles, Role.SUPER_ADMIN);
    const targetIsSuperAdmin = targetUser.roles.includes(Role.SUPER_ADMIN);

    if (targetIsSuperAdmin && !actorIsSuperAdmin) {
      throw new Error('Bạn không có quyền đặt lại mật khẩu cho tài khoản Super Admin.');
    }

    const policyCheck = validatePasswordPolicy(newPassword);
    if (!policyCheck.valid) {
      throw new Error(policyCheck.error || 'Mật khẩu mới không đáp ứng tiêu chuẩn an toàn.');
    }

    const passwordHash = await hashPassword(newPassword);

    // Atomic password update and session revocation
    await db.transaction(async (tx) => {
      await userRepository.setPassword(userId, passwordHash, tx);
      await userRepository.revokeAllUserSessions(userId, tx);
    });

    // Log audit event (NEVER plain password or hash)
    await logAuditEvent({
      actorId: actor.id,
      actorEmail: actor.email,
      action: AuditAction.USER_PASSWORD_RESET,
      entityType: 'User',
      entityId: userId,
      metadata: {
        targetEmail: targetUser.email,
        revokedAllSessions: true,
      },
    });

    return true;
  }

  /**
   * Gets session list for a user.
   */
  async getUserSessions(userId: string, actor: UserWithRoles): Promise<SafeSessionMetadata[]> {
    if (!hasPermission(actor.roles, actor.permissions, Permission.USER_MANAGE)) {
      throw new Error('Bạn không có quyền xem các phiên hoạt động.');
    }

    return await userRepository.getUserSessions(userId);
  }

  /**
   * Revokes a single session.
   */
  async revokeSession(sessionId: string, userId: string, actor: UserWithRoles): Promise<boolean> {
    if (!hasPermission(actor.roles, actor.permissions, Permission.USER_MANAGE)) {
      throw new Error('Bạn không có quyền thu hồi phiên đăng nhập.');
    }

    const success = await userRepository.revokeSession(sessionId, userId);
    if (success) {
      await logAuditEvent({
        actorId: actor.id,
        actorEmail: actor.email,
        action: AuditAction.USER_SESSION_REVOKED,
        entityType: 'Session',
        entityId: sessionId,
        metadata: { targetUserId: userId },
      });
    }

    return success;
  }

  /**
   * Revokes all active sessions for a target user.
   */
  async revokeAllUserSessions(userId: string, actor: UserWithRoles): Promise<number> {
    if (!hasPermission(actor.roles, actor.permissions, Permission.USER_MANAGE)) {
      throw new Error('Bạn không có quyền thu hồi toàn bộ phiên đăng nhập.');
    }

    const count = await userRepository.revokeAllUserSessions(userId);
    await logAuditEvent({
      actorId: actor.id,
      actorEmail: actor.email,
      action: AuditAction.USER_ALL_SESSIONS_REVOKED,
      entityType: 'User',
      entityId: userId,
      metadata: { revokedSessionCount: count },
    });

    return count;
  }
}

export const userAdminService = new UserAdminService();
