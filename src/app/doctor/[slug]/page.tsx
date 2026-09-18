import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { doctorRepository } from '@/repositories';
import { DoctorTemplate } from '@/components/templates/DoctorTemplate';
import { generateDoctorJsonLd } from '@/lib/seo/structured-data';

interface DoctorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const doctors = await doctorRepository.getAll();
  return doctors.map((doc) => ({
    slug: doc.id,
  }));
}

export async function generateMetadata({ params }: DoctorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await doctorRepository.getBySlug(slug);

  if (!doctor) {
    return {
      title: 'Không Tìm Thấy Bác Sĩ - Doctor Check',
      robots: { index: false, follow: false },
    };
  }

  const title = `${doctor.name} – ${doctor.title} ${doctor.specialty} | Doctor Check`;
  const description = `${doctor.name}, ${doctor.title} với hơn ${doctor.experienceYears} năm kinh nghiệm chuyên khoa ${doctor.specialty}. Giấy phép CCHN: ${doctor.cchn}. Đặt lịch khám tại Doctor Check.`;
  const canonicalUrl = `https://doctorcheck.vn/doctor/${doctor.id}/`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Doctor Check',
      locale: 'vi_VN',
      type: 'profile',
      images: [doctor.image],
    },
  };
}

export default async function DoctorProfilePage({ params }: DoctorPageProps) {
  const { slug } = await params;
  const doctor = await doctorRepository.getBySlug(slug);

  if (!doctor) {
    notFound();
  }

  const jsonLd = generateDoctorJsonLd(doctor);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DoctorTemplate doctor={doctor} />
    </>
  );
}
