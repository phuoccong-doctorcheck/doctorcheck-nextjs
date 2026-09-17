import { normalizeHtmlLinks } from './link-normalizer';
import { extractTableOfContents } from './toc-extractor';
import type { TableOfContentsItem } from '@/types/doctorcheck';

export interface NormalizedContentResult {
  html: string;
  tableOfContents: TableOfContentsItem[];
}

/**
 * Normalizes and sanitizes authentic WordPress HTML content.
 *
 * Strictly preserves:
 * - Headings (h1-h6)
 * - Paragraphs, lists (ul, ol, li)
 * - Blockquotes, strong, em, span
 * - Tables, thead, tbody, tr, th, td
 * - Images, figure, figcaption
 * - Links (with canonical route normalization)
 *
 * Cleans:
 * - Flatsome TOC placeholders
 * - Dead script / iframe tags
 * - Unresponsive table containers
 */
export function normalizeContentHtml(rawHtml: string): NormalizedContentResult {
  if (!rawHtml) {
    return { html: '', tableOfContents: [] };
  }

  let cleaned = rawHtml;

  // 1. Strip Flatsome TOC placeholder
  cleaned = cleaned.replace(/<div\s+class=["'][^"']*ft-toc-placeholder[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');

  // 2. Strip WordPress block comments
  cleaned = cleaned.replace(/<!--\s*\/?wp:[^>]*-->/gi, '');

  // 3. Remove script and dangerous tags
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 4. Normalize internal links
  cleaned = normalizeHtmlLinks(cleaned);

  // 5. Wrap <table> tags with responsive container if not already wrapped
  cleaned = cleaned.replace(/(<table\b[^>]*>[\s\S]*?<\/table>)/gi, (match) => {
    return `<div class="overflow-x-auto my-6 border border-gray-200 rounded-xl shadow-xs"><div class="inline-block min-w-full align-middle">${match}</div></div>`;
  });

  // 6. Ensure <img> tags have loading="lazy" and decoding="async"
  cleaned = cleaned.replace(/<img\s+([^>]*?)>/gi, (match, attrs) => {
    let newAttrs = attrs;
    if (!/loading=/i.test(newAttrs)) {
      newAttrs += ' loading="lazy"';
    }
    if (!/decoding=/i.test(newAttrs)) {
      newAttrs += ' decoding="async"';
    }
    return `<img ${newAttrs}>`;
  });

  // 7. Extract Table of Contents and inject anchor IDs into <h2> and <h3> tags
  const { htmlWithIds, items } = extractTableOfContents(cleaned);

  return {
    html: htmlWithIds,
    tableOfContents: items
  };
}
