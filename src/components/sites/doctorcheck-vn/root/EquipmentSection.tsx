import React from 'react';
import Image from 'next/image';

export function EquipmentSection() {
  const equipmentItems = [
    {
      id: 'noi-soi',
      name: 'Hệ thống máy nội soi',
      desc: 'Máy nội soi Olympus EVIS-X1 CV-1500 & Máy nội soi Fujifilm EP-7000 tích hợp nhiều công nghệ tiên tiến, cho hình ảnh rõ nét, giúp Bác Sĩ đánh giá chính xác tổn thương.',
      image: '/sites/doctorcheck-vn/root/images/equipment/equip-noi-soi-master.webp',
    },
    {
      id: 'xet-nghiem',
      name: 'Hệ thống máy xét nghiệm',
      desc: 'Các máy xét nghiệm đến từ hãng: Abbott, Roche, Olympus, Cobas,... phân tích các mẫu hoàn toàn tự động, giúp chẩn đoán bệnh lý tiêu hóa – gan mật và tầm soát ung thư hệ tiêu hóa.',
      image: '/sites/doctorcheck-vn/root/images/equipment/equip-xet-nghiem-master.webp',
    },
    {
      id: 'sieu-am',
      name: 'Hệ thống máy siêu âm màu',
      desc: 'ACUSON Juniper từ hãng Siemens (Mỹ) cao cấp có thiết kế nhỏ gọn, màn hình cảm ứng lớn, hệ thống đầu đò đa dạng, giúp thu được hình ảnh chất lượng cao trong siêu âm cận lâm sàng tiêu hóa.',
      image: '/sites/doctorcheck-vn/root/images/equipment/equip-sieu-am-master.webp',
    },
    {
      id: 'x-quang',
      name: 'Máy chụp X-quang',
      desc: 'Hệ thống máy chụp X quang từ hãng Vikomed (Liên doanh Việt - Hàn) có thể thu nhận hình ảnh cả tư thế đứng & nằm, được sử dụng để khảo sát các bệnh lý bụng ngoại khoa, liệt ruột, tắc ruột,....',
      image: '/sites/doctorcheck-vn/root/images/equipment/equip-x-quang-master.webp',
    },
    {
      id: 'dien-tim',
      name: 'Máy đo điện tim 3 kênh',
      desc: 'Máy FX 8100 từ hãng Fukuda (Nhật Bản) có màn hình màu LCD 7” giúp quan sát rõ dạng sóng ECG, sóng lâm sàng và nhịp tim. Kết quả in được ở nhiều định dạng, cho người dùng dễ đọc dữ liệu.',
      image: '/sites/doctorcheck-vn/root/images/equipment/equip-dien-tim-master.webp',
    },
    {
      id: 'hpylori',
      name: 'Máy Đo H. pylori',
      desc: 'Máy FanHp từ hãng Fisher (Đức) được sử dụng để phân tích urease nhanh thông qua hơi thở, giúp sớm phát hiện nguy cơ mắc vi khuẩn Helicobacter pylori (HP) gây các bệnh lý trong dạ dày.',
      image: '/sites/doctorcheck-vn/root/images/equipment/equip-hpylori-master.webp',
    },
  ];

  return (
    <section className="section section-facilities py-10 md:py-14 bg-[#FDFDF6] relative overflow-hidden" id="section_818310656">
      <div className="container max-w-[1250px] mx-auto px-[15px]">
        {/* Section Heading matching authentic WordPress HTML */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#005570] tracking-tight leading-snug">
            Khám Phá Sức Mạnh Từ Trang Thiết Bị Máy Móc Hiện Đại Tại Doctor Check
          </h2>
          <p className="text-sm sm:text-base text-[#4D5565] mt-3 leading-relaxed max-w-2xl mx-auto">
            Doctor Check muốn mang đến cho bạn dịch vụ tầm soát không đau, nhanh chóng và khả năng chẩn đoán ngay từ giai đoạn sớm, phát hiện các bất thường trong cơ thể. Nên đã đầu tư toàn bộ trang bị hệ thống máy móc đạt chuẩn quốc tế.
          </p>
        </div>

        {/* 6 Equipment Boxes Grid in 3x2 matching authentic CSS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mx-auto">
          {equipmentItems.map((item) => (
            <div
              key={item.id}
              className="box has-hover box-overlay dark box-text-bottom group relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 aspect-[874/582] cursor-pointer bg-[#042A35]"
            >
              {/* Box Image with Master Asset */}
              <div className="box-image absolute inset-0 rounded-lg overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500 rounded-[14px]"
                />
              </div>

              {/* Authentic Gradient Overlay */}
              <div
                className="absolute inset-0 rounded-[14px] pointer-events-none transition-all duration-300 z-10"
                style={{
                  background: 'linear-gradient(180deg, rgba(12, 123, 155, 0.05) 30%, rgba(4, 42, 53, 0.95) 100%)',
                }}
              />

              {/* Hover Darker Gradient Overlay */}
              <div
                className="absolute inset-0 rounded-[14px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-10"
                style={{
                  background: 'linear-gradient(180deg, rgba(12, 123, 155, 0.35) 0%, rgba(4, 42, 53, 0.98) 100%)',
                }}
              />

              {/* Box Text with title and hover description reveal */}
              <div className="box-text text-center absolute inset-x-0 bottom-0 p-5 z-20 transition-transform duration-300 group-hover:-translate-y-2">
                <div className="box-text-inner text-center">
                  <h3 className="capitalize text-white font-bold text-base sm:text-lg tracking-wide mb-1.5 drop-shadow-md">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-200 leading-relaxed max-h-0 opacity-0 group-hover:max-h-28 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
