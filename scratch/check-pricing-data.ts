import * as dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config({ path: '.env.local' });

async function checkPricingData() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

  // 1. Check pages related to pricing / bang-gia
  const pricingPages = await sql`
    SELECT id, slug, path, title, is_root, length(content_html) as len
    FROM pages
    WHERE slug LIKE '%bang-gia%' OR slug LIKE '%gia%' OR title LIKE '%Bảng giá%' OR title LIKE '%giá%' OR path LIKE '%bang-gia%'
  `;
  console.log('Pricing Pages in DB:', pricingPages);

  // 2. Check all packages in DB
  const packageList = await sql`
    SELECT id, slug, name, gender, price_vnd, price_formatted, length(recommended_for) as rec_len, jsonb_array_length(features) as feat_count
    FROM packages
    ORDER BY price_vnd ASC;
  `;
  console.log('\nPackages in DB (total ' + packageList.length + '):');
  packageList.forEach(p => console.log(`- Slug: /${p.slug}/ | Name: "${p.name}" | Gender: ${p.gender} | Price: ${p.price_formatted} | Feat: ${p.feat_count}`));

  await sql.end();
}

checkPricingData();
