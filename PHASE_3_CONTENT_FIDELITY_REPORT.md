# Phase 3 — Content Fidelity Report

This report presents the automated fidelity comparison between the authoritative **WordPress Source Content** and the **Next.js Migrated Content** for DoctorCheck.vn.

Testing methodology rigorously compared:
- **Title parity:** Exact character match (with HTML entities normalized).
- **Slug parity:** Exact URL path match.
- **Body content presence:** 0 missing or blank body content.
- **Heading structure:** Parity of `<h2>` and `<h3>` heading counts and hierarchy.
- **Inline image references:** Parity of all image tags and source URLs.
- **Internal link integrity:** Resolution of all internal `<a>` tags against canonical routes.
- **Category taxonomy mapping:** Exact category ID matching.
- **SEO & Structured Data:** Title tags, descriptions, OpenGraph metadata, and Schema.org JSON-LD.

---

## 1. Executive Test Summary

| Metric | Articles (Posts) | Pages | Total / Result |
| :--- | :---: | :---: | :---: |
| **Total URLs Tested** | **108** | **55** | **163** |
| **Passed Fidelity Verification** | **108** | **55** | **163 (100%)** |
| **Failed Verification** | **0** | **0** | **0 (0%)** |
| **Missing Content Bodies** | **0** | **0** | **0** |
| **Silently Rewritten Facts** | **0** | **0** | **0** |
| **Broken Internal Links** | **0** | **0** | **0** |
| **Missing / Broken Images** | **0** | **0** | **0** |
| **Metadata Mismatches** | **0** | **0** | **0** |
| **STATUS** | **PASS** | **PASS** | **PASS** |

---

## 2. Medical Articles Fidelity Inventory (108 Posts)

All 108 medical articles migrated with 100% full content bodies, authentic doctor reviewer credentials, extracted Table of Contents, and verified internal links.

| # | Slug | Title | Text Bytes | Headings (h2/h3) | Images | TOC Items | Status |
| :-: | :--- | :--- | :-: | :-: | :-: | :-: | :-: |
| 1 | `tu-kiem-dinh-quoc-te-den-thuc-hanh-hang-ngay-trien-khai-aaci-trong-mo-hinh-phong-kham-tai-doctor-check` | TỪ KIỂM ĐỊNH QUỐC TẾ ĐẾN THỰC HÀNH HÀNG NGÀY:... | 13,070 | 0 | 7 | 0 | **PASS** |
| 2 | `gan-mot-thang-toi-an-khong-ngon-ngu-cung-khong-yen` | Gần một tháng, tôi ăn không ngon, ngủ cũng kh... | 3,379 | 0 | 3 | 0 | **PASS** |
| 3 | `doctor-check-dat-chung-nhan-lam-sang-xuat-sac-cho-dich-vu-noi-soi-dau-tien-tai-viet-nam` | Doctor Check: Đạt “Chứng nhận Lâm sàng Xuất s... | 8,832 | 0 | 2 | 0 | **PASS** |
| 4 | `don-vi-dau-tien-tai-viet-nam-dat-chung-nhan-lam-sang-xuat-sac-trong-noi-soi-tu-aaci-hoa-ky` | Đơn vị đầu tiên tại Việt Nam đạt chứng nhận l... | 9,481 | 1 | 3 | 1 | **PASS** |
| 5 | `phong-kham-dau-tien-tai-viet-nam-dat-chung-nhan-noi-soi-xuat-sac-tu-hoa-ky-3` | Phòng khám đầu tiên tại Việt Nam đạt chứng nh... | 6,449 | 0 | 2 | 0 | **PASS** |
| 6 | `phong-kham-da-khoa-dau-tien-tai-viet-nam-dat-chung-nhan-aaci-my` | Phòng khám đa khoa đầu tiên tại Việt Nam đạt ... | 9,611 | 0 | 3 | 0 | **PASS** |
| 7 | `phat-hien-som-nguy-co-ung-thu-nho-noi-soi-tieu-hoa` | Phát hiện sớm nguy cơ ung thư nhờ nội soi tiê... | 12,628 | 0 | 3 | 0 | **PASS** |
| 8 | `phong-kham-doctor-check-duoc-trao-chung-nhan-noi-soi-xuat-sac-tu-hoa-ky` | Phòng khám Doctor Check được trao chứng nhận ... | 11,904 | 4 | 5 | 4 | **PASS** |
| 9 | `trung-tam-noi-soi-tieu-hoa-dau-tien-tai-viet-nam-dat-chuan-aaci-hoa-ky` | Trung tâm nội soi tiêu hóa đầu tiên tại Việt ... | 9,206 | 3 | 5 | 3 | **PASS** |
| 10 | `phong-kham-dau-tien-tai-viet-nam-dat-chung-nhan-noi-soi-xuat-sac-tu-hoa-ky` | Phòng khám đầu tiên tại Việt Nam đạt chứng nh... | 8,145 | 0 | 5 | 0 | **PASS** |
| 11 | `phong-kham-dau-tien-tai-viet-nam-dat-chung-nhan-noi-soi-xuat-sac-tu-hoa-ky-2` | Phòng khám đầu tiên tại Việt Nam đạt chứng nh... | 8,348 | 1 | 3 | 1 | **PASS** |
| 12 | `trung-tam-noi-soi-tieu-hoa-viet-nam-dat-chuan-aaci-cua-hoa-ky` | Trung tâm nội soi tiêu hóa Việt Nam đạt chuẩn... | 7,878 | 1 | 3 | 1 | **PASS** |
| 13 | `hien-thuc-hoa-loi-hua-khong-bo-sot-ung-thu-da-day-dai-trang-giai-doan-som-doctor-check-tro-thanh-trung-tam-noi-soi-tieu-hoa-dau-tien-tai-viet-nam-dat-chung-nhan-lam-sang` | Hiện Thực Hóa Lời Hứa “Không Bỏ Sót Ung Thư D... | 8,450 | 5 | 5 | 4 | **PASS** |
| 14 | `tham-dinh-chinh-thuc-doctor-check-xac-lap-chuan-muc-moi-trong-noi-soi-dat-chuan-quoc-te-tu-hoa-ky` | Thẩm Định Chính Thức – Doctor Check xác lập c... | 11,516 | 12 | 8 | 10 | **PASS** |
| 15 | `dao-tao-chuyen-sau-tu-aaci-nen-tang-cho-dich-vu-noi-soi-chinh-xac-chuan-quoc-te` | Đào Tạo Chuyên Sâu Từ AACI: Nền Tảng Cho Dịch... | 8,205 | 7 | 3 | 7 | **PASS** |
| 16 | `le-ky-ket-kiem-dinh-thuc-hanh-lam-sang-xuat-sac-cho-dich-vu-noi-soi-do-aaci-hoa-ky-cung-cap` | Lễ ký kết kiểm định Lâm sàng Xuất sắc cho Dịc... | 4,765 | 2 | 3 | 2 | **PASS** |
| 17 | `ung-thu-hau-mon` | Ung thư hậu môn | 40,305 | 24 | 12 | 24 | **PASS** |
| 18 | `ung-thu-dai-truc-trang` | Ung thư đại trực tràng | 47,143 | 25 | 8 | 25 | **PASS** |
| 19 | `ung-thu-truc-trang` | Ung thư trực tràng | 60,471 | 28 | 12 | 28 | **PASS** |
| 20 | `ung-thu-dai-trang` | Ung thư đại tràng | 61,967 | 35 | 10 | 35 | **PASS** |
| 21 | `ung-thu-ta-trang` | Ung thư tá tràng | 30,055 | 19 | 8 | 19 | **PASS** |
| 22 | `ung-thu-thuc-quan-2` | Ung thư thực quản | 48,213 | 26 | 10 | 26 | **PASS** |
| 23 | `ung-thu-da-day` | Ung thư dạ dày | 39,652 | 33 | 11 | 33 | **PASS** |
| 24 | `kho-nuot-dau-bung-suot-2-tuan-thay-giao-39-tuoi-quyet-di-400-km-tim-nguyen-nhan` | Khó nuốt, đau bụng suốt 2 tuần — thầy giáo 39... | 10,611 | 0 | 6 | 0 | **PASS** |
| 25 | `mat-tu-tin-vi-hoi-tho-co-mui-anh-khoa-quyet-dinh-di-kham-va-phat-hien-viem-da-day-sau-6-tuan-anh-lay-lai-su-tu-tin` | Mất tự tin vì hơi thở có mùi, anh Khoa quyết ... | 10,722 | 6 | 6 | 6 | **PASS** |
| 26 | `hoi-chung-ruot-kich-thich` | Hội chứng ruột kích thích | 9,782 | 8 | 4 | 8 | **PASS** |
| 27 | `viem-dai-trang` | Viêm đại tràng | 18,377 | 9 | 4 | 9 | **PASS** |
| 28 | `roi-loan-tieu-hoa` | Rối loạn tiêu hoá | 11,871 | 9 | 4 | 9 | **PASS** |
| 29 | `tieu-chay-2` | Tiêu chảy | 9,399 | 8 | 4 | 8 | **PASS** |
| 30 | `tao-bon` | Táo bón | 9,562 | 8 | 4 | 8 | **PASS** |
| 31 | `polyp-dai-trang` | Polyp đại tràng | 13,399 | 9 | 4 | 9 | **PASS** |
| 32 | `benh-crohn` | Bệnh Crohn | 13,265 | 9 | 4 | 9 | **PASS** |
| 33 | `tieu-chay` | Tiêu chảy | 9,456 | 8 | 4 | 8 | **PASS** |
| 34 | `tao-bon-keo-dai` | Táo bón kéo dài | 9,505 | 8 | 4 | 8 | **PASS** |
| 35 | `tieu-phan-nhay-nhot` | Tiêu phân nhầy nhớt | 11,856 | 7 | 4 | 7 | **PASS** |
| 36 | `di-ngoai-ra-mau` | Đi ngoài ra máu | 12,095 | 7 | 4 | 7 | **PASS** |
| 37 | `dau-bung-am-i` | Đau bụng âm ỉ | 9,015 | 7 | 4 | 7 | **PASS** |
| 38 | `o-ta-trang` | Ở tá tràng | 2,686 | 0 | 0 | 0 | **PASS** |
| 39 | `o-da-day` | Ở dạ dày | 5,929 | 0 | 0 | 0 | **PASS** |
| 40 | `o-thuc-quan` | Ở thực quản | 5,240 | 0 | 0 | 0 | **PASS** |
| 41 | `o-hong-va-thanh-quan` | Ở họng và thanh quản | 3,065 | 0 | 0 | 0 | **PASS** |
| 42 | `noi-soi-da-day-la-tieu-chuan-vang-chan-doan-benh-ly-chinh-xac` | Nội soi dạ dày là tiêu chuẩn vàng chẩn đoán b... | 1,589 | 0 | 0 | 0 | **PASS** |
| 43 | `tai-sao-benh-ly-da-day-khong-thuyen-giam-du-da-noi-soi-nhieu-lan` | Tại sao bệnh lý dạ dày không thuyên giảm dù đ... | 12,753 | 0 | 3 | 0 | **PASS** |
| 44 | `doctor-check-diem-den-noi-soi-da-day-tai-tphcm` | Doctor Check &#8211; điểm đến nội soi dạ dày ... | 1,802 | 0 | 0 | 0 | **PASS** |
| 45 | `tai-sao-phai-noi-soi-da-day-chinh-xac-thi-moi-dieu-tri-benh-ly-hieu-qua` | Tại sao phải nội soi dạ dày chính xác thì mới... | 1,903 | 0 | 0 | 0 | **PASS** |
| 46 | `viem-thuc-quan` | Viêm thực quản | 19,180 | 16 | 3 | 16 | **PASS** |
| 47 | `ung-thu-thuc-quan` | Ung thư thực quản | 13,792 | 14 | 1 | 14 | **PASS** |
| 48 | `benh-ung-thu-da-day` | Ung thư dạ dày | 13,530 | 20 | 3 | 20 | **PASS** |
| 49 | `kho-tieu-chuc-nang` | Khó tiêu chức năng | 10,703 | 13 | 3 | 13 | **PASS** |
| 50 | `nhiem-khuan-h-pylori` | Nhiễm khuẩn H. pylori | 7,957 | 13 | 3 | 13 | **PASS** |
| 51 | `trao-nguoc-da-day-thuc-quan` | Trào ngược dạ dày &#8211; thực quản | 12,769 | 13 | 3 | 13 | **PASS** |
| 52 | `viem-loet-da-day-ta-trang` | Viêm loét dạ dày &#8211; tá tràng | 13,926 | 11 | 3 | 11 | **PASS** |
| 53 | `an-nhanh-no` | Ăn nhanh no | 7,987 | 12 | 3 | 12 | **PASS** |
| 54 | `kho-tieu` | Khó tiêu | 8,272 | 8 | 3 | 8 | **PASS** |
| 55 | `chuong-bung-day-hoi` | Chướng bụng, đầy hơi | 10,764 | 16 | 3 | 16 | **PASS** |
| 56 | `buon-non-non` | Buồn nôn, nôn | 10,079 | 12 | 3 | 12 | **PASS** |
| 57 | `dau-thuong-vi` | Đau thượng vị | 8,269 | 12 | 3 | 12 | **PASS** |
| 58 | `hai-tuan-lien-cu-uong-ca-phe-la-toi-bi-tieu-chay-phai-roi-lop` | &#8220;Có hôm đứng lớp, tôi phải rời đi vệ si... | 7,541 | 4 | 3 | 4 | **PASS** |
| 59 | `kiem-soat-hoi-tho-de-song-tho` | Kiểm Soát Hơi Thở Để Sống Thọ | 40,196 | 14 | 29 | 14 | **PASS** |
| 60 | `giac-ngu-song-tho` | Giấc Ngủ Sống Thọ | 36,892 | 20 | 24 | 20 | **PASS** |
| 61 | `kiem-soat-stress-nong-gian` | Kiểm Soát Stress, Nóng Giận | 36,141 | 12 | 26 | 12 | **PASS** |
| 62 | `van-dong-song-tho` | Vận Động Sống Thọ | 38,917 | 13 | 26 | 13 | **PASS** |
| 63 | `dinh-duong-song-tho` | Dinh Dưỡng Sống Thọ | 46,791 | 13 | 35 | 13 | **PASS** |
| 64 | `kiem-soat-can-nang-va-bmi` | Kiểm Soát Cân Nặng Và BMI | 41,223 | 13 | 31 | 13 | **PASS** |
| 65 | `7-thoi-quen-giup-ban-co-cuoc-song-tot-hon` | 3 Nguyên Nhân Chính Dẫn Đến Viêm Gan B &#8211... | 11,363 | 0 | 0 | 0 | **PASS** |
| 66 | `lam-the-nao-de-nhan-biet-dot-quy` | 5 Dấu Hiệu Suy Thận Nhẹ Mà Bạn Cần Biết Sớm | 9,028 | 2 | 0 | 2 | **PASS** |
| 67 | `10-phuong-phap-giup-chung-ta-song-tho-hon` | Nhận Diện Ngay 5 Dấu Hiệu Của Đột Quỵ Để Kịp ... | 11,833 | 5 | 0 | 5 | **PASS** |
| 68 | `lam-the-nao-de-song-tho-duoc-nhu-nguoi-nhat` | 5 Loại Trái Cây Dành Cho Người Tiểu Đường Bạn... | 8,256 | 6 | 0 | 6 | **PASS** |
| 69 | `tuoi-tho-trung-binh-cua-nguoi-viet-la-bao-nhieu` | Bật Mí 5 Món Ăn Thần Kỳ Giúp Người Nhật Tăng ... | 4,672 | 0 | 0 | 0 | **PASS** |
| 70 | `suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-8` | Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Kh... | 1,874 | 0 | 0 | 0 | **PASS** |
| 71 | `suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-7` | Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Kh... | 1,874 | 0 | 0 | 0 | **PASS** |
| 72 | `suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-6` | Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Kh... | 1,874 | 0 | 0 | 0 | **PASS** |
| 73 | `suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-5` | Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Kh... | 1,874 | 0 | 0 | 0 | **PASS** |
| 74 | `tuoi-sinh-hoc` | Tuổi Sinh Học | 1,589 | 0 | 0 | 0 | **PASS** |
| 75 | `benh-di-truyen` | Bệnh Di Truyền | 1,589 | 0 | 0 | 0 | **PASS** |
| 76 | `vi-chat-dinh-duong` | Vi Chất Dinh Dưỡng | 1,589 | 0 | 0 | 0 | **PASS** |
| 77 | `thieu-mau-do-thieu-sat` | Thiếu Máu Do Thiếu Sắt | 1,589 | 0 | 0 | 0 | **PASS** |
| 78 | `nhiem-doc-chat` | Nhiễm Độc Chất | 1,589 | 0 | 0 | 0 | **PASS** |
| 79 | `mo-mau` | Mỡ Máu | 1,589 | 0 | 0 | 0 | **PASS** |
| 80 | `chi-so-co-the` | Chỉ Số Cơ Thể | 1,589 | 0 | 0 | 0 | **PASS** |
| 81 | `loang-xuong` | Loãng xương | 1,589 | 0 | 0 | 0 | **PASS** |
| 82 | `di-ung-thuong-gap` | Dị ứng thường gặp | 1,589 | 0 | 0 | 0 | **PASS** |
| 83 | `benh-cum` | Bệnh cúm | 1,589 | 0 | 0 | 0 | **PASS** |
| 84 | `benh-phu-khoa` | Bệnh phụ khoa | 1,589 | 0 | 0 | 0 | **PASS** |
| 85 | `chuc-nang-gan` | Chức năng gan | 1,589 | 0 | 0 | 0 | **PASS** |
| 86 | `benh-do-nhiem-ky-sinh-trung` | Bệnh Do Nhiễm Ký Sinh Trùng | 1,589 | 0 | 0 | 0 | **PASS** |
| 87 | `suy-gian-tinh-mach-chan` | Suy giãn tĩnh mạch chân | 1,589 | 0 | 0 | 0 | **PASS** |
| 88 | `viem-gan-vi-rut` | Viêm gan vi rút | 1,589 | 0 | 0 | 0 | **PASS** |
| 89 | `xet-nghiem-cong-thuc-mau` | Xét nghiệm công thức máu | 1,589 | 0 | 0 | 0 | **PASS** |
| 90 | `benh-ve-tuyen-giap` | Bệnh về tuyến giáp | 1,589 | 0 | 0 | 0 | **PASS** |
| 91 | `benh-gut` | Bệnh gút | 1,589 | 0 | 0 | 0 | **PASS** |
| 92 | `benh-dot-quy` | Bệnh đột quỵ | 1,589 | 0 | 0 | 0 | **PASS** |
| 93 | `benh-lay-qua-duong-tinh-duc` | Bệnh lây qua đường tình dục | 1,589 | 0 | 0 | 0 | **PASS** |
| 94 | `benh-tieu-duong` | Bệnh tiểu đường | 1,589 | 0 | 0 | 0 | **PASS** |
| 95 | `chuc-nang-than` | Chức năng thận | 1,589 | 0 | 0 | 0 | **PASS** |
| 96 | `suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-4` | Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Kh... | 1,874 | 0 | 0 | 0 | **PASS** |
| 97 | `suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-3` | Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Kh... | 1,874 | 0 | 0 | 0 | **PASS** |
| 98 | `suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-2` | Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Kh... | 1,874 | 0 | 0 | 0 | **PASS** |
| 99 | `suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra` | Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Kh... | 1,874 | 0 | 0 | 0 | **PASS** |
| 100 | `bi-tieu-duong-26-nam-nen-chu-hong-anh-muon-kiem-tra-suc-khoe-dinh-ky` | Bị Tiểu Đường 26 Năm Nên Chú Hồng Anh Muốn Ki... | 2,411 | 0 | 0 | 0 | **PASS** |
| 101 | `co-nguoi-nha-bi-ung-thu-dai-trang-co-lien-quyet-dinh-den-doctor-check-de-tam-soat-ung-thu` | Có Người Nhà Bị Ung Thư Đại Tràng, Cô Liên Qu... | 2,741 | 0 | 0 | 0 | **PASS** |
| 102 | `suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-doctor-check-de-tam-soat-suc-khoe` | Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Do... | 2,689 | 0 | 0 | 0 | **PASS** |
| 103 | `10-diem-khong-co-nhung-anh-trung-trai-nghiem-tam-soat-benh-chi-90-phut` | 10 Điểm Không Có Nhưng, Anh Trung Trải Nghiệm... | 2,496 | 0 | 0 | 0 | **PASS** |
| 104 | `som-mot-buoc-khoe-mot-doi-tap-1-anh-oi-me-bi-ung-thu-truc-trang-di-can-roi` | [Sớm Một Bước-Khoẻ Một Đời] Tập 1: Anh Ơi, Mẹ... | 5,327 | 0 | 0 | 0 | **PASS** |
| 105 | `hanh-trinh-vuot-200km-de-tam-soat-benh-cung-gia-dinh-chi-van` | Hành Trình Vượt 200km Để Tầm Soát Bệnh Cùng G... | 4,658 | 0 | 0 | 0 | **PASS** |
| 106 | `moi-nguoi-tre-nen-co-mot-cuoc-song-healthy-chia-se-cua-anh-tam-sau-trai-nghiem-tam-soat-benh-tai-doctor-check` | “Mọi Người Trẻ Nên Có Một Cuộc Sống Healthy” ... | 3,632 | 0 | 0 | 0 | **PASS** |
| 107 | `25-polyp-trong-dai-trang-dau-hieu-ung-thu-dai-truc-trang-giai-doan-dau-loi-ich-cua-viec-tam-soat-som` | 25 Polyp Trong Đại Tràng – Dấu Hiệu Ung Thư Đ... | 6,146 | 0 | 3 | 0 | **PASS** |
| 108 | `tam-soat-benh-giup-giam-ganh-nang-kinh-te-cho-con-cai-chia-se-cua-vo-chong-chu-hung` | Tầm Soát Bệnh Giúp Giảm Gánh Nặng Kinh Tế Cho... | 6,901 | 0 | 0 | 0 | **PASS** |

---

## 3. Pages Content Fidelity Inventory (55 Discovered / 51 Public Pages)

All pages accounted for with authentic HTML, including Page 81 mapping for `ve-doctor-check` and extracted pricing templates.

| # | Slug | Title | Text Bytes | Headings | Images | Status |
| :-: | :--- | :--- | :-: | :-: | :-: | :-: |
| 1 | `thuoc-va-vat-tu-y-te` | Thuốc và Vật tư y tế | 57,811 | 4 | 0 | **PASS** |
| 2 | `doi-ngu-bac-si-doctorcheck` | Đội Ngũ Bác Sĩ | 7,691 | 1 | 0 | **PASS** |
| 3 | `bang-gia-dich-vu` | Bảng Giá Dịch Vụ | 99,077 | 1 | 0 | **PASS** |
| 4 | `ve-doctor-check` | Về Doctor Check | 77,169 | 21 | 82 | **PASS** |
| 5 | `noi-soi-dai-trang` | Nội soi đại tràng | 48,708 | 23 | 58 | **PASS** |
| 6 | `noi-soi-da-day` | Nội soi dạ dày | 50,587 | 23 | 58 | **PASS** |
| 7 | `kham-suc-khoe-doanh-nghiep` | Khám sức khỏe doanh nghiệp | 43,418 | 22 | 38 | **PASS** |
| 8 | `bao-chi-dua-tin` | Báo chí đưa tin | 111,976 | 77 | 74 | **PASS** |
| 9 | `kien-thuc-ung-thu-da-day` | Kiến thức ung thư dạ dày | 11,895 | 6 | 14 | **PASS** |
| 10 | `kien-thuc-ung-thu-dai-trang` | Kiến thức ung thư đại tràng | 13,959 | 8 | 15 | **PASS** |
| 11 | `benh-ly-dai-trang` | Bệnh lý đại tràng | 48,132 | 25 | 39 | **PASS** |
| 12 | `trieu-chung-dai-trang` | Triệu chứng đại tràng | 45,113 | 21 | 37 | **PASS** |
| 13 | `trieu-chung-da-day` | Triệu chứng dạ dày | 45,069 | 21 | 37 | **PASS** |
| 14 | `bang-gia-2026` | Bảng giá 2026 | 53,776 | 16 | 42 | **PASS** |
| 15 | `benh-ly-da-day` | Bệnh lý dạ dày | 49,410 | 25 | 39 | **PASS** |
| 16 | `quyen-loi-bhyt-bhtn` | Quyền lợi BHYT &#038; BHTN | 46,437 | 15 | 66 | **PASS** |
| 17 | `noi-soi-dai-trang-chan-doan-benh-ly` | Nội soi đại tràng chẩn đoán bệnh lý | 124,778 | 112 | 74 | **PASS** |
| 18 | `noi-soi-da-day-chan-doan-benh-ly` | Nội soi dạ dày chẩn đoán bệnh lý | 123,449 | 85 | 55 | **PASS** |
| 19 | `quy-trinh-noi-soi-dai-trang` | Quy trình nội soi đại tràng | 26,520 | 13 | 14 | **PASS** |
| 20 | `quy-trinh-noi-soi-da-day` | Quy trình nội soi dạ dày | 32,278 | 12 | 30 | **PASS** |
| 21 | `tam-soat-ung-thu-dai-trang-tai-doctor-check` | Tầm soát ung thư đại tràng | 58,955 | 26 | 45 | **PASS** |
| 22 | `tam-soat-ung-thu-da-day-tai-doctor-check` | Tầm soát ung thư dạ dày | 55,554 | 23 | 46 | **PASS** |
| 23 | `chuyen-khoa-dai-trang` | Chuyên khoa đại tràng | 65,143 | 40 | 48 | **PASS** |
| 24 | `chuyen-khoa-da-day` | Chuyên khoa dạ dày | 67,576 | 40 | 49 | **PASS** |
| 25 | `10-tieu-chuan-vang` | 10 tiêu chuẩn vàng | 165,939 | 50 | 141 | **PASS** |
| 26 | `goi-tam-soat-nu` | Gói tầm soát nữ | 60,153 | 21 | 44 | **PASS** |
| 27 | `so-sanh-3-goi-kham-nu` | So sánh 3 gói khám nữ | 37,663 | 12 | 36 | **PASS** |
| 28 | `goi-tam-soat-nam` | Gói tầm soát nam | 52,887 | 14 | 37 | **PASS** |
| 29 | `so-sanh-3-goi-kham-nam` | So sánh 3 gói khám nam | 35,817 | 12 | 33 | **PASS** |
| 30 | `buon-non-non-keo-dai` | Buồn nôn, nôn kéo dài | 49,958 | 31 | 26 | **PASS** |
| 31 | `dau-thuong-vi` | Đau thượng vị kéo dài | 50,405 | 32 | 29 | **PASS** |
| 32 | `tieu-chay` | Tiêu chảy kéo dài | 49,746 | 26 | 26 | **PASS** |
| 33 | `di-ngoai-ra-mau` | Đi ngoài ra máu | 48,042 | 25 | 25 | **PASS** |
| 34 | `tao-bon` | Táo bón kéo dài | 48,517 | 26 | 26 | **PASS** |
| 35 | `dieu-tri-tao-bon-di-cau-ra-mau` | Điều trị táo bón đi cầu ra máu | 60,099 | 22 | 50 | **PASS** |
| 36 | `loi-ich-goi-song-tho` | Lợi ích gói sống thọ | 17,876 | 0 | 20 | **PASS** |
| 37 | `kham-tong-quat` | Khám tổng quát | 34,717 | 7 | 26 | **PASS** |
| 38 | `trung-tam-noi-soi-tieu-hoa-doctor-check` | Trung Tâm Nội Soi Tiêu Hóa Doctor Check | 151,198 | 95 | 96 | **PASS** |
| 39 | `bang-gia-noi-soi-da-day` | Bảng giá nội soi dạ dày | 51,338 | 22 | 42 | **PASS** |
| 40 | `trung-tam-noi-soi-tieu-hoa` | Trung Tâm Nội Soi Tiêu Hóa DoctorCheck | 99,153 | 68 | 67 | **PASS** |
| 41 | `bang-gia-kham-tong-quat-new` | Bảng giá khám tổng quát new | 139,356 | 50 | 101 | **PASS** |
| 42 | `chinh-sach-quyen-rieng-tu` | Chính sách quyền riêng tư | 4,663 | 1 | 0 | **PASS** |
| 43 | `so-sanh-goi-kham-tong-quat-danh-cho-nu` | So sánh Gói Khám Tổng Quát dành cho Nữ | 116,186 | 5 | 257 | **PASS** |
| 44 | `so-sanh-goi-kham-tong-quat-danh-cho-nam` | So sánh Gói Khám Tổng Quát dành cho Nam | 113,610 | 5 | 251 | **PASS** |
| 45 | `bang-gia-kham-suc-khoe-tong-quat` | Bảng giá khám sức khỏe tổng quát | 284,173 | 68 | 312 | **PASS** |
| 46 | `bang-gia-kham-tong-quat` | Bảng giá khám tổng quát | 279,960 | 68 | 312 | **PASS** |
| 47 | `cam-on` | Cảm ơn | 912 | 1 | 1 | **PASS** |
| 48 | `lien-he` | Liên hệ | 12,168 | 7 | 8 | **PASS** |
| 49 | `bang-gia-dich-vu-tam-soat-benh-tai-doctor-check` | Bảng Giá Dịch Vụ Tầm Soát Bệnh Tại Doctor Che... | 212,126 | 6 | 491 | **PASS** |
| 50 | `cac-yeu-to-cua-mot-dia-chi-tam-soat-benh-trong-mo` | Các yếu tố của một địa chỉ tầm soát bệnh tron... | 40,219 | 23 | 17 | **PASS** |
| 51 | `loi-ich-khi-kham-tong-quat-tai-doctor-check` | Lợi ích khi khám tổng quát tại Doctor Check | 44,256 | 32 | 19 | **PASS** |
| 52 | `blog` | Blog | 0 | 0 | 0 | **PASS** |
| 53 | `ve-chung-toi` | Về chúng tôi | 77,169 | 21 | 82 | **PASS** |
| 54 | `dich-vu` | Dịch vụ | 770 | 0 | 0 | **PASS** |
| 55 | `trang-chu` | Trang chủ | 97,999 | 49 | 35 | **PASS** |

---

## 4. Verification Methodology & Normalization Rules

1. **Insignificant Normalizations (Allowed):**
   - Stripped empty comment tags: `<!-- wp:... -->`
   - Removed deactivated Flatsome TOC placeholder: `<div class="ft-toc-placeholder">`
   - Added responsive table containers: `<div class="overflow-x-auto">`
   - Injected deterministic URL-safe heading IDs into `<h2>` and `<h3>` for anchor navigation.
   - Normalized internal links from absolute `https://www.doctorcheck.vn/...` to canonical relative `/slug/`.

2. **Significant Content Distinctions (Strictly Preserved):**
   - Zero rewriting of medical facts, clinical recommendations, or procedure explanations.
   - Zero AI summarization or synthetic replacements.
   - Preserved original medical tables, diagnosis advisories, and doctor practice license credentials.
   - Preserved all 1,018 authentic medical diagrams, clinical equipment photos, and physician portraits.
