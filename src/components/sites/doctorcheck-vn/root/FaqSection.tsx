'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const faqs: FaqItem[] = [
    {
      id: 'faq-1',
      question: 'Các việc cần thực hiện trước khi tầm soát bệnh',
      answer: (
        <ul className="list-disc pl-5 space-y-2 text-sm text-[#4D5565] leading-relaxed">
          <li>Nhịn ăn ít nhất 6 tiếng trước khi khám, chỉ uống nước lọc (không sử dụng rượu bia, nước ngọt,…). Một số xét nghiệm như xét nghiệm đường huyết tốt nhất nên nhịn ăn ít nhất 8 – 10 tiếng.</li>
          <li>Không hút thuốc lá và uống rượu bia từ buổi tối trước khi khám.</li>
          <li>Nếu bạn đang sử dụng các thuốc điều trị đái tháo đường cần ngưng vào ngày đến khám để có kết quả xét nghiệm chính xác nhất.</li>
          <li>Đối với Khách hàng Nữ khi đến khám tổng quát không sử dụng thuốc đặt âm đạo, thụt rửa âm đạo hay quan hệ tình dục trong 3 ngày trước khi đến khám.</li>
          <li>Khi đi khám, bạn nên mặc quần áo rộng rãi, thoải mái. Nên mặc áo ngắn tay hoặc áo dài tay có thể kéo lên dễ dàng để thuận tiện cho việc lấy máu và đo huyết áp.</li>
        </ul>
      ),
    },
    {
      id: 'faq-2',
      question: 'Thời gian thăm khám tại trung tâm Doctor Check',
      answer: (
        <ul className="list-disc pl-5 space-y-2 text-sm text-[#4D5565] leading-relaxed">
          <li>Nếu bạn đã đăng ký lịch khám trước sẽ được thăm khám ưu tiên.</li>
          <li>Thủ tục đăng ký nhanh chóng, không chờ đợi.</li>
          <li>
            Tổng thời gian bắt đầu khám đến khi kết thúc:
            <ul className="list-circle pl-5 mt-1 space-y-1">
              <li>Gói Khuyến cáo: chỉ 60 – 90 phút</li>
              <li>Gói Chuyên sâu: chỉ từ 90 – 120 phút</li>
              <li>Gói Sống Thọ: chỉ từ 120 phút (được hướng dẫn nội soi tại nhà)</li>
            </ul>
          </li>
          <li>Bạn sẽ được Bác Sĩ Doctor Check tư vấn kết quả &amp; điều trị (nếu phát hiện bệnh).</li>
          <li>Đặc biệt, bạn sẽ được tư vấn 6 thói quen Sống Thọ được cá nhân hóa dành cho bạn.</li>
        </ul>
      ),
    },
    {
      id: 'faq-3',
      question: 'Chi phí khám sức khỏe tại Doctor Check là bao nhiêu?',
      answer: (
        <p className="text-sm text-[#4D5565] leading-relaxed">
          Tùy vào từng gói khám tổng quát mà chi phí sẽ khác nhau. Nhưng bạn hãy an tâm, chi phí tại Doctor Check luôn minh bạch, tư vấn trung thực và rõ ràng.<br />
          <Link href="/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/" className="text-[#005570] underline font-bold hover:text-[#FFB500]">
            Bấm vào đây
          </Link>{' '}
          để xem Bảng giá tầm soát bệnh tại Doctor Check.
        </p>
      ),
    },
    {
      id: 'faq-4',
      question: 'Phòng khám Doctor Check có thanh toán bảo hiểm không?',
      answer: (
        <p className="text-sm text-[#4D5565] leading-relaxed">
          Phòng khám Doctor Check liên kết hơn 20+ công ty bảo hiểm tư nhân, đặc biệt có hỗ trợ Trả Góp 0% giúp khách hàng giảm nỗi lo tài chính khi chăm sóc sức khỏe.<br />
          Bạn vui lòng liên hệ với đội ngũ nhân viên Doctor Check để được hỗ trợ thủ tục bảo hiểm, trả góp nhanh chóng.
        </p>
      ),
    },
  ];

  return (
    <section className="section section-faq py-8 md:py-12 bg-[#FDFDF6] relative overflow-hidden" id="section_1915240304">
      <div className="section-bg fill" />

      <div className="section-content relative container max-w-[1250px] mx-auto px-[15px]">
        <div className="row row-collapse flex justify-center" id="row-1778294024">
          <div id="col-1176991202" className="col medium-7 small-12 large-7 w-full max-w-[800px]">
            <div className="col-inner text-left">
              {/* Heading */}
              <div id="text-2376950180" className="text mb-8">
                <h2 className="text-[#005570] font-bold text-xl sm:text-2xl md:text-[1.4rem] text-center" style={{ margin: 0 }}>
                  Câu hỏi thường gặp
                </h2>
              </div>

              {/* Authentic Flatsome Accordion */}
              <div className="accordion border-t border-gray-200">
                {faqs.map((faq) => {
                  const isOpen = openId === faq.id;
                  return (
                    <div key={faq.id} className="accordion-item border-b border-gray-200">
                      <button
                        type="button"
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between py-4 text-left gap-4 bg-transparent border-none cursor-pointer group"
                        aria-expanded={isOpen}
                      >
                        <h3 className={`text-sm sm:text-base font-bold transition-colors ${isOpen ? 'text-[#005570]' : 'text-[#2A2F38] group-hover:text-[#005570]'}`}>
                          {faq.question}
                        </h3>
                        <div className="flex-shrink-0 text-[#005570]">
                          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="pb-5 pt-1 px-1 text-[#4D5565] animate-in fade-in duration-200">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
