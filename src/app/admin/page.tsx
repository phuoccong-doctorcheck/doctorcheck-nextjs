import React from 'react';
import Link from 'next/link';
import { requireAdminAuth } from '@/lib/auth/admin-guard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ADMIN_NAV_GROUPS } from '@/components/admin/AdminNavConfig';
import { AdminIcon } from '@/components/admin/AdminIcons';
import { ShieldCheck, Database, KeyRound, ArrowRight, UserCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bảng Điều Khiển | DoctorCheck CMS',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardPage() {
  const user = await requireAdminAuth('/admin');

  // Extract all content and management modules (excluding overview)
  const modules = ADMIN_NAV_GROUPS.filter((g) => g.id !== 'overview').flatMap((g) => g.items);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <AdminPageHeader
        title="Bảng Điều Khiển CMS"
        description="Trung tâm điều hành và quản trị nội dung y khoa DoctorCheck.vn"
        iconName="LayoutDashboard"
        phaseBadge="CMS-2 Khung Giao Diện"
        statusBadge="Bảo Mật Máy Chủ: ĐÃ KÍCH HOẠT"
      />

      {/* System & Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Auth & User Identity */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Tài Khoản Đang Đăng Nhập
            </span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-base font-bold text-white truncate">{user.fullName}</div>
            <div className="text-xs text-slate-400 font-mono truncate">{user.email}</div>
          </div>
          <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800">
            {user.roles.map((role) => (
              <span
                key={role}
                className="px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-[10px] font-mono text-sky-300 uppercase"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Card 2: Database Status */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Cơ Sở Dữ Liệu
            </span>
            <Database className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="text-base font-bold text-white">PostgreSQL (LOCKED)</div>
            <div className="text-xs text-slate-400">8 phân hệ dữ liệu đạt chuẩn DB-FINAL</div>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-[11px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Kết nối máy chủ ổn định (Latency &lt; 40ms)</span>
          </div>
        </div>

        {/* Card 3: RBAC & Permissions */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quyền Hạn Khả Dụng
            </span>
            <KeyRound className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-base font-bold text-white">
              {user.permissions.length} Quyền Hoạt Động
            </div>
            <div className="text-xs text-slate-400">Kiểm soát trực tiếp trên máy chủ (Server-side)</div>
          </div>
          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Phân quyền theo chuẩn RBAC CMS-1</span>
          </div>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 tracking-tight flex items-center gap-2">
          <span>Danh Mục Phân Hệ Quản Trị CMS</span>
          <span className="text-xs font-normal text-slate-500">({modules.length} phân hệ)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group p-5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/50 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 group-hover:bg-sky-500/10 text-slate-300 group-hover:text-sky-400 flex items-center justify-center transition-colors">
                    <AdminIcon name={item.icon} className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 group-hover:border-sky-800 group-hover:text-sky-300">
                    {item.phaseTag}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-snug line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 group-hover:text-sky-400 transition-colors pt-2 border-t border-slate-800/60">
                <span>Truy cập phân hệ</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
