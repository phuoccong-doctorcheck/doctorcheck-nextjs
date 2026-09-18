import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { resolveContent } from '../src/lib/routing/resolve-content';

dotenv.config({ path: '.env.local' });

async function checkRoute() {
  console.log('resolveContent("bang-gia-2026"):', resolveContent('bang-gia-2026'));
  console.log('resolveContent("bang-gia-dich-vu"):', resolveContent('bang-gia-dich-vu'));
  
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const [p] = await sql`
    SELECT id, slug, title, is_root, length(content_html) as len, substring(content_html from 1 for 500) as preview
    FROM pages
    WHERE slug = 'bang-gia-2026';
  `;
  console.log('bang-gia-2026 in DB:', p);
  await sql.end();
}

checkRoute();
