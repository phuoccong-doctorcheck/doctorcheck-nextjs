import * as dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config({ path: '.env.local' });

async function checkPages() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const rows = await sql`
    SELECT id, slug, path, title, is_root, length(content_html) as len
    FROM pages
    WHERE slug LIKE '%bang-gia%' OR path LIKE '%bang-gia%'
  `;
  console.log('Pages:', rows);
  await sql.end();
}

checkPages();
