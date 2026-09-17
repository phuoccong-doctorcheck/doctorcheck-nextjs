import type { TableOfContentsItem } from '@/types/doctorcheck';

/**
 * Converts Vietnamese text to a clean, URL-safe slug ID.
 */
export function slugifyVietnamese(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Extracts Table of Contents from HTML and injects deterministic IDs into <h2> and <h3> tags.
 */
export function extractTableOfContents(html: string): {
  htmlWithIds: string;
  items: TableOfContentsItem[];
} {
  if (!html) {
    return { htmlWithIds: '', items: [] };
  }

  const items: TableOfContentsItem[] = [];
  const existingIds = new Set<string>();

  // Regular expression to match <h2> and <h3> tags
  const headingRegex = /<(h[23])(\s+[^>]*)?>([\s\S]*?)<\/\1>/gi;

  const htmlWithIds = html.replace(headingRegex, (fullMatch, tag, attrs = '', content) => {
    // Strip inner HTML tags to get raw text
    const rawText = content.replace(/<[^>]+>/g, '').trim();

    if (!rawText) return fullMatch;

    // Check if an id is already present in attributes
    let id = '';
    const idMatch = attrs.match(/id=["']([^"']+)["']/i);

    if (idMatch) {
      id = idMatch[1];
    } else {
      const baseSlug = slugifyVietnamese(rawText) || `heading-${items.length + 1}`;
      let finalSlug = baseSlug;
      let counter = 1;

      while (existingIds.has(finalSlug)) {
        finalSlug = `${baseSlug}-${counter++}`;
      }

      id = finalSlug;
    }

    existingIds.add(id);

    const level = tag.toLowerCase() === 'h2' ? 2 : 3;
    items.push({
      id,
      text: rawText,
      level: level as 2 | 3
    });

    // Remove existing id if present so we can write clean id
    const cleanAttrs = attrs.replace(/\s*id=["'][^"']*["']/i, '');
    return `<${tag} id="${id}"${cleanAttrs}>${content}</${tag}>`;
  });

  return { htmlWithIds, items };
}
