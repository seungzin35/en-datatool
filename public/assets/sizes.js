(() => {
  // [Korean mm, US, UK, EU] — typical sneaker brand charts; brands differ by about half a size.
  const SHOES = {
    women: [[220,5,2.5,35.5],[225,5.5,3,36],[230,6,3.5,36.5],[235,6.5,4,37.5],[240,7,4.5,38],[245,7.5,5,38.5],[250,8,5.5,39],[255,8.5,6,40],[260,9,6.5,40.5],[265,9.5,7,41],[270,10,7.5,42]],
    men: [[250,7,6,40],[255,7.5,6.5,40.5],[260,8,7,41],[265,8.5,7.5,42],[270,9,8,42.5],[275,9.5,8.5,43],[280,10,9,44],[285,10.5,9.5,44.5],[290,11,10,45],[295,11.5,10.5,45.5],[300,12,11,46],[310,13,12,47.5]],
  };
  const $ = (id) => document.getElementById(id);
  function fill() {
    const g = $('gender').value, sys = $('system').value;
    const idx = { kr: 0, us: 1, uk: 2, eu: 3 }[sys];
    const prev = $('size').value;
    $('size').innerHTML = SHOES[g].map((r, i) => `<option value="${i}">${sys === 'kr' ? r[0] + ' mm' : sys.toUpperCase() + ' ' + r[idx]}</option>`).join('');
    if (prev && SHOES[g][prev]) $('size').value = prev; else $('size').value = Math.floor(SHOES[g].length / 2);
    show();
    $('shoe-table').innerHTML = SHOES[g].map((r) => `<tr><td class="num">${r[0]}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td><td class="num">${r[3]}</td></tr>`).join('');
  }
  function show() {
    const r = SHOES[$('gender').value][$('size').value];
    if (!r) return;
    $('shoe-out').textContent = `Korea ${r[0]} mm = US ${r[1]} = UK ${r[2]} = EU ${r[3]}`;
  }
  $('gender').addEventListener('change', fill);
  $('system').addEventListener('change', fill);
  $('size').addEventListener('change', show);
  fill();
})();
