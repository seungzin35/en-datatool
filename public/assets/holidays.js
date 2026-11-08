(() => {
  const H = [
    ['2026-12-25', 'Christmas Day', '기독탄신일'],
    ['2027-01-01', "New Year's Day", '신정'],
    ['2027-02-06', 'Seollal holiday', '설날 연휴'],
    ['2027-02-07', 'Seollal (Lunar New Year)', '설날'],
    ['2027-02-08', 'Seollal holiday', '설날 연휴'],
    ['2027-02-09', 'Substitute holiday (Seollal)', '대체공휴일'],
    ['2027-03-01', 'Independence Movement Day', '삼일절'],
    ['2027-05-01', 'Labor Day', '노동절'],
    ['2027-05-03', 'Substitute holiday (Labor Day)', '대체공휴일'],
    ['2027-05-05', "Children's Day", '어린이날'],
    ['2027-05-13', "Buddha's Birthday", '부처님오신날'],
    ['2027-06-06', 'Memorial Day', '현충일'],
    ['2027-07-17', 'Constitution Day', '제헌절'],
    ['2027-07-19', 'Substitute holiday (Constitution Day)', '대체공휴일'],
    ['2027-08-15', 'Liberation Day', '광복절'],
    ['2027-08-16', 'Substitute holiday (Liberation Day)', '대체공휴일'],
    ['2027-09-14', 'Chuseok holiday', '추석 연휴'],
    ['2027-09-15', 'Chuseok (Korean Thanksgiving)', '추석'],
    ['2027-09-16', 'Chuseok holiday', '추석 연휴'],
    ['2027-10-03', 'National Foundation Day', '개천절'],
    ['2027-10-04', 'Substitute holiday (National Foundation Day)', '대체공휴일'],
    ['2027-10-09', 'Hangul Day', '한글날'],
    ['2027-10-11', 'Substitute holiday (Hangul Day)', '대체공휴일'],
    ['2027-12-25', 'Christmas Day', '기독탄신일'],
  ];
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  // "Today" in Korea time
  const k = new Date(Date.now() + 9 * 3600000);
  const today = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate());
  const $ = (id) => document.getElementById(id);
  $('list').innerHTML = H.filter(([d]) => d.startsWith('2027')).map(([d, en, ko]) => {
    const t = parse(d), wd = t.getUTCDay();
    const weekend = wd === 0 || wd === 6;
    return `<tr${t.getTime() < today ? ' style="opacity:.55"' : ''}><td style="white-space:nowrap">${MONTHS[t.getUTCMonth()]} ${t.getUTCDate()}</td><td style="white-space:nowrap">${DAYS[wd]}${weekend ? ' ●' : ''}</td><td>${en}</td><td class="kr" style="white-space:nowrap">${ko}</td></tr>`;
  }).join('');
  const next = H.find(([d]) => parse(d).getTime() >= today);
  if (next) {
    const t = parse(next[0]); const days = Math.round((t.getTime() - today) / 86400000);
    $('next').textContent = `${next[1]} · ${DAYS[t.getUTCDay()]}, ${MONTHS[t.getUTCMonth()]} ${t.getUTCDate()}, ${t.getUTCFullYear()}`;
    $('next-sub').textContent = days === 0 ? 'Today!' : `${days} day${days === 1 ? '' : 's'} from today (Korea time) · ● = falls on a weekend`;
  } else {
    $('next').textContent = 'See the 2028 list soon';
  }
})();
