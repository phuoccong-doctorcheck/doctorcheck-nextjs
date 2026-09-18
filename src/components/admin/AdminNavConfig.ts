import { Permission, PermissionKey, hasPermission } from '@/lib/auth/rbac';

export interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  description: string;
  requiredPermission?: PermissionKey | string;
  phaseTag: string; // CMS phase tag e.g. "CMS-4"
}

export interface AdminNavGroup {
  id: string;
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: 'overview',
    label: 'Tổng Quan',
    items: [
      {
        id: 'dashboard',
        label: 'Bảng Điều Khiển',
        href: '/admin',
        icon: 'LayoutDashboard',
        description: 'Tổng quan hệ thống và trạng thái hoạt động',
        phaseTag: 'CMS-2',
      },
    ],
  },
  {
    id: 'content',
    label: 'Quản Lý Nội Dung',
    items: [
      {
        id: 'articles',
        label: 'Bài Viết Y Khoa',
        href: '/admin/articles',
        icon: 'FileText',
        description: 'Quản lý 108 bài viết chuyên khoa tiêu hóa & nội soi',
        requiredPermission: Permission.ARTICLE_READ,
        phaseTag: 'CMS-4',
      },
      {
        id: 'categories',
        label: 'Chuyên Mục Bài Viết',
        href: '/admin/categories',
        icon: 'FolderTree',
        description: 'Quản lý 30 chuyên mục và danh mục phân loại',
        requiredPermission: Permission.CATEGORY_MANAGE,
        phaseTag: 'CMS-4',
      },
      {
        id: 'pages',
        label: 'Trang Tĩnh & Nội Soi',
        href: '/admin/pages',
        icon: 'Files',
        description: 'Quản lý 55 trang tĩnh và cây trang nội soi tiêu hóa',
        requiredPermission: Permission.PAGE_READ,
        phaseTag: 'CMS-6',
      },
    ],
  },
  {
    id: 'clinical',
    label: 'Y Khoa & Dịch Vụ',
    items: [
      {
        id: 'doctors',
        label: 'Đội Ngũ Bác Sĩ',
        href: '/admin/doctors',
        icon: 'Stethoscope',
        description: 'Quản lý hồ sơ bác sĩ, chứng chỉ CCHN và lịch khám',
        requiredPermission: Permission.DOCTOR_READ,
        phaseTag: 'CMS-5',
      },
      {
        id: 'packages',
        label: 'Gói Khám & Bảng Giá',
        href: '/admin/packages',
        icon: 'PackageCheck',
        description: 'Quản lý các gói tầm soát và danh mục giá niêm yết',
        requiredPermission: Permission.PACKAGE_READ,
        phaseTag: 'CMS-5',
      },
      {
        id: 'clinic',
        label: 'Hồ Sơ & Độ Tin Cậy',
        href: '/admin/clinic',
        icon: 'Building2',
        description: 'Thông tin phòng khám, trang thiết bị, FAQs và cảm nhận',
        requiredPermission: Permission.CLINIC_EDIT,
        phaseTag: 'CMS-8',
      },
    ],
  },
  {
    id: 'media',
    label: 'Truyền Thông & Giao Diện',
    items: [
      {
        id: 'media',
        label: 'Thư Viện Media',
        href: '/admin/media',
        icon: 'Image',
        description: 'Kho lưu trữ hình ảnh, tài liệu và chứng nhận y khoa',
        requiredPermission: Permission.MEDIA_UPLOAD,
        phaseTag: 'CMS-3',
      },
      {
        id: 'homepage',
        label: 'Cấu Hình Trang Chủ',
        href: '/admin/homepage',
        icon: 'Sliders',
        description: 'Biên tập khối banner, nội dung chọn lọc và CTA trang chủ',
        requiredPermission: Permission.HOMEPAGE_EDIT,
        phaseTag: 'CMS-9',
      },
    ],
  },
  {
    id: 'system',
    label: 'Quản Trị Hệ Thống',
    items: [
      {
        id: 'redirects',
        label: 'Điều Hướng & Xuất Bản',
        href: '/admin/redirects',
        icon: 'Compass',
        description: 'Quản trị điều hướng 301, lịch sử route và hàng đợi revalidation',
        requiredPermission: Permission.REDIRECTS_MANAGE,
        phaseTag: 'CMS-10',
      },
      {
        id: 'users',
        label: 'Quản Lý Người Dùng',
        href: '/admin/users',
        icon: 'Users',
        description: 'Phân quyền quản trị viên, bác sĩ và biên tập viên',
        requiredPermission: Permission.USER_MANAGE,
        phaseTag: 'CMS-10',
      },
      {
        id: 'audit',
        label: 'Nhật Ký Kiểm Toán',
        href: '/admin/audit',
        icon: 'ShieldAlert',
        description: 'Truy vết toàn bộ lịch sử đăng nhập và biến động dữ liệu',
        requiredPermission: Permission.AUDIT_READ,
        phaseTag: 'CMS-10',
      },
    ],
  },
];

/**
 * Filters navigation groups and items based on the user's active permissions.
 * NOTE: This is for UX display only; server guards enforce actual authorization.
 */
export function getFilteredNavigation(
  userRoles: string[],
  userPermissions: string[]
): AdminNavGroup[] {
  return ADMIN_NAV_GROUPS.map((group) => {
    const accessibleItems = group.items.filter((item) => {
      if (!item.requiredPermission) return true;
      return hasPermission(userRoles, userPermissions, item.requiredPermission);
    });
    return {
      ...group,
      items: accessibleItems,
    };
  }).filter((group) => group.items.length > 0);
}
