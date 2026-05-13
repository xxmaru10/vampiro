const fs = require('fs');
const h = fs.readFileSync('site/index.html', 'utf8');
const m = h.match(/id="[^"]+"/g);
const ids = [...new Set(m)];
console.log(ids.join('\n'));
