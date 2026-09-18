import * as dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config({ path: '.env.local' });

async function checkArticle() {
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
      substring(content_html from 1 for 1000) as start_html,
      substring(content_html from length(content_html)-1000 for 1000) as end_html
    FROM articles
    WHERE slug = 'ung-thu-dai-trang';
  `;

  console.log('Article details:');
  console.log({
    id: a.id,
    slug: a.slug,
    title: a.title,
    featured_image_url: a.featured_image_url,
    author_name: a.author_name,
    author_title: a.author_title,
    published_at: a.published_at,
    modified_at: a.modified_at,
    toc_length: a.toc?.length,
    toc_sample: a.toc?.slice(0, 5),
    content_len: a.content_len,
  });
  console.log('\n--- START HTML ---');
  console.log(a.start_html);
  console.log('\n--- END HTML ---');
  console.log(a.end_html);

  await sql.end();
}

checkArticle();
