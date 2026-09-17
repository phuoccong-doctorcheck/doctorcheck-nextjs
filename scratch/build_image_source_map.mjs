import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('doctorcheck-source/html/homepage.html', 'utf8');

// Read local files
function scanDir(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(scanDir(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

const localFiles = scanDir('public/sites/doctorcheck-vn').map(f => f.replace(/\\/g, '/'));

// List of all sections in order
const sections = [
  { id: 'header', tag: 'header', name: 'Header' },
  { id: 'section_380136169', tag: 'section', name: 'Section 1: Hero Banner' },
  { id: 'section_294013533', tag: 'section', name: 'Section 2: Concerns & Video Testimonials' },
  { id: 'section_1967412634', tag: 'section', name: 'Section 3: 5 Clinical Benefits (Advanced)' },
  { id: 'section_1563108974', tag: 'section', name: 'Section 4: Doctors Carousel' },
  { id: 'section_818310656', tag: 'section', name: 'Section 5: Facilities & Equipment' },
  { id: 'section_1936328654', tag: 'section', name: 'Section 6: Pricing Packages' },
  { id: 'section_991765975', tag: 'section', name: 'Section 7: Periodic Cancer Screening' },
  { id: 'section_1899109699', tag: 'section', name: 'Section 8: Customer Stories' },
  { id: 'section_1178718493', tag: 'section', name: 'Section 9: Consultation & Booking' },
  { id: 'section_1915240304', tag: 'section', name: 'Section 10: FAQ' },
  { id: 'section_514095607', tag: 'section', name: 'Section 11: Banner CTA' },
  { id: 'section_2064860503', tag: 'section', name: 'Section 12: Footer Main' },
  { id: 'section_1263006414', tag: 'section', name: 'Section 13: Footer Bottom' }
];

const imgMap = [];

// Extract section by section
sections.forEach(sec => {
  let secHtml = '';
  if (sec.id === 'header') {
    const m = html.match(/<header id="header"[\s\S]*?<\/header>/i);
    secHtml = m ? m[0] : '';
  } else {
    const m = html.match(new RegExp(`<section[^>]*id=["']${sec.id}["'][\\s\\S]*?<\\/section>`, 'i'));
    secHtml = m ? m[0] : '';
  }

  // Find images in this section
  const imgMatches = [...secHtml.matchAll(/<img\b([^>]*?)>/gi)];
  imgMatches.forEach(im => {
    const attrs = im[1];
    const src = (attrs.match(/src=["']([^"']+)["']/i) || [])[1];
    const dataSrc = (attrs.match(/data-src=["']([^"']+)["']/i) || [])[1];
    const alt = (attrs.match(/alt=["']([^"']+)["']/i) || [])[1] || '';
    const cls = (attrs.match(/class=["']([^"']+)["']/i) || [])[1] || '';
    const finalUrl = dataSrc || src;

    if (!finalUrl || finalUrl.startsWith('data:') || finalUrl.includes('facebook.com')) return;

    // determine usage
    let usage = alt || cls || 'Content image';

    // match against localFiles
    let matchedAsset = null;
    let confidence = 'unresolved';

    // Specific known mappings based on project context
    if (finalUrl.includes('700da2d8-a2da-4897-3616-647bc8083d00')) {
      matchedAsset = '/sites/doctorcheck-vn/root/images/logo-header.webp';
      usage = 'Header main brand logo';
      confidence = 'exact';
    } else if (finalUrl.includes('9c47f8ce-3635-4598-2d0e-6c7e9a9ab200')) {
      matchedAsset = '/sites/doctorcheck-vn/root/images/logo-sticky.webp';
      usage = 'Sticky header white logo';
      confidence = 'exact';
    } else if (finalUrl.includes('428ac6c9-bd35-483e-db56-281930032d00')) {
      matchedAsset = '/sites/doctorcheck-vn/root/images/banner-desktop-master.webp';
      usage = 'Desktop Hero Banner (2560x1038)';
      confidence = 'exact';
    } else if (finalUrl.includes('ccd6b033-d84d-4f06-88f2-fa2bd08aaf00')) {
      matchedAsset = '/sites/doctorcheck-vn/root/images/banner-mobile-master.webp';
      usage = 'Mobile Hero Banner (856x1256)';
      confidence = 'exact';
    } else if (finalUrl.includes('fe4b3528-d236-4c2c-72e7-87a5dd287800')) {
      matchedAsset = '/sites/doctorcheck-vn/root/images/doctors/trinh-ai-nhi.webp';
      usage = 'BSCKII Trịnh Ái Nhi portrait';
      confidence = 'exact';
    } else if (finalUrl.includes('fa3c5180-954a-4a59-dd94-3d447bb7a700') || finalUrl.includes('4e2481e7-7f3e-4dd7-26d8-7a9563c29200')) {
      matchedAsset = '/sites/doctorcheck-vn/root/images/doctors/chau-quynh-phi-nha.webp';
      usage = 'BSCKII Châu Quỳnh Phi Nhã portrait';
      confidence = 'exact';
    } else if (finalUrl.includes('e2437733-41f5-42f7-278b-afcddd382f00')) {
      matchedAsset = '/sites/doctorcheck-vn/root/images/doctors/nguyen-ngoc-quynh-dung.webp';
      usage = 'ThS. BSCKII Nguyễn Ngọc Quỳnh Dung portrait';
      confidence = 'exact';
    } else if (finalUrl.includes('9fafa9a3-97a5-4895-2715-bf56ee418b00')) {
      matchedAsset = '/sites/doctorcheck-vn/root/images/doctors/nguyen-hong-thanh.webp';
      usage = 'ThS. BSCKII Nguyễn Hồng Thanh portrait';
      confidence = 'exact';
    } else if (finalUrl.includes('c3a06dc1-81e7-4287-ff3f-13bea17bc700')) {
      matchedAsset = '/sites/doctorcheck-vn/root/images/doctors/luu-ngoc-mai.webp';
      usage = 'ThS. BSCKI Lưu Ngọc Mai portrait';
      confidence = 'exact';
    } else if (finalUrl.includes('b9ca289f-001e-4d7b-aff4-99654da0b900')) {
      matchedAsset = '/sites/doctorcheck-vn/root/images/doctors/thai-viet-nguyen.webp';
      usage = 'BSCKI Thái Việt Nguyên portrait';
      confidence = 'exact';
    } else if (finalUrl.includes('c8dffc2a-eb71-4d2f-27a7-1acabb8fc900')) {
      matchedAsset = '/sites/doctorcheck-vn/root/images/doctors/dang-nguyen-nhat-thanh-thi.webp';
      usage = 'BS Đặng Nguyễn Nhật Thanh Thi portrait';
      confidence = 'exact';
    } else if (sec.id === 'section_818310656') {
      // Equipment section
      if (alt.includes('nội soi') || alt.includes('EVIS') || finalUrl.includes('65b02767')) {
        matchedAsset = '/sites/doctorcheck-vn/root/images/equipment/equip-noi-soi-master.webp';
        usage = 'Máy nội soi Olympus EVIS X1';
        confidence = 'exact';
      } else if (alt.includes('siêu âm') || alt.includes('Siemens') || finalUrl.includes('5ae5a4b8')) {
        matchedAsset = '/sites/doctorcheck-vn/root/images/equipment/equip-sieu-am-master.webp';
        usage = 'Máy siêu âm màu Siemens Acuson';
        confidence = 'exact';
      } else if (alt.includes('X-quang')) {
        matchedAsset = '/sites/doctorcheck-vn/root/images/equipment/equip-x-quang-master.webp';
        usage = 'Máy chụp X-quang kỹ thuật số';
        confidence = 'exact';
      } else if (alt.includes('xét nghiệm')) {
        matchedAsset = '/sites/doctorcheck-vn/root/images/equipment/equip-xet-nghiem-master.webp';
        usage = 'Hệ thống máy xét nghiệm tự động';
        confidence = 'exact';
      } else if (alt.includes('HP') || alt.includes('hơi thở')) {
        matchedAsset = '/sites/doctorcheck-vn/root/images/equipment/equip-hpylori-master.webp';
        usage = 'Máy xét nghiệm vi khuẩn HP qua hơi thở';
        confidence = 'exact';
      } else if (alt.includes('điện tim')) {
        matchedAsset = '/sites/doctorcheck-vn/root/images/equipment/equip-dien-tim-master.webp';
        usage = 'Máy đo điện tim kỹ thuật số';
        confidence = 'exact';
      } else {
        matchedAsset = 'UNRESOLVED';
        confidence = 'unresolved';
      }
    } else if (sec.id === 'section_1967412634') {
      matchedAsset = '/sites/doctorcheck-vn/root/images/benefits-banner-master.webp';
      usage = '5 Quyền lợi clinical intro banner';
      confidence = 'exact';
    } else if (sec.id === 'section_2064860503') {
      if (finalUrl.includes('Group-55.svg') || alt.includes('logo')) {
        matchedAsset = '/sites/doctorcheck-vn/root/images/logo.webp';
        usage = 'Footer brand logo';
        confidence = 'exact';
      } else {
        matchedAsset = 'UNRESOLVED (External/Third-party badge)';
        confidence = 'unresolved';
      }
    }

    imgMap.push({
      originalReference: finalUrl,
      section: sec.name,
      existingAsset: matchedAsset || 'UNRESOLVED',
      usage,
      confidence
    });
  });
});

console.log('Total extracted image rows:', imgMap.length);
fs.writeFileSync('scratch/image_source_map.json', JSON.stringify(imgMap, null, 2));
