import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

// Stub 'server-only'
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

import { resolveContent } from '../src/lib/routing/resolve-content';
import { getPageBySlug } from '../src/lib/content/pages-data';

async function main() {
  const slugs = [
    'lien-he',
    'chinh-sach-bao-mat',
    'chinh-sach-thanh-toan',
    'chinh-sach-hoan-tien',
    'dieu-khoan-su-dung',
    'chinh-sach-quyen-rieng-tu',
    'cam-on',
    'dich-vu',
    'blog'
  ];

  console.log('--- RESOLVE CONTENT CHECK ---');
  for (const s of slugs) {
    const res = await resolveContent(s);
    const p = getPageBySlug(s);
    console.log(`Slug: "${s}" -> Resolved Type: "${res.type}", Redirect: "${(res as any).redirectUrl || 'none'}", PageExists: ${!!p}, Title: "${p?.title || 'N/A'}"`);
  }
}

main().catch(console.error);
