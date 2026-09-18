import React from 'react';
import Link from 'next/link';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Không Tìm Thấy Trang Quản Trị | DoctorCheck CMS',
  robots: { index: false, follow: false },
};

export default function AdminNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 text-slate-400">
          <HelpCircle className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            404 — Trang Quản Trị Không Tồn Tại
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Đường dẫn quản trị bạn yêu cầu không tồn tại trong hệ thống DoctorCheck CMS hoặc đã được di dời.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay Về Bảng Điều Khiển CMS</span>
        </Link>
      </div>
    </div>
  );
}
