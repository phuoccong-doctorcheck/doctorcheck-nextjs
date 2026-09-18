'use client';

import React from 'react';

interface TimelineStep {
  step: number;
  title: string;
  description: string;
}

const defaultSteps: TimelineStep[] = [
  {
    step: 1,
    title: 'Đón tiếp và hoàn tất thủ tục',
    description: 'Điều dưỡng tiếp đón chu đáo, hướng dẫn khai báo thông tin bệnh sử và bảo mật hồ sơ điện tử.',
  },
  {
    step: 2,
    title: 'Khám sàng lọc và tư vấn cùng Bác sĩ CKII',
    description: 'Bác sĩ thăm khám lâm sàng kỹ lưỡng, chỉ định các xét nghiệm và chuẩn bị cần thiết trước nội soi.',
  },
  {
    step: 3,
    title: 'Làm sạch ống tiêu hóa chuẩn y khoa',
    description: 'Quy trình làm sạch đại tràng nhẹ nhàng, không gây buồn nôn, sử dụng thuốc nhập khẩu an toàn.',
  },
  {
    step: 4,
    title: 'Thực hiện cận lâm sàng & xét nghiệm an toàn',
    description: 'Đo điện tim (ECG), xét nghiệm đông máu và đánh giá chức năng trước gây mê/tiền mê.',
  },
  {
    step: 5,
    title: 'Khám tiền mê cùng Bác sĩ Gây mê Hồi sức',
    description: 'Đảm bảo kiểm soát huyết áp, nhịp tim và liều lượng thuốc tiền mê chuẩn xác tuyệt đối.',
  },
  {
    step: 6,
    title: 'Tiến hành nội soi tiền mê không đau (Olympus EVIS-X1)',
    description: 'Bác sĩ CKII thực hiện nội soi quan sát toàn diện, phóng đại nhuộm màu NBI phát hiện tổn thương vi thể.',
  },
  {
    step: 7,
    title: 'Hồi tỉnh êm ái tại phòng theo dõi riêng',
    description: 'Người bệnh nghỉ ngơi thoải mái, được phục vụ thức ăn nhẹ bổ dưỡng và kiểm tra sinh hiệu trước khi rời phòng.',
  },
  {
    step: 8,
    title: 'Bác sĩ giải thích kết quả và xây dựng phác đồ',
    description: 'Trả kết quả hình ảnh HD sắc nét, giải thích chi tiết và cấp đơn thuốc kèm hướng dẫn phòng ngừa.',
  },
  {
    step: 9,
    title: 'Đồng hành chăm sóc sức khỏe sau khám',
    description: 'Nhân viên y tế liên hệ hỏi thăm, theo dõi đáp ứng điều trị và nhắc lịch tái khám định kỳ.',
  },
];

interface PricingTimelineProps {
  title?: string;
  subtitle?: string;
  steps?: TimelineStep[];
}

export function PricingTimeline({
  title = '9 Bước Nội Soi Dạ Dày & Đại Tràng Không Đau',
  subtitle = 'Quy trình khép kín, an toàn tuyệt đối và đạt chuẩn chất lượng quốc tế',
  steps = defaultSteps,
}: PricingTimelineProps) {
  return (
    <section className="dc-timeline py-12 md:py-16 bg-[#FDFDF6]" id="procedure-timeline">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#005570]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="dc-timeline__list">
          {steps.map((item) => (
            <div key={item.step} className="dc-timeline__item">
              <div className="dc-tl-step">
                {item.step}
              </div>
              <div className="dc-content">
                <h3 className="text-lg font-bold text-[#005570] mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
