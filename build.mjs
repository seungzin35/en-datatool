// Tiny static builder: wraps each pages/*.html body in the shared layout and writes dist/.
// Each page file starts with a JSON header between <!--meta and -->.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';

const SITE = 'https://en-datatool.zinnote.kr';
const ADSENSE = 'ca-pub-8517057986888627';
const OUT = 'dist';
const TOOLS = [
  ['man-eok-converter', 'Man / Eok converter', 'Read 만 and 억 amounts in digits, English and USD.'],
  ['pyeong-to-square-meters', 'Pyeong ↔ m² converter', 'Korean apartment sizes in square meters and feet.'],
  ['take-home-pay-calculator', 'Take-home pay calculator', 'Your 2026 net monthly salary in Korea.'],
  ['korean-address-in-english', 'Korean address in English', 'Hangul address to English order and spelling.'],
  ['korean-size-chart', 'Clothing & shoe sizes', 'Korean sizes vs US, UK and EU.'],
  ['korean-name-romanizer', 'Korean name romanizer', 'Korean names in English letters.'],
];
const layout = readFileSync('layout.html', 'utf8');
const help = JSON.parse(readFileSync('help.json', 'utf8'));
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

rmSync(OUT, { recursive: true, force: true });
cpSync('public', OUT, { recursive: true });

const urls = [];
for (const file of readdirSync('pages').filter((f) => f.endsWith('.html'))) {
  const raw = readFileSync(join('pages', file), 'utf8');
  const m = raw.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if (!m) throw new Error(`${file}: missing <!--meta {...} --> header`);
  const meta = JSON.parse(m[1]);
  let body = raw.slice(m[0].length);
  const h = help[file.replace(/\.html$/, '')];
  let faqLd = '';
  if (h) {
    const howto = `<h2>How to use</h2>\n<ol class="steps">${h.howto.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>\n`;
    if (!body.includes('{{howto}}')) throw new Error(`${file}: missing {{howto}} placeholder`);
    body = body.replace('{{howto}}', howto) +
      `\n<h2>Frequently asked questions</h2>\n<div class="faq">${h.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>\n`;
    faqLd = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: h.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) })}</script>`;
  }
  const slug = file === 'index.html' ? '' : file.replace(/\.html$/, '') + '/';
  const url = `${SITE}/${slug}`;
  const ld = [];
  if (slug === '') {
    ld.push({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Korea Data Tools', url: `${SITE}/`, inLanguage: 'en',
      publisher: { '@type': 'Organization', name: 'zinnote.kr', url: 'https://zinnote.kr' } });
  } else {
    ld.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Korea Data Tools', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: meta.tool || meta.title.split(' – ')[0], item: url }] });
  }
  if (meta.tool) {
    const others = TOOLS.filter(([s]) => s + '.html' !== file);
    body += `\n<h2>More free tools for life in Korea</h2>\n<div class="grid">${others.map(([s, n, d]) =>
      `<a class="tool-card" href="/${s}/"><h3>${n}</h3><p>${d}</p></a>`).join('')}</div>\n`;
  }
  const html = layout
    .replaceAll('{{title}}', meta.title)
    .replaceAll('{{description}}', meta.description)
    .replaceAll('{{url}}', url)
    .replaceAll('{{adsense}}', ADSENSE)
    .replaceAll('{{script}}', [].concat(meta.script || []).map((f) => `<script src="/assets/${f}" defer></script>`).join('\n'))
    .replaceAll('{{jsonld}}', meta.tool
      ? `<script type="application/ld+json">${JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebApplication', name: meta.tool,
          url, description: meta.description, applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Any', inLanguage: 'en', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        })}</script>`
      : '')
    .replace('{{faqld}}', faqLd + ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join(''))
    .replace('{{body}}', body);
  const dest = join(OUT, slug, 'index.html');
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html);
  urls.push(url);
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.sort().map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
  `\n</urlset>\n`);
console.log(`Built ${urls.length} pages into ${OUT}/`);
