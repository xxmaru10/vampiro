const fs = require('fs');
const txt = fs.readFileSync('index_utf8.html', 'utf8');
const idx = txt.lastIndexOf('terminal-box');
if (idx !== -1) {
  console.log(txt.substring(idx - 50, idx + 400));
} else {
  console.log('not found');
}
