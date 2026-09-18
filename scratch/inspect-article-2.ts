import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { resolveContent } from '../src/lib/routing/resolve-content';

dotenv.config({ path: '.env.local' });

async function checkSample2() {
  // 1. Check collision resolution
  const resolved = resolveContent('dau-thuong-vi');
  console.log('Collision check /dau-thuong-vi/:', {
    type: resolved.type,
    title: resolved.title,
    canonicalUrl: resolved.canonicalUrl,
    hasArticleData: Boolean(resolved.data?.article),
  });

  // 2. Database detail check
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const [a] = await sql`
    SELECT 
      id, 
      slug, 
      title, 
      featured_image_url,
      author_name,
      author_title,
      published_at,
      modified_at,
      toc,
      length(content_html) as content_len,
      content_html
    FROM articles
    WHERE slug = 'dau-thuong-vi';
  `;

  console.log('\nDB Article:');
  console.log({
    id: a.id,
    slug: a.slug,
    title: a.title,
    featured_image_url: a.featured_image_url,
    toc_count: a.toc?.length,
    toc: a.toc,
    content_len: a.content_len,
    has_blockquote: a.content_html.includes('<blockquote'),
    has_table: a.content_html.includes('<table'),
    has_img: a.content_html.includes('<img'),
    has_iframe: a.content_html.includes('<iframe'),
  });

  // Check callout / blockquote structure
  const blockquotes = a.content_html.match(/<blockquote[^>]*>[\s\S]*?<\/blockquote>/gi);
  console.log('\nBlockquotes count:', blockquotes?.length);
  if (blockquotes) {
    blockquotes.forEach((bq: string, i: number) => {
      console.log(`\nBlockquote #${i + 1}:\n`, bq.slice(0, 300));
    });
  }

  await sql.end();
}

checkSample2();
