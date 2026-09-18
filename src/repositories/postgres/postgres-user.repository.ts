import { eq, and, or, ilike, desc, count, sql } from 'drizzle-orm';
import { db } from '@/db';
import { users, userRoles, sessions, roles } from '@/db/schema';
import { resolvePermissionsForRoles, Role } from '@/lib/auth/rbac';
import type {
  IUserRepository,
  SafeUser,
  UserListOptions,
  UserListResult,
  CreateUserData,
  UpdateUserData,
  SafeSessionMetadata,
  UserRow,
} from '../contracts/user.repository';

export const STANDARD_ROLES = [
  { id: Role.SUPER_ADMIN, name: 'Super Administrator', description: 'Toàn quyền kiểm soát hệ thống và quản trị tối cao' },
  { id: Role.ADMIN, name: 'Administrator', description: 'Quản trị viên nội dung và vận hành hệ thống' },
  { id: Role.MEDICAL_REVIEWER, name: 'Medical Reviewer', description: 'Kiểm duyệt y khoa và chứng chỉ hành nghề' },
  { id: Role.EDITOR, name: 'Editor', description: 'Biên tập viên soạn thảo bài viết và trang' },
  { id: Role.DOCTOR, name: 'Doctor', description: 'Bác sĩ chuyên khoa' },
];

export class PostgresUserRepository implements IUserRepository {
  private getDb(tx?: unknown) {
    return (tx as typeof db) || db;
  }

  private async ensureRolesExist(client: typeof db) {
    for (const r of STANDARD_ROLES) {
      await client
        .insert(roles)
        .values({
          id: r.id,
          name: r.name,
          description: r.description,
          permissions: [],
        })
        .onConflictDoNothing();
    }
  }

  async listUsers(options: UserListOptions = {}): Promise<UserListResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (options.isActive !== undefined) {
      conditions.push(eq(users.isActive, options.isActive));
    }

    if (options.query && options.query.trim()) {
      const q = `%${options.query.trim()}%`;
      conditions.push(or(ilike(users.email, q), ilike(users.fullName, q)));
    }

    if (options.role && options.role.trim()) {
      const matchedUserIds = await db
        .select({ userId: userRoles.userId })
        .from(userRoles)
        .where(eq(userRoles.roleId, options.role.trim()));

      const uids = matchedUserIds.map((r) => r.userId);
      if (uids.length === 0) {
        return {
          users: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }
      conditions.push(sql`${users.id} IN ${uids}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Total count
    const [countResult] = await db
      .select({ total: count() })
      .from(users)
      .where(whereClause);

    const total = Number(countResult?.total || 0);

    // Fetch user rows with safe fields only (NO passwordHash)
    const userRows = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    if (userRows.length === 0) {
      return {
        users: [],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }

    // Batch fetch roles for the page's users to avoid N+1 query problem
    const userIds = userRows.map((u) => u.id);
    const roleRows = await db
      .select({
        userId: userRoles.userId,
        roleId: userRoles.roleId,
      })
      .from(userRoles)
      .where(sql`${userRoles.userId} IN ${userIds}`);

    const roleMap = new Map<string, string[]>();
    for (const r of roleRows) {
      const current = roleMap.get(r.userId) || [];
      current.push(r.roleId);
      roleMap.set(r.userId, current);
    }

    const safeUsers: SafeUser[] = userRows.map((u) => {
      const rIds = roleMap.get(u.id) || [];
      return {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl,
        isActive: u.isActive,
        roles: rIds,
        permissions: resolvePermissionsForRoles(rIds),
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      };
    });

    return {
      users: safeUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getById(id: string, tx?: unknown): Promise<SafeUser | null> {
    const client = this.getDb(tx);
    const [user] = await client
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) return null;

    const roleRows = await client
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, id));

    const rIds = roleRows.map((r) => r.roleId);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      roles: rIds,
      permissions: resolvePermissionsForRoles(rIds),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getByEmail(email: string, tx?: unknown): Promise<SafeUser | null> {
    const client = this.getDb(tx);
    const normalized = email.toLowerCase().trim();
    const [user] = await client
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.email, normalized))
      .limit(1);

    if (!user) return null;

    const roleRows = await client
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));

    const rIds = roleRows.map((r) => r.roleId);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      roles: rIds,
      permissions: resolvePermissionsForRoles(rIds),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUserWithPasswordByEmail(email: string, tx?: unknown): Promise<(UserRow & { roles: string[] }) | null> {
    const client = this.getDb(tx);
    const normalized = email.toLowerCase().trim();
    const [user] = await client
      .select()
      .from(users)
      .where(eq(users.email, normalized))
      .limit(1);

    if (!user) return null;

    const roleRows = await client
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));

    return {
      ...user,
      roles: roleRows.map((r) => r.roleId),
    };
  }

  async getUserWithPasswordById(id: string, tx?: unknown): Promise<(UserRow & { roles: string[] }) | null> {
    const client = this.getDb(tx);
    const [user] = await client
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) return null;

    const roleRows = await client
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));

    return {
      ...user,
      roles: roleRows.map((r) => r.roleId),
    };
  }

  async create(data: CreateUserData, tx?: unknown): Promise<SafeUser> {
    const client = this.getDb(tx);
    const normalizedEmail = data.email.toLowerCase().trim();

    await this.ensureRolesExist(client);

    const [newUser] = await client
      .insert(users)
      .values({
        email: normalizedEmail,
        passwordHash: data.passwordHash,
        fullName: data.fullName.trim(),
        avatarUrl: data.avatarUrl || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      })
      .returning();

    if (data.roleIds && data.roleIds.length > 0) {
      for (const rId of data.roleIds) {
        await client.insert(userRoles).values({
          userId: newUser.id,
          roleId: rId,
        });
      }
    }

    const rIds = data.roleIds || [];
    return {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      avatarUrl: newUser.avatarUrl,
      isActive: newUser.isActive,
      roles: rIds,
      permissions: resolvePermissionsForRoles(rIds),
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
  }

  async update(id: string, data: UpdateUserData, tx?: unknown): Promise<SafeUser> {
    const client = this.getDb(tx);
    const updateValues: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.fullName !== undefined) updateValues.fullName = data.fullName.trim();
    if (data.avatarUrl !== undefined) updateValues.avatarUrl = data.avatarUrl;
    if (data.isActive !== undefined) updateValues.isActive = data.isActive;
    if (data.passwordHash !== undefined) updateValues.passwordHash = data.passwordHash;

    const [updatedUser] = await client
      .update(users)
      .set(updateValues)
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new Error(`Không tìm thấy tài khoản với mã ID: ${id}`);
    }

    if (data.roleIds !== undefined) {
      await this.setRoles(id, data.roleIds, tx);
    }

    const roleRows = await client
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, id));

    const rIds = roleRows.map((r) => r.roleId);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      avatarUrl: updatedUser.avatarUrl,
      isActive: updatedUser.isActive,
      roles: rIds,
      permissions: resolvePermissionsForRoles(rIds),
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async setStatus(id: string, isActive: boolean, tx?: unknown): Promise<boolean> {
    const client = this.getDb(tx);
    const result = await client
      .update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({ id: users.id });

    return result.length > 0;
  }

  async setPassword(id: string, passwordHash: string, tx?: unknown): Promise<boolean> {
    const client = this.getDb(tx);
    const result = await client
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({ id: users.id });

    return result.length > 0;
  }

  async setRoles(id: string, roleIds: string[], tx?: unknown): Promise<void> {
    const client = this.getDb(tx);
    await this.ensureRolesExist(client);
    await client.delete(userRoles).where(eq(userRoles.userId, id));

    if (roleIds && roleIds.length > 0) {
      for (const rId of roleIds) {
        await client.insert(userRoles).values({
          userId: id,
          roleId: rId,
        });
      }
    }
  }

  async countActiveSuperAdmins(tx?: unknown): Promise<number> {
    const client = this.getDb(tx);
    const rows = await client
      .select({ total: count() })
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .where(and(eq(users.isActive, true), eq(userRoles.roleId, Role.SUPER_ADMIN)));

    return Number(rows[0]?.total || 0);
  }

  async getUserSessions(userId: string, tx?: unknown): Promise<SafeSessionMetadata[]> {
    const client = this.getDb(tx);
    const now = new Date();

    const sessionRows = await client
      .select({
        id: sessions.id,
        userId: sessions.userId,
        expiresAt: sessions.expiresAt,
        ipAddress: sessions.ipAddress,
        userAgent: sessions.userAgent,
        lastActiveAt: sessions.lastActiveAt,
        createdAt: sessions.createdAt,
      })
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.lastActiveAt));

    return sessionRows.map((s) => ({
      id: s.id,
      userId: s.userId,
      expiresAt: s.expiresAt,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      lastActiveAt: s.lastActiveAt,
      createdAt: s.createdAt,
      isExpired: now > s.expiresAt,
    }));
  }

  async revokeSession(sessionId: string, userId?: string, tx?: unknown): Promise<boolean> {
    const client = this.getDb(tx);
    const condition = userId
      ? and(eq(sessions.id, sessionId), eq(sessions.userId, userId))
      : eq(sessions.id, sessionId);

    const result = await client.delete(sessions).where(condition).returning({ id: sessions.id });
    return result.length > 0;
  }

  async revokeAllUserSessions(userId: string, tx?: unknown): Promise<number> {
    const client = this.getDb(tx);
    const result = await client.delete(sessions).where(eq(sessions.userId, userId)).returning({ id: sessions.id });
    return result.length;
  }
}

export const userRepository = new PostgresUserRepository();
