import React from 'react';
import { Calendar, RefreshCw, UserCheck, ShieldCheck } from 'lucide-react';

interface ArticleMetadataProps {
  date: string;
  modified?: string;
  authorName?: string;
  authorTitle?: string;
}

export function ArticleMetadata({
  date,
  modified,
  authorName = 'BSCKII Doctor Check',
  authorTitle = 'Tham vấn Y khoa: Đội ngũ Bác sĩ CKII Doctor Check'
}: ArticleMetadataProps) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : '';

  const formattedModified = modified
    ? new Date(modified).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : '';

  const isUpdated = formattedModified && formattedModified !== formattedDate;

  return (
    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-6 text-xs text-gray-500 py-3 border-y border-gray-100 my-4">
      {formattedDate && (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#00A896] flex-shrink-0" />
          <span>Ngày đăng: <strong className="text-gray-700">{formattedDate}</strong></span>
        </div>
      )}

      {isUpdated && (
        <div className="flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-[#00A896] flex-shrink-0" />
          <span>Cập nhật: <strong className="text-gray-700">{formattedModified}</strong></span>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <UserCheck className="w-3.5 h-3.5 text-[#00A896] flex-shrink-0" />
        <span>{authorTitle}{authorName && authorName !== 'BSCKII Doctor Check' ? `: ${authorName}` : ''}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-[#00A896] flex-shrink-0" />
        <span className="text-[#00A896] font-semibold">100% Y học chứng cứ</span>
      </div>
    </div>
  );
}
