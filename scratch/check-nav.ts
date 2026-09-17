import fs from 'fs';
import { navigationData } from '../src/lib/data/testimonials.ts';
import { resolveContent, getAllRootSlugs, resolveEndoscopySubpath } from '../src/lib/routing/resolve-content.ts';
import { getLegacyRedirect } from '../src/lib/routing/redirects.ts';
import { staticPagesData } from '../src/lib/routing/pages-data.ts';
import { doctorsData } from '../src/lib/data/doctors.ts';

console.log('=== AUDITING NAVIGATION LINKS ===\n');

const checkUrl = (url, source) => {
  if (!url || url.startsWith('#') || url.startsWith('tel:') || url.startsWith('mailto:') || url.startsWith('http')) {
    return;
  }
  const clean = url.replace(/^\/+|\/+$/g, '');
  const isRedirect = getLegacyRedirect(clean);
  const resolved = resolveContent(clean);
  console.log(`[${source}] ${url} -> resolved type: ${resolved.type} (isRedirect: ${!!isRedirect})`);
  if (resolved.type === 'notFound') {
    // Check if it's a hub subpath
    if (clean.startsWith('trung-tam-noi-soi-tieu-hoa-doctor-check/')) {
      const sub = clean.replace('trung-tam-noi-soi-tieu-hoa-doctor-check/', '').split('/');
      const hubRes = resolveEndoscopySubpath(sub);
      console.log(`  -> Hub subpath check: ${hubRes.type}`);
    } else if (clean.startsWith('doctor/')) {
      const docSlug = clean.replace('doctor/', '');
      const doc = doctorsData.find(d => d.id === docSlug);
      console.log(`  -> Doctor check: ${doc ? 'FOUND' : 'NOT FOUND'}`);
    }
  }
};

navigationData.forEach(item => {
  checkUrl(item.href, `Nav: ${item.title}`);
  if (item.children) {
    item.children.forEach(sub => {
      checkUrl(sub.href, `Sub: ${sub.title}`);
    });
  }
});
