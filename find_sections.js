const fs = require('fs');
const txt = fs.readFileSync('index.html', 'utf8');
const lines = txt.split('\n');
const sections = lines.filter(l => l.includes('id="section-'));
console.log(sections);
