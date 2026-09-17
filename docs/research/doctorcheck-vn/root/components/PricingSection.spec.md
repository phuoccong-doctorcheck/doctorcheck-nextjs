# PricingSection Component Specification

## Overview
- **Target file:** `src/components/sites/doctorcheck-vn/root/PricingSection.tsx`
- **Interaction model:** Click-driven state switch between "Dành Cho Nữ" and "Dành Cho Nam".

## Content
- Heading H2: "Bảng Giá Các Gói Khám Tổng Quát tại Doctor Check"
- Subtitle: "Chẩn đoán dựa vào y học chứng cứ 100%, trang thiết bị hiện đại chuẩn quốc tế, không phát sinh chi phí."
- Gender Switcher Tabs:
  - Tab 1: "Dành Cho Nữ"
  - Tab 2: "Dành Cho Nam"

### Package Tiers:
1. **Gói Khuyến Cáo:**
   - Price: `3.000.000đ`
   - Highlights: 21 nhóm bệnh & 2 loại ung thư phổ biến
   - Duration: 60 - 90 phút
   - Features: Khám nội tổng quát, Siêu âm bụng tổng quát, Đo điện tim ECG, Xét nghiệm máu & sinh hóa cơ bản, Chụp X-quang phổi kỹ thuật số.
2. **Gói Chuyên Sâu:**
   - Price: `5.000.000đ` (Khuyên dùng / Phổ biến nhất)
   - Badge: "Được chọn nhiều nhất"
   - Highlights: 24 nhóm bệnh & 5 loại ung thư
   - Features: Toàn bộ gói Khuyến Cáo + Tầm soát ung thư gan, tiền liệt tuyến / cổ tử cung, Siêu âm tuyến giáp, Đo vi khuẩn HP qua hơi thở, Tư vấn chế độ dinh dưỡng.
3. **Gói Sống Thọ:**
   - Price: `11.500.000đ`
   - Highlights: 29 nhóm bệnh & 9 loại ung thư
   - Badge: "Toàn diện nhất"
   - Features: Toàn bộ gói Chuyên Sâu + Nội soi dạ dày - đại tràng tiền mê không đau bằng hệ thống Olympus EVIS-X1 / Fujifilm EP-7000, Tầm soát xơ vữa động mạch, Đánh giá nguy cơ đột quỵ & tim mạch, Kế hoạch sống thọ đến 85 tuổi.

## Computed Styles
- Active Tab: `background-color: #00475B; color: #FFFFFF; font-weight: 600; border-radius: 9999px;`
- Card Container: `background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E5E7EB; padding: 32px 24px;`
- Featured Card: `border: 2px solid #FFB500; box-shadow: 0 12px 36px rgba(0, 71, 91, 0.12); transform: scale(1.02);`
- CTA Button: `background-color: #FFB500; color: #00475B; font-weight: 700; border-radius: 9999px; width: 100%;`
