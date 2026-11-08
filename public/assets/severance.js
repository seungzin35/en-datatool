(() => {
  const $ = (id) => document.getElementById(id);
  const won = (s) => Number(String(s).replace(/[^\d.]/g, '')) || 0;
  const fmt = (n) => '₩' + Math.round(n).toLocaleString('en-US');
  const DAY = 86400000;
  const utc = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  function render() {
    const s = $('start').value, e = $('end').value;
    if (!s || !e || e < s) { $('sev').textContent = '—'; $('sev-detail').textContent = 'Check the dates.'; return; }
    const served = (utc(e) - utc(s)) / DAY + 1;
    // Average-wage period: the 3 calendar months before the day after the last working day.
    const [y, m, d] = e.split('-').map(Number);
    const exit = Date.UTC(y, m - 1, d + 1);
    const from = new Date(exit); from.setUTCMonth(from.getUTCMonth() - 3);
    const days3 = Math.round((exit - from.getTime()) / DAY);
    const wages = won($('pay3').value) + won($('bonus').value) * 3 / 12 + won($('leave').value) * 3 / 12;
    const daily = wages / days3;
    const sev = daily * 30 * served / 365;
    if (served < 365) {
      $('sev').textContent = '₩0';
      $('sev-detail').textContent = `You worked ${served} days. Severance requires at least 365 days with the same employer.`;
      return;
    }
    $('sev').textContent = fmt(sev);
    $('sev-detail').textContent = `${served.toLocaleString('en-US')} days worked (${(served / 365).toFixed(2)} years) · average daily wage ${fmt(daily)} over ${days3} days`;
  }
  ['start', 'end', 'pay3', 'bonus', 'leave'].forEach((id) => $(id).addEventListener('input', render));
  render();
})();
