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
    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-6 text-xs text-[#64748B] py-3.5 border-y border-[#DDE4EA] my-4 font-sans">
      {formattedDate && (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#005570] flex-shrink-0" />
          <span>Ngày đăng: <strong className="text-[#2A2F38] font-semibold">{formattedDate}</strong></span>
        </div>
      )}

      {isUpdated && (
        <div className="flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-[#005570] flex-shrink-0" />
          <span>Cập nhật: <strong className="text-[#2A2F38] font-semibold">{formattedModified}</strong></span>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <UserCheck className="w-3.5 h-3.5 text-[#005570] flex-shrink-0" />
        <span className="text-[#2A2F38]">{authorTitle}{authorName && authorName !== 'BSCKII Doctor Check' && authorName !== 'admin' ? `: ${authorName}` : ''}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-[#005570] flex-shrink-0" />
        <span className="text-[#005570] font-semibold">100% Y học chứng cứ</span>
      </div>
    </div>
  );
}
