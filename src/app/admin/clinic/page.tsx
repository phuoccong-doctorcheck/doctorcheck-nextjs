import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { guardAdminModule } from '@/lib/auth/admin-guard';
import { Permission } from '@/lib/auth/rbac';
import { AdminForbidden } from '@/components/admin/AdminForbidden';
import { clinicRepository, clinicalTrustRepository } from '@/repositories';
import { revisionRepository } from '@/repositories/postgres/postgres-revision.repository';
import { ContentType } from '@/lib/workflow/types';
import { ClinicProfileEditorForm } from '@/components/admin/clinic/ClinicProfileEditorForm';
import { EquipmentListTable } from '@/components/admin/clinic/EquipmentListTable';
import { FaqListTable } from '@/components/admin/clinic/FaqListTable';
import { TestimonialsListTable } from '@/components/admin/clinic/TestimonialsListTable';
import {
  Building2,
  Stethoscope,
  HelpCircle,
  Video,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hồ Sơ Phòng Khám & Độ Tin Cậy Lâm Sàng | DoctorCheck CMS',
  robots: { index: false, follow: false },
};

interface AdminClinicPageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function AdminClinicPage({ searchParams }: AdminClinicPageProps) {
  const guard = await guardAdminModule(Permission.CLINIC_EDIT, '/admin/clinic');

  if (!guard.isAuthorized) {
    return (
      <AdminForbidden
        requiredPermission={Permission.CLINIC_EDIT}
        userRoles={guard.user.roles}
        moduleName="Hồ sơ Phòng khám & Độ tin cậy"
      />
    );
  }

  const params = await searchParams;
  const currentTab = params.tab || 'profile';

  // Load baseline clinical data
  const [
    clinicInfo,
    latestClinicRevision,
    equipmentList,
    faqsList,
    videoList,
    storiesList,
  ] = await Promise.all([
    clinicRepository.getAdminClinicInfo(),
    revisionRepository.getLatestByEntity(ContentType.CLINIC, 'default'),
    clinicalTrustRepository.getEquipmentAdminList(),
    clinicalTrustRepository.getFaqsAdminList(),
    clinicalTrustRepository.getVideoTestimonialsAdminList(),
    clinicalTrustRepository.getCustomerStoriesAdminList(),
  ]);

  const allTestimonials = [...videoList, ...storiesList];

  const tabs = [
    {
      id: 'profile',
      label: 'Hồ Sơ & Pháp Lý',
      icon: Building2,
      count: null,
      description: 'Giấy phép 09789/HCM-GPHĐ, hotline, địa chỉ và giờ làm việc',
    },
    {
      id: 'equipment',
      label: 'Trang Thiết Bị',
      icon: Stethoscope,
      count: equipmentList.length,
      description: 'Hệ thống máy nội soi Olympus X1, Fujifilm 7000, Siêu âm...',
    },
    {
      id: 'faqs',
      label: 'Hỏi Đáp Y Khoa',
      icon: HelpCircle,
      count: faqsList.length,
      description: 'Câu hỏi thường gặp và giải đáp quy trình nội soi',
    },
    {
      id: 'videos',
      label: 'Video Cảm Nhận',
      icon: Video,
      count: videoList.length,
      description: 'Video phỏng vấn trải nghiệm thực tế từ bệnh nhân',
    },
    {
      id: 'stories',
      label: 'Câu Chuyện Khách Hàng',
      icon: BookOpen,
      count: storiesList.length,
      description: 'Trải nghiệm tầm soát và chia sẻ hành trình điều trị',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Building2 className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            Hồ Sơ Phòng Khám & Độ Tin Cậy Lâm Sàng
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản trị thông tin định danh y tế, chứng thực năng lực lâm sàng, hệ thống trang thiết bị nội soi và phản hồi người bệnh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            CMS-8 Clinical Trust
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/admin/clinic?tab=${tab.id}`}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {currentTab === 'profile' && clinicInfo && (
          <ClinicProfileEditorForm
            initialData={{
              ...clinicInfo,
              workingHours: (clinicInfo.workingHours as {
                full?: string;
                short?: string;
              }) || undefined,
            }}
            latestDraftRevision={latestClinicRevision}
            userPermissions={guard.user.permissions}
          />
        )}

        {currentTab === 'equipment' && (
          <div className="space-y-4">
            <EquipmentListTable
              initialItems={equipmentList}
              userPermissions={guard.user.permissions}
            />
          </div>
        )}

        {currentTab === 'faqs' && (
          <div className="space-y-4">
            <FaqListTable
              initialItems={faqsList}
              userPermissions={guard.user.permissions}
            />
          </div>
        )}

        {currentTab === 'videos' && (
          <div className="space-y-4">
            <TestimonialsListTable
              initialItems={allTestimonials}
              activeType="video"
              userPermissions={guard.user.permissions}
            />
          </div>
        )}

        {currentTab === 'stories' && (
          <div className="space-y-4">
            <TestimonialsListTable
              initialItems={allTestimonials}
              activeType="customer_story"
              userPermissions={guard.user.permissions}
            />
          </div>
        )}
      </div>
    </div>
  );
}
