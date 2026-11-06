(() => {
  // 2026 rates (employee share). See page text for sources.
  const R = {
    pension: 0.0475, pensionMin: 410000, pensionMax: 6590000,
    health: 0.03595, ltcOfHealth: 0.9448 / 7.19,
    ei: 0.009,
    personal: 1500000, standardCredit: 130000,
  };
  const BRACKETS = [ // [upper limit, rate, progressive deduction]
    [14e6, 0.06, 0], [50e6, 0.15, 1.26e6], [88e6, 0.24, 5.76e6], [150e6, 0.35, 15.44e6],
    [300e6, 0.38, 19.94e6], [500e6, 0.40, 25.94e6], [1e9, 0.42, 35.94e6], [Infinity, 0.45, 65.94e6],
  ];

  const floor10 = (n) => Math.max(0, Math.floor(n / 10 + 1e-9) * 10); // drop amounts under 10 won
  const fmt = (n) => '₩' + Math.round(n).toLocaleString('en-US');

  function parseWon(s) {
    s = String(s).replace(/[,\s원₩]|won|krw/gi, '');
    if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
    const m = s.match(/^(?:([\d.]+)억)?(?:([\d.]+)천)?(?:([\d.]+)만)?$/);
    if (!m || !s) return NaN;
    const eok = parseFloat(m[1] || 0), cheon = parseFloat(m[2] || 0), man = parseFloat(m[3] || 0);
    // "4천만" -> 4000만; "1억 2천" -> 1억 2천만 (everyday shorthand)
    return Math.round(eok * 1e8 + cheon * 1e7 + man * 1e4);
  }

  function earnedIncomeDeduction(S) {
    let d;
    if (S <= 5e6) d = S * 0.7;
    else if (S <= 15e6) d = 3.5e6 + (S - 5e6) * 0.4;
    else if (S <= 45e6) d = 7.5e6 + (S - 15e6) * 0.15;
    else if (S <= 100e6) d = 12e6 + (S - 45e6) * 0.05;
    else d = 14.75e6 + (S - 100e6) * 0.02;
    return Math.min(d, 20e6);
  }

  function earnedIncomeCredit(tax, S) {
    let c = tax <= 1.3e6 ? tax * 0.55 : 715000 + (tax - 1.3e6) * 0.3;
    let cap;
    if (S <= 33e6) cap = 740000;
    else if (S <= 70e6) cap = Math.max(740000 - (S - 33e6) * 0.008, 660000);
    else if (S <= 120e6) cap = Math.max(660000 - (S - 70e6) * 0.5, 500000);
    else cap = Math.max(500000 - (S - 120e6) * 0.5, 200000);
    return Math.min(c, cap);
  }

  function calc({ monthlyGross, nontax, deps, noPension, noEi }) {
    const base = Math.max(0, monthlyGross - nontax);
    const pension = noPension ? 0 : floor10(Math.min(Math.max(base, R.pensionMin), R.pensionMax) * R.pension);
    const health = floor10(base * R.health);
    const ltc = floor10(health * R.ltcOfHealth);
    const ei = noEi ? 0 : floor10(base * R.ei);

    const S = base * 12;
    const income = S - earnedIncomeDeduction(S);
    const taxable = Math.max(0, income - R.personal * deps - (pension + health + ltc + ei) * 12);
    const b = BRACKETS.find(([lim]) => taxable <= lim);
    const computed = Math.max(0, taxable * b[1] - b[2]);
    const annualTax = Math.max(0, computed - earnedIncomeCredit(computed, S) - R.standardCredit);
    const incomeTax = floor10(annualTax / 12);
    const localTax = floor10(incomeTax * 0.1);

    const total = pension + health + ltc + ei + incomeTax + localTax;
    return { pension, health, ltc, ei, incomeTax, localTax, total, net: monthlyGross - total };
  }

  const $ = (id) => document.getElementById(id);
  const inputs = ['period', 'amount', 'nontax', 'deps', 'no-pension', 'no-ei'];

  function render() {
    const amt = parseWon($('amount').value);
    const nontax = parseWon($('nontax').value || '0');
    if (!(amt > 0) || !(nontax >= 0)) {
      $('net').textContent = '—';
      $('net-year').textContent = 'Please enter your salary in won, e.g. 40,000,000 or 4000만.';
      $('rows').innerHTML = '';
      return;
    }
    const monthlyGross = $('period').value === 'year' ? amt / 12 : amt;
    $('amount-hint').textContent = $('period').value === 'year'
      ? `= ${fmt(monthlyGross)} per month before deductions.`
      : `= ${fmt(monthlyGross * 12)} per year before deductions.`;
    const r = calc({
      monthlyGross, nontax: Math.min(nontax, monthlyGross), deps: Number($('deps').value),
      noPension: $('no-pension').checked, noEi: $('no-ei').checked,
    });
    $('net').textContent = fmt(r.net);
    $('net-year').textContent = `${fmt(r.net * 12)} per year · deductions ${fmt(r.total)} a month (${(r.total / monthlyGross * 100).toFixed(1)}% of gross)`;
    const rows = [
      ['Gross monthly salary', '', monthlyGross],
      ['National Pension', $('no-pension').checked ? 'exempt' : '4.75%', -r.pension],
      ['Health Insurance', '3.595%', -r.health],
      ['Long-term Care Insurance', '13.14% of health', -r.ltc],
      ['Employment Insurance', $('no-ei').checked ? 'exempt' : '0.9%', -r.ei],
      ['Income tax (estimate)', 'progressive', -r.incomeTax],
      ['Local income tax', '10% of income tax', -r.localTax],
    ];
    $('rows').innerHTML = rows.map(([n, rate, v]) =>
      `<tr><td>${n}</td><td>${rate}</td><td class="num">${v < 0 ? '−' : ''}${fmt(Math.abs(v))}</td></tr>`).join('') +
      `<tr class="total"><td>Take-home pay</td><td></td><td class="num">${fmt(r.net)}</td></tr>`;
  }

  inputs.forEach((id) => { $(id).addEventListener('input', render); $(id).addEventListener('change', render); });
  render();
  window.__salaryCalc = calc;
})();
