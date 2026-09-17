import { TestimonialVideo, NavItem } from '@/types/doctorcheck';

export const videoTestimonialsData: TestimonialVideo[] = [
  {
    id: 'vid-1',
    title: 'Có người nhà bị ung thư, cô Liên quyết định tầm soát sớm',
    patientName: 'Cô Bích Liên',
    patientAge: 58,
    videoId: 'A4BCCgKqwVI',
    thumbnail: 'https://img.youtube.com/vi/A4BCCgKqwVI/hqdefault.jpg',
    quote: 'Nội soi ở Doctor Check rất êm ái, ngủ một giấc dậy là xong, không đau đớn khó chịu gì cả. Bác sĩ tư vấn rất tận tâm, chỉ rõ từng vết nhỏ trong dạ dày.',
    dataClassification: 'VERIFIED_PRODUCTION',
  },
  {
    id: 'vid-2',
    title: 'Bị tiểu đường 26 năm, chú Hồng Anh kiểm tra sức khỏe định kỳ',
    patientName: 'Chú Hồng Anh',
    patientAge: 64,
    videoId: '80iE-7mnZGM',
    thumbnail: 'https://img.youtube.com/vi/80iE-7mnZGM/hqdefault.jpg',
    quote: 'Tôi bất ngờ vì quy trình ở đây nhanh như vậy, không phải bốc số chờ đợi từ sáng sớm như các bệnh viện lớn. Mọi thứ chỉn chu và sạch sẽ như khách sạn.',
    dataClassification: 'VERIFIED_PRODUCTION',
  },
  {
    id: 'vid-3',
    title: 'Gần 1 tháng ăn không ngon ngủ không yên, tôi đi tầm soát và thở phào',
    patientName: 'Anh Minh Trí',
    patientAge: 42,
    videoId: 'BpDdHblLz98',
    thumbnail: 'https://img.youtube.com/vi/BpDdHblLz98/hqdefault.jpg',
    quote: 'Sau khi nội soi phát hiện polyp đại tràng và được bác sĩ cắt bỏ ngay trong lúc nội soi, tôi cảm thấy như trút được gánh nặng nghìn cân.',
    dataClassification: 'VERIFIED_PRODUCTION',
  }
];

export const navigationData: NavItem[] = [
  {
    title: 'Tầm Soát Bệnh',
    href: '/kham-tong-quat',
    children: [
      { title: 'Tổng quan tầm soát bệnh', href: '/kham-tong-quat', description: 'Quy trình tầm soát bệnh 60-90 phút' },
      { title: 'Lợi ích khi tầm soát tại Doctor Check', href: '/loi-ich-khi-kham-tong-quat-tai-doctor-check', description: 'Y học chứng cứ 100%, không chờ đợi' },
      { title: 'Bảng giá dịch vụ 2026', href: '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check', description: 'Minh bạch chi phí niêm yết' }
    ]
  },
  {
    title: 'Gói Khám Nữ',
    href: '/goi-tam-soat-nu',
    children: [
      { title: 'Gói Khuyến Cáo Nữ (3.000.000đ)', href: '/goi-khuyen-cao-danh-cho-nu', description: '21 nhóm bệnh & 2 ung thư' },
      { title: 'Gói Chuyên Sâu Nữ (5.000.000đ)', href: '/goi-tam-soat-chuyen-sau-danh-cho-nu', description: '26 nhóm bệnh & 4 ung thư' },
      { title: 'Gói Sống Thọ Nữ (11.500.000đ)', href: '/goi-kham-song-tho-danh-cho-nu', description: '31 nhóm bệnh & 10 ung thư' },
      { title: 'So Sánh 3 Gói Khám Nữ', href: '/so-sanh-3-goi-kham-nu', description: 'Bảng so sánh chi tiết' }
    ]
  },
  {
    title: 'Gói Khám Nam',
    href: '/goi-tam-soat-nam',
    children: [
      { title: 'Gói Khuyến Cáo Nam (2.990.000đ)', href: '/goi-khuyen-cao-danh-cho-nam', description: '21 nhóm bệnh & 2 ung thư' },
      { title: 'Gói Chuyên Sâu Nam (5.000.000đ)', href: '/goi-chuyen-sau-danh-cho-nam', description: '24 nhóm bệnh & 4 ung thư' },
      { title: 'Gói Sống Thọ Nam (11.500.000đ)', href: '/goi-song-tho-danh-cho-nam', description: '29 nhóm bệnh & 9 ung thư' },
      { title: 'So Sánh 3 Gói Khám Nam', href: '/so-sanh-3-goi-kham-nam', description: 'Bảng so sánh chi tiết' }
    ]
  },
  {
    title: 'Trung Tâm Nội Soi',
    href: '/trung-tam-noi-soi-tieu-hoa-doctor-check',
    children: [
      { title: '10 Tiêu Chuẩn Vàng Nội Soi', href: '/trung-tam-noi-soi-tieu-hoa-doctor-check/10-tieu-chuan-vang', description: 'An toàn, vô trùng, không đau' },
      { title: 'Nội Soi Dạ Dày Tiền Mê', href: '/noi-soi-da-day', description: 'Hệ thống Olympus EVIS-X1 Nhật Bản' },
      { title: 'Nội Soi Đại Tràng Tiền Mê', href: '/noi-soi-dai-trang', description: 'Phát hiện & cắt polyp tiền ung thư' },
      { title: 'Tầm Soát Ung Thư Tiêu Hóa', href: '/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-da-day-tai-doctor-check', description: 'Phát hiện sớm từ tế bào' }
    ]
  },
  {
    title: 'Đội Ngũ Bác Sĩ',
    href: '/doi-ngu-bac-si-doctorcheck'
  },
  {
    title: 'Khám Doanh Nghiệp',
    href: '/kham-suc-khoe-doanh-nghiep'
  },
  {
    title: 'Liên Hệ',
    href: '/lien-he'
  }
];
