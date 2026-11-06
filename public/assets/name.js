(() => {
  // Most common passport spellings for Korean family names (from everyday usage, not an official list).
  const COMMON = {
    '김':'Kim','이':'Lee','박':'Park','최':'Choi','정':'Jung','강':'Kang','조':'Cho','윤':'Yoon','장':'Jang','임':'Lim',
    '한':'Han','오':'Oh','서':'Seo','신':'Shin','권':'Kwon','황':'Hwang','안':'Ahn','송':'Song','류':'Ryu','전':'Jeon',
    '홍':'Hong','고':'Ko','문':'Moon','양':'Yang','손':'Son','배':'Bae','백':'Baek','허':'Heo','유':'Yoo','남':'Nam',
    '심':'Shim','노':'Noh','하':'Ha','곽':'Kwak','성':'Sung','차':'Cha','주':'Joo','우':'Woo','구':'Koo','민':'Min',
    '나':'Na','진':'Jin','지':'Ji','엄':'Eom','채':'Chae','원':'Won','천':'Cheon','방':'Bang','공':'Kong','현':'Hyun',
    '함':'Ham','변':'Byun','염':'Yeom','여':'Yeo','추':'Choo','도':'Do','소':'So','석':'Seok','선':'Sun','설':'Seol',
    '마':'Ma','길':'Gil','연':'Yeon','위':'Wi','표':'Pyo','명':'Myung','기':'Ki','반':'Ban','왕':'Wang','금':'Keum',
    '옥':'Ok','육':'Yook','인':'In','맹':'Maeng','제':'Je','모':'Mo','탁':'Tak','국':'Kook','어':'Eo','은':'Eun',
    '편':'Pyeon','용':'Yong','예':'Ye','경':'Kyung','봉':'Bong','사':'Sa','부':'Boo','라':'Ra','형':'Hyung','목':'Mok',
    '황보':'Hwangbo','남궁':'Namgung','제갈':'Jegal','선우':'Sunwoo','독고':'Dokgo','사공':'Sagong','서문':'Seomun',
  };
  const OTHER = { '이':'Yi, Rhee', '박':'Pak', '최':'Choe', '정':'Jeong, Chung', '조':'Jo', '윤':'Yun', '임':'Im', '오':'O',
    '신':'Sin', '권':'Gwon', '안':'An', '유':'Yu', '노':'No, Roh', '주':'Ju', '우':'U', '구':'Gu', '김':'Gim', '강':'Gang',
    '고':'Go', '문':'Mun', '성':'Seong', '현':'Hyeon', '류':'Yu, Yoo', '변':'Byeon', '명':'Myeong', '경':'Gyeong' };
  const { romanize, cap } = window.KRoman;
  const $ = (id) => document.getElementById(id);

  function split(full) {
    const s = full.replace(/\s+/g, '');
    if (full.trim().includes(' ')) { const [a, ...b] = full.trim().split(/\s+/); return [a, b.join('')]; }
    if (s.length >= 4 && COMMON[s.slice(0, 2)]) return [s.slice(0, 2), s.slice(2)];
    if (s.length === 3 && COMMON[s.slice(0, 2)] && !COMMON[s[0]]) return [s.slice(0, 2), s.slice(2)];
    return [s.slice(0, 1), s.slice(1)];
  }

  function render() {
    const raw = $('name').value.trim();
    if (!raw || /[^가-힣\s]/.test(raw)) {
      $('rr').textContent = raw ? 'Please type the name in Hangul (Korean letters), e.g. 김민준.' : '—';
      $('common').textContent = '—'; $('other').textContent = ''; $('parts').textContent = '';
      return;
    }
    const [sur, given] = split(raw);
    const sep = $('hyphen').checked ? '-' : '';
    const givenSyl = [...given].map((c) => romanize(c, { assimilate: false }));
    const givenRR = cap(givenSyl.join(sep));
    const surRR = cap(romanize(sur, { assimilate: false }));
    const order = $('order').value;
    const fmt = (a, b) => order === 'western' ? `${b} ${a}` : `${a} ${b}`;
    $('rr').textContent = given ? fmt(surRR, givenRR) : surRR;
    const common = COMMON[sur];
    $('common').textContent = common ? (given ? fmt(common, givenRR) : common) : 'No widely used alternative; use the official spelling.';
    $('other').textContent = OTHER[sur] ? `Other spellings you may see for ${sur}: ${OTHER[sur]}` : '';
    $('parts').textContent = `Family name: ${sur} · Given name: ${given || '—'} (${[...given].map((c, i) => c + ' = ' + givenSyl[i]).join(', ')})`;
  }
  ['name', 'hyphen', 'order'].forEach((id) => { $(id).addEventListener('input', render); $(id).addEventListener('change', render); });
  document.querySelectorAll('[data-name]').forEach((b) => b.addEventListener('click', () => { $('name').value = b.dataset.name; render(); }));
  render();
})();
