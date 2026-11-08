(() => {
  const U = [
    ['geun-meat', 'Geun 근 (meat)', 600, 'g', 'Meat is sold in 600 g geun.'],
    ['geun-veg', 'Geun 근 (fruit & vegetables)', 375, 'g', 'Fruit and vegetables use a 375 g geun.'],
    ['don', 'Don 돈 (gold)', 3.75, 'g', '1 don = 3.75 g. 1 troy ounce ≈ 8.29 don.'],
    ['nyang', 'Nyang 냥', 37.5, 'g', '1 nyang = 10 don.'],
    ['gwan', 'Gwan 관', 3750, 'g', '1 gwan = 1,000 don.'],
    ['ja', 'Ja 자', 30.303, 'cm', '1 ja = 10/33 m.'],
    ['pyeong', 'Pyeong 평', 400 / 121, 'm²', 'Area of a square 6 ja on each side.'],
    ['doe', 'Doe 되', 1.804, 'L', 'Volume, not weight. A doe of rice weighs roughly 1.6 kg.'],
    ['mal', 'Mal 말', 18.04, 'L', '1 mal = 10 doe.'],
    ['hop', 'Hop 홉', 0.1804, 'L', '10 hop = 1 doe.'],
  ];
  const $ = (id) => document.getElementById(id);
  $('unit').innerHTML = U.map(([k, n]) => `<option value="${k}">${n}</option>`).join('');
  function show(v, unit) {
    if (unit === 'g' && v >= 1000) return `${(v / 1000).toLocaleString('en-US', { maximumFractionDigits: 3 })} kg (${(v / 453.592).toFixed(2)} lb)`;
    if (unit === 'g') return `${v.toLocaleString('en-US', { maximumFractionDigits: 3 })} g (${(v / 28.3495).toFixed(2)} oz)`;
    if (unit === 'cm') return `${v.toLocaleString('en-US', { maximumFractionDigits: 2 })} cm (${(v / 2.54).toFixed(2)} in)`;
    if (unit === 'm²') return `${v.toLocaleString('en-US', { maximumFractionDigits: 2 })} m² (${(v * 10.7639).toFixed(1)} ft²)`;
    return `${v.toLocaleString('en-US', { maximumFractionDigits: 3 })} L (${(v * 0.264172).toFixed(2)} US gal)`;
  }
  function render() {
    const u = U.find(([k]) => k === $('unit').value), n = parseFloat($('val').value);
    if (!(n >= 0)) { $('uout').textContent = '—'; return; }
    $('uout').textContent = `${n} ${u[1].split(' ')[0].toLowerCase()} = ${show(n * u[2], u[3])}`;
    $('unote').textContent = u[4];
  }
  $('val').addEventListener('input', render); $('unit').addEventListener('change', render);
  render();
})();
