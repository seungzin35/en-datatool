(() => {
  const UNITS_BIG = { '조': 1e12, '억': 1e8, '만': 1e4 };
  const UNITS_SMALL = { '천': 1e3, '백': 1e2, '십': 10 };

  // Parse "3억 5천만", "2.5억", "50 man", "350,000,000원" into a number (NaN if invalid).
  function parseKorean(input) {
    let s = String(input).toLowerCase()
      .replace(/krw|won|원|₩|,|\s/g, '')
      .replace(/eok/g, '억').replace(/man/g, '만').replace(/jo/g, '조')
      .replace(/cheon/g, '천').replace(/baek/g, '백').replace(/sip/g, '십');
    if (!s) return NaN;
    if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
    let total = 0, section = 0, num = '', any = false, lastBig = '';
    for (const c of s) {
      if (/[\d.]/.test(c)) { num += c; continue; }
      if (c in UNITS_SMALL) {
        section += (num ? parseFloat(num) : 1) * UNITS_SMALL[c];
        num = ''; any = true; continue;
      }
      if (c in UNITS_BIG) {
        section += num ? parseFloat(num) : 0;
        if (section === 0) section = 1;
        total += section * UNITS_BIG[c];
        section = 0; num = ''; any = true; lastBig = c; continue;
      }
      return NaN;
    }
    if (num) section += parseFloat(num);
    // Everyday shorthand: "2억 5천" means 2억 5천만 (the 만 is dropped after 억).
    parseKorean.shorthand = lastBig === '억' && section > 0 && section < 1e4;
    total += parseKorean.shorthand ? section * 1e4 : section;
    if (!any && !num) return NaN;
    return Math.round(total);
  }

  const fmt = (n) => Math.round(n).toLocaleString('en-US');

  function toKorean(n) {
    n = Math.round(n);
    if (n === 0) return '0원';
    const parts = [];
    const jo = Math.floor(n / 1e12), eok = Math.floor((n % 1e12) / 1e8),
      man = Math.floor((n % 1e8) / 1e4), rest = n % 1e4;
    if (jo) parts.push(fmt(jo) + '조');
    if (eok) parts.push(fmt(eok) + '억');
    if (man) parts.push(fmt(man) + '만');
    if (rest) parts.push(fmt(rest));
    return parts.join(' ') + ' 원';
  }

  function toWords(n) {
    if (n < 1000) return fmt(n) + ' won';
    return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'long', maximumFractionDigits: 2 }).format(n) + ' won';
  }

  const $ = (id) => document.getElementById(id);
  const krw = $('krw'), usd = $('usd'), rate = $('rate');

  function fromKrw() {
    const n = parseKorean(krw.value);
    if (!isFinite(n)) {
      $('out-digits').textContent = '—';
      $('out-words').textContent = krw.value.trim() ? 'Could not read that amount. Try e.g. 1억 2천만 or 120000000.' : '—';
      $('out-korean').textContent = '—';
      usd.value = '';
      return;
    }
    $('out-digits').textContent = '₩' + fmt(n);
    $('out-words').textContent = toWords(n);
    $('out-korean').textContent = toKorean(n) + (parseKorean.shorthand ? ' (read as shorthand: the 만 after 억 is often left out)' : '');
    const r = parseFloat(rate.value);
    usd.value = r > 0 ? (n / r).toLocaleString('en-US', { maximumFractionDigits: 2 }) : '';
  }

  function fromUsd() {
    const d = parseFloat(usd.value.replace(/[$,\s]/g, ''));
    const r = parseFloat(rate.value);
    if (!(d >= 0) || !(r > 0)) return;
    krw.value = fmt(d * r);
    const keep = usd.value;
    fromKrw();
    usd.value = keep;
  }

  krw.addEventListener('input', fromKrw);
  usd.addEventListener('input', fromUsd);
  rate.addEventListener('input', fromKrw);
  document.getElementById('chips').addEventListener('click', (e) => {
    const v = e.target.closest('[data-v]');
    if (v) { krw.value = v.dataset.v; fromKrw(); }
  });
  fromKrw();

  fetch('https://open.er-api.com/v6/latest/USD')
    .then((r) => r.json())
    .then((j) => {
      const k = j && j.rates && j.rates.KRW;
      if (!k) throw new Error('no rate');
      rate.value = k.toFixed(2);
      const d = j.time_last_update_utc ? new Date(j.time_last_update_utc) : null;
      $('rate-note').textContent = 'Reference rate' + (d ? ' updated ' + d.toISOString().slice(0, 10) : '') + '. You can change it.';
      fromKrw();
    })
    .catch(() => { $('rate-note').textContent = "Couldn't load today's rate. Please type the current rate."; });

  window.__parseKorean = parseKorean; // for quick testing in the console
})();
