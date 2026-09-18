'use client';

import React, { useState } from 'react';
import { Check, Minus } from 'lucide-react';

interface ComparisonItem {
  name: string;
  note?: string;
  khuyenCao: boolean | string;
  chuyenSau: boolean | string;
  songTho: boolean | string;
}

interface CategoryGroup {
  category: string;
  items: ComparisonItem[];
}

const maleComparisonData: CategoryGroup[] = [
  {
    category: 'I. Khám Lâm Sàng & Tư Vấn Chuyên Sâu',
    items: [
      { name: 'Khám nội tổng quát và đo dấu sinh hiệu, chỉ số BMI', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Tư vấn dinh dưỡng và đánh giá nguy cơ tim mạch - chuyển hóa', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Hội chẩn 1:1 cùng Bác Sĩ Chuyên Khoa II', khuyenCao: false, chuyenSau: true, songTho: true },
    ],
  },
  {
    category: 'II. Chẩn Đoán Hình Ảnh & Thăm Dò Chức Năng',
    items: [
      { name: 'Chụp X-quang tim phổi kỹ thuật số thẳng', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Đo điện tâm đồ (ECG) 3 kênh kiểm tra nhịp tim', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Siêu âm ổ bụng tổng quát màu', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Siêu âm tuyến tiền liệt & hệ tiết niệu bàng quang', khuyenCao: false, chuyenSau: true, songTho: true },
      { name: 'Siêu âm tuyến giáp phát hiện nhân giáp', khuyenCao: false, chuyenSau: true, songTho: true },
      { name: 'Đo xơ vữa động mạch & nguy cơ tai biến mạch máu não', khuyenCao: false, chuyenSau: false, songTho: true },
    ],
  },
  {
    category: 'III. Xét Nghiệm Máu & Sinh Hóa Đánh Giá Chức Năng',
    items: [
      { name: 'Tổng phân tích tế bào máu ngoại vi (18 thông số)', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Đường huyết đói (Glucose) tầm soát đái tháo đường', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Đánh giá chức năng lọc thận (Ure, Creatinine)', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Đánh giá men gan (AST, ALT, GGT)', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Định lượng Axit Uric máu tầm soát bệnh Gout', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Bộ mỡ máu toàn diện (Cholesterol, Triglyceride, HDL, LDL)', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Tổng phân tích nước tiểu (10 thông số)', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Xét nghiệm kháng nguyên viêm gan siêu vi B (HBsAg)', khuyenCao: false, chuyenSau: true, songTho: true },
      { name: 'Kiểm tra vi khuẩn Helicobacter pylori (HP) hơi thở C13/C14', khuyenCao: false, chuyenSau: true, songTho: true },
    ],
  },
  {
    category: 'IV. Dấu Ấn Ung Thư Sớm (Tumor Markers)',
    items: [
      { name: 'Tầm soát ung thư gan sớm (AFP)', khuyenCao: false, chuyenSau: true, songTho: true },
      { name: 'Tầm soát ung thư tiền liệt tuyến (PSA toàn phần)', khuyenCao: false, chuyenSau: true, songTho: true },
      { name: 'Tầm soát ung thư đường tiêu hóa (CEA)', khuyenCao: false, chuyenSau: true, songTho: true },
      { name: 'Bộ dấu ấn tầm soát 9 loại ung thư phổ biến nam giới', khuyenCao: false, chuyenSau: false, songTho: true },
    ],
  },
  {
    category: 'V. Nội Soi Tiêu Hóa Không Đau Chuẩn Quốc Tế',
    items: [
      { name: 'Nội soi dạ dày tiền mê không đau (Olympus EVIS-X1)', khuyenCao: false, chuyenSau: false, songTho: true },
      { name: 'Nội soi toàn bộ đại tràng tiền mê không đau phóng đại', khuyenCao: false, chuyenSau: false, songTho: true },
      { name: 'Can thiệp cắt polyp tiêu hóa tức thì (nếu có chỉ định)', khuyenCao: false, chuyenSau: false, songTho: true },
    ],
  },
];

const femaleComparisonData: CategoryGroup[] = [
  {
    category: 'I. Khám Lâm Sàng & Tư Vấn Chuyên Sâu',
    items: [
      { name: 'Khám nội tổng quát và đo dấu sinh hiệu, chỉ số BMI', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Khám phụ khoa và tầm soát tế bào cổ tử cung cơ bản', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Tư vấn dinh dưỡng và phác đồ theo dõi cá nhân hóa', khuyenCao: false, chuyenSau: true, songTho: true },
      { name: 'Hội chẩn 1:1 cùng Bác Sĩ Chuyên Khoa II', khuyenCao: false, chuyenSau: false, songTho: true },
    ],
  },
  {
    category: 'II. Chẩn Đoán Hình Ảnh & Thăm Dò Chức Năng',
    items: [
      { name: 'Chụp X-quang tim phổi kỹ thuật số thẳng', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Đo điện tâm đồ (ECG) 3 kênh kiểm tra nhịp tim', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Siêu âm ổ bụng tổng quát màu', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Siêu âm tuyến giáp phát hiện nhân giáp, bướu cổ', khuyenCao: false, chuyenSau: true, songTho: true },
      { name: 'Siêu âm tuyến vú 2 bên tầm soát u nang, tổn thương sớm', khuyenCao: false, chuyenSau: true, songTho: true },
      { name: 'Đo mật độ khoáng chất xương tầm soát loãng xương', khuyenCao: false, chuyenSau: false, songTho: true },
      { name: 'Đo xơ vữa động mạch & nguy cơ tai biến', khuyenCao: false, chuyenSau: false, songTho: true },
    ],
  },
  {
    category: 'III. Xét Nghiệm Máu & Sinh Hóa Chức Năng',
    items: [
      { name: 'Tổng phân tích tế bào máu ngoại vi (18 thông số)', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Đường huyết đói (Glucose) tầm soát đái tháo đường', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Đánh giá chức năng lọc thận (Ure, Creatinine)', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Đánh giá men gan (AST, ALT, GGT)', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Bộ mỡ máu toàn diện (Cholesterol, Triglyceride, HDL, LDL)', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Tổng phân tích nước tiểu (10 thông số)', khuyenCao: true, chuyenSau: true, songTho: true },
      { name: 'Xét nghiệm kháng nguyên viêm gan B (HBsAg)', khuyenCao: false, chuyenSau: true, songTho: true },
      { name: 'Kiểm tra vi khuẩn Helicobacter pylori (HP) hơi thở C13/C14', khuyenCao: false, chuyenSau: true, songTho: true },
    ],
  },
  {
    category: 'IV. Dấu Ấn Ung Thư Sớm (Tumor Markers)',
    items: [
      { name: 'Dấu ấn tầm soát ung thư gan sớm (AFP)', khuyenCao: false, chuyenSau: true, songTho: true },
      { name: 'Dấu ấn tầm soát ung thư buồng trứng (CA 125)', khuyenCao: false, chuyenSau: true, songTho: true },
      { name: 'Dấu ấn tầm soát ung thư vú (CA 15-3)', khuyenCao: false, chuyenSau: true, songTho: true },
      { name: 'Bộ dấu ấn tầm soát 10 loại ung thư phổ biến ở nữ giới', khuyenCao: false, chuyenSau: false, songTho: true },
    ],
  },
  {
    category: 'V. Nội Soi Tiêu Hóa Tiền Mê Chuẩn Quốc Tế',
    items: [
      { name: 'Nội soi dạ dày tiền mê không đau (Olympus EVIS-X1)', khuyenCao: false, chuyenSau: false, songTho: true },
      { name: 'Nội soi toàn bộ đại tràng tiền mê không đau', khuyenCao: false, chuyenSau: false, songTho: true },
      { name: 'Cắt polyp tiêu hóa và làm sinh thiết mô bệnh học', khuyenCao: false, chuyenSau: false, songTho: true },
    ],
  },
];

export function PricingComparisonTable() {
  const [activeGender, setActiveGender] = useState<'male' | 'female'>('male');
  const data = activeGender === 'male' ? maleComparisonData : femaleComparisonData;

  const prices = activeGender === 'male'
    ? { khuyenCao: '2.990.000đ', chuyenSau: '5.000.000đ', songTho: '11.500.000đ' }
    : { khuyenCao: '3.000.000đ', chuyenSau: '5.000.000đ', songTho: '11.500.000đ' };

  return (
    <div className="w-full my-8">
      {/* Gender Tab Switcher */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex p-1.5 rounded-full bg-[#E5F3F7] shadow-inner gap-1">
          <button
            type="button"
            onClick={() => setActiveGender('male')}
            className={`px-6 sm:px-8 py-2 rounded-full font-bold text-sm sm:text-base transition-all duration-300 cursor-pointer ${
              activeGender === 'male'
                ? 'bg-[#005570] text-white shadow-sm'
                : 'text-[#005570] hover:text-[#00475B]'
            }`}
          >
            Dành Cho Nam
          </button>
          <button
            type="button"
            onClick={() => setActiveGender('female')}
            className={`px-6 sm:px-8 py-2 rounded-full font-bold text-sm sm:text-base transition-all duration-300 cursor-pointer ${
              activeGender === 'female'
                ? 'bg-[#005570] text-white shadow-sm'
                : 'text-[#005570] hover:text-[#00475B]'
            }`}
          >
            Dành Cho Nữ
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-gray-500 italic mb-4">
        Vuốt ngang trên điện thoại để xem chi tiết các cột
      </p>

      {/* Comparison Table Container */}
      <div className="comparison-table">
        <div className="pricing-table">
          {/* Header Row */}
          <div className="header-table">
            <div className="pricing-cell">
              <span className="font-extrabold text-[#005570] text-base">Hạng mục khám & Xét nghiệm</span>
            </div>
            <div className="pricing-cell">
              <div>
                <div className="font-bold text-[#005570] text-base">Gói Khuyến Cáo</div>
                <div className="text-sm font-black text-[#005570] mt-1">{prices.khuyenCao}</div>
              </div>
            </div>
            <div className="pricing-cell !bg-[#E5F3F7] border-x-2 border-[#005570]/30 relative">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#FFB500] text-[#00475B] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                Phổ biến
              </span>
              <div>
                <div className="font-bold text-[#005570] text-base">Gói Chuyên Sâu</div>
                <div className="text-sm font-black text-[#005570] mt-1">{prices.chuyenSau}</div>
              </div>
            </div>
            <div className="pricing-cell">
              <div>
                <div className="font-bold text-[#005570] text-base">Gói Sống Thọ</div>
                <div className="text-sm font-black text-[#005570] mt-1">{prices.songTho}</div>
              </div>
            </div>
          </div>

          {/* Grouped Rows */}
          {data.map((group, gIdx) => (
            <React.Fragment key={gIdx}>
              {/* Category Header */}
              <div className="pricing-row category-header">
                <div className="pricing-cell !w-full !flex-1 !justify-start !bg-[#E6F4F8] font-bold text-[#00475B]">
                  {group.category}
                </div>
              </div>

              {/* Items */}
              {group.items.map((item, iIdx) => (
                <div key={iIdx} className="pricing-row">
                  <div className="pricing-cell">
                    <span className="text-gray-800 text-xs sm:text-sm">{item.name}</span>
                    {item.note && <span className="block text-[11px] text-gray-500 mt-0.5">{item.note}</span>}
                  </div>
                  <div className="pricing-cell">
                    {renderCellVal(item.khuyenCao)}
                  </div>
                  <div className="pricing-cell !bg-[#F8FDFF] border-x-2 border-[#005570]/10">
                    {renderCellVal(item.chuyenSau)}
                  </div>
                  <div className="pricing-cell">
                    {renderCellVal(item.songTho)}
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderCellVal(val: boolean | string) {
  if (typeof val === 'string') {
    return <span className="font-semibold text-xs text-[#005570]">{val}</span>;
  }
  if (val) {
    return (
      <span className="w-6 h-6 rounded-full bg-[#E5F3F7] text-[#005570] flex items-center justify-center">
        <Check className="w-4 h-4 stroke-[3]" />
      </span>
    );
  }
  return (
    <span className="text-gray-300">
      <Minus className="w-4 h-4" />
    </span>
  );
}
