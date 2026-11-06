// Revised Romanization of Korean (국어의 로마자 표기법), with the common sound changes.
(function (root) {
  const L = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
  const V = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
  // Representative sound of each final (index 0 = none).
  const T = ['','k','k','k','n','n','n','t','l','k','m','l','l','l','p','l','m','p','p','t','t','ng','t','t','k','t','p','t'];
  // Liaison: final index -> [final left behind, initial index moved to next syllable] (-1 = nothing moves)
  const LIAISON = {1:[0,0],2:[0,1],3:[1,9],4:[0,2],5:[4,12],6:[4,-1],7:[0,3],8:[0,5],9:[8,0],10:[8,6],11:[8,7],12:[8,9],13:[8,16],14:[8,17],15:[8,-1],16:[0,6],17:[0,7],18:[17,9],19:[0,9],20:[0,10],22:[0,12],23:[0,14],24:[0,15],25:[0,16],26:[0,17],27:[0,-1]};
  const isHangul = (c) => c >= 0xac00 && c <= 0xd7a3;

  function decompose(str) {
    return [...str].map((ch) => {
      const c = ch.codePointAt(0);
      if (!isHangul(c)) return { raw: ch };
      const o = c - 0xac00;
      return { l: Math.floor(o / 588), v: Math.floor((o % 588) / 28), t: o % 28 };
    });
  }

  // assimilate=false: each syllable on its own (used for given names).
  function romanize(str, { assimilate = true } = {}) {
    const s = decompose(str);
    let out = '';
    for (let i = 0; i < s.length; i++) {
      const cur = s[i];
      if (cur.raw !== undefined) { out += cur.raw; continue; }
      const next = s[i + 1] && s[i + 1].raw === undefined ? s[i + 1] : null;
      let initial = L[cur.l];
      if (cur.forceL !== undefined) initial = cur.forceL;
      let fin = T[cur.t];
      if (assimilate && next) {
        const nl = next.l;
        if (cur.t && nl === 11 && cur.t !== 21) {
          // palatalization: ㄷ/ㅌ + 이 → j/ch
          if ((cur.t === 7 || cur.t === 25) && next.v === 20) { next.forceL = cur.t === 7 ? 'j' : 'ch'; fin = ''; }
          else {
            const [left, moved] = LIAISON[cur.t];
            fin = T[left];
            if (moved >= 0) next.forceL = moved === 5 ? 'r' : L[moved];
          }
        } else if (cur.t === 27 && (nl === 0 || nl === 3 || nl === 12)) { // ㅎ + ㄱ/ㄷ/ㅈ → aspirated
          fin = ''; next.forceL = { 0: 'k', 3: 't', 12: 'ch' }[nl];
        } else if (cur.t === 6 || cur.t === 15) { // ㄶ/ㅀ + ㄱ/ㄷ/ㅈ
          if (nl === 0 || nl === 3 || nl === 12) next.forceL = { 0: 'k', 3: 't', 12: 'ch' }[nl];
        } else if (fin === 'k' || fin === 't' || fin === 'p') {
          if (nl === 2 || nl === 6) fin = { k: 'ng', t: 'n', p: 'm' }[fin];
          else if (nl === 5) { fin = { k: 'ng', t: 'n', p: 'm' }[fin]; next.forceL = 'n'; }
        } else if ((fin === 'm' || fin === 'ng') && nl === 5) {
          next.forceL = 'n';
        } else if (fin === 'n' && nl === 5) {
          fin = 'l'; next.forceL = 'l';
        } else if (fin === 'l' && (nl === 2 || nl === 5)) {
          next.forceL = 'l';
        }
      }
      out += initial + V[cur.v] + fin;
    }
    return out;
  }

  const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
  root.KRoman = { romanize, cap, decompose };
})(typeof window !== 'undefined' ? window : globalThis);
