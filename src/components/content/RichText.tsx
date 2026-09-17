import React from 'react';

interface RichTextProps {
  contentHtml: string;
  className?: string;
}

export function RichText({ contentHtml, className = '' }: RichTextProps) {
  if (!contentHtml) return null;

  // Detect whether this content is structured using Flatsome / UX Builder markup
  const isUxBuilder =
    contentHtml.includes('class="section') ||
    contentHtml.includes('class="row') ||
    contentHtml.includes('class="banner') ||
    contentHtml.includes('class="col ');

  if (isUxBuilder) {
    return (
      <div
        className={`flatsome-content ${className}`}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    );
  }

  return (
    <div
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
