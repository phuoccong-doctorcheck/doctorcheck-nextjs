'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error internally
    console.error('⚠️ Admin Interface Runtime Error:', error.message);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900 border border-red-900/50 shadow-2xl text-center space-y-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-950/80 border border-red-800 text-red-400">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Đã Xảy Ra Lỗi Trong Hệ Thống Quản Trị
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Hệ thống đã tự động ghi nhận sự cố này. Vui lòng thử tải lại hoặc quay lại trang điều khiển chính.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-slate-500 mt-2">
              Mã tham chiếu lỗi: {error.digest}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Thử Lại</span>
          </button>

          <Link
            href="/admin"
            className="flex-1 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Trang Chủ CMS</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
