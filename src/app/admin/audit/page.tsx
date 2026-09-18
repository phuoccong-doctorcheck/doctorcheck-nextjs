import React from 'react';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { AuditLogViewer } from '@/components/admin/audit/AuditLogViewer';
import { auditRepository } from '@/repositories';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nhật Ký Kiểm Toán | DoctorCheck CMS',
  robots: { index: false, follow: false },
};

export default async function AdminAuditPage() {
  const guard = await guardAdminModule(Permission.AUDIT_READ, '/admin/audit');

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.AUDIT_READ}
        userRoles={guard.user.roles}
        moduleName="Nhật ký Kiểm toán"
      />
    );
  }

  // Fetch initial bounded list of audit logs
  const initialResult = await auditRepository.listAuditLogs({ page: 1, limit: 20 });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Nhật Ký Kiểm Toán & An Ninh (Audit Trail)"
        description="Truy vết toàn bộ hoạt động đăng nhập, phân quyền, biến động nội dung và thao tác xuất bản"
        iconName="ShieldAlert"
        phaseBadge="CMS-11"
        statusBadge="PostgreSQL: audit_logs"
      />

      <AuditLogViewer
        initialLogs={initialResult.logs}
        initialTotal={initialResult.total}
        initialPage={initialResult.page}
        initialLimit={initialResult.limit}
        initialTotalPages={initialResult.totalPages}
      />
    </div>
  );
}

