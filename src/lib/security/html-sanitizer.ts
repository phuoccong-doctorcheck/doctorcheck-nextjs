/**
 * Strict HTML Sanitizer for CMS-Submitted Content
 *
 * Enforces XSS protection on newly created and edited rich content
 * while preserving semantic HTML tags, headings, tables, media, and formatting.
 *
 * Features:
 * - Strips `<script>...</script>`, `<style>...</style>`, `<object>`, `<embed>`, `<applet>`, `<form>`, `<input>`, `<button>`, `<iframe>`
 * - Strips all inline JavaScript event handlers (e.g. `onload`, `onerror`, `onclick`, `onmouseover`)
 * - Strips dangerous URL schemes (`javascript:`, `data:` where inappropriate, `vbscript:`)
 * - Normalizes `<a>` tags with `target="_blank"` to include `rel="noopener noreferrer"`
 * - Preserves semantic formatting, table structures, and clean image references
 */

const ALLOWED_TAGS = new Set([
  // Block containers
  'p', 'div', 'blockquote', 'figure', 'figcaption', 'hr', 'br',
  // Headings
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // Lists
  'ul', 'ol', 'li',
  // Inline formatting
  'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'sub', 'sup', 'span', 'code', 'pre', 'mark',
  // Links & Media
  'a', 'img',
  // Tables
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
]);

const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  '*': new Set(['class', 'id', 'title', 'lang', 'dir']),
  'a': new Set(['href', 'target', 'rel', 'download', 'title']),
  'img': new Set(['src', 'alt', 'width', 'height', 'loading', 'decoding', 'data-media-id', 'class']),
  'th': new Set(['colspan', 'rowspan', 'scope', 'align', 'class']),
  'td': new Set(['colspan', 'rowspan', 'align', 'class']),
  'table': new Set(['border', 'cellpadding', 'cellspacing', 'class']),
};

const DISALLOWED_BLOCKS_REGEX = /<(script|style|object|embed|applet|form|textarea|select|iframe|base|frame|frameset)[\s\S]*?<\/\1>/gi;
const DISALLOWED_STANDALONE_TAGS = /<\/?(script|style|object|embed|applet|form|input|button|textarea|select|option|meta|link|iframe|base|frame|frameset)[\s\S]*?>/gi;
const EVENT_HANDLER_REGEX = /\s+on[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JAVASCRIPT_URL_REGEX = /^(javascript|vbscript|data(?!\/image)):/i;

/**
 * Sanitizes an HTML string to ensure safe storage and rendering.
 */
export function sanitizeHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') {
    return '';
  }

  // 1. Remove dangerous blocks entirely including inner contents
  let clean = rawHtml.replace(DISALLOWED_BLOCKS_REGEX, '');

  // 2. Remove any standalone disallowed tags
  clean = clean.replace(DISALLOWED_STANDALONE_TAGS, '');

  // 3. Remove all inline event handlers (onerror, onload, onclick, etc.)
  clean = clean.replace(EVENT_HANDLER_REGEX, '');

  // 4. Process all remaining HTML tags
  clean = clean.replace(/<(\/?[a-zA-Z0-9]+)(\s+[^>]*?)?(\/?)>/g, (_match, tagNameRaw: string, attrsRaw = '', selfClosing: string) => {
    const isClosing = tagNameRaw.startsWith('/');
    const tagName = isClosing ? tagNameRaw.slice(1).toLowerCase() : tagNameRaw.toLowerCase();

    // If tag is not in whitelist, strip tag wrappers but keep inner content
    if (!ALLOWED_TAGS.has(tagName)) {
      return '';
    }

    if (isClosing) {
      return `</${tagName}>`;
    }

    // Process attributes for opening tag
    const allowedForTag = ALLOWED_ATTRIBUTES[tagName] || new Set<string>();
    const allowedGlobal = ALLOWED_ATTRIBUTES['*'];

    const sanitizedAttrs: string[] = [];
    const attrRegex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let attrMatch: RegExpExecArray | null;

    let hasTargetBlank = false;
    let existingRel = '';

    while ((attrMatch = attrRegex.exec(attrsRaw)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';

      // Check if attribute is allowed
      if (!allowedForTag.has(attrName) && !allowedGlobal.has(attrName)) {
        continue;
      }

      // Check for dangerous URLs in href or src
      if (attrName === 'href' || attrName === 'src') {
        const trimmed = attrValue.trim();
        if (JAVASCRIPT_URL_REGEX.test(trimmed)) {
          continue; // Strip unsafe protocol
        }
      }

      // Check target="_blank"
      if (tagName === 'a' && attrName === 'target' && attrValue.toLowerCase() === '_blank') {
        hasTargetBlank = true;
      }
      if (tagName === 'a' && attrName === 'rel') {
        existingRel = attrValue;
      }

      sanitizedAttrs.push(`${attrName}="${escapeAttributeValue(attrValue)}"`);
    }

    // Enforce noopener noreferrer for target="_blank"
    if (tagName === 'a' && hasTargetBlank) {
      const relValues = new Set(existingRel.toLowerCase().split(/\s+/).filter(Boolean));
      relValues.add('noopener');
      relValues.add('noreferrer');

      // Filter out existing rel attribute from sanitizedAttrs and push combined rel
      const filtered = sanitizedAttrs.filter((a) => !a.startsWith('rel='));
      filtered.push(`rel="${Array.from(relValues).join(' ')}"`);
      sanitizedAttrs.length = 0;
      sanitizedAttrs.push(...filtered);
    }

    const attrsString = sanitizedAttrs.length > 0 ? ' ' + sanitizedAttrs.join(' ') : '';
    const isSelfClosing = selfClosing === '/' || tagName === 'img' || tagName === 'br' || tagName === 'hr';

    return `<${tagName}${attrsString}${isSelfClosing ? ' />' : '>'}`;
  });

  return clean;
}

function escapeAttributeValue(val: string): string {
  return val
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
