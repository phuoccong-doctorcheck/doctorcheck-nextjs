import fs from 'fs';

const html = fs.readFileSync('doctorcheck-source/html/homepage.html', 'utf8');

const headerStart = html.indexOf('<header');
const headerEnd = html.indexOf('</header>') + 9;
const headerHtml = html.substring(headerStart, headerEnd);
fs.writeFileSync('scratch/header-source.html', headerHtml);

const drawerIdx = html.indexOf('id="main-menu"');
if (drawerIdx !== -1) {
  const openTag = html.lastIndexOf('<div', drawerIdx);
  const closeTag = html.indexOf('</div>', drawerIdx + 2000) + 6;
  const drawerHtml = html.substring(openTag, closeTag);
  fs.writeFileSync('scratch/drawer-source.html', drawerHtml);
  console.log('Saved drawer-source.html');
}

console.log('Saved header-source.html');
