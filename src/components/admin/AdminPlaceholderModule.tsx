import React from 'react';
import { Database, Lock, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

interface AdminPlaceholderModuleProps {
  moduleTitle: string;
  moduleCode: string;
  targetPhase: string;
  databaseTable: string;
  scopeDescription: string;
  plannedFeatures: string[];
  userPermissions: string[];
  requiredPermission: string;
}

export function AdminPlaceholderModule({
  moduleTitle,
  moduleCode,
  targetPhase,
  databaseTable,
  scopeDescription,
  plannedFeatures,
  requiredPermission,
}: AdminPlaceholderModuleProps) {
  return (
    <div className="space-y-6">
      {/* Module Overview Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300 uppercase">
              {targetPhase} Lập Trình
            </span>
            <h2 className="text-base font-bold text-white mt-1">
              Phân Hệ {moduleTitle} ({moduleCode})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quyền Truy Cập: ĐÃ XÁC THỰC</span>
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {scopeDescription}
        </p>

        {/* Database & Security State */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>Bảng Cơ Sở Dữ Liệu</span>
            </div>
            <p className="text-xs font-mono text-slate-200 font-semibold">{databaseTable}</p>
            <p className="text-[10px] text-emerald-400">PostgreSQL (LOCKED DB-FINAL)</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Quyền Máy Chủ (RBAC)</span>
            </div>
            <p className="text-xs font-mono text-amber-300 font-semibold">{requiredPermission}</p>
            <p className="text-[10px] text-slate-400">Đã kiểm tra máy chủ</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Giai Đoạn Triển Khai</span>
            </div>
            <p className="text-xs font-mono text-indigo-300 font-semibold">{targetPhase}</p>
            <p className="text-[10px] text-slate-400">CMS-2 thiết lập khung cấu trúc</p>
          </div>
        </div>
      </div>

      {/* Planned Feature Scope */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/60 space-y-4">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>Tính Năng Sẽ Được Xây Dựng Tại {targetPhase}</span>
        </h3>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-slate-300">
          {plannedFeatures.map((feat, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950/40 border border-slate-800/40"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
              <span className="leading-snug">{feat}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
