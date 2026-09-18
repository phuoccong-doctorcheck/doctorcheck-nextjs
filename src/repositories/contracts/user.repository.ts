import type { users, sessions, roles } from '@/db/schema';

export type UserRow = typeof users.$inferSelect;
export type SessionRow = typeof sessions.$inferSelect;
export type RoleRow = typeof roles.$inferSelect;

export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  isActive: boolean;
  roles: string[];
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserListOptions {
  page?: number;
  limit?: number;
  query?: string;
  role?: string;
  isActive?: boolean;
}

export interface UserListResult {
  users: SafeUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  fullName: string;
  avatarUrl?: string | null;
  isActive?: boolean;
  roleIds: string[];
}

export interface UpdateUserData {
  fullName?: string;
  avatarUrl?: string | null;
  roleIds?: string[];
  isActive?: boolean;
  passwordHash?: string;
}

export interface SafeSessionMetadata {
  id: string;
  userId: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  lastActiveAt: Date;
  createdAt: Date;
  isExpired: boolean;
}

export interface IUserRepository {
  listUsers(options?: UserListOptions): Promise<UserListResult>;
  getById(id: string, tx?: unknown): Promise<SafeUser | null>;
  getByEmail(email: string, tx?: unknown): Promise<SafeUser | null>;
  getUserWithPasswordByEmail(email: string, tx?: unknown): Promise<(UserRow & { roles: string[] }) | null>;
  getUserWithPasswordById(id: string, tx?: unknown): Promise<(UserRow & { roles: string[] }) | null>;
  create(data: CreateUserData, tx?: unknown): Promise<SafeUser>;
  update(id: string, data: UpdateUserData, tx?: unknown): Promise<SafeUser>;
  setStatus(id: string, isActive: boolean, tx?: unknown): Promise<boolean>;
  setPassword(id: string, passwordHash: string, tx?: unknown): Promise<boolean>;
  setRoles(id: string, roleIds: string[], tx?: unknown): Promise<void>;
  countActiveSuperAdmins(tx?: unknown): Promise<number>;
  getUserSessions(userId: string, tx?: unknown): Promise<SafeSessionMetadata[]>;
  revokeSession(sessionId: string, userId?: string, tx?: unknown): Promise<boolean>;
  revokeAllUserSessions(userId: string, tx?: unknown): Promise<number>;
}
