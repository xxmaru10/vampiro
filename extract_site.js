const fs = require('fs');
let html = fs.readFileSync('site/index.html', 'utf8');

// Seções a incluir, em ordem (excluindo Miami/intro/splash)
const pagesToInclude = [
  'page-principios',
  'page-como-usar',
  'page-criacao',
  'page-pericias',
  'page-aspectos',
  'page-stunts',
  'page-disciplinas',
  'page-taumaturgia',
  'page-necromancia',
  'page-fome',
  'page-combate',
  'page-dano-agravado',
  'page-frenesi',
  'page-humanidade',
  'page-sangue',
  'page-laco',
  'page-recuperacao',
  'page-torpor',
  'page-mascara',
  'page-diablerie',
  'page-avanco',
  'page-clas',
  'page-sociedade',
  'page-geracoes',
  'page-narrador',
  'page-jogadores',
  'page-referencia',
];

const pageTitles = {
  'page-principios':    'PRINCÍPIOS DA ADAPTAÇÃO',
  'page-como-usar':     'COMO USAR ESTE GUIA',
  'page-criacao':       'CRIAÇÃO DE PERSONAGEM',
  'page-pericias':      'PERÍCIAS',
  'page-aspectos':      'ASPECTOS',
  'page-stunts':        'FAÇANHAS E EXTRAS',
  'page-disciplinas':   'DISCIPLINAS',
  'page-taumaturgia':   'TAUMATURGIA',
  'page-necromancia':   'NECROMANCIA',
  'page-fome':          'FOME E CAÇA',
  'page-combate':       'COMBATE',
  'page-dano-agravado': 'DANO AGRAVADO',
  'page-frenesi':       'FRENESI',
  'page-humanidade':    'HUMANIDADE E TRILHAS',
  'page-sangue':        'GASTAR SANGUE (POOL DE SANGUE)',
  'page-laco':          'LAÇO DE SANGUE',
  'page-recuperacao':   'RECUPERAÇÃO',
  'page-torpor':        'TORPOR E ESTACA',
  'page-mascara':       'A MÁSCARA',
  'page-diablerie':     'DIABOLERIE',
  'page-avanco':        'AVANÇO',
  'page-clas':          'OS CLÃS DE CAIM',
  'page-sociedade':     'SOCIEDADE KINDRED',
  'page-geracoes':      'GERAÇÕES',
  'page-narrador':      'GUIA DO NARRADOR',
  'page-jogadores':     'PARA JOGADORES',
  'page-referencia':    'TABELAS DE REFERÊNCIA',
};

// IDs de todas as seções "page-" para calcular o fim de cada bloco
const allPageIds = [
  'page-historia',
  'page-inicio',
  ...pagesToInclude,
  'section-char-creator',
  'section-social',
];

// Extrair slice de HTML entre dois IDs
function extractBetween(html, startId, allIds) {
  const startMarker = `id="${startId}"`;
  const startPos = html.indexOf(startMarker);
  if (startPos === -1) return '';

  // Encontra o próximo id de seção após este
  let endPos = html.length;
  for (const otherId of allIds) {
    if (otherId === startId) continue;
    const marker = `id="${otherId}"`;
    const pos = html.indexOf(marker, startPos + startMarker.length);
    if (pos !== -1 && pos < endPos) {
      endPos = pos;
    }
  }

  return html.substring(startPos, endPos);
}

// Converte bloco HTML para texto limpo
function toText(block) {
  // Remove scripts e estilos
  block = block.replace(/<script[\s\S]*?<\/script>/gi, '');
  block = block.replace(/<style[\s\S]*?<\/style>/gi, '');

  // Callout titles → colchetes
  block = block.replace(/<[^>]*class="callout-title"[^>]*>([\s\S]*?)<\/[^>]+>/gi,
    (_, t) => '\n[' + stripTags(t).trim() + ']\n');

  // src-tag (Original / Adaptação minha / Parcial)
  block = block.replace(/<[^>]*class="[^"]*src-[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/gi,
    (_, t) => ' [' + stripTags(t).trim() + ']');

  // Headings
  block = block.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi,
    (_, t) => '\n\n' + '='.repeat(60) + '\n' + stripTags(t).trim() + '\n' + '='.repeat(60) + '\n');
  block = block.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi,
    (_, t) => '\n\n' + '-'.repeat(50) + '\n' + stripTags(t).trim() + '\n' + '-'.repeat(50) + '\n');
  block = block.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi,
    (_, t) => '\n\n>> ' + stripTags(t).trim() + '\n');
  block = block.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi,
    (_, t) => '\n> ' + stripTags(t).trim() + '\n');

  // Listas
  block = block.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi,
    (_, t) => '\n  • ' + stripTags(t).trim());

  // Tabelas: cabeçalho
  block = block.replace(/<thead[\s\S]*?<\/thead>/gi, thead => {
    const cols = [];
    thead.replace(/<th[^>]*>([\s\S]*?)<\/th>/gi, (_, t) => cols.push(stripTags(t).trim()));
    if (!cols.length) return '';
    return '\n' + cols.join(' | ') + '\n' + cols.map(() => '---').join(' | ') + '\n';
  });

  // Linhas de tabela
  block = block.replace(/<tr[^>]*>/gi, '\n');
  block = block.replace(/<td[^>]*>([\s\S]*?)<\/td>/gi, (_, t) => stripTags(t).trim() + ' | ');

  // Strong / em
  block = block.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_, t) => '**' + stripTags(t).trim() + '**');
  block = block.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, (_, t) => '_' + stripTags(t).trim() + '_');

  // Parágrafos e quebras
  block = block.replace(/<p[^>]*>/gi, '\n');
  block = block.replace(/<\/p>/gi, '\n');
  block = block.replace(/<br\s*\/?>/gi, '\n');

  // Divs genéricos → nova linha
  block = block.replace(/<div[^>]*>/gi, '\n');
  block = block.replace(/<\/div>/gi, '\n');

  // Remove todas as outras tags
  block = block.replace(/<[^>]+>/g, '');

  // Entidades HTML
  block = block
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '--')
    .replace(/&ndash;/g, '-')
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"');

  // Limpeza de espaços
  block = block.replace(/\r\n/g, '\n');
  block = block.replace(/[ \t]+/g, ' ');
  block = block.replace(/ \n/g, '\n');
  block = block.replace(/\n /g, '\n');
  block = block.replace(/\n{4,}/g, '\n\n\n');

  return block.trim();
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

// Montar documento final
const DIVIDER = '\n' + '#'.repeat(60) + '\n';

let out = '';
out += '============================================================\n';
out += '    VAMPIRO: A MÁSCARA — ADAPTAÇÃO FATE CORE\n';
out += '    GUIA COMPLETO DE REGRAS\n';
out += '    (Documento de referência — Crônicas de Miami excluídas)\n';
out += '============================================================\n\n';
out += 'Este documento reúne todas as regras e mecânicas da adaptação\n';
out += 'de Vampiro: A Máscara para o sistema Fate Core.\n\n';

let count = 0;
let missing = [];

for (const pageId of pagesToInclude) {
  const block = extractBetween(html, pageId, allPageIds);
  if (!block) { missing.push(pageId); continue; }

  const text = toText(block);
  if (text.length < 30) { missing.push(pageId); continue; }

  const title = pageTitles[pageId] || pageId;
  out += DIVIDER + '\n';
  out += title + '\n';
  out += DIVIDER + '\n\n';
  out += text + '\n\n';
  count++;
}

out = out.replace(/\n{5,}/g, '\n\n\n');

fs.writeFileSync(
  'c:/Users/danie/Desktop/RPG/vampiro/Guia_Completo_Vampiro_Site.txt',
  out, 'utf8'
);

console.log('Seções extraídas: ' + count);
console.log('Não encontradas : ' + (missing.join(', ') || 'nenhuma'));
console.log('Linhas          : ' + out.split('\n').length);
console.log('Tamanho         : ' + (out.length / 1024).toFixed(1) + ' KB');
