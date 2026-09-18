import 'server-only';
import { redirect } from 'next/navigation';
import { getCurrentUser, UserWithRoles } from '@/services/auth.service';
import { hasPermission, PermissionKey } from '@/lib/auth/rbac';

export interface AdminAuthContext {
  user: UserWithRoles;
}

export interface AdminPermissionGuardResult {
  isAuthorized: boolean;
  user: UserWithRoles;
}

/**
 * Server-side helper to ensure the user is authenticated for any admin page.
 * If unauthenticated, immediately redirects to /admin/login/ with returnTo URL.
 */
export async function requireAdminAuth(returnTo = '/admin'): Promise<UserWithRoles> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/admin/login/?returnTo=${encodeURIComponent(returnTo)}`);
  }

  return user;
}

/**
 * Server-side guard to verify that the authenticated user possesses the required permission.
 * - If not authenticated: redirects to /admin/login/
 * - If authenticated: checks permission and returns isAuthorized boolean and user context.
 */
export async function guardAdminModule(
  requiredPermission: PermissionKey | string,
  returnTo = '/admin'
): Promise<AdminPermissionGuardResult> {
  const user = await requireAdminAuth(returnTo);
  const isAuthorized = hasPermission(user.roles, user.permissions, requiredPermission);

  return {
    isAuthorized,
    user,
  };
}
