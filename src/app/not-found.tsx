import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Không Tìm Thấy Trang (404) | DoctorCheck',
  robots: { index: false, follow: false },
};

export default function PublicNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6">
        <div className="text-6xl font-extrabold text-primary tracking-tight">404</div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Không Tìm Thấy Trang Yêu Cầu
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Địa chỉ liên kết bạn đang truy cập có thể đã được thay đổi, di chuyển hoặc không còn tồn tại trên hệ thống DoctorCheck.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors shadow-xs"
          >
            Quay Về Trang Chủ
          </Link>
          <Link
            href="/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/"
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-colors"
          >
            Xem Bảng Giá Khám
          </Link>
        </div>
      </div>
    </div>
  );
}
