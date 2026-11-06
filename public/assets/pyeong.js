(() => {
  const M2_PER_PY = 400 / 121;
  const FT2_PER_M2 = 1 / (0.3048 * 0.3048);
  const $ = (id) => document.getElementById(id);
  const py = $('py'), m2 = $('m2'), ft2 = $('ft2');
  const r2 = (n) => (Math.round(n * 100) / 100).toString();
  const show = (p, m, f) => {
    $('summary').textContent = isFinite(p) && p >= 0
      ? `${r2(p)} pyeong = ${r2(m)} m² = ${Math.round(f).toLocaleString('en-US')} ft²` : '—';
  };
  const fromPy = () => { const p = parseFloat(py.value), m = p * M2_PER_PY, f = m * FT2_PER_M2; m2.value = isFinite(m) ? r2(m) : ''; ft2.value = isFinite(f) ? r2(f) : ''; show(p, m, f); };
  const fromM2 = () => { const m = parseFloat(m2.value), p = m / M2_PER_PY, f = m * FT2_PER_M2; py.value = isFinite(p) ? r2(p) : ''; ft2.value = isFinite(f) ? r2(f) : ''; show(p, m, f); };
  const fromFt2 = () => { const f = parseFloat(ft2.value), m = f / FT2_PER_M2, p = m / M2_PER_PY; py.value = isFinite(p) ? r2(p) : ''; m2.value = isFinite(m) ? r2(m) : ''; show(p, m, f); };
  py.addEventListener('input', fromPy);
  m2.addEventListener('input', fromM2);
  ft2.addEventListener('input', fromFt2);
  $('chips').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.py) { py.value = b.dataset.py; fromPy(); } else { m2.value = b.dataset.m2; fromM2(); }
  });
  fromPy();
})();
