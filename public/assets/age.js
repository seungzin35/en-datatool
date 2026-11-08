(() => {
  const ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Sheep', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  const KR = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
  const $ = (id) => document.getElementById(id);
  const today = new Date();
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  $('on').value = iso(today);
  function render() {
    const b = $('birth').value, o = $('on').value;
    if (!b || !o) return;
    const [by, bm, bd] = b.split('-').map(Number), [oy, om, od] = o.split('-').map(Number);
    if (o < b) { $('intl').textContent = '—'; $('korean').textContent = '—'; $('year').textContent = '—'; $('extra').textContent = 'The date must be after the birth date.'; return; }
    let intl = oy - by; if (om < bm || (om === bm && od < bd)) intl--;
    $('intl').textContent = intl;
    $('korean').textContent = oy - by + 1;
    $('year').textContent = oy - by;
    const a = ((by - 4) % 12 + 12) % 12;
    let next = new Date(oy, bm - 1, bd); const on = new Date(oy, om - 1, od);
    if (next < on) next = new Date(oy + 1, bm - 1, bd);
    const days = Math.round((next - on) / 86400000);
    const adult = by + 19;
    $('extra').textContent = `Zodiac animal: ${ANIMALS[a]} (${KR[a]}띠) · ${days === 0 ? 'Happy birthday!' : days + ' days until your next birthday'} · Legal to buy alcohol in Korea from Jan 1, ${adult}.`;
  }
  ['birth', 'on'].forEach((id) => $(id).addEventListener('input', render));
  render();
})();
