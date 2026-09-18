/**
 * RBAC (Role-Based Access Control) Foundation for DoctorCheck CMS
 *
 * Enforces centralized, server-authoritative role and permission checking.
 */

export const Role = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MEDICAL_REVIEWER: 'medical_reviewer',
  EDITOR: 'editor',
  DOCTOR: 'doctor',
} as const;

export type RoleId = (typeof Role)[keyof typeof Role];

export const Permission = {
  // Articles & Categories
  ARTICLE_READ: 'article.read',
  ARTICLE_CREATE: 'article.create',
  ARTICLE_EDIT_DRAFT: 'article.edit_draft',
  ARTICLE_REVIEW: 'article.review',
  ARTICLE_PUBLISH: 'article.publish',
  ARTICLE_DELETE: 'article.delete',
  CATEGORY_MANAGE: 'category.manage',

  // Doctors & Medical Licenses
  DOCTOR_READ: 'doctor.read',
  DOCTOR_EDIT_BIO: 'doctor.edit_bio',
  DOCTOR_EDIT_CCHN: 'doctor.edit_cchn',

  // Packages & Pricing
  PACKAGE_READ: 'package.read',
  PACKAGE_EDIT_CONTENT: 'package.edit_content',
  PACKAGE_EDIT_PRICE: 'package.edit_price',
  PACKAGE_PUBLISH: 'package.publish',

  // Pages & Homepage
  PAGE_READ: 'page.read',
  PAGE_EDIT: 'page.edit',
  PAGE_PUBLISH: 'page.publish',
  HOMEPAGE_EDIT: 'homepage.edit',
  HOMEPAGE_PUBLISH: 'homepage.publish',

  // Clinic Profile & Equipment
  CLINIC_READ: 'clinic.read',
  CLINIC_EDIT: 'clinic.edit',
  CLINIC_PUBLISH: 'clinic.publish',
  CLINICAL_TRUST_READ: 'clinical_trust.read',
  CLINICAL_TRUST_EDIT: 'clinical_trust.edit',
  CLINICAL_TRUST_PUBLISH: 'clinical_trust.publish',

  // Media Management
  MEDIA_UPLOAD: 'media.upload',
  MEDIA_DELETE: 'media.delete',

  // Redirects
  REDIRECTS_MANAGE: 'redirects.manage',

  // System Administration
  USER_MANAGE: 'user.manage',
  AUDIT_READ: 'audit.read',
} as const;

export type PermissionKey = (typeof Permission)[keyof typeof Permission];

/**
 * Standard Role-to-Permissions Mapping
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleId, PermissionKey[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission), // Full system access
  [Role.ADMIN]: [
    Permission.ARTICLE_READ,
    Permission.ARTICLE_CREATE,
    Permission.ARTICLE_EDIT_DRAFT,
    Permission.ARTICLE_REVIEW,
    Permission.ARTICLE_PUBLISH,
    Permission.ARTICLE_DELETE,
    Permission.CATEGORY_MANAGE,
    Permission.DOCTOR_READ,
    Permission.DOCTOR_EDIT_BIO,
    Permission.PACKAGE_READ,
    Permission.PACKAGE_EDIT_CONTENT,
    Permission.PACKAGE_EDIT_PRICE,
    Permission.PACKAGE_PUBLISH,
    Permission.PAGE_READ,
    Permission.PAGE_EDIT,
    Permission.PAGE_PUBLISH,
    Permission.HOMEPAGE_EDIT,
    Permission.HOMEPAGE_PUBLISH,
    Permission.CLINIC_READ,
    Permission.CLINIC_EDIT,
    Permission.CLINIC_PUBLISH,
    Permission.CLINICAL_TRUST_READ,
    Permission.CLINICAL_TRUST_EDIT,
    Permission.CLINICAL_TRUST_PUBLISH,
    Permission.MEDIA_UPLOAD,
    Permission.MEDIA_DELETE,
    Permission.REDIRECTS_MANAGE,
    Permission.AUDIT_READ,
  ],
  [Role.MEDICAL_REVIEWER]: [
    Permission.ARTICLE_READ,
    Permission.ARTICLE_CREATE,
    Permission.ARTICLE_EDIT_DRAFT,
    Permission.ARTICLE_REVIEW,
    Permission.ARTICLE_PUBLISH,
    Permission.CATEGORY_MANAGE,
    Permission.DOCTOR_READ,
    Permission.DOCTOR_EDIT_BIO,
    Permission.DOCTOR_EDIT_CCHN,
    Permission.PACKAGE_READ,
    Permission.PACKAGE_EDIT_CONTENT,
    Permission.PACKAGE_PUBLISH,
    Permission.PAGE_READ,
    Permission.CLINIC_EDIT,
    Permission.CLINICAL_TRUST_EDIT,
    Permission.MEDIA_UPLOAD,
  ],
  [Role.EDITOR]: [
    Permission.ARTICLE_READ,
    Permission.ARTICLE_CREATE,
    Permission.ARTICLE_EDIT_DRAFT,
    Permission.CATEGORY_MANAGE,
    Permission.DOCTOR_READ,
    Permission.PACKAGE_READ,
    Permission.PAGE_READ,
    Permission.PAGE_EDIT,
    Permission.MEDIA_UPLOAD,
  ],
  [Role.DOCTOR]: [
    Permission.ARTICLE_READ,
    Permission.ARTICLE_CREATE,
    Permission.ARTICLE_EDIT_DRAFT,
    Permission.DOCTOR_READ,
    Permission.DOCTOR_EDIT_BIO,
    Permission.MEDIA_UPLOAD,
  ],
};

/**
 * Checks if a set of user permissions contains the required permission.
 * SUPER_ADMIN role bypasses individual permission checks.
 */
export function hasPermission(
  userRoles: string[],
  userPermissions: string[],
  requiredPermission: PermissionKey | string
): boolean {
  if (userRoles.includes(Role.SUPER_ADMIN)) {
    return true;
  }
  return userPermissions.includes(requiredPermission);
}

/**
 * Checks if a user has a specific role.
 */
export function hasRole(userRoles: string[], requiredRole: RoleId | string): boolean {
  if (userRoles.includes(Role.SUPER_ADMIN)) {
    return true;
  }
  return userRoles.includes(requiredRole);
}

/**
 * Resolves all distinct permissions for a given list of role IDs.
 */
export function resolvePermissionsForRoles(roleIds: string[]): string[] {
  const permissionsSet = new Set<string>();
  for (const roleId of roleIds) {
    const rolePerms = DEFAULT_ROLE_PERMISSIONS[roleId as RoleId] || [];
    for (const perm of rolePerms) {
      permissionsSet.add(perm);
    }
  }
  return Array.from(permissionsSet);
}
