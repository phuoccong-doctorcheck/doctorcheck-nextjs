import React from 'react';
import { Stethoscope, AlertCircle, Info, ShieldCheck } from 'lucide-react';

interface ContentCalloutProps {
  type?: 'info' | 'warning' | 'evidence' | 'doctor';
  title?: string;
  children: React.ReactNode;
}

export function ContentCallout({
  type = 'evidence',
  title,
  children
}: ContentCalloutProps) {
  const styles = {
    info: {
      border: 'border-[#00475B]',
      bg: 'bg-[#EEF7FA]',
      titleColor: 'text-[#00475B]',
      icon: <Info className="w-5 h-5 text-[#00475B]" />,
      defaultTitle: 'Thông Tin Y Khoa'
    },
    warning: {
      border: 'border-[#FFB500]',
      bg: 'bg-[#FFFBF0]',
      titleColor: 'text-[#D97706]',
      icon: <AlertCircle className="w-5 h-5 text-[#D97706]" />,
      defaultTitle: 'Lưu Ý Quan Trọng'
    },
    evidence: {
      border: 'border-[#00A896]',
      bg: 'bg-[#EEF7FA]',
      titleColor: 'text-[#00475B]',
      icon: <ShieldCheck className="w-5 h-5 text-[#00A896]" />,
      defaultTitle: 'Y Học Chứng Cứ'
    },
    doctor: {
      border: 'border-[#00A896]',
      bg: 'bg-[#F0FDF4]',
      titleColor: 'text-[#00475B]',
      icon: <Stethoscope className="w-5 h-5 text-[#00A896]" />,
      defaultTitle: 'Lời Khuyên Của Bác Sĩ Chuyên Khoa II'
    }
  }[type];

  return (
    <aside
      className={`border-l-4 ${styles.border} ${styles.bg} p-4 sm:p-6 rounded-r-2xl my-6 shadow-xs`}
      aria-label={title || styles.defaultTitle}
    >
      <div className="flex items-center gap-2 mb-2">
        {styles.icon}
        <h4 className={`font-bold ${styles.titleColor} text-sm sm:text-base`}>
          {title || styles.defaultTitle}
        </h4>
      </div>
      <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-2">
        {children}
      </div>
    </aside>
  );
}
