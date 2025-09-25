const fs = require('fs');
const path = require('path');

const preferred = path.join(__dirname, '../data/loto_base_1976_2025_v2.json');
const fallback = path.join(__dirname, '../data/loto_base_1976_2025.json');
const filePath = fs.existsSync(preferred) ? preferred : fallback;

function toIsoClamp(raw) {
  const minIso = '1976-05-19';
  const today = new Date().toISOString().slice(0, 10);
  if (!raw) return { iso: null, ok: false, reason: 'missing' };
  let s = String(raw).slice(0, 10);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return { iso: null, ok: false, reason: 'format' };
  let [, y, mo, d] = m;
  if (mo === '00' || Number(mo) < 1 || Number(mo) > 12) mo = '01';
  if (d === '00' || Number(d) < 1 || Number(d) > 31) d = '01';
  let iso = `${y}-${mo}-${d}`;
  if (iso < minIso) iso = minIso;
  if (iso > today) iso = today;
  return { iso, ok: true };
}

function analyze() {
  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);
  const draws = Array.isArray(json.draws) ? json.draws : [];

  const ids = new Set();
  const dupIds = [];
  const keySet = new Set();
  const dupKeys = [];
  let minDate = '9999-12-31';
  let maxDate = '1976-01-01';
  let futureCount = 0;
  let badDateCount = 0;
  let outOfRangeNums = 0;
  let badChance = 0;
  let badTirage = 0;

  for (const d of draws) {
    const id = d.id;
    if (ids.has(id)) dupIds.push(id);
    else ids.add(id);

    const dateInfo = toIsoClamp(d.date);
    if (!dateInfo.ok) badDateCount++;
    const iso = dateInfo.iso;
    if (iso) {
      if (iso < minDate) minDate = iso;
      if (iso > maxDate) maxDate = iso;
      if (iso !== String(d.date).slice(0,10)) futureCount += (iso < String(d.date).slice(0,10) || iso > String(d.date).slice(0,10)) ? 1 : 0;
    }

    const tirage = Number(d.tirage);
    if (!(tirage === 1 || tirage === 2)) badTirage++;
    const key = `${String(d.id).split('-')[0]}|${iso}|${tirage || 1}`;
    if (keySet.has(key)) dupKeys.push(key);
    else keySet.add(key);

    const nums = Array.isArray(d.numeros) ? d.numeros : [];
    if (nums.length !== 5) outOfRangeNums++;
    else {
      for (const n of nums) {
        if (typeof n !== 'number' || n < 1 || n > 49) { outOfRangeNums++; break; }
      }
    }

    if (d.chance != null) {
      const c = Number(d.chance);
      if (!(c >= 1 && c <= 10)) badChance++;
    }
  }

  const report = {
    file: path.basename(filePath),
    total: draws.length,
    unique_ids: ids.size,
    duplicate_ids: dupIds.length,
    duplicate_keys: dupKeys.length,
    date_range: { from: minDate, to: maxDate },
    bad_dates: badDateCount,
    adjusted_dates: futureCount,
    bad_tirage_values: badTirage,
    out_of_range_numbers: outOfRangeNums,
    bad_chance_values: badChance,
    sample_latest_5: draws
      .map(d => ({ date: toIsoClamp(d.date).iso || d.date, id: d.id, tirage: d.tirage, numeros: d.numeros, chance: d.chance }))
      .sort((a,b) => new Date(b.date) - new Date(a.date))
      .slice(0,5),
  };

  console.log(JSON.stringify(report, null, 2));
}

analyze();
