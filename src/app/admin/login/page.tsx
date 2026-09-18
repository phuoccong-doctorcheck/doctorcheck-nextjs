import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/services/auth.service';
import { LoginForm } from './LoginForm';
import { ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng Nhập CMS | DoctorCheck Vietnam',
  robots: {
    index: false,
    follow: false,
  },
};

interface LoginPageProps {
  searchParams: Promise<{ returnTo?: string }>;
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect('/admin/');
  }

  const { returnTo } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">DoctorCheck CMS</h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Hệ thống Quản trị Nội dung Y khoa Nội bộ
          </p>
        </div>

        <LoginForm returnTo={returnTo} />

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500">
            Hệ thống bảo mật nội bộ. Mọi hoạt động truy cập đều được ghi nhật ký kiểm toán.
          </p>
        </div>
      </div>
    </div>
  );
}
