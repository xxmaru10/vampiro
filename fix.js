const fs = require('fs');

const txt = fs.readFileSync('index.html', 'utf8');

// The file was saved as UTF-8 while the text editor thought it was Windows-1252.
// In Node, we can decode it by using binary (latin1) to UTF-8.
let fixed = Buffer.from(txt, 'binary').toString('utf8');

// Now, the ASCII art was broken because the original characters were not in Latin1.
// Let's find the ASCII art by locating the terminal-box div.
const startStr = '<div class="terminal-box">';
const endStr = '</div>';

const startIndex = fixed.indexOf(startStr);
if (startIndex !== -1) {
  const innerStartIndex = startIndex + startStr.length;
  const endIndex = fixed.indexOf(endStr, innerStartIndex);
  
  if (endIndex !== -1) {
    const goodAscii = `
██████╗ ██╗     ██╗███╗   ██╗██╗  ██╗███╗   ███╗ ██████╗ ████████╗██╗ ██████╗ ███╗   ██╗
██╔══██╗██║     ██║████╗  ██║██║ ██╔╝████╗ ████║██╔═══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
██████╔╝██║     ██║██╔██╗ ██║█████╔╝ ██╔████╔██║██║   ██║   ██║   ██║██║   ██║██╔██╗ ██║
██╔══██╗██║     ██║██║╚██╗██║██╔═██╗ ██║╚██╔╝██║██║   ██║   ██║   ██║██║   ██║██║╚██╗██║
██████╔╝███████╗██║██║ ╚████║██║  ██╗██║ ╚═╝ ██║╚██████╔╝   ██║   ██║╚██████╔╝██║ ╚████║
╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝    ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
`;
    fixed = fixed.substring(0, innerStartIndex) + goodAscii + fixed.substring(endIndex);
  }
}

// Write back the perfectly fixed file as pure UTF-8.
fs.writeFileSync('index.html', fixed, 'utf8');
console.log('Fixed index.html successfully!');
