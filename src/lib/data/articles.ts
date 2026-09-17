import { MedicalArticleSummary } from '@/types/doctorcheck';

/**
 * AUTHENTIC DOCTORCHECK MEDICAL ARTICLES CATALOG (108 Verified Articles)
 *
 * Sourced directly from DoctorCheck WordPress REST API (/wp/v2/posts) and post-sitemap.xml.
 *
 * STATUS:
 * - Metadata (id, slug, title, date, categories, link): PRODUCTION_VERIFIED (108/108)
 * - Full Article Body Content (HTML): BLOCKED (Pending CMS Content Import Pipeline in Phase 2)
 *
 * In accordance with Phase 1 migration protocol:
 * - NO AI rewriting of medical texts
 * - NO synthetic replacement articles
 * - NO medical summaries
 */

export const ARTICLE_IMPORT_STATUS = {
  totalTarget: 108,
  metadataCataloged: 108,
  contentBodyImport: 'BLOCKED_PENDING_CMS_IMPORT',
  apiEndpoint: 'https://www.doctorcheck.vn/wp-json/wp/v2/posts',
} as const;

export const articlesCatalog: MedicalArticleSummary[] = [
  {
    "id": 5637,
    "slug": "tu-kiem-dinh-quoc-te-den-thuc-hanh-hang-ngay-trien-khai-aaci-trong-mo-hinh-phong-kham-tai-doctor-check",
    "title": "TỪ KIỂM ĐỊNH QUỐC TẾ ĐẾN THỰC HÀNH HÀNG NGÀY: TRIỂN KHAI AACI TRONG MÔ HÌNH PHÒNG KHÁM TẠI DOCTOR CHECK",
    "date": "2026-03-24T14:02:58",
    "modified": "2026-03-24T15:30:36",
    "categories": [
      49
    ],
    "featuredMediaId": 5076,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/tu-kiem-dinh-quoc-te-den-thuc-hanh-hang-ngay-trien-khai-aaci-trong-mo-hinh-phong-kham-tai-doctor-check/"
  },
  {
    "id": 5148,
    "slug": "gan-mot-thang-toi-an-khong-ngon-ngu-cung-khong-yen",
    "title": "Gần một tháng, tôi ăn không ngon, ngủ cũng không yên.",
    "date": "2025-12-18T11:15:28",
    "modified": "2025-12-18T15:13:17",
    "categories": [
      20
    ],
    "featuredMediaId": 5158,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/gan-mot-thang-toi-an-khong-ngon-ngu-cung-khong-yen/"
  },
  {
    "id": 5089,
    "slug": "doctor-check-dat-chung-nhan-lam-sang-xuat-sac-cho-dich-vu-noi-soi-dau-tien-tai-viet-nam",
    "title": "Doctor Check: Đạt “Chứng nhận Lâm sàng Xuất sắc cho Dịch vụ Nội soi” đầu tiên tại Việt Nam",
    "date": "2025-12-13T13:50:59",
    "modified": "2025-12-13T15:44:03",
    "categories": [
      43,
      54
    ],
    "featuredMediaId": 5083,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/doctor-check-dat-chung-nhan-lam-sang-xuat-sac-cho-dich-vu-noi-soi-dau-tien-tai-viet-nam/"
  },
  {
    "id": 5079,
    "slug": "don-vi-dau-tien-tai-viet-nam-dat-chung-nhan-lam-sang-xuat-sac-trong-noi-soi-tu-aaci-hoa-ky",
    "title": "Đơn vị đầu tiên tại Việt Nam đạt chứng nhận lâm sàng xuất sắc trong nội soi từ AACI Hoa Kỳ",
    "date": "2025-12-13T13:47:01",
    "modified": "2025-12-13T15:44:10",
    "categories": [
      43,
      59
    ],
    "featuredMediaId": 5076,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/don-vi-dau-tien-tai-viet-nam-dat-chung-nhan-lam-sang-xuat-sac-trong-noi-soi-tu-aaci-hoa-ky/"
  },
  {
    "id": 5073,
    "slug": "phong-kham-dau-tien-tai-viet-nam-dat-chung-nhan-noi-soi-xuat-sac-tu-hoa-ky-3",
    "title": "Phòng khám đầu tiên tại Việt Nam đạt chứng nhận nội soi xuất sắc từ Hoa Kỳ",
    "date": "2025-12-13T13:44:33",
    "modified": "2025-12-13T15:44:26",
    "categories": [
      43,
      55
    ],
    "featuredMediaId": 5067,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/phong-kham-dau-tien-tai-viet-nam-dat-chung-nhan-noi-soi-xuat-sac-tu-hoa-ky-3/"
  },
  {
    "id": 5062,
    "slug": "phong-kham-da-khoa-dau-tien-tai-viet-nam-dat-chung-nhan-aaci-my",
    "title": "Phòng khám đa khoa đầu tiên tại Việt Nam đạt chứng nhận AACI Mỹ",
    "date": "2025-12-11T10:41:39",
    "modified": "2025-12-13T15:44:35",
    "categories": [
      43,
      50
    ],
    "featuredMediaId": 5026,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/phong-kham-da-khoa-dau-tien-tai-viet-nam-dat-chung-nhan-aaci-my/"
  },
  {
    "id": 5045,
    "slug": "phat-hien-som-nguy-co-ung-thu-nho-noi-soi-tieu-hoa",
    "title": "Phát hiện sớm nguy cơ ung thư nhờ nội soi tiêu hóa",
    "date": "2025-12-10T17:19:09",
    "modified": "2025-12-13T15:44:41",
    "categories": [
      43,
      50
    ],
    "featuredMediaId": 5047,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/phat-hien-som-nguy-co-ung-thu-nho-noi-soi-tieu-hoa/"
  },
  {
    "id": 5022,
    "slug": "phong-kham-doctor-check-duoc-trao-chung-nhan-noi-soi-xuat-sac-tu-hoa-ky",
    "title": "Phòng khám Doctor Check được trao chứng nhận nội soi xuất sắc từ Hoa Kỳ",
    "date": "2025-12-06T17:36:36",
    "modified": "2025-12-13T15:44:52",
    "categories": [
      43,
      51
    ],
    "featuredMediaId": 5018,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/phong-kham-doctor-check-duoc-trao-chung-nhan-noi-soi-xuat-sac-tu-hoa-ky/"
  },
  {
    "id": 5013,
    "slug": "trung-tam-noi-soi-tieu-hoa-dau-tien-tai-viet-nam-dat-chuan-aaci-hoa-ky",
    "title": "Trung tâm nội soi tiêu hóa đầu tiên tại Việt Nam đạt chuẩn AACI Hoa Kỳ",
    "date": "2025-12-06T17:33:46",
    "modified": "2025-12-13T15:44:58",
    "categories": [
      43,
      60
    ],
    "featuredMediaId": 5008,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-dau-tien-tai-viet-nam-dat-chuan-aaci-hoa-ky/"
  },
  {
    "id": 4991,
    "slug": "phong-kham-dau-tien-tai-viet-nam-dat-chung-nhan-noi-soi-xuat-sac-tu-hoa-ky",
    "title": "Phòng khám đầu tiên tại Việt Nam đạt chứng nhận nội soi xuất sắc từ Hoa Kỳ",
    "date": "2025-12-06T17:25:32",
    "modified": "2025-12-13T15:50:29",
    "categories": [
      43,
      61
    ],
    "featuredMediaId": 4992,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/phong-kham-dau-tien-tai-viet-nam-dat-chung-nhan-noi-soi-xuat-sac-tu-hoa-ky/"
  },
  {
    "id": 4986,
    "slug": "phong-kham-dau-tien-tai-viet-nam-dat-chung-nhan-noi-soi-xuat-sac-tu-hoa-ky-2",
    "title": "Phòng khám đầu tiên tại Việt Nam đạt chứng nhận nội soi xuất sắc từ Hoa Kỳ",
    "date": "2025-12-06T17:18:53",
    "modified": "2025-12-13T15:45:33",
    "categories": [
      43,
      58
    ],
    "featuredMediaId": 5000,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/phong-kham-dau-tien-tai-viet-nam-dat-chung-nhan-noi-soi-xuat-sac-tu-hoa-ky-2/"
  },
  {
    "id": 4983,
    "slug": "trung-tam-noi-soi-tieu-hoa-viet-nam-dat-chuan-aaci-cua-hoa-ky",
    "title": "Trung tâm nội soi tiêu hóa Việt Nam đạt chuẩn AACI của Hoa Kỳ",
    "date": "2025-12-06T17:18:16",
    "modified": "2025-12-13T15:45:38",
    "categories": [
      43,
      57
    ],
    "featuredMediaId": 5008,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-viet-nam-dat-chuan-aaci-cua-hoa-ky/"
  },
  {
    "id": 4967,
    "slug": "hien-thuc-hoa-loi-hua-khong-bo-sot-ung-thu-da-day-dai-trang-giai-doan-som-doctor-check-tro-thanh-trung-tam-noi-soi-tieu-hoa-dau-tien-tai-viet-nam-dat-chung-nhan-lam-sang",
    "title": "Hiện Thực Hóa Lời Hứa “Không Bỏ Sót Ung Thư Dạ Dày – Đại Tràng Giai Đoạn Sớm” – Doctor Check Trở Thành Trung Tâm Nội Soi Tiêu Hóa Đầu Tiên Tại Việt Nam Đạt Chứng Nhận Lâm Sàng Xuất Sắc Cho Dịch Vụ Nội Soi",
    "date": "2025-12-06T13:43:03",
    "modified": "2025-12-13T13:46:43",
    "categories": [
      49
    ],
    "featuredMediaId": 4968,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/hien-thuc-hoa-loi-hua-khong-bo-sot-ung-thu-da-day-dai-trang-giai-doan-som-doctor-check-tro-thanh-trung-tam-noi-soi-tieu-hoa-dau-tien-tai-viet-nam-dat-chung-nhan-lam-sang/"
  },
  {
    "id": 4956,
    "slug": "tham-dinh-chinh-thuc-doctor-check-xac-lap-chuan-muc-moi-trong-noi-soi-dat-chuan-quoc-te-tu-hoa-ky",
    "title": "Thẩm Định Chính Thức – Doctor Check xác lập chuẩn mực mới trong nội soi đạt chuẩn quốc tế từ Hoa Kỳ",
    "date": "2025-11-17T14:43:14",
    "modified": "2025-12-06T14:24:34",
    "categories": [
      49
    ],
    "featuredMediaId": 4938,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/tham-dinh-chinh-thuc-doctor-check-xac-lap-chuan-muc-moi-trong-noi-soi-dat-chuan-quoc-te-tu-hoa-ky/"
  },
  {
    "id": 4928,
    "slug": "dao-tao-chuyen-sau-tu-aaci-nen-tang-cho-dich-vu-noi-soi-chinh-xac-chuan-quoc-te",
    "title": "Đào Tạo Chuyên Sâu Từ AACI: Nền Tảng Cho Dịch Vụ Nội Soi Chính Xác – Chuẩn Quốc Tế",
    "date": "2025-11-15T17:13:47",
    "modified": "2025-12-06T15:30:00",
    "categories": [
      49
    ],
    "featuredMediaId": 4929,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/dao-tao-chuyen-sau-tu-aaci-nen-tang-cho-dich-vu-noi-soi-chinh-xac-chuan-quoc-te/"
  },
  {
    "id": 4908,
    "slug": "le-ky-ket-kiem-dinh-thuc-hanh-lam-sang-xuat-sac-cho-dich-vu-noi-soi-do-aaci-hoa-ky-cung-cap",
    "title": "Lễ ký kết kiểm định Lâm sàng Xuất sắc cho Dịch vụ Nội soi do AACI – Hoa Kỳ cung cấp",
    "date": "2025-11-12T17:24:03",
    "modified": "2025-12-06T14:24:58",
    "categories": [
      49
    ],
    "featuredMediaId": 4910,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/le-ky-ket-kiem-dinh-thuc-hanh-lam-sang-xuat-sac-cho-dich-vu-noi-soi-do-aaci-hoa-ky-cung-cap/"
  },
  {
    "id": 4831,
    "slug": "ung-thu-hau-mon",
    "title": "Ung thư hậu môn",
    "date": "2025-11-01T15:25:45",
    "modified": "2025-11-01T15:37:53",
    "categories": [
      48
    ],
    "featuredMediaId": 4807,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/ung-thu-hau-mon/"
  },
  {
    "id": 4803,
    "slug": "ung-thu-dai-truc-trang",
    "title": "Ung thư đại trực tràng",
    "date": "2025-11-01T15:19:02",
    "modified": "2025-11-01T15:22:31",
    "categories": [
      48
    ],
    "featuredMediaId": 4806,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/ung-thu-dai-truc-trang/"
  },
  {
    "id": 4787,
    "slug": "ung-thu-truc-trang",
    "title": "Ung thư trực tràng",
    "date": "2025-11-01T15:09:00",
    "modified": "2025-11-15T17:22:34",
    "categories": [
      48
    ],
    "featuredMediaId": 4810,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/ung-thu-truc-trang/"
  },
  {
    "id": 4772,
    "slug": "ung-thu-dai-trang",
    "title": "Ung thư đại tràng",
    "date": "2025-11-01T14:15:11",
    "modified": "2025-12-17T15:00:47",
    "categories": [
      48
    ],
    "featuredMediaId": 4805,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/ung-thu-dai-trang/"
  },
  {
    "id": 4745,
    "slug": "ung-thu-ta-trang",
    "title": "Ung thư tá tràng",
    "date": "2025-11-01T13:47:53",
    "modified": "2025-11-01T16:17:54",
    "categories": [
      47
    ],
    "featuredMediaId": 4808,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/ung-thu-ta-trang/"
  },
  {
    "id": 4730,
    "slug": "ung-thu-thuc-quan-2",
    "title": "Ung thư thực quản",
    "date": "2025-10-31T16:22:49",
    "modified": "2025-11-01T16:18:40",
    "categories": [
      47
    ],
    "featuredMediaId": 4809,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/ung-thu-thuc-quan-2/"
  },
  {
    "id": 4728,
    "slug": "ung-thu-da-day",
    "title": "Ung thư dạ dày",
    "date": "2025-10-31T15:53:54",
    "modified": "2025-12-17T14:53:15",
    "categories": [
      47
    ],
    "featuredMediaId": 4804,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/ung-thu-da-day/"
  },
  {
    "id": 4624,
    "slug": "kho-nuot-dau-bung-suot-2-tuan-thay-giao-39-tuoi-quyet-di-400-km-tim-nguyen-nhan",
    "title": "Khó nuốt, đau bụng suốt 2 tuần — thầy giáo 39 tuổi quyết đi 400 km tìm nguyên nhân",
    "date": "2025-10-15T09:13:22",
    "modified": "2025-10-17T11:31:23",
    "categories": [
      38
    ],
    "featuredMediaId": 4666,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/kho-nuot-dau-bung-suot-2-tuan-thay-giao-39-tuoi-quyet-di-400-km-tim-nguyen-nhan/"
  },
  {
    "id": 3855,
    "slug": "mat-tu-tin-vi-hoi-tho-co-mui-anh-khoa-quyet-dinh-di-kham-va-phat-hien-viem-da-day-sau-6-tuan-anh-lay-lai-su-tu-tin",
    "title": "Mất tự tin vì hơi thở có mùi, anh Khoa quyết định đi khám và phát hiện viêm dạ dày.<br> Sau 6 tuần anh lấy lại sự tự tin.",
    "date": "2025-09-19T17:27:03",
    "modified": "2025-09-19T21:32:52",
    "categories": [
      38
    ],
    "featuredMediaId": 3883,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/mat-tu-tin-vi-hoi-tho-co-mui-anh-khoa-quyet-dinh-di-kham-va-phat-hien-viem-da-day-sau-6-tuan-anh-lay-lai-su-tu-tin/"
  },
  {
    "id": 3840,
    "slug": "hoi-chung-ruot-kich-thich",
    "title": "Hội chứng ruột kích thích",
    "date": "2025-09-19T16:10:21",
    "modified": "2025-10-17T15:06:05",
    "categories": [
      46
    ],
    "featuredMediaId": 3841,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/hoi-chung-ruot-kich-thich/"
  },
  {
    "id": 3825,
    "slug": "viem-dai-trang",
    "title": "Viêm đại tràng",
    "date": "2025-09-19T16:10:21",
    "modified": "2025-10-16T15:56:18",
    "categories": [
      46
    ],
    "featuredMediaId": 3826,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/viem-dai-trang/"
  },
  {
    "id": 3816,
    "slug": "roi-loan-tieu-hoa",
    "title": "Rối loạn tiêu hoá",
    "date": "2025-09-19T16:10:21",
    "modified": "2025-10-17T15:05:16",
    "categories": [
      46
    ],
    "featuredMediaId": 3817,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/roi-loan-tieu-hoa/"
  },
  {
    "id": 3806,
    "slug": "tieu-chay-2",
    "title": "Tiêu chảy",
    "date": "2025-09-19T16:10:21",
    "modified": "2025-10-17T15:04:03",
    "categories": [
      46
    ],
    "featuredMediaId": 3807,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/tieu-chay-2/"
  },
  {
    "id": 3797,
    "slug": "tao-bon",
    "title": "Táo bón",
    "date": "2025-09-19T16:10:21",
    "modified": "2025-10-03T14:34:33",
    "categories": [
      46
    ],
    "featuredMediaId": 3798,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/tao-bon/"
  },
  {
    "id": 3788,
    "slug": "polyp-dai-trang",
    "title": "Polyp đại tràng",
    "date": "2025-09-19T16:10:21",
    "modified": "2025-10-16T15:56:52",
    "categories": [
      46
    ],
    "featuredMediaId": 3789,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/polyp-dai-trang/"
  },
  {
    "id": 3779,
    "slug": "benh-crohn",
    "title": "Bệnh Crohn",
    "date": "2025-09-19T16:10:21",
    "modified": "2025-10-17T15:07:20",
    "categories": [
      46
    ],
    "featuredMediaId": 3780,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/benh-crohn/"
  },
  {
    "id": 3773,
    "slug": "tieu-chay",
    "title": "Tiêu chảy",
    "date": "2025-09-19T16:10:21",
    "modified": "2025-10-04T14:37:54",
    "categories": [
      45
    ],
    "featuredMediaId": 4585,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/tieu-chay/"
  },
  {
    "id": 3768,
    "slug": "tao-bon-keo-dai",
    "title": "Táo bón kéo dài",
    "date": "2025-09-19T16:10:21",
    "modified": "2025-10-17T15:21:27",
    "categories": [
      45
    ],
    "featuredMediaId": 4584,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/tao-bon-keo-dai/"
  },
  {
    "id": 3759,
    "slug": "tieu-phan-nhay-nhot",
    "title": "Tiêu phân nhầy nhớt",
    "date": "2025-09-19T16:10:21",
    "modified": "2025-10-17T15:20:31",
    "categories": [
      45
    ],
    "featuredMediaId": 4586,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/tieu-phan-nhay-nhot/"
  },
  {
    "id": 3750,
    "slug": "di-ngoai-ra-mau",
    "title": "Đi ngoài ra máu",
    "date": "2025-09-19T16:10:21",
    "modified": "2025-10-04T14:37:13",
    "categories": [
      45
    ],
    "featuredMediaId": 4583,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/di-ngoai-ra-mau/"
  },
  {
    "id": 3741,
    "slug": "dau-bung-am-i",
    "title": "Đau bụng âm ỉ",
    "date": "2025-09-19T16:10:21",
    "modified": "2025-10-17T15:19:14",
    "categories": [
      45
    ],
    "featuredMediaId": 4587,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/dau-bung-am-i/"
  },
  {
    "id": 3694,
    "slug": "o-ta-trang",
    "title": "Ở tá tràng",
    "date": "2025-09-19T16:10:21",
    "modified": "2025-09-19T16:11:08",
    "categories": [
      44
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/o-ta-trang/"
  },
  {
    "id": 3693,
    "slug": "o-da-day",
    "title": "Ở dạ dày",
    "date": "2025-09-19T16:10:21",
    "modified": "2025-09-19T16:11:07",
    "categories": [
      44
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/o-da-day/"
  },
  {
    "id": 3692,
    "slug": "o-thuc-quan",
    "title": "Ở thực quản",
    "date": "2025-09-19T16:10:21",
    "modified": "2025-09-19T16:11:07",
    "categories": [
      44
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/o-thuc-quan/"
  },
  {
    "id": 3691,
    "slug": "o-hong-va-thanh-quan",
    "title": "Ở họng và thanh quản",
    "date": "2025-09-19T16:10:21",
    "modified": "2025-09-19T16:11:06",
    "categories": [
      44
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/o-hong-va-thanh-quan/"
  },
  {
    "id": 3698,
    "slug": "noi-soi-da-day-la-tieu-chuan-vang-chan-doan-benh-ly-chinh-xac",
    "title": "Nội soi dạ dày là tiêu chuẩn vàng chẩn đoán bệnh lý chính xác",
    "date": "2025-09-19T13:09:38",
    "modified": "2025-12-13T15:46:12",
    "categories": [
      56,
      43
    ],
    "featuredMediaId": 3699,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/noi-soi-da-day-la-tieu-chuan-vang-chan-doan-benh-ly-chinh-xac/"
  },
  {
    "id": 3695,
    "slug": "tai-sao-benh-ly-da-day-khong-thuyen-giam-du-da-noi-soi-nhieu-lan",
    "title": "Tại sao bệnh lý dạ dày không thuyên giảm dù đã nội soi nhiều lần?",
    "date": "2025-09-19T13:09:38",
    "modified": "2025-12-13T15:46:05",
    "categories": [
      43,
      58
    ],
    "featuredMediaId": 5047,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/tai-sao-benh-ly-da-day-khong-thuyen-giam-du-da-noi-soi-nhieu-lan/"
  },
  {
    "id": 3689,
    "slug": "doctor-check-diem-den-noi-soi-da-day-tai-tphcm",
    "title": "Doctor Check – điểm đến nội soi dạ dày tại TPHCM",
    "date": "2025-09-19T13:09:38",
    "modified": "2025-12-13T15:45:50",
    "categories": [
      43,
      53
    ],
    "featuredMediaId": 3690,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/doctor-check-diem-den-noi-soi-da-day-tai-tphcm/"
  },
  {
    "id": 3686,
    "slug": "tai-sao-phai-noi-soi-da-day-chinh-xac-thi-moi-dieu-tri-benh-ly-hieu-qua",
    "title": "Tại sao phải nội soi dạ dày chính xác thì mới điều trị bệnh lý hiệu quả",
    "date": "2025-09-19T13:09:38",
    "modified": "2025-12-13T15:45:44",
    "categories": [
      43,
      52
    ],
    "featuredMediaId": 3687,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/tai-sao-phai-noi-soi-da-day-chinh-xac-thi-moi-dieu-tri-benh-ly-hieu-qua/"
  },
  {
    "id": 3681,
    "slug": "viem-thuc-quan",
    "title": "Viêm thực quản",
    "date": "2025-09-19T13:09:38",
    "modified": "2025-10-16T16:00:48",
    "categories": [
      42
    ],
    "featuredMediaId": 4345,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/viem-thuc-quan/"
  },
  {
    "id": 3676,
    "slug": "ung-thu-thuc-quan",
    "title": "Ung thư thực quản",
    "date": "2025-09-19T13:09:38",
    "modified": "2025-10-17T14:40:04",
    "categories": [
      42
    ],
    "featuredMediaId": 4343,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/ung-thu-thuc-quan/"
  },
  {
    "id": 3669,
    "slug": "benh-ung-thu-da-day",
    "title": "Ung thư dạ dày",
    "date": "2025-09-19T13:09:38",
    "modified": "2025-11-15T16:52:14",
    "categories": [
      42
    ],
    "featuredMediaId": 4342,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/benh-ung-thu-da-day/"
  },
  {
    "id": 3664,
    "slug": "kho-tieu-chuc-nang",
    "title": "Khó tiêu chức năng",
    "date": "2025-09-19T13:09:38",
    "modified": "2025-10-17T14:29:48",
    "categories": [
      42
    ],
    "featuredMediaId": 4622,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/kho-tieu-chuc-nang/"
  },
  {
    "id": 3659,
    "slug": "nhiem-khuan-h-pylori",
    "title": "Nhiễm khuẩn H. pylori",
    "date": "2025-09-19T13:09:38",
    "modified": "2025-10-16T15:59:02",
    "categories": [
      42
    ],
    "featuredMediaId": 4654,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/nhiem-khuan-h-pylori/"
  },
  {
    "id": 3652,
    "slug": "trao-nguoc-da-day-thuc-quan",
    "title": "Trào ngược dạ dày – thực quản",
    "date": "2025-09-19T13:09:38",
    "modified": "2025-10-17T14:28:51",
    "categories": [
      42
    ],
    "featuredMediaId": 4619,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/trao-nguoc-da-day-thuc-quan/"
  },
  {
    "id": 3647,
    "slug": "viem-loet-da-day-ta-trang",
    "title": "Viêm loét dạ dày – tá tràng",
    "date": "2025-09-19T13:09:38",
    "modified": "2025-10-16T13:47:09",
    "categories": [
      42
    ],
    "featuredMediaId": 4618,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/viem-loet-da-day-ta-trang/"
  },
  {
    "id": 3642,
    "slug": "an-nhanh-no",
    "title": "Ăn nhanh no",
    "date": "2025-09-19T13:09:38",
    "modified": "2025-10-17T15:12:09",
    "categories": [
      41
    ],
    "featuredMediaId": 3643,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/an-nhanh-no/"
  },
  {
    "id": 3637,
    "slug": "kho-tieu",
    "title": "Khó tiêu",
    "date": "2025-09-19T13:09:38",
    "modified": "2025-10-17T15:09:49",
    "categories": [
      41
    ],
    "featuredMediaId": 4340,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/kho-tieu/"
  },
  {
    "id": 3632,
    "slug": "chuong-bung-day-hoi",
    "title": "Chướng bụng, đầy hơi",
    "date": "2025-09-19T13:09:38",
    "modified": "2025-10-17T15:12:57",
    "categories": [
      41
    ],
    "featuredMediaId": 3633,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/chuong-bung-day-hoi/"
  },
  {
    "id": 3627,
    "slug": "buon-non-non",
    "title": "Buồn nôn, nôn",
    "date": "2025-09-19T13:09:38",
    "modified": "2025-10-17T15:08:55",
    "categories": [
      41
    ],
    "featuredMediaId": 3628,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/buon-non-non/"
  },
  {
    "id": 3622,
    "slug": "dau-thuong-vi",
    "title": "Đau thượng vị",
    "date": "2025-09-19T13:09:38",
    "modified": "2025-10-04T09:36:27",
    "categories": [
      41
    ],
    "featuredMediaId": 3623,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/dau-thuong-vi/"
  },
  {
    "id": 3329,
    "slug": "hai-tuan-lien-cu-uong-ca-phe-la-toi-bi-tieu-chay-phai-roi-lop",
    "title": "&#8220;Có hôm đứng lớp, tôi phải rời đi vệ sinh đến 3 lần&#8221;",
    "date": "2025-08-19T17:16:33",
    "modified": "2025-08-20T13:43:29",
    "categories": [
      38
    ],
    "featuredMediaId": 3334,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/hai-tuan-lien-cu-uong-ca-phe-la-toi-bi-tieu-chay-phai-roi-lop/"
  },
  {
    "id": 1859,
    "slug": "kiem-soat-hoi-tho-de-song-tho",
    "title": "Kiểm Soát Hơi Thở Để Sống Thọ",
    "date": "2025-01-14T11:52:05",
    "modified": "2025-01-24T15:04:50",
    "categories": [
      36
    ],
    "featuredMediaId": 1824,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/kiem-soat-hoi-tho-de-song-tho/"
  },
  {
    "id": 1856,
    "slug": "giac-ngu-song-tho",
    "title": "Giấc Ngủ Sống Thọ",
    "date": "2025-01-14T11:51:30",
    "modified": "2025-05-05T14:14:02",
    "categories": [
      36
    ],
    "featuredMediaId": 1828,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/giac-ngu-song-tho/"
  },
  {
    "id": 1853,
    "slug": "kiem-soat-stress-nong-gian",
    "title": "Kiểm Soát Stress, Nóng Giận",
    "date": "2025-01-14T11:51:04",
    "modified": "2025-01-24T15:04:42",
    "categories": [
      36
    ],
    "featuredMediaId": 1823,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/kiem-soat-stress-nong-gian/"
  },
  {
    "id": 1850,
    "slug": "van-dong-song-tho",
    "title": "Vận Động Sống Thọ",
    "date": "2025-01-14T11:50:08",
    "modified": "2025-01-24T15:04:35",
    "categories": [
      36
    ],
    "featuredMediaId": 1827,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/van-dong-song-tho/"
  },
  {
    "id": 1847,
    "slug": "dinh-duong-song-tho",
    "title": "Dinh Dưỡng Sống Thọ",
    "date": "2025-01-14T11:49:27",
    "modified": "2025-01-24T15:04:25",
    "categories": [
      36
    ],
    "featuredMediaId": 1822,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/dinh-duong-song-tho/"
  },
  {
    "id": 1818,
    "slug": "kiem-soat-can-nang-va-bmi",
    "title": "Kiểm Soát Cân Nặng Và BMI",
    "date": "2025-01-13T16:25:09",
    "modified": "2025-01-24T15:04:12",
    "categories": [
      36
    ],
    "featuredMediaId": 1825,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/kiem-soat-can-nang-va-bmi/"
  },
  {
    "id": 1131,
    "slug": "7-thoi-quen-giup-ban-co-cuoc-song-tot-hon",
    "title": "3 Nguyên Nhân Chính Dẫn Đến Viêm Gan B – Bạn Cần Biết Để Phòng Tránh!",
    "date": "2024-12-23T13:45:39",
    "modified": "2024-12-31T16:56:07",
    "categories": [
      28
    ],
    "featuredMediaId": 1380,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/7-thoi-quen-giup-ban-co-cuoc-song-tot-hon/"
  },
  {
    "id": 1128,
    "slug": "lam-the-nao-de-nhan-biet-dot-quy",
    "title": "5 Dấu Hiệu Suy Thận Nhẹ Mà Bạn Cần Biết Sớm",
    "date": "2024-12-23T06:16:23",
    "modified": "2024-12-31T16:57:44",
    "categories": [
      28
    ],
    "featuredMediaId": 1381,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/lam-the-nao-de-nhan-biet-dot-quy/"
  },
  {
    "id": 1126,
    "slug": "10-phuong-phap-giup-chung-ta-song-tho-hon",
    "title": "Nhận Diện Ngay 5 Dấu Hiệu Của Đột Quỵ Để Kịp Thời Ứng Phó",
    "date": "2024-12-23T06:15:37",
    "modified": "2024-12-31T17:02:26",
    "categories": [
      28
    ],
    "featuredMediaId": 1384,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/10-phuong-phap-giup-chung-ta-song-tho-hon/"
  },
  {
    "id": 1124,
    "slug": "lam-the-nao-de-song-tho-duoc-nhu-nguoi-nhat",
    "title": "5 Loại Trái Cây Dành Cho Người Tiểu Đường Bạn Nên Biết",
    "date": "2024-12-23T06:14:44",
    "modified": "2024-12-31T17:02:19",
    "categories": [
      28
    ],
    "featuredMediaId": 1386,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/lam-the-nao-de-song-tho-duoc-nhu-nguoi-nhat/"
  },
  {
    "id": 1096,
    "slug": "tuoi-tho-trung-binh-cua-nguoi-viet-la-bao-nhieu",
    "title": "Bật Mí 5 Món Ăn Thần Kỳ Giúp Người Nhật Tăng Tuổi Thọ",
    "date": "2024-12-22T08:31:14",
    "modified": "2024-12-31T17:03:58",
    "categories": [
      28
    ],
    "featuredMediaId": 1389,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/tuoi-tho-trung-binh-cua-nguoi-viet-la-bao-nhieu/"
  },
  {
    "id": 1074,
    "slug": "suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-8",
    "title": "Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Khám Tổng Quát Để Kiểm Tra",
    "date": "2024-12-21T08:07:14",
    "modified": "2024-12-23T06:26:59",
    "categories": [
      25
    ],
    "featuredMediaId": 907,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-8/"
  },
  {
    "id": 1072,
    "slug": "suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-7",
    "title": "Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Khám Tổng Quát Để Kiểm Tra",
    "date": "2024-12-21T08:06:59",
    "modified": "2024-12-23T06:26:59",
    "categories": [
      25
    ],
    "featuredMediaId": 907,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-7/"
  },
  {
    "id": 1070,
    "slug": "suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-6",
    "title": "Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Khám Tổng Quát Để Kiểm Tra",
    "date": "2024-12-21T08:06:35",
    "modified": "2024-12-23T06:27:00",
    "categories": [
      25
    ],
    "featuredMediaId": 907,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-6/"
  },
  {
    "id": 1068,
    "slug": "suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-5",
    "title": "Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Khám Tổng Quát Để Kiểm Tra",
    "date": "2024-12-21T08:06:18",
    "modified": "2024-12-23T06:27:01",
    "categories": [
      25
    ],
    "featuredMediaId": 907,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-5/"
  },
  {
    "id": 1038,
    "slug": "tuoi-sinh-hoc",
    "title": "Tuổi Sinh Học",
    "date": "2024-12-18T07:58:22",
    "modified": "2024-12-30T10:00:02",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/tuoi-sinh-hoc/"
  },
  {
    "id": 1036,
    "slug": "benh-di-truyen",
    "title": "Bệnh Di Truyền",
    "date": "2024-12-18T07:58:02",
    "modified": "2024-12-30T10:00:03",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/benh-di-truyen/"
  },
  {
    "id": 1034,
    "slug": "vi-chat-dinh-duong",
    "title": "Vi Chất Dinh Dưỡng",
    "date": "2024-12-18T07:57:38",
    "modified": "2024-12-30T10:00:03",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/vi-chat-dinh-duong/"
  },
  {
    "id": 1032,
    "slug": "thieu-mau-do-thieu-sat",
    "title": "Thiếu Máu Do Thiếu Sắt",
    "date": "2024-12-18T07:57:03",
    "modified": "2024-12-30T10:00:04",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/thieu-mau-do-thieu-sat/"
  },
  {
    "id": 1030,
    "slug": "nhiem-doc-chat",
    "title": "Nhiễm Độc Chất",
    "date": "2024-12-18T07:56:40",
    "modified": "2024-12-30T10:00:05",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/nhiem-doc-chat/"
  },
  {
    "id": 1028,
    "slug": "mo-mau",
    "title": "Mỡ Máu",
    "date": "2024-12-18T07:56:18",
    "modified": "2024-12-30T10:00:05",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/mo-mau/"
  },
  {
    "id": 1026,
    "slug": "chi-so-co-the",
    "title": "Chỉ Số Cơ Thể",
    "date": "2024-12-18T07:55:55",
    "modified": "2024-12-30T10:00:06",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/chi-so-co-the/"
  },
  {
    "id": 1024,
    "slug": "loang-xuong",
    "title": "Loãng xương",
    "date": "2024-12-18T07:55:28",
    "modified": "2024-12-30T10:00:07",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/loang-xuong/"
  },
  {
    "id": 1022,
    "slug": "di-ung-thuong-gap",
    "title": "Dị ứng thường gặp",
    "date": "2024-12-18T07:54:54",
    "modified": "2024-12-30T10:00:07",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/di-ung-thuong-gap/"
  },
  {
    "id": 1020,
    "slug": "benh-cum",
    "title": "Bệnh cúm",
    "date": "2024-12-18T07:54:26",
    "modified": "2024-12-30T10:00:08",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/benh-cum/"
  },
  {
    "id": 1018,
    "slug": "benh-phu-khoa",
    "title": "Bệnh phụ khoa",
    "date": "2024-12-18T07:53:59",
    "modified": "2024-12-30T10:00:09",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/benh-phu-khoa/"
  },
  {
    "id": 1016,
    "slug": "chuc-nang-gan",
    "title": "Chức năng gan",
    "date": "2024-12-18T07:53:23",
    "modified": "2024-12-30T10:00:09",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/chuc-nang-gan/"
  },
  {
    "id": 1014,
    "slug": "benh-do-nhiem-ky-sinh-trung",
    "title": "Bệnh Do Nhiễm Ký Sinh Trùng",
    "date": "2024-12-18T07:52:51",
    "modified": "2024-12-30T10:00:10",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/benh-do-nhiem-ky-sinh-trung/"
  },
  {
    "id": 1012,
    "slug": "suy-gian-tinh-mach-chan",
    "title": "Suy giãn tĩnh mạch chân",
    "date": "2024-12-18T07:52:24",
    "modified": "2024-12-30T10:00:11",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/suy-gian-tinh-mach-chan/"
  },
  {
    "id": 1010,
    "slug": "viem-gan-vi-rut",
    "title": "Viêm gan vi rút",
    "date": "2024-12-18T07:51:51",
    "modified": "2024-12-30T10:00:12",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/viem-gan-vi-rut/"
  },
  {
    "id": 1008,
    "slug": "xet-nghiem-cong-thuc-mau",
    "title": "Xét nghiệm công thức máu",
    "date": "2024-12-18T07:51:10",
    "modified": "2024-12-30T10:00:12",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/xet-nghiem-cong-thuc-mau/"
  },
  {
    "id": 1006,
    "slug": "benh-ve-tuyen-giap",
    "title": "Bệnh về tuyến giáp",
    "date": "2024-12-18T07:50:34",
    "modified": "2024-12-30T10:00:13",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/benh-ve-tuyen-giap/"
  },
  {
    "id": 1004,
    "slug": "benh-gut",
    "title": "Bệnh gút",
    "date": "2024-12-18T07:49:45",
    "modified": "2024-12-30T10:00:14",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/benh-gut/"
  },
  {
    "id": 1002,
    "slug": "benh-dot-quy",
    "title": "Bệnh đột quỵ",
    "date": "2024-12-18T07:49:20",
    "modified": "2024-12-30T10:00:15",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/benh-dot-quy/"
  },
  {
    "id": 1000,
    "slug": "benh-lay-qua-duong-tinh-duc",
    "title": "Bệnh lây qua đường tình dục",
    "date": "2024-12-18T07:47:52",
    "modified": "2024-12-30T10:00:15",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/benh-lay-qua-duong-tinh-duc/"
  },
  {
    "id": 998,
    "slug": "benh-tieu-duong",
    "title": "Bệnh tiểu đường",
    "date": "2024-12-18T07:47:19",
    "modified": "2024-12-30T10:00:35",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/benh-tieu-duong/"
  },
  {
    "id": 996,
    "slug": "chuc-nang-than",
    "title": "Chức năng thận",
    "date": "2024-12-18T07:46:33",
    "modified": "2024-12-30T10:00:36",
    "categories": [
      26,
      33,
      27
    ],
    "featuredMediaId": 0,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/chuc-nang-than/"
  },
  {
    "id": 922,
    "slug": "suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-4",
    "title": "Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Khám Tổng Quát Để Kiểm Tra",
    "date": "2024-12-14T07:34:36",
    "modified": "2024-12-23T06:27:33",
    "categories": [
      25
    ],
    "featuredMediaId": 542,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-4/"
  },
  {
    "id": 912,
    "slug": "suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-3",
    "title": "Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Khám Tổng Quát Để Kiểm Tra",
    "date": "2024-12-14T06:54:03",
    "modified": "2024-12-23T06:27:34",
    "categories": [
      25
    ],
    "featuredMediaId": 913,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-3/"
  },
  {
    "id": 909,
    "slug": "suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-2",
    "title": "Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Khám Tổng Quát Để Kiểm Tra",
    "date": "2024-12-14T06:53:38",
    "modified": "2024-12-23T06:27:35",
    "categories": [
      25
    ],
    "featuredMediaId": 910,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-2/"
  },
  {
    "id": 906,
    "slug": "suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra",
    "title": "Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Khám Tổng Quát Để Kiểm Tra",
    "date": "2024-12-14T06:52:41",
    "modified": "2024-12-23T06:27:36",
    "categories": [
      25
    ],
    "featuredMediaId": 907,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra/"
  },
  {
    "id": 651,
    "slug": "bi-tieu-duong-26-nam-nen-chu-hong-anh-muon-kiem-tra-suc-khoe-dinh-ky",
    "title": "Bị Tiểu Đường 26 Năm Nên Chú Hồng Anh Muốn Kiểm Tra Sức Khỏe Định Kỳ",
    "date": "2024-11-09T09:19:30",
    "modified": "2024-12-23T06:27:36",
    "categories": [
      20
    ],
    "featuredMediaId": 652,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/bi-tieu-duong-26-nam-nen-chu-hong-anh-muon-kiem-tra-suc-khoe-dinh-ky/"
  },
  {
    "id": 647,
    "slug": "co-nguoi-nha-bi-ung-thu-dai-trang-co-lien-quyet-dinh-den-doctor-check-de-tam-soat-ung-thu",
    "title": "Có Người Nhà Bị Ung Thư Đại Tràng, Cô Liên Quyết Định Đến Doctor Check Để Tầm Soát Ung Thư",
    "date": "2024-11-09T09:17:43",
    "modified": "2024-12-23T06:27:37",
    "categories": [
      20
    ],
    "featuredMediaId": 649,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/co-nguoi-nha-bi-ung-thu-dai-trang-co-lien-quyet-dinh-den-doctor-check-de-tam-soat-ung-thu/"
  },
  {
    "id": 644,
    "slug": "suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-doctor-check-de-tam-soat-suc-khoe",
    "title": "Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Doctor Check Để Tầm Soát Sức Khỏe",
    "date": "2024-11-09T09:14:52",
    "modified": "2024-12-23T06:27:37",
    "categories": [
      20
    ],
    "featuredMediaId": 645,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-doctor-check-de-tam-soat-suc-khoe/"
  },
  {
    "id": 641,
    "slug": "10-diem-khong-co-nhung-anh-trung-trai-nghiem-tam-soat-benh-chi-90-phut",
    "title": "10 Điểm Không Có Nhưng, Anh Trung Trải Nghiệm Tầm Soát Bệnh Chỉ 90 Phút",
    "date": "2024-11-09T09:13:16",
    "modified": "2024-12-23T06:27:38",
    "categories": [
      20
    ],
    "featuredMediaId": 642,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/10-diem-khong-co-nhung-anh-trung-trai-nghiem-tam-soat-benh-chi-90-phut/"
  },
  {
    "id": 638,
    "slug": "som-mot-buoc-khoe-mot-doi-tap-1-anh-oi-me-bi-ung-thu-truc-trang-di-can-roi",
    "title": "[Sớm Một Bước-Khoẻ Một Đời] Tập 1: Anh Ơi, Mẹ Bị Ung Thư Trực Tràng Di Căn Rồi….",
    "date": "2024-11-09T09:11:53",
    "modified": "2024-12-23T06:27:39",
    "categories": [
      20
    ],
    "featuredMediaId": 639,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/som-mot-buoc-khoe-mot-doi-tap-1-anh-oi-me-bi-ung-thu-truc-trang-di-can-roi/"
  },
  {
    "id": 634,
    "slug": "hanh-trinh-vuot-200km-de-tam-soat-benh-cung-gia-dinh-chi-van",
    "title": "Hành Trình Vượt 200km Để Tầm Soát Bệnh Cùng Gia Đình Chị Vân",
    "date": "2024-11-09T09:09:13",
    "modified": "2024-12-23T06:28:03",
    "categories": [
      20
    ],
    "featuredMediaId": 635,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/hanh-trinh-vuot-200km-de-tam-soat-benh-cung-gia-dinh-chi-van/"
  },
  {
    "id": 631,
    "slug": "moi-nguoi-tre-nen-co-mot-cuoc-song-healthy-chia-se-cua-anh-tam-sau-trai-nghiem-tam-soat-benh-tai-doctor-check",
    "title": "“Mọi Người Trẻ Nên Có Một Cuộc Sống Healthy” – Chia Sẻ Của Anh Tâm Sau Trải Nghiệm Tầm Soát Bệnh Tại Doctor Check",
    "date": "2024-11-09T09:02:52",
    "modified": "2024-12-23T06:28:04",
    "categories": [
      20
    ],
    "featuredMediaId": 632,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/moi-nguoi-tre-nen-co-mot-cuoc-song-healthy-chia-se-cua-anh-tam-sau-trai-nghiem-tam-soat-benh-tai-doctor-check/"
  },
  {
    "id": 628,
    "slug": "25-polyp-trong-dai-trang-dau-hieu-ung-thu-dai-truc-trang-giai-doan-dau-loi-ich-cua-viec-tam-soat-som",
    "title": "25 Polyp Trong Đại Tràng – Dấu Hiệu Ung Thư Đại Trực Tràng Giai Đoạn Đầu – Lợi Ích Của Việc Tầm Soát Sớm",
    "date": "2024-11-09T09:00:58",
    "modified": "2024-12-23T06:28:05",
    "categories": [
      20
    ],
    "featuredMediaId": 629,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/25-polyp-trong-dai-trang-dau-hieu-ung-thu-dai-truc-trang-giai-doan-dau-loi-ich-cua-viec-tam-soat-som/"
  },
  {
    "id": 624,
    "slug": "tam-soat-benh-giup-giam-ganh-nang-kinh-te-cho-con-cai-chia-se-cua-vo-chong-chu-hung",
    "title": "Tầm Soát Bệnh Giúp Giảm Gánh Nặng Kinh Tế Cho Con Cái – Chia Sẻ Của Vợ Chồng Chú Hùng",
    "date": "2024-11-09T08:58:53",
    "modified": "2024-12-23T06:28:05",
    "categories": [
      20
    ],
    "featuredMediaId": 625,
    "status": "AUTHENTIC_METADATA_VERIFIED",
    "dataClassification": "VERIFIED_PRODUCTION",
    "contentImportStatus": "BLOCKED_PENDING_CMS_IMPORT",
    "link": "https://www.doctorcheck.vn/tam-soat-benh-giup-giam-ganh-nang-kinh-te-cho-con-cai-chia-se-cua-vo-chong-chu-hung/"
  }
];
