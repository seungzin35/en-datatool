(() => {
  const $ = (id) => document.getElementById(id);
  function won(s) {
    s = String(s).replace(/[,\s원₩]/g, '');
    if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
    const m = s.match(/^(?:([\d.]+)억)?(?:([\d.]+)천)?(?:([\d.]+)만)?$/);
    if (!m || !s) return NaN;
    return (parseFloat(m[1] || 0) * 1e8) + (parseFloat(m[2] || 0) * 1e7) + (parseFloat(m[3] || 0) * 1e4);
  }
  const fmt = (n) => '₩' + Math.round(n).toLocaleString('en-US');
  function one() {
    const j = won($('j').value), d = won($('d').value), r = parseFloat($('r').value) / 100;
    if (!(j >= 0) || !(d >= 0) || !(r > 0) || d > j) { $('out1').textContent = '—'; $('out1s').textContent = d > j ? 'The new deposit must be smaller than the jeonse deposit.' : 'Check the numbers.'; return; }
    const m = (j - d) * r / 12;
    $('out1').textContent = fmt(Math.round(m / 1000) * 1000) + ' / month';
    $('out1s').textContent = `Deposit ${fmt(d)} + monthly rent ≈ ${fmt(m)} (${fmt(j - d)} converted at ${(r * 100).toFixed(1)}% a year)`;
  }
  function two() {
    const d = won($('d2').value), m = won($('m2r').value), r = parseFloat($('r2').value) / 100;
    if (!(d >= 0) || !(m >= 0) || !(r > 0)) { $('out2').textContent = '—'; $('out2s').textContent = 'Check the numbers.'; return; }
    const j = d + m * 12 / r;
    $('out2').textContent = fmt(Math.round(j / 1e6) * 1e6);
    $('out2s').textContent = `${fmt(m)} a month at ${(r * 100).toFixed(1)}% a year is worth about ${fmt(m * 12 / r)} of deposit.`;
  }
  ['j', 'd', 'r'].forEach((id) => $(id).addEventListener('input', one));
  ['d2', 'm2r', 'r2'].forEach((id) => $(id).addEventListener('input', two));
  one(); two();
})();
