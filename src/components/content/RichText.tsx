'use client';

import React, { useEffect, useRef } from 'react';

interface RichTextProps {
  contentHtml: string;
  className?: string;
}

export function RichText({ contentHtml, className = '' }: RichTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Interactive Tabs Handler
    const handleTabClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tabLink = target.closest('.tabbed-content .nav li.tab a') as HTMLAnchorElement | null;
      if (!tabLink) return;

      const href = tabLink.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      e.preventDefault();
      const tabLi = tabLink.closest('li.tab') as HTMLElement;
      const nav = tabLink.closest('.nav') as HTMLElement;
      const tabbedContent = tabLink.closest('.tabbed-content') as HTMLElement;

      if (nav && tabLi) {
        nav.querySelectorAll('li.tab').forEach((li) => li.classList.remove('active'));
        tabLi.classList.add('active');
      }

      if (tabbedContent) {
        const targetId = decodeURIComponent(href.slice(1));
        const rawTargetId = href.slice(1);
        const panels = tabbedContent.querySelectorAll(':scope > .tab-panels > .panel, :scope .tab-panels > .panel');
        panels.forEach((p) => p.classList.remove('active'));

        const targetPanel =
          document.getElementById(targetId) ||
          document.getElementById(rawTargetId) ||
          document.getElementById(`tab_${targetId}`) ||
          document.getElementById(`tab_${rawTargetId}`) ||
          Array.from(panels).find(
            (p) =>
              p.id === targetId ||
              p.id === rawTargetId ||
              p.id === `tab_${targetId}` ||
              p.id === `tab_${rawTargetId}` ||
              p.getAttribute('id') === targetId ||
              p.getAttribute('id') === rawTargetId ||
              p.getAttribute('id') === `tab_${targetId}` ||
              p.getAttribute('id') === `tab_${rawTargetId}`
          );
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      }
    };

    // 2. Interactive Accordion Handler
    const handleAccordionClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const accTitle = target.closest('.accordion-title') as HTMLElement | null;
      if (!accTitle) return;

      e.preventDefault();
      const accItem = accTitle.closest('.accordion-item') as HTMLElement | null;
      if (!accItem) return;

      const isActive = accItem.classList.contains('active');
      const accordion = accItem.closest('.accordion') as HTMLElement | null;

      // Close siblings if in standard single-expand accordion
      if (accordion) {
        accordion.querySelectorAll('.accordion-item').forEach((item) => item.classList.remove('active'));
      }

      if (!isActive) {
        accItem.classList.add('active');
      }
    };

    // 3. Hydrate data-src images (perfmatters-lazy)
    const lazyImages = container.querySelectorAll('img[data-src]');
    lazyImages.forEach((img) => {
      const dataSrc = img.getAttribute('data-src');
      if (dataSrc) {
        // Map downloaded pricing SVGs if present
        if (dataSrc.includes('/2024/12/dollars-1.svg')) {
          img.setAttribute('src', '/images/pricing/dollars-1.svg');
        } else if (dataSrc.includes('/2024/12/napas.svg')) {
          img.setAttribute('src', '/images/pricing/napas.svg');
        } else if (dataSrc.includes('/2024/12/momo.svg')) {
          img.setAttribute('src', '/images/pricing/momo.svg');
        } else if (dataSrc.includes('/2024/12/visa.svg')) {
          img.setAttribute('src', '/images/pricing/visa.svg');
        } else if (dataSrc.includes('/2024/12/vnpay.svg')) {
          img.setAttribute('src', '/images/pricing/vnpay.svg');
        } else if (dataSrc.includes('/2024/12/zalopay.svg')) {
          img.setAttribute('src', '/images/pricing/zalopay.svg');
        } else if (dataSrc.includes('check-circle.svg')) {
          img.setAttribute('src', '/images/protocols/check-circle.svg');
        } else if (dataSrc.includes('Vector-1.svg')) {
          img.setAttribute('src', '/images/protocols/Vector-1.svg');
        } else if (!img.getAttribute('src') || img.getAttribute('src')?.startsWith('data:image')) {
          img.setAttribute('src', dataSrc);
        }
      }
    });

    container.addEventListener('click', handleTabClick);
    container.addEventListener('click', handleAccordionClick);

    return () => {
      container.removeEventListener('click', handleTabClick);
      container.removeEventListener('click', handleAccordionClick);
    };
  }, [contentHtml]);

  if (!contentHtml) return null;

  // Detect whether this content is structured using Flatsome / UX Builder markup
  const isUxBuilder =
    contentHtml.includes('class="section') ||
    contentHtml.includes('class="row') ||
    contentHtml.includes('class="banner') ||
    contentHtml.includes('class="col ') ||
    contentHtml.includes('class="dc-med') ||
    contentHtml.includes('class="dc-kkg');

  if (isUxBuilder) {
    return (
      <div
        ref={containerRef}
        className={`flatsome-content ${className}`}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`prose prose-slate max-w-none
        prose-headings:text-[#005570] prose-headings:font-bold
        prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:mb-6
        prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
        prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-4
        prose-a:text-[#005570] prose-a:font-semibold hover:prose-a:text-[#00475B]
        prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6 prose-li:my-1.5
        prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-1.5
        prose-img:rounded-sm prose-img:my-6
        prose-table:w-full prose-table:text-sm
        ${className}`}
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  );
}

