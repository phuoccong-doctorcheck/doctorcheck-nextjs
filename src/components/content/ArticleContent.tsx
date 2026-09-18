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
      className="article-content dc-article-content"
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  );
}
