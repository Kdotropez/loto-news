const fs = require('fs');
const path = require('path');

const v2Path = path.join(__dirname, '../data/loto_base_1976_2025_v2.json');
const outPath = path.join(__dirname, '../data/tirages.json');

function toIso(raw) {
  if (!raw) return '1976-05-19';
  const s = String(raw).slice(0, 10);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '1976-05-19';
  let [, y, mo, d] = m;
  if (mo === '00' || Number(mo) < 1 || Number(mo) > 12) mo = '01';
  if (d === '00' || Number(d) < 1 || Number(d) > 31) d = '01';
  let iso = `${y}-${mo}-${d}`;
  const minIso = '1976-05-19';
  const today = new Date().toISOString().slice(0, 10);
  if (iso < minIso) iso = minIso;
  if (iso > today) iso = today;
  return iso;
}

function main() {
  if (!fs.existsSync(v2Path)) {
    console.error('Missing file:', v2Path);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(v2Path, 'utf8'));
  const draws = Array.isArray(raw.draws) ? raw.draws : [];

  const out = draws.map(d => {
    const [numero1, numero2, numero3, numero4, numero5] = d.numeros || [];
    return {
      id: Number(String(d.id).split('-')[0]) || undefined,
      annee_numero: String(String(d.id).split('-')[0] || ''),
      date: toIso(d.date),
      numero1, numero2, numero3, numero4, numero5,
      complementaire: d.chance ?? null,
      source: 'JSON_V2',
      tirage_type: Number(d.tirage) || 1,
      // gains par rang si présents
      ...(Array.isArray(d.rangs) ? d.rangs.reduce((acc, r) => {
        const idx = Number(r.rang);
        if (idx >= 1 && idx <= 9) {
          acc[`gagnant_rang${idx}`] = Number(r.gagnants) || 0;
          acc[`rapport_rang${idx}`] = Number(r.rapport) || 0;
        }
        return acc;
      }, {}) : {})
    };
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  const latest = out[0]?.date || 'n/a';
  console.log(`Wrote ${out.length} tirages to ${outPath} (latest=${latest})`);
}

main();


