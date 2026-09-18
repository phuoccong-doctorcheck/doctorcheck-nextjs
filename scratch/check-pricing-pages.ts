import * as dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config({ path: '.env.local' });

async function checkAllPricingPages() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const rows = await sql`
    SELECT id, slug, path, subpath, is_root, is_ux_builder, title, length(content_html) as len
    FROM pages
    WHERE slug LIKE '%bang-gia%' OR path LIKE '%bang-gia%'
  `;
  console.log('All pricing pages in DB:');
  console.log(JSON.stringify(rows, null, 2));
  await sql.end();
}

checkAllPricingPages();
