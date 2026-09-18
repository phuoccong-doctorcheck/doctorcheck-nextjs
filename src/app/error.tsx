'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error internally without exposing to user
    console.error('⚠️ Public Application Error:', error.message);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
          DC
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Đã Xảy Ra Sự Cố Kết Nối
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Hệ thống đang gặp gián đoạn tạm thời. Vui lòng thử tải lại trang hoặc quay về trang chủ DoctorCheck.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-slate-400 mt-2">
              Mã tham chiếu: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 py-3 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors shadow-xs"
          >
            Thử Lại
          </button>

          <Link
            href="/"
            className="flex-1 py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-colors text-center"
          >
            Về Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
