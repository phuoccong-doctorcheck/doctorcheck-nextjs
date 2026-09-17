import type { Metadata } from 'next';
import './globals.css';
import { CLINIC_INFO } from '@/lib/data/clinic';
import { doctorsData } from '@/lib/data/doctors';
import { packagesData } from '@/lib/data/packages';
import { MobileBottomBar } from '@/components/sites/doctorcheck-vn/root/MobileBottomBar';

export const metadata: Metadata = {
  title: 'Trang chủ - Doctor Check Tầm Soát Bệnh Để Sống Thọ Hơn',
  description: 'Trung tâm Tầm Soát Bệnh & Nội Soi Tiêu Hóa Không Đau tại TP.HCM. Bác sĩ Chuyên khoa II giàu kinh nghiệm, thiết bị hiện đại hàng đầu từ Nhật Bản. Giấy phép Sở Y Tế: 09789/HCM-GPHĐ.',
  keywords: [
    'Doctor Check',
    'Tầm soát bệnh',
    'Khám tổng quát',
    'Nội soi dạ dày',
    'Nội soi đại tràng',
    'Tầm soát ung thư',
    'Sống thọ',
    'Phòng khám uy tín Quận 10 TP.HCM'
  ],
  authors: [{ name: 'Doctor Check' }],
  metadataBase: new URL('https://doctorcheck.vn'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Doctor Check – Tầm Soát Bệnh Để Sống Thọ Hơn',
    description: 'Địa chỉ uy tín giúp bạn tầm soát sức khỏe toàn diện với trang thiết bị hiện đại, đội ngũ bác sĩ giàu kinh nghiệm.',
    url: 'https://doctorcheck.vn/',
    siteName: 'Doctor Check',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/sites/doctorcheck-vn/root/images/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'Phòng khám Doctor Check Tầm Soát Bệnh',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Doctor Check – Tầm Soát Bệnh Để Sống Thọ Hơn',
    description: 'Địa chỉ uy tín giúp bạn tầm soát sức khỏe toàn diện với trang thiết bị hiện đại, đội ngũ bác sĩ giàu kinh nghiệm.',
    images: ['/sites/doctorcheck-vn/root/images/og-image.webp'],
  },
};

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['MedicalClinic', 'MedicalOrganization', 'LocalBusiness'],
      '@id': `${CLINIC_INFO.websiteUrl}/#organization`,
      name: CLINIC_INFO.brandName,
      legalName: CLINIC_INFO.legalName,
      alternateName: ['Doctor Check – Tầm Soát Bệnh Để Sống Thọ Hơn', 'Phòng Khám Doctor Check', 'Trung Tâm Y Khoa Doctor Check'],
      url: CLINIC_INFO.websiteUrl,
      logo: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/700da2d8-a2da-4897-3616-647bc8083d00/w=281,h=281,fit=crop',
      description: 'Doctor Check là trung tâm đầu tiên tại TP.HCM chuyên sâu về tầm soát bệnh toàn diện và phát hiện sớm ung thư trong 60–90 phút với đội ngũ Bác Sĩ Chuyên Khoa II.',
      slogan: 'Tầm Soát Bệnh Để Sống Thọ Hơn',
      telephone: '+84-28-5678-9999',
      hasCredential: `Giấy phép hoạt động khám bệnh, chữa bệnh số ${CLINIC_INFO.license} do ${CLINIC_INFO.licenseIssuer} cấp`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: CLINIC_INFO.address.street,
        addressLocality: CLINIC_INFO.address.district,
        addressRegion: CLINIC_INFO.address.city,
        addressCountry: 'VN',
        postalCode: '700000',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: CLINIC_INFO.coordinates.latitude.toString(),
        longitude: CLINIC_INFO.coordinates.longitude.toString(),
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '07:30',
          closes: '17:00',
        },
      ],
      priceRange: '2.990.000đ – 11.500.000đ',
      currenciesAccepted: 'VND',
    },
    ...doctorsData.map((doc) => ({
      '@type': 'Physician',
      '@id': `${CLINIC_INFO.websiteUrl}/doi-ngu-bac-si-doctorcheck/#${doc.id}`,
      name: doc.name,
      jobTitle: doc.title,
      medicalSpecialty: doc.specialty,
      worksFor: {
        '@id': `${CLINIC_INFO.websiteUrl}/#organization`,
      },
      description: doc.description,
      image: `${CLINIC_INFO.websiteUrl}${doc.image}`,
      hasCredential: doc.cchn ? `Chứng chỉ hành nghề số ${doc.cchn}` : undefined,
    })),
    {
      '@type': 'OfferCatalog',
      name: 'Bảng Giá Gói Tầm Soát Bệnh – Doctor Check 2026',
      url: `${CLINIC_INFO.websiteUrl}/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/`,
      itemListElement: [
        ...packagesData.female.map((pkg) => ({
          '@type': 'Offer',
          name: pkg.name,
          price: pkg.price.toString(),
          priceCurrency: 'VND',
          eligibleGender: 'Female',
          url: pkg.url || CLINIC_INFO.websiteUrl,
        })),
        ...packagesData.male.map((pkg) => ({
          '@type': 'Offer',
          name: pkg.name,
          price: pkg.price.toString(),
          priceCurrency: 'VND',
          eligibleGender: 'Male',
          url: pkg.url || CLINIC_INFO.websiteUrl,
        })),
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className="min-h-screen bg-[#FDFDF6] text-[#2A2F38] font-sans antialiased">
        {children}
        <MobileBottomBar />
      </body>
    </html>
  );
}
