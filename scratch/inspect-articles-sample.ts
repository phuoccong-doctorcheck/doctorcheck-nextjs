import * as dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config({ path: '.env.local' });

async function inspectArticles() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const withTable = await sql`
    SELECT id, slug, title, length(content_html) as len
    FROM articles
    WHERE content_html LIKE '%<table%'
  `;
  console.log('Articles with table:', withTable);

  const withIframe = await sql`
    SELECT id, slug, title, length(content_html) as len
    FROM articles
    WHERE content_html LIKE '%<iframe%'
  `;
  console.log('Articles with iframe/video:', withIframe);

  const topToc = await sql`
    SELECT id, slug, title, jsonb_array_length(toc) as toc_count, length(content_html) as len
    FROM articles
    ORDER BY jsonb_array_length(toc) DESC
    LIMIT 5;
  `;
  console.log('Top TOC articles:', topToc);

  await sql.end();
}

inspectArticles();
