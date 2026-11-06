// Tiny static builder: wraps each pages/*.html and pages/guides/*.html body in the shared layout and writes dist/.
// Each page file starts with a JSON header between <!--meta and -->.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync, existsSync } from 'node:fs';
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
const ldScript = (o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`;
const fmtDate = (d) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

function readPage(path) {
  const raw = readFileSync(path, 'utf8');
  const m = raw.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if (!m) throw new Error(`${path}: missing <!--meta {...} --> header`);
  return { meta: JSON.parse(m[1]), body: raw.slice(m[0].length) };
}

// Guides: pages/guides/<slug>.html, newest first.
const guides = existsSync('pages/guides')
  ? readdirSync('pages/guides').filter((f) => f.endsWith('.html')).map((f) => {
      const { meta, body } = readPage(join('pages/guides', f));
      return { slug: f.replace(/\.html$/, ''), meta, body };
    }).sort((a, b) => b.meta.date.localeCompare(a.meta.date) || a.slug.localeCompare(b.slug))
  : [];
const guideFor = (toolSlug) => guides.find((g) => g.meta.tool === toolSlug);
const guideCards = (list) => `<div class="grid">${list.map((g) =>
  `<a class="tool-card" href="/guides/${g.slug}/"><span class="tag">Guide</span><h3>${esc(g.meta.headline)}</h3><p>${esc(g.meta.description)}</p></a>`).join('')}</div>`;

rmSync(OUT, { recursive: true, force: true });
cpSync('public', OUT, { recursive: true });

const urls = [];
function emit(slug, meta, body, extraLd = []) {
  const url = `${SITE}/${slug}`;
  const ld = [...extraLd];
  if (slug === '') {
    ld.push({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Korea Data Tools', url: `${SITE}/`, inLanguage: 'en',
      publisher: { '@type': 'Organization', name: 'zinnote.kr', url: 'https://zinnote.kr' } });
  } else {
    const items = [{ '@type': 'ListItem', position: 1, name: 'Korea Data Tools', item: `${SITE}/` }];
    if (slug.startsWith('guides/') && slug !== 'guides/') items.push({ '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE}/guides/` });
    items.push({ '@type': 'ListItem', position: items.length + 1, name: meta.headline || meta.tool || meta.title.split(' – ')[0], item: url });
    ld.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items });
  }
  if (meta.tool && !slug.startsWith('guides/')) {
    ld.push({ '@context': 'https://schema.org', '@type': 'WebApplication', name: meta.tool, url, description: meta.description,
      applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', inLanguage: 'en', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } });
  }
  const html = layout
    .replaceAll('{{title}}', meta.title)
    .replaceAll('{{description}}', meta.description)
    .replaceAll('{{url}}', url)
    .replaceAll('{{ogtype}}', slug.startsWith('guides/') && slug !== 'guides/' ? 'article' : 'website')
    .replaceAll('{{adsense}}', ADSENSE)
    .replaceAll('{{script}}', [].concat(meta.script || []).map((f) => `<script src="/assets/${f}" defer></script>`).join('\n'))
    .replace('{{jsonld}}', ld.map(ldScript).join('\n'))
    .replace('{{body}}', body);
  const dest = join(OUT, slug, 'index.html');
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html);
  urls.push(url);
}

// Tool and static pages
for (const file of readdirSync('pages').filter((f) => f.endsWith('.html'))) {
  let { meta, body } = readPage(join('pages', file));
  const key = file.replace(/\.html$/, '');
  const slug = file === 'index.html' ? '' : key + '/';
  const extraLd = [];
  const h = help[key];
  if (h) {
    if (!body.includes('{{howto}}')) throw new Error(`${file}: missing {{howto}} placeholder`);
    body = body.replace('{{howto}}', `<h2>How to use</h2>\n<ol class="steps">${h.howto.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>\n`) +
      `\n<h2>Frequently asked questions</h2>\n<div class="faq">${h.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>\n`;
    extraLd.push({ '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: h.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
  }
  if (meta.tool) {
    const g = guideFor(key);
    if (g) body += `\n<h2>Read the guide</h2>\n${guideCards([g])}\n`;
    const others = TOOLS.filter(([s]) => s !== key);
    body += `\n<h2>More free tools for life in Korea</h2>\n<div class="grid">${others.map(([s, n, d]) =>
      `<a class="tool-card" href="/${s}/"><h3>${n}</h3><p>${d}</p></a>`).join('')}</div>\n`;
  }
  if (slug === '' && guides.length) body = body.replace('{{guides}}', `<h2>Guides</h2>\n<p>Plain-English explanations of the Korean numbers, documents and habits behind each tool.</p>\n${guideCards(guides)}`);
  emit(slug, meta, body.replace('{{guides}}', ''), extraLd);
}

// Guide articles
for (const g of guides) {
  const { meta } = g;
  const tool = TOOLS.find(([s]) => s === meta.tool);
  const body = `<p class="crumbs"><a href="/">Home</a> › <a href="/guides/">Guides</a></p>
<article class="post">
<h1>${esc(meta.headline)}</h1>
<p class="lead">${esc(meta.description)}</p>
<p class="byline">Updated ${fmtDate(meta.updated || meta.date)} · ${meta.minutes} min read</p>
${tool ? `<div class="cta"><strong>Try the tool:</strong> <a href="/${tool[0]}/">${tool[1]}</a>. ${tool[2]}</div>` : ''}
${g.body}
${tool ? `<div class="cta"><strong>Do the math in seconds:</strong> <a href="/${tool[0]}/">open the ${tool[1]}</a>.</div>` : ''}
</article>
<h2>More guides</h2>
${guideCards(guides.filter((x) => x.slug !== g.slug))}
`;
  emit(`guides/${g.slug}/`, { ...meta, title: meta.title || meta.headline }, body, [{
    '@context': 'https://schema.org', '@type': 'Article', headline: meta.headline, description: meta.description,
    datePublished: meta.date, dateModified: meta.updated || meta.date, inLanguage: 'en',
    image: `${SITE}/og.png`, mainEntityOfPage: `${SITE}/guides/${g.slug}/`,
    author: { '@type': 'Organization', name: 'Korea Data Tools', url: `${SITE}/about/` },
    publisher: { '@type': 'Organization', name: 'zinnote.kr', url: 'https://zinnote.kr' },
  }]);
}

// Guides index
if (guides.length) {
  emit('guides/', { title: 'Guides to Life in Korea – Korea Data Tools',
    description: 'Plain-English guides to Korean rent listings, apartment sizes, payslips, addresses, clothing sizes and names.' },
    `<h1>Guides</h1>\n<p class="lead">Plain-English guides to the Korean numbers, documents and habits that confuse newcomers. Each guide comes with a free tool.</p>\n${guideCards(guides)}\n`);
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.sort().map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
  `\n</urlset>\n`);
console.log(`Built ${urls.length} pages into ${OUT}/`);
