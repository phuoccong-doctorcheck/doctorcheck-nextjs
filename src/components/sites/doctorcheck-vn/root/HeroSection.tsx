import React from 'react';
import Image from 'next/image';
import type { HeroBlockConfig } from '@/lib/data/homepage';

interface HeroSectionProps {
  config?: HeroBlockConfig;
}

export function HeroSection({ config }: HeroSectionProps) {
  const title = config?.title || 'Doctor Check – Tầm Soát Bệnh Để Sống Thọ Hơn';
  const subtitle = config?.subtitle || '“Tầm soát bệnh chính xác mỗi năm công thức Sống Thọ dành riêng cho bạn” - Doctor Check';
  const desktopBanner = config?.desktopBanner || '/sites/doctorcheck-vn/root/images/banner-desktop-master.webp';
  const mobileBanner = config?.mobileBanner || '/sites/doctorcheck-vn/root/images/banner-mobile-master.webp';
  const ctaTarget = config?.ctaTarget || '#tu-van';

  return (
    <section className="section section-banner" id="section_380136169" style={{ paddingTop: 0, paddingBottom: 0 }}>
      <div className="section-bg fill" />

      {/* Semantic H1 for SEO Parity */}
      <h1 className="sr-only">
        {title}
      </h1>

      <div className="section-content relative" style={{ width: '100%', maxWidth: '100%', padding: 0 }}>
        {/* Desktop Banner (hide-for-small) */}
        <div className="img has-hover btn-appointment hide-for-small" id="image_1573834974" style={{ width: '100%', height: 'auto', display: 'block' }}>
          <div className="img-inner dark" style={{ width: '100%', height: 'auto', aspectRatio: '2560 / 1038' }}>
            <a href={ctaTarget} title={title} className="block w-full h-full">
              <Image
                src={desktopBanner}
                alt={subtitle}
                width={2560}
                height={1038}
                priority
                sizes="100vw"
                className="attachment-original size-original w-full h-auto block"
              />
            </a>
          </div>
        </div>

        {/* Mobile Banner (show-for-small) */}
        <div className="img has-hover btn-appointment show-for-small" id="image_1006804480" style={{ width: '100%', height: 'auto' }}>
          <div className="img-inner dark" style={{ width: '100%', height: 'auto', aspectRatio: '856 / 1256' }}>
            <a href={ctaTarget} title={title} className="block w-full h-full">
              <Image
                src={mobileBanner}
                alt={title}
                width={856}
                height={1256}
                priority
                sizes="100vw"
                className="attachment-original size-original w-full h-auto block"
              />
            </a>
          </div>
        </div>

        {/* Scoped CSS for strict mutual exclusivity between desktop and mobile banners */}
        <style>{`
          @media (max-width: 549px) {
            #image_1573834974 { display: none !important; }
            #image_1006804480 { display: block !important; }
          }
          @media (min-width: 550px) {
            #image_1006804480 { display: none !important; }
            #image_1573834974 { display: block !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

