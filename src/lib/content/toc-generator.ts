/**
 * Table of Contents (TOC) Generator & Extractor
 *
 * Automatically extracts hierarchical headings (H2, H3) from HTML content
 * to produce structured Table of Contents items.
 */

export interface TableOfContentsEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Converts a Vietnamese / Unicode text string into a clean, URL-safe slug ID.
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Extracts all H2 and H3 headings from HTML content.
 */
export function extractTableOfContents(html: string): TableOfContentsEntry[] {
  if (!html || typeof html !== 'string') return [];

  const headingRegex = /<(h[2-3])([^>]*)>([\s\S]*?)<\/\1>/gi;
  const entries: TableOfContentsEntry[] = [];
  const seenIds = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(html)) !== null) {
    const tagName = match[1].toLowerCase();
    const attrs = match[2] || '';
    const rawInner = match[3] || '';

    const level: 2 | 3 = tagName === 'h3' ? 3 : 2;
    // Strip any nested HTML tags from heading text
    const text = rawInner.replace(/<[^>]*>/g, '').trim();
    if (!text) continue;

    // Check for existing id attribute
    const idMatch = attrs.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    let id = idMatch ? (idMatch[1] ?? idMatch[2] ?? idMatch[3] ?? '').trim() : '';

    if (!id) {
      id = slugifyHeading(text) || `heading-${entries.length + 1}`;
    }

    // Ensure unique IDs
    let uniqueId = id;
    let counter = 1;
    while (seenIds.has(uniqueId)) {
      uniqueId = `${id}-${counter}`;
      counter++;
    }
    seenIds.add(uniqueId);

    entries.push({
      id: uniqueId,
      text,
      level,
    });
  }

  return entries;
}

/**
 * Injects missing `id` attributes into H2 and H3 headings in an HTML string.
 */
export function injectHeadingIds(html: string): string {
  if (!html || typeof html !== 'string') return '';

  const seenIds = new Set<string>();

  return html.replace(/<(h[2-3])([^>]*)>([\s\S]*?)<\/\1>/gi, (_match, tagName: string, attrs: string, inner: string) => {
    const text = inner.replace(/<[^>]*>/g, '').trim();
    const idMatch = attrs.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);

    let id = idMatch ? (idMatch[1] ?? idMatch[2] ?? idMatch[3] ?? '').trim() : '';
    if (!id) {
      id = slugifyHeading(text) || `sec-${seenIds.size + 1}`;
    }

    let uniqueId = id;
    let counter = 1;
    while (seenIds.has(uniqueId)) {
      uniqueId = `${id}-${counter}`;
      counter++;
    }
    seenIds.add(uniqueId);

    // If id attribute already exists, replace it; otherwise add it
    if (idMatch) {
      const updatedAttrs = attrs.replace(/id\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i, `id="${uniqueId}"`);
      return `<${tagName}${updatedAttrs}>${inner}</${tagName}>`;
    } else {
      return `<${tagName} id="${uniqueId}"${attrs}>${inner}</${tagName}>`;
    }
  });
}
