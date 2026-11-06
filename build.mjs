// Tiny static builder: wraps each pages/*.html body in the shared layout and writes dist/.
// Each page file starts with a JSON header between <!--meta and -->.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';

const SITE = 'https://en-datatool.zinnote.kr';
const ADSENSE = 'ca-pub-8517057986888627';
const OUT = 'dist';
const layout = readFileSync('layout.html', 'utf8');

rmSync(OUT, { recursive: true, force: true });
cpSync('public', OUT, { recursive: true });

const urls = [];
for (const file of readdirSync('pages').filter((f) => f.endsWith('.html'))) {
  const raw = readFileSync(join('pages', file), 'utf8');
  const m = raw.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if (!m) throw new Error(`${file}: missing <!--meta {...} --> header`);
  const meta = JSON.parse(m[1]);
  const body = raw.slice(m[0].length);
  const slug = file === 'index.html' ? '' : file.replace(/\.html$/, '') + '/';
  const url = `${SITE}/${slug}`;
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
