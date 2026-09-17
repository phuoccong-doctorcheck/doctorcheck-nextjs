import React from 'react';

interface ArticleContentProps {
  contentHtml: string;
}

export function ArticleContent({ contentHtml }: ArticleContentProps) {
  if (!contentHtml) {
    return (
      <div className="py-8 text-center text-gray-500 text-sm">
        Nội dung bài viết đang được đồng bộ hóa từ hệ thống.
      </div>
    );
  }

  return (
    <div
      className="article-content prose prose-slate max-w-none
        prose-headings:text-[#005570] prose-headings:font-bold prose-headings:tracking-tight
        prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-[#005570]
        prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-[#005570]
        prose-p:text-gray-700 prose-p:text-base prose-p:leading-relaxed prose-p:my-4
        prose-a:text-[#005570] prose-a:font-semibold prose-a:underline hover:prose-a:text-[#00475B] prose-a:transition-colors
        prose-strong:text-gray-900 prose-strong:font-bold
        prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6 prose-li:my-1.5 prose-li:text-gray-700
        prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-1.5 prose-li:text-gray-700
        prose-img:rounded-sm prose-img:mx-auto prose-img:my-6
        prose-figure:my-6 prose-figcaption:text-xs prose-figcaption:text-gray-500 prose-figcaption:text-center prose-figcaption:mt-2 prose-figcaption:italic
        prose-blockquote:border-l-4 prose-blockquote:border-[#FFB500] prose-blockquote:bg-[#FFFBF0] prose-blockquote:p-4 prose-blockquote:rounded-r-md prose-blockquote:italic prose-blockquote:text-gray-700
        prose-table:w-full prose-table:text-sm prose-table:border-collapse
        prose-th:bg-[#F0F7FA] prose-th:text-[#00475B] prose-th:font-bold prose-th:p-3 prose-th:text-left prose-th:border prose-th:border-gray-200
        prose-td:p-3 prose-td:border prose-td:border-gray-200 prose-td:text-gray-700"
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  );
}
