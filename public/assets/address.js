(() => {
  const { romanize, cap } = window.KRoman;
  const REGIONS = [
    [/^서울(특별시|시)?$/, 'Seoul'], [/^부산(광역시|시)?$/, 'Busan'], [/^대구(광역시|시)?$/, 'Daegu'],
    [/^인천(광역시|시)?$/, 'Incheon'], [/^광주(광역시)?$/, 'Gwangju'], [/^대전(광역시|시)?$/, 'Daejeon'],
    [/^울산(광역시|시)?$/, 'Ulsan'], [/^세종(특별자치시|시)?$/, 'Sejong-si'], [/^경기(도)?$/, 'Gyeonggi-do'],
    [/^강원(특별자치도|도)?$/, 'Gangwon-do'], [/^충(청북도|북)$/, 'Chungcheongbuk-do'], [/^충(청남도|남)$/, 'Chungcheongnam-do'],
    [/^(전북특별자치도|전라북도|전북)$/, 'Jeonbuk-do'], [/^(전라남도|전남)$/, 'Jeollanam-do'],
    [/^(경상북도|경북)$/, 'Gyeongsangbuk-do'], [/^(경상남도|경남)$/, 'Gyeongsangnam-do'], [/^제주(특별자치도|도)?$/, 'Jeju-do'],
  ];
  const UNIT = { '시': 'si', '군': 'gun', '구': 'gu', '읍': 'eup', '면': 'myeon', '동': 'dong', '리': 'ri', '가': 'ga' };
  const rom = (w) => cap(romanize(w));

  function convertToken(tok) {
    for (const [re, en] of REGIONS) if (re.test(tok)) return { type: 'admin', text: en };
    let m;
    if ((m = tok.match(/^(\d+(?:-\d+)?)(번지)?$/))) return { type: 'num', text: m[1] };
    if ((m = tok.match(/^지하(\d+(?:-\d+)?)$/))) return { type: 'num', text: 'B' + m[1] };
    if ((m = tok.match(/^(\d+)동$/))) return { type: 'detail', text: m[1] + '-dong', order: 2 };
    if ((m = tok.match(/^(?:제)?(\d+)호$/))) return { type: 'detail', text: m[1] + '-ho', order: 1 };
    if ((m = tok.match(/^(?:지하)?(\d+)층$/))) return { type: 'detail', text: (tok.startsWith('지하') ? 'B' : '') + m[1] + 'F', order: 1 };
    // Road names: 세종대로, 테헤란로, 세종대로23길, 중앙로123번길, 서문로1가길
    if ((m = tok.match(/^(.+?)(대로|로|길)(?:(\d+)(번길|길))?$/)) && !/\d/.test(m[1])) {
      const base = rom(m[1]) + '-' + { '대로': 'daero', '로': 'ro', '길': 'gil' }[m[2]];
      return { type: 'road', text: m[3] ? `${base} ${m[3]}${m[4] === '번길' ? 'beon-gil' : '-gil'}` : base };
    }
    // 종로1가, 을지로3가
    if ((m = tok.match(/^(.+?)(\d+)가$/))) return { type: 'admin', text: `${rom(m[1])} ${m[2]}-ga` };
    // 역삼1동, 신림동, 수원시, 분당구 …
    if ((m = tok.match(/^(.+?)(\d*)(시|군|구|읍|면|동|리)$/)) && m[1].length >= 1) {
      return { type: 'admin', text: `${rom(m[1])}${m[2] ? m[2] : ''}-${UNIT[m[3]]}` };
    }
    if (/^[가-힣]+$/.test(tok)) return { type: 'name', text: rom(tok) };
    return { type: 'name', text: tok };
  }

  function convert(addr) {
    let s = addr.replace(/\(.*?\)/g, ' ').replace(/,/g, ' ').trim();
    let postal = '';
    s = s.replace(/^\[?(\d{5})\]?\s*/, (_, p) => { postal = p; return ''; });
    s = s.replace(/\s(\d{5})$/, (_, p) => { postal = p; return ''; });
    // split glued detail like "101동202호"
    s = s.replace(/(\d+동)(\d+호)/g, '$1 $2');
    const toks = s.split(/\s+/).filter(Boolean);
    const main = [], detail = [], names = [];
    for (const tok of toks) {
      const c = convertToken(tok);
      if (c.type === 'num' && main.length) main[main.length - 1] = c.text + ' ' + main[main.length - 1];
      else if (c.type === 'detail') detail.push(c);
      else if (c.type === 'name') names.push(c.text);
      else main.push(c.text);
    }
    detail.sort((a, b) => a.order - b.order);
    const first = [detail.map((d) => d.text).join(', '), names.join(' ')].filter(Boolean);
    const parts = [...first, ...main.reverse()];
    if (postal) parts.push(postal);
    parts.push('Republic of Korea');
    return parts.join(', ');
  }

  const $ = (id) => document.getElementById(id);
  function render() {
    const v = $('addr').value.trim();
    if (!v) { $('out').textContent = '—'; return; }
    $('out').textContent = convert(v);
  }
  $('addr').addEventListener('input', render);
  document.querySelectorAll('[data-addr]').forEach((b) => b.addEventListener('click', () => { $('addr').value = b.dataset.addr; render(); }));
  $('copy').addEventListener('click', () => {
    const t = $('out').textContent;
    navigator.clipboard && navigator.clipboard.writeText(t).then(() => { $('copy').textContent = 'Copied!'; setTimeout(() => { $('copy').textContent = 'Copy'; }, 1500); });
  });
  render();
  window.__convertAddress = convert;
})();
