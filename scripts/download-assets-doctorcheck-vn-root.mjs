import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const FONTS_DIR = path.join(ROOT, 'public/sites/doctorcheck-vn/fonts');
const IMAGES_DIR = path.join(ROOT, 'public/sites/doctorcheck-vn/root/images');
const DOCTORS_DIR = path.join(IMAGES_DIR, 'doctors');
const EQUIP_DIR = path.join(IMAGES_DIR, 'equipment');

[FONTS_DIR, IMAGES_DIR, DOCTORS_DIR, EQUIP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function downloadFile(url, destPath) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
      return false;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buffer);
    console.log(`✓ Downloaded: ${path.relative(ROOT, destPath)} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return true;
  } catch (err) {
    console.error(`Error downloading ${url}:`, err.message);
    return false;
  }
}

async function main() {
  console.log('Downloading assets for DoctorCheck.vn...');

  // 1. Fonts
  const fonts = [
    'SVN-SofiaPro-Regular.woff2',
    'SVN-SofiaPro-Bold.woff2',
    'SVN-SofiaPro-SemiBold.woff2',
    'SVN-SofiaPro-Light.woff2',
    'SVN-SofiaPro-Black.woff2',
  ];
  for (const f of fonts) {
    await downloadFile(
      `https://www.doctorcheck.vn/wp-content/themes/doctorcheck/assets/fonts/${f}`,
      path.join(FONTS_DIR, f)
    );
  }

  // 2. Doctor portraits from Cloudflare Images
  const doctors = [
    { name: 'trinh-ai-nhi.webp', url: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/fe4b3528-d236-4c2c-72e7-87a5dd287800/w=600' },
    { name: 'chau-quynh-phi-nha.webp', url: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/4e2481e7-7f3e-4dd7-26d8-7a9563c29200/w=600' },
    { name: 'nguyen-ngoc-quynh-dung.webp', url: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/e2437733-41f5-42f7-278b-afcddd382f00/w=600' },
    { name: 'nguyen-hong-thanh.webp', url: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/9fafa9a3-97a5-4895-2715-bf56ee418b00/w=600' },
    { name: 'luu-ngoc-mai.webp', url: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/c3a06dc1-81e7-4287-ff3f-13bea17bc700/w=600' },
    { name: 'thai-viet-nguyen.webp', url: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/b9ca289f-001e-4d7b-aff4-99654da0b900/w=600' },
    { name: 'dang-nguyen-nhat-thanh-thi.webp', url: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/c8dffc2a-eb71-4d2f-27a7-1acabb8fc900/w=600' }
  ];
  for (const d of doctors) {
    await downloadFile(d.url, path.join(DOCTORS_DIR, d.name));
  }

  // 3. Key Brand Assets & Logos
  const brandAssets = [
    { name: 'logo.webp', url: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/700da2d8-a2da-4897-3616-647bc8083d00/w=600' },
    { name: 'banner-hero.webp', url: 'https://www.doctorcheck.vn/wp-content/uploads/2025/01/HB1-Mobile.webp' },
    { name: 'og-image.webp', url: 'https://www.doctorcheck.vn/wp-content/uploads/2024/12/bai3.webp' },
    { name: 'facility-main.webp', url: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/428ac6c9-bd35-483e-db56-281930032d00/w=1200' },
    { name: 'olympus-evis-x1.webp', url: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/65b02767-f03a-4c2c-dbfe-da2153e7b500/w=800' },
    { name: 'siemens-ultrasound.webp', url: 'https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/5ae5a4b8-6aef-48d0-f6d8-e30434d33800/w=800' }
  ];
  for (const a of brandAssets) {
    await downloadFile(a.url, path.join(IMAGES_DIR, a.name));
  }

  console.log('Done downloading assets!');
}

main();
