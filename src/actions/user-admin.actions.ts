'use server';

import { getCurrentUser } from '@/services/auth.service';
import {
  userAdminService,
  CreateUserPayload,
  UpdateUserProfilePayload,
} from '@/services/user-admin.service';
import type {
  SafeUser,
  UserListOptions,
  UserListResult,
  SafeSessionMetadata,
} from '@/repositories/contracts/user.repository';

/**
 * Lists users with server-side bounded pagination and filters.
 */
export async function listUsersAction(
  options: UserListOptions = {}
): Promise<{ success: boolean; data?: UserListResult; error?: string }> {
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  try {
    const data = await userAdminService.listUsers(options, actor);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Retrieves details of a specific user.
 */
export async function getUserDetailAction(
  userId: string
): Promise<{ success: boolean; data?: { user: SafeUser; sessions: SafeSessionMetadata[] }; error?: string }> {
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  try {
    const data = await userAdminService.getUserDetail(userId, actor);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Creates a new user account with secure Argon2id password hashing.
 */
export async function createUserAction(
  payload: CreateUserPayload
): Promise<{ success: boolean; data?: SafeUser; error?: string }> {
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  try {
    const data = await userAdminService.createUser(payload, actor);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Updates an existing user's profile and roles.
 */
export async function updateUserAction(
  userId: string,
  payload: UpdateUserProfilePayload
): Promise<{ success: boolean; data?: SafeUser; error?: string }> {
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  try {
    const data = await userAdminService.updateUser(userId, payload, actor);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Enables or disables a user account.
 */
export async function toggleUserStatusAction(
  userId: string,
  isActive: boolean
): Promise<{ success: boolean; data?: SafeUser; error?: string }> {
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  try {
    const data = await userAdminService.toggleUserStatus(userId, isActive, actor);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Resets a user's password and revokes all their active sessions.
 */
export async function adminResetPasswordAction(
  userId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  try {
    await userAdminService.adminResetPassword(userId, newPassword, actor);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Fetches active sessions for a user.
 */
export async function getUserSessionsAction(
  userId: string
): Promise<{ success: boolean; data?: SafeSessionMetadata[]; error?: string }> {
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  try {
    const data = await userAdminService.getUserSessions(userId, actor);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Revokes a single session.
 */
export async function revokeUserSessionAction(
  userId: string,
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  try {
    const success = await userAdminService.revokeSession(sessionId, userId, actor);
    return { success };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Revokes all sessions for a user.
 */
export async function revokeAllUserSessionsAction(
  userId: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false, error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  try {
    const count = await userAdminService.revokeAllUserSessions(userId, actor);
    return { success: true, count };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
