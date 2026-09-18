import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users, sessions, userRoles } from '@/db/schema';
import { verifyPassword } from '@/lib/auth/password';
import { generateSessionToken, hashSessionToken } from '@/lib/auth/tokens';
import {
  setSessionCookie,
  getSessionCookie,
  deleteSessionCookie,
  SESSION_MAX_AGE_SECONDS,
  SESSION_IDLE_TIMEOUT_SECONDS,
} from '@/lib/auth/cookies';
import { hasPermission, hasRole, resolvePermissionsForRoles } from '@/lib/auth/rbac';
import { logAuditEvent, AuditAction } from '@/lib/auth/audit';
import { checkLoginRateLimit, resetLoginRateLimit } from '@/lib/auth/rate-limiter';

export interface UserWithRoles {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  isActive: boolean;
  roles: string[];
  permissions: string[];
  createdAt: Date;
}

export type SessionRecord = typeof sessions.$inferSelect;

export class AuthenticationError extends Error {
  constructor(message = 'Yêu cầu đăng nhập để truy cập tài nguyên.') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Bạn không có quyền thực hiện hành động này.') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Creates a new active session for a verified user in PostgreSQL.
 */
export async function createSession(
  userId: string,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<{ session: SessionRecord; token: string }> {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000);

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      tokenHash,
      expiresAt,
      ipAddress: metadata?.ipAddress || null,
      userAgent: metadata?.userAgent || null,
      lastActiveAt: now,
      createdAt: now,
    })
    .returning();

  return { session, token };
}

/**
 * Validates an opaque session token, checks expiration, user status, and resolves user roles/permissions.
 */
export async function validateSessionToken(
  token: string
): Promise<{ session: SessionRecord; user: UserWithRoles } | null> {
  if (!token || typeof token !== 'string' || token.length < 16) {
    return null;
  }

  const tokenHash = hashSessionToken(token);
  const now = new Date();

  // 1. Fetch Session from DB
  const sessionRows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.tokenHash, tokenHash))
    .limit(1);

  if (!sessionRows.length || !sessionRows[0]) {
    return null;
  }

  const session = sessionRows[0];

  // 2. Check Absolute Expiration
  if (now > session.expiresAt) {
    await db.delete(sessions).where(eq(sessions.id, session.id));
    return null;
  }

  // 3. Check Idle Expiration (2 hours without activity)
  const idleThreshold = new Date(now.getTime() - SESSION_IDLE_TIMEOUT_SECONDS * 1000);
  if (session.lastActiveAt < idleThreshold) {
    await db.delete(sessions).where(eq(sessions.id, session.id));
    return null;
  }

  // 4. Fetch User and verify status
  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!userRows.length || !userRows[0]) {
    await db.delete(sessions).where(eq(sessions.id, session.id));
    return null;
  }

  const user = userRows[0];

  // 5. Immediate rejection of disabled users
  if (!user.isActive) {
    await db.delete(sessions).where(eq(sessions.userId, user.id));
    return null;
  }

  // 6. Resolve User Roles & Permissions
  const userRoleRows = await db
    .select({ roleId: userRoles.roleId })
    .from(userRoles)
    .where(eq(userRoles.userId, user.id));

  const roleIds = userRoleRows.map((r) => r.roleId);
  const permissions = resolvePermissionsForRoles(roleIds);

  // 7. Touch lastActiveAt (throttled to once per 5 minutes to avoid DB write thrashing)
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  if (session.lastActiveAt < fiveMinutesAgo) {
    await db
      .update(sessions)
      .set({ lastActiveAt: now })
      .where(eq(sessions.id, session.id));
  }

  const userWithRoles: UserWithRoles = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    roles: roleIds,
    permissions,
    createdAt: user.createdAt,
  };

  return { session, user: userWithRoles };
}

/**
 * Revokes a session by raw token.
 */
export async function revokeSession(token: string): Promise<boolean> {
  if (!token) return false;
  const tokenHash = hashSessionToken(token);
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  return true;
}

/**
 * Revokes all active sessions for a given user (used on password change or account suspension).
 */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/**
 * Retrieves the current session and authenticated user from request cookies.
 */
export async function getCurrentSession(): Promise<{
  session: SessionRecord;
  user: UserWithRoles;
} | null> {
  const token = await getSessionCookie();
  if (!token) return null;

  const result = await validateSessionToken(token);
  if (!result) {
    await deleteSessionCookie();
    return null;
  }

  return result;
}

/**
 * Retrieves the currently authenticated user or null.
 */
export async function getCurrentUser(): Promise<UserWithRoles | null> {
  const sessionData = await getCurrentSession();
  return sessionData?.user || null;
}

/**
 * Enforces that a caller is authenticated. Throws AuthenticationError if unauthenticated.
 */
export async function requireAuthenticatedUser(): Promise<UserWithRoles> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthenticationError();
  }
  return user;
}

/**
 * Enforces that a caller possesses a specific permission. Throws AuthorizationError if denied.
 */
export async function requirePermission(permission: string): Promise<UserWithRoles> {
  const user = await requireAuthenticatedUser();

  if (!hasPermission(user.roles, user.permissions, permission)) {
    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      action: AuditAction.PERMISSION_DENIED,
      metadata: { attemptedPermission: permission, userRoles: user.roles },
    });
    throw new AuthorizationError(`Thiếu quyền yêu cầu: ${permission}`);
  }

  return user;
}

/**
 * Enforces that a caller has a specific role. Throws AuthorizationError if denied.
 */
export async function requireRole(roleId: string): Promise<UserWithRoles> {
  const user = await requireAuthenticatedUser();

  if (!hasRole(user.roles, roleId)) {
    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      action: AuditAction.PERMISSION_DENIED,
      metadata: { attemptedRole: roleId, userRoles: user.roles },
    });
    throw new AuthorizationError(`Yêu cầu vai trò: ${roleId}`);
  }

  return user;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  user?: UserWithRoles;
}

// Dummy hash used to mitigate timing attacks for non-existent users
const TIMING_SAFE_DUMMY_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$dGVzdHNhbHQxMjM0NTY3OA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

/**
 * Authenticates an administrator with credentials, rate limiting, and session creation.
 */
export async function login(
  credentials: LoginCredentials,
  context?: { ipAddress?: string; userAgent?: string }
): Promise<LoginResult> {
  const normalizedEmail = (credentials.email || '').toLowerCase().trim();
  const password = credentials.password || '';

  // 1. Rate Limiting Check (by IP + normalized email)
  const clientKey = `${context?.ipAddress || 'unknown'}:${normalizedEmail}`;
  const rateLimit = await checkLoginRateLimit(clientKey);

  if (!rateLimit.success) {
    await logAuditEvent({
      actorEmail: normalizedEmail,
      action: AuditAction.LOGIN_FAILURE,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      metadata: { reason: 'RATE_LIMIT_EXCEEDED', retryAfterSeconds: rateLimit.retryAfterSeconds },
    });

    return {
      success: false,
      error: 'Quá nhiều lần thử đăng nhập không thành công. Vui lòng thử lại sau 15 phút.',
    };
  }

  // 2. Validate input presence
  if (!normalizedEmail || !password) {
    return {
      success: false,
      error: 'Vui lòng nhập đầy đủ email và mật khẩu.',
    };
  }

  // 3. Lookup user in database
  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!userRows.length || !userRows[0]) {
    // Constant-time execution dummy verification
    await verifyPassword(TIMING_SAFE_DUMMY_HASH, password);
    await logAuditEvent({
      actorEmail: normalizedEmail,
      action: AuditAction.LOGIN_FAILURE,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      metadata: { reason: 'USER_NOT_FOUND' },
    });
    return {
      success: false,
      error: 'Email hoặc mật khẩu không chính xác.',
    };
  }

  const user = userRows[0];

  // 4. Verify account active status
  if (!user.isActive) {
    await verifyPassword(TIMING_SAFE_DUMMY_HASH, password);
    await logAuditEvent({
      actorId: user.id,
      actorEmail: normalizedEmail,
      action: AuditAction.LOGIN_FAILURE,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      metadata: { reason: 'ACCOUNT_DISABLED' },
    });
    return {
      success: false,
      error: 'Tài khoản đã bị tạm khóa. Vui lòng liên hệ quản trị viên.',
    };
  }

  // 5. Verify Password
  const isValidPassword = await verifyPassword(user.passwordHash, password);
  if (!isValidPassword) {
    await logAuditEvent({
      actorId: user.id,
      actorEmail: normalizedEmail,
      action: AuditAction.LOGIN_FAILURE,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      metadata: { reason: 'INVALID_PASSWORD' },
    });
    return {
      success: false,
      error: 'Email hoặc mật khẩu không chính xác.',
    };
  }

  // 6. Authentication Successful -> Reset rate limit
  await resetLoginRateLimit(clientKey);

  // 7. Create Session & Set Secure Cookie
  const { session, token } = await createSession(user.id, context);
  await setSessionCookie(token, session.expiresAt);

  // 8. Resolve Roles & Permissions
  const userRoleRows = await db
    .select({ roleId: userRoles.roleId })
    .from(userRoles)
    .where(eq(userRoles.userId, user.id));

  const roleIds = userRoleRows.map((r) => r.roleId);
  const permissions = resolvePermissionsForRoles(roleIds);

  const userWithRoles: UserWithRoles = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    roles: roleIds,
    permissions,
    createdAt: user.createdAt,
  };

  // 9. Log Audit Event
  await logAuditEvent({
    actorId: user.id,
    actorEmail: user.email,
    action: AuditAction.LOGIN_SUCCESS,
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
    metadata: { sessionId: session.id, roles: roleIds },
  });

  return {
    success: true,
    user: userWithRoles,
  };
}

/**
 * Logs out the current administrator, revokes session server-side, and clears the session cookie.
 */
export async function logout(context?: { ipAddress?: string; userAgent?: string }): Promise<void> {
  const token = await getSessionCookie();

  if (token) {
    const sessionData = await validateSessionToken(token);
    if (sessionData) {
      await logAuditEvent({
        actorId: sessionData.user.id,
        actorEmail: sessionData.user.email,
        action: AuditAction.LOGOUT,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: { sessionId: sessionData.session.id },
      });
    }

    await revokeSession(token);
  }

  await deleteSessionCookie();
}
