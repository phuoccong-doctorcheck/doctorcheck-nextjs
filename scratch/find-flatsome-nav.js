const fs = require('fs');
const css = fs.readFileSync('doctorcheck-source/css/flatsome.css', 'utf8');
const idx = css.indexOf('.nav>li>a');
if (idx !== -1) {
  console.log(css.substring(idx, idx + 300));
} else {
  console.log('Not found');
}
