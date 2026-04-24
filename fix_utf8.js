const fs = require('fs');

let txt = fs.readFileSync('index_utf8.html', 'utf8');

const map = {
  'Ã¡': 'á', 'Ã¢': 'â', 'Ã£': 'ã', 'Ã§': 'ç', 'Ã©': 'é', 'Ãª': 'ê', 
  'Ã­': 'í', 'Ã³': 'ó', 'Ã´': 'ô', 'Ãµ': 'õ', 'Ãº': 'ú', 'Ã€': 'À', 
  'Ã\x81': 'Á', 'Ã‰': 'É', 'Ã“': 'Ó', 'Ã‡': 'Ç', 'ÃŠ': 'Ê', 
  'â€”': '—', 'â€\xA0': '†', 'â€œ': '“', 'â€\x9D': '”', 'Â·': '·', 'â€¦': '…',
  'Ã£o': 'ão', 'Ã§Ã£o': 'ção'
};

Object.keys(map).forEach(k => {
  txt = txt.split(k).join(map[k]);
});

// Since we fixed the encoding with string replacement, the ASCII art was NOT corrupted!
// BUT we should verify if the user's file had the ASCII art mangled!
// If the user's file had â–ˆ, we replace it!
txt = txt.split('â–ˆ').join('█');
txt = txt.split('â•—').join('╗');
txt = txt.split('â•—').join('╗');
txt = txt.split('â•”').join('╔');
txt = txt.split('â•š').join('╚');
txt = txt.split('â• ').join('═');
txt = txt.split('â•‘').join('║');

// Alternatively, just inject the clean ASCII art!
const startStr = '<div class="terminal-box">';
const endStr = '</div>';

const startIndex = txt.indexOf(startStr);
if (startIndex !== -1) {
  const innerStartIndex = startIndex + startStr.length;
  const endIndex = txt.indexOf(endStr, innerStartIndex);
  
  if (endIndex !== -1) {
    const goodAscii = `\n██████╗ ██╗     ██╗███╗   ██╗██╗  ██╗███╗   ███╗ ██████╗ ████████╗██╗ ██████╗ ███╗   ██╗\n██╔══██╗██║     ██║████╗  ██║██║ ██╔╝████╗ ████║██╔═══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║\n██████╔╝██║     ██║██╔██╗ ██║█████╔╝ ██╔████╔██║██║   ██║   ██║   ██║██║   ██║██╔██╗ ██║\n██╔══██╗██║     ██║██║╚██╗██║██╔═██╗ ██║╚██╔╝██║██║   ██║   ██║   ██║██║   ██║██║╚██╗██║\n██████╔╝███████╗██║██║ ╚████║██║  ██╗██║ ╚═╝ ██║╚██████╔╝   ██║   ██║╚██████╔╝██║ ╚████║\n╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝    ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝\n`;
    txt = txt.substring(0, innerStartIndex) + goodAscii + txt.substring(endIndex);
  }
}

fs.writeFileSync('index.html', txt, 'utf8');
console.log('Fixed index.html and restored Blinkmotion!');
