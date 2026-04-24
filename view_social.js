const fs = require('fs');
const txt = fs.readFileSync('index.html', 'utf8');
const idx = txt.indexOf('id="section-social"');
console.log(txt.substring(idx, idx + 500));
