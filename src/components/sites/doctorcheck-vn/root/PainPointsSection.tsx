'use client';

import React from 'react';

export function PainPointsSection() {
  const painPoints = [
    {
      num: 1,
      title: 'Kết quả khám tổng quát không chính xác',
    },
    {
      num: 2,
      title: 'Bác sĩ không dành nhiều thời gian tư vấn cho bạn',
    },
    {
      num: 3,
      title: 'Mệt mỏi vì phải bốc số, chờ đợi quá lâu',
    },
    {
      num: 4,
      title: 'Phát sinh các chi phí không cần thiết',
    },
  ];

  return (
    <section className="section section-confuse" id="section_294013533" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
      <div className="section-bg fill" />

      <div className="section-content relative container">
        {/* Main Title with dc-title decoration */}
        <div id="text-3883347502" className="text dc-title bluesky" style={{ fontSize: '1.7rem', textAlign: 'center' }}>
          <h2 className="text-[#005570] font-bold" style={{ fontSize: '1.7rem', textAlign: 'center', margin: '0 0 10px 0' }}>
            Tầm Soát Bệnh – Một Khởi Đầu Thông Thái Cho Năm Mới
          </h2>
        </div>

        {/* Row 64855036: Subtitle & 4 Number Boxes */}
        <div className="row" id="row-64855036">
          <div id="col-1356688087" className="col small-12 large-12" style={{ padding: 0 }}>
            <div className="col-inner">
              <div id="gap-891457538" className="gap-element clearfix" style={{ display: 'block', height: 'auto', paddingTop: '20px' }} />
              
              <div id="text-62814145" className="text">
                <h3 className="capitalize font-bold text-[#005570]" style={{ fontSize: '1.4rem', textAlign: 'center', margin: 0 }}>
                  Gỡ Bỏ 4 “Nỗi Lo” Khiến Bạn Chần Chừ Trước Khi Quyết Định Đi Tầm Soát Bệnh
                </h3>
              </div>

              <div id="gap-1802328419" className="gap-element clearfix" style={{ display: 'block', height: 'auto', paddingTop: '30px' }} />
            </div>
          </div>

          {/* 4 Concern Cards: 4 columns on desktop, 2 columns on tablet/mobile */}
          <div className="row w-full" style={{ margin: '0 -10px' }}>
            {painPoints.map((item) => (
              <div key={item.num} className="col medium-6 small-6 large-3" style={{ padding: '0 10px', marginBottom: '20px' }}>
                <div className="col-inner" style={{ margin: 0 }}>
                  <div className="text-center number-box">
                    <p style={{ margin: 0 }}>
                      <span className="number">{item.num}</span>
                    </p>
                    <p className="title">{item.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
