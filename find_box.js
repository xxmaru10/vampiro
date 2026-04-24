const fs = require('fs');
const txt = fs.readFileSync('index_utf8.html', 'utf8');
const idx = txt.indexOf('terminal-box');
if (idx !== -1) {
  console.log(txt.substring(idx - 50, idx + 200));
} else {
  console.log('not found');
}
