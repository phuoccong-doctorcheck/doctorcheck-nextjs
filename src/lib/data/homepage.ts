export interface HeroBlockConfig {
  title: string;
  subtitle: string;
  desktopBanner: string;
  mobileBanner: string;
  ctaTarget: string;
}

export interface PainPointItem {
  num: number;
  title: string;
}

export interface PainPointsBlockConfig {
  title: string;
  subtitle: string;
  items: PainPointItem[];
}

export interface BenefitItemConfig {
  num: number;
  title: string;
  desc: string;
}

export interface BenefitsBlockConfig {
  title: string;
  moreUrl: string;
  moreLabel: string;
  bannerImage: string;
  bannerVideoId: string;
  items: BenefitItemConfig[];
}

export interface CancerScreeningCardConfig {
  id: string;
  title: string;
  price: string;
  slug: string;
}

export interface CancerScreeningBlockConfig {
  title: string;
  description: string;
  ctaUrl: string;
  ctaLabel: string;
  featuredCards: CancerScreeningCardConfig[];
}

export interface BannerCtaBlockConfig {
  brand: string;
  title: string;
  workingHoursTitle: string;
  workingHoursWeekday: string;
  workingHoursSunday: string;
  buttonText: string;
  buttonTarget: string;
  desktopImage: string;
  mobileImage: string;
}

export interface SectionsMetaConfig {
  doctorsHeader: {
    title: string;
    subtitle: string;
    ctaUrl: string;
    ctaLabel: string;
  };
  equipmentHeader: {
    title: string;
    description: string;
  };
  pricingHeader: {
    title: string;
    maleMoreUrl: string;
    femaleMoreUrl: string;
  };
  customerStoriesHeader: {
    title: string;
    subtitle: string;
    viewAllUrl: string;
  };
  videoTestimonialsHeader: {
    titleDesktop: string;
    titleMobile: string;
  };
  faqHeader: {
    title: string;
  };
  bookingHeader: {
    title: string;
    formTitle: string;
  };
}

export interface HomepagePackageCard {
  id: string;
  slug: string;
  name: string;
  price: string;
  sub: string;
  image: string;
}

export interface PricingBlockConfig {
  malePackages: HomepagePackageCard[];
  femalePackages: HomepagePackageCard[];
}

export interface HomepageData {
  hero: HeroBlockConfig;
  painPoints: PainPointsBlockConfig;
  benefits: BenefitsBlockConfig;
  cancerScreening: CancerScreeningBlockConfig;
  bannerCta: BannerCtaBlockConfig;
  sectionsMeta: SectionsMetaConfig;
  pricing: PricingBlockConfig;
}

export const staticHomepageData: HomepageData = {
  hero: {
    title: 'Doctor Check – Tầm Soát Bệnh Để Sống Thọ Hơn',
    subtitle: '“Tầm soát bệnh chính xác mỗi năm công thức Sống Thọ dành riêng cho bạn” - Doctor Check',
    desktopBanner: '/sites/doctorcheck-vn/root/images/banner-desktop-master.webp',
    mobileBanner: '/sites/doctorcheck-vn/root/images/banner-mobile-master.webp',
    ctaTarget: '#tu-van',
  },
  painPoints: {
    title: 'Tầm Soát Bệnh – Một Khởi Đầu Thông Thái Cho Năm Mới',
    subtitle: 'Gỡ Bỏ 4 “Nỗi Lo” Khiến Bạn Chần Chừ Trước Khi Quyết Định Đi Tầm Soát Bệnh',
    items: [
      { num: 1, title: 'Kết quả khám tổng quát không chính xác' },
      { num: 2, title: 'Bác sĩ không dành nhiều thời gian tư vấn cho bạn' },
      { num: 3, title: 'Mệt mỏi vì phải bốc số, chờ đợi quá lâu' },
      { num: 4, title: 'Phát sinh các chi phí không cần thiết' },
    ],
  },
  benefits: {
    title: '5 quyền lợi bạn nhận được khi tầm soát bệnh tại Doctor Check:',
    moreUrl: '/ve-chung-toi/',
    moreLabel: 'Xem thêm về Doctor Check',
    bannerImage: '/sites/doctorcheck-vn/root/images/benefits-banner-master.webp',
    bannerVideoId: 'VnL1iSrq7CY',
    items: [
      {
        num: 1,
        title: '1. Trung Tâm Đầu Tiên Chuyên Sâu Tầm Soát Bệnh',
        desc: 'Hằng năm, Doctor Check sẽ đồng hành cùng bạn trong việc phát hiện sớm các vấn đề tiềm ẩn, theo dõi và ngăn ngừa kịp thời để giúp bạn sống khoẻ & sống thọ hơn.',
      },
      {
        num: 2,
        title: '2. Chẩn Đoán Dựa Vào Y Học Chứng Cứ 100%',
        desc: 'Doctor Check đầu tư hệ thống xét nghiệm, chẩn đoán hình ảnh, nội soi & thăm dò chức năng theo tiêu chuẩn hàng đầu thế giới. Vì vậy, bạn sẽ hoàn toàn yên tâm khi nhận được kết quả chẩn đoán chính xác về tình trạng sức khoẻ của mình.',
      },
      {
        num: 3,
        title: '3. Quy Trình Tầm Soát Bệnh Chỉ Trong 60-90 Phút',
        desc: 'Doctor Check hiểu rằng việc chờ đợi là rất mệt mỏi, vì vậy Doctor Check cải tiến & thiết kế quy trình tầm soát bệnh một cách khoa học nhất để tiết kiệm tối đa thời gian cho bạn.',
      },
      {
        num: 4,
        title: '4. Kết Nối Bạn Với Chuyên Gia Bác Sĩ Hàng Đầu',
        desc: 'Khi tầm soát ra bệnh, Doctor Check sẽ kết nối bạn với chuyên gia hàng đầu về bệnh lý bạn đang mắc phải ở các bệnh viện lớn để việc điều trị đạt được hiệu quả cao nhất.',
      },
      {
        num: 5,
        title: '5. Tư Vấn Cách Để Bạn Sống Thọ Đến 85 Tuổi Như Người Nhật Bản',
        desc: 'Dựa trên kết quả tầm soát, bác sĩ Doctor Check sẽ đưa ra lời khuyên về ăn uống, nghỉ ngơi, tập luyện, … để giúp bạn trở thành bác sĩ của chính mình.',
      },
    ],
  },
  cancerScreening: {
    title: 'Thế giới khuyến cáo tầm soát ung thư định kỳ',
    description: '80% Khách Hàng sau khi đăng ký tầm soát bệnh tại Doctor Check lựa chọn sử dụng thêm các dịch vụ tầm soát, bao gồm tầm soát ung thư thực quản – dạ dày – tá tràng, tầm soát ung thư đại – trực tràng, tầm soát chuyên sâu bệnh lý gan hay tầm soát yếu tố nguy cơ đột quỵ.',
    ctaUrl: '/tam-soat-ung-thu/',
    ctaLabel: 'Gói tầm soát ung thư khác',
    featuredCards: [
      {
        id: 'stomach',
        title: 'Tầm soát ung thư thực quản – dạ dày – tá tràng',
        price: '3.100.000đ',
        slug: '/tam-soat-ung-thu-da-day/',
      },
      {
        id: 'colon',
        title: 'Tầm soát ung thư đại tràng – trực tràng',
        price: '4.100.000đ',
        slug: '/tam-soat-ung-thu-dai-trang/',
      },
    ],
  },
  bannerCta: {
    brand: 'Doctor Check',
    title: 'Tầm Soát Bệnh Để Sống Thọ Hơn',
    workingHoursTitle: 'Thời gian làm việc',
    workingHoursWeekday: 'Thứ 2 – Thứ 7: 6h – 15h',
    workingHoursSunday: 'Chủ nhật: 7h – 12h',
    buttonText: 'Đặt hẹn ngay',
    buttonTarget: '#tu-van',
    desktopImage: '/sites/doctorcheck-vn/root/images/banner-cta-desktop.webp',
    mobileImage: '/sites/doctorcheck-vn/root/images/banner-cta-mobile.webp',
  },
  sectionsMeta: {
    doctorsHeader: {
      title: 'Đội Ngũ Bác Sĩ Giàu Kinh Nghiệm, Đến Từ Các Bệnh Viện Lớn Tại TP.HCM',
      subtitle: 'Đội ngũ Bác sĩ sẽ dành nhiều thời gian tư vấn cho bạn với mong muốn giúp bạn trở thành bác sĩ của chính mình.',
      ctaUrl: '/doi-ngu-bac-si/',
      ctaLabel: 'Tìm hiểu thêm về đội ngũ bác sĩ',
    },
    equipmentHeader: {
      title: 'Khám Phá Sức Mạnh Từ Trang Thiết Bị Máy Móc Hiện Đại Tại Doctor Check',
      description: 'Doctor Check muốn mang đến cho bạn dịch vụ tầm soát không đau, nhanh chóng và khả năng chẩn đoán ngay từ giai đoạn sớm, phát hiện các bất thường trong cơ thể. Nên đã đầu tư toàn bộ trang bị hệ thống máy móc đạt chuẩn quốc tế.',
    },
    pricingHeader: {
      title: 'Bảng Giá Các Gói Khám Tổng Quát tại Doctor Check',
      maleMoreUrl: '/goi-kham-danh-cho-nam/',
      femaleMoreUrl: '/goi-kham-danh-cho-nu/',
    },
    customerStoriesHeader: {
      title: 'Hơn 10.000+ Khách hàng đã trải nghiệm hài lòng',
      subtitle: 'Dịch vụ tầm soát bệnh tại Doctor Check Nhanh chóng – Minh bạch – Hiệu quả – Thoải mái tối đa.',
      viewAllUrl: '/cau-chuyen-khach-hang/',
    },
    videoTestimonialsHeader: {
      titleDesktop: 'Kiểm Chứng Ngay Qua\nNhững Chia Sẻ Từ Khách Hàng',
      titleMobile: 'Mời bạn lắng nghe những chia sẻ từ những khách hàng đã trải nghiệm',
    },
    faqHeader: {
      title: 'Câu hỏi thường gặp',
    },
    bookingHeader: {
      title: 'Tầm Soát Bệnh Để Sống Khỏe &\nSống Thọ Hơn',
      formTitle: 'Doctor Check sẵn sàng tư vấn, giúp khách hàng giải quyết nỗi lo về sức khỏe!',
    },
  },
  pricing: {
    malePackages: [
      {
        id: 'khuyen-cao-nam',
        slug: '/goi-khuyen-cao-danh-cho-nam/',
        name: 'Gói Khuyến Cáo',
        price: '3,000,000đ',
        sub: '21 Nhóm bệnh & 2 loại ung thư',
        image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/e4515038-e50c-45f6-f35d-8255929a6f00/w=625,h=400',
      },
      {
        id: 'chuyen-sau-nam',
        slug: '/goi-chuyen-sau-danh-cho-nam/',
        name: 'Gói Chuyên Sâu',
        price: '5,000,000đ',
        sub: '24 Nhóm bệnh & 5 loại ung thư',
        image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/9e90b45a-e67c-4570-0afe-de7f4b40a700/w=625,h=400',
      },
      {
        id: 'song-tho-nam',
        slug: '/goi-song-tho-danh-cho-nam/',
        name: 'Gói Sống Thọ',
        price: '11,500,000đ',
        sub: '29 Nhóm bệnh & 9 loại ung thư',
        image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/887ac26c-5b5c-4732-f2fe-37f2b4a4e200/w=625,h=400',
      },
    ],
    femalePackages: [
      {
        id: 'khuyen-cao-nu',
        slug: '/goi-khuyen-cao-danh-cho-nu/',
        name: 'Gói Khuyến Cáo',
        price: '3,000,000đ',
        sub: '21 Nhóm bệnh & 2 loại ung thư',
        image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/f95b8991-eaad-4b0d-0e10-363256915b00/w=625,h=400',
      },
      {
        id: 'chuyen-sau-nu',
        slug: '/goi-tam-soat-chuyen-sau-danh-cho-nu/',
        name: 'Gói Chuyên Sâu',
        price: '6,000,000đ',
        sub: '26 Nhóm bệnh & 4 loại ung thư',
        image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/ca8d1686-7b25-4e2b-b648-376b7cc69800/w=625,h=400',
      },
      {
        id: 'song-tho-nu',
        slug: '/goi-kham-song-tho-danh-cho-nu/',
        name: 'Gói Sống Thọ',
        price: '14,500,000đ',
        sub: '31 Nhóm bệnh & 10 loại ung thư',
        image: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/f298c0dc-622c-4fc2-8f74-e4d83e1d5300/w=625,h=400',
      },
    ],
  },
};
