import React from 'react';
import Link from 'next/link';
import { ShieldX, ArrowLeft, Lock } from 'lucide-react';

interface AdminForbiddenProps {
  requiredPermission: string;
  userRoles?: string[];
  moduleName?: string;
}

export function AdminForbidden({
  requiredPermission,
  userRoles = [],
  moduleName = 'Phân hệ này',
}: AdminForbiddenProps) {
  return (
    <div className="py-12 flex items-center justify-center">
      <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/90 border border-red-900/40 shadow-2xl text-center space-y-5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-950/80 border border-red-800/80 text-red-400">
          <ShieldX className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            403 — Không Có Quyền Truy Cập
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Bạn không có quyền hạn máy chủ cần thiết để xem hoặc tương tác với {moduleName}.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-left space-y-2">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              Quyền Hạn Yêu Cầu
            </span>
            <div className="flex items-center gap-1.5 text-xs font-mono text-red-400 mt-0.5">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>{requiredPermission}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              Vai Trò Hiện Tại
            </span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {userRoles.map((role) => (
                <span
                  key={role}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300 uppercase"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay Về Bảng Điều Khiển</span>
        </Link>
      </div>
    </div>
  );
}
