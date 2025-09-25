/*
  Rebuilds the single canonical data file data/tirages.json by merging:
  - data/Tirages_Loto_1976_2025_COMPLET.json (read-only historical)
  - existing data/tirages.json (recent ODS imports)
  The output is a normalized array with unique draws.
  Uniqueness key: annee_numero_de_tirage | date (YYYY-MM-DD) | tirage_type (1 or 2)
*/

const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');
const historicPath = path.join(dataDir, 'Tirages_Loto_1976_2025_COMPLET.json');
const canonicalPath = path.join(dataDir, 'tirages.json');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function normalizeNumber(n) {
  if (n == null) return 0;
  if (typeof n === 'number') return Number.isFinite(n) ? n : 0;
  const parsed = parseFloat(String(n).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDate(raw) {
  const minIso = '1976-05-19';
  const todayIso = new Date().toISOString().slice(0, 10);
  if (raw == null) return minIso;
  const s = String(raw);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    let iso = s.slice(0, 10);
    // Corriger "00" jour/mois
    const y = iso.slice(0,4); let m = iso.slice(5,7); let d = iso.slice(8,10);
    if (m === '00' || Number(m) < 1 || Number(m) > 12) m = '01';
    if (d === '00' || Number(d) < 1 || Number(d) > 31) d = '01';
    iso = `${y}-${m}-${d}`;
    if (iso < minIso) iso = minIso;
    if (iso > todayIso) iso = todayIso;
    return iso;
  }
  const digits = s.replace(/\D/g, '');
  if (digits.length >= 8) {
    const y = digits.slice(0,4); let m = digits.slice(4,6); let d = digits.slice(6,8);
    if (m === '00' || Number(m) < 1 || Number(m) > 12) m = '01';
    if (d === '00' || Number(d) < 1 || Number(d) > 31) d = '01';
    let iso = `${y}-${m}-${d}`;
    if (iso < minIso) iso = minIso;
    if (iso > todayIso) iso = todayIso;
    return iso;
  }
  const d = new Date(s);
  if (Number.isFinite(d.getTime())) {
    let iso = d.toISOString().slice(0, 10);
    if (iso < minIso) iso = minIso;
    if (iso > todayIso) iso = todayIso;
    return iso;
  }
  return minIso;
}

function normalizeHistoricRecord(t) {
  const date = normalizeDate(t.date_de_tirage);
  const type = Number(t['1er_ou_2eme_tirage']) || 1;
  return {
    id: Number(t.annee_numero_de_tirage) || undefined,
    numero_tirage: Number(t.annee_numero_de_tirage) || 0,
    date,
    numero1: t.boule_1,
    numero2: t.boule_2,
    numero3: t.boule_3,
    numero4: t.boule_4,
    numero5: t.boule_5,
    complementaire: t.numero_chance || (t.boule_complementaire != null ? ((Number(t.boule_complementaire) % 10) + 1) : 0),
    source: 'JSON_Complet',
    tirage_type: type,
    // gains
    gagnant_rang1: normalizeNumber(t.nombre_de_gagnant_au_rang1),
    rapport_rang1: normalizeNumber(t.rapport_du_rang1),
    gagnant_rang2: normalizeNumber(t.nombre_de_gagnant_au_rang2),
    rapport_rang2: normalizeNumber(t.rapport_du_rang2),
    gagnant_rang3: normalizeNumber(t.nombre_de_gagnant_au_rang3),
    rapport_rang3: normalizeNumber(t.rapport_du_rang3),
    gagnant_rang4: normalizeNumber(t.nombre_de_gagnant_au_rang4),
    rapport_rang4: normalizeNumber(t.rapport_du_rang4),
    gagnant_rang5: normalizeNumber(t.nombre_de_gagnant_au_rang5),
    rapport_rang5: normalizeNumber(t.rapport_du_rang5),
    gagnant_rang6: normalizeNumber(t.nombre_de_gagnant_au_rang6),
    rapport_rang6: normalizeNumber(t.rapport_du_rang6),
    gagnant_rang7: normalizeNumber(t.nombre_de_gagnant_au_rang7),
    rapport_rang7: normalizeNumber(t.rapport_du_rang7),
    gagnant_rang8: normalizeNumber(t.nombre_de_gagnant_au_rang8),
    rapport_rang8: normalizeNumber(t.rapport_du_rang8),
    gagnant_rang9: normalizeNumber(t.nombre_de_gagnant_au_rang9),
    rapport_rang9: normalizeNumber(t.rapport_du_rang9),
  };
}

function normalizeRecentRecord(t) {
  const date = normalizeDate(t.date);
  const type = Number(t.tirage_type) || 1;
  return {
    id: t.id || t.numero_tirage || undefined,
    numero_tirage: t.numero_tirage || t.id || 0,
    date,
    numero1: t.numero1 ?? t.boule_1,
    numero2: t.numero2 ?? t.boule_2,
    numero3: t.numero3 ?? t.boule_3,
    numero4: t.numero4 ?? t.boule_4,
    numero5: t.numero5 ?? t.boule_5,
    complementaire: t.complementaire ?? t.numero_chance,
    source: 'OpenDataSoft',
    tirage_type: type,
    gagnant_rang1: normalizeNumber(t.gagnant_rang1),
    rapport_rang1: normalizeNumber(t.rapport_rang1),
    gagnant_rang2: normalizeNumber(t.gagnant_rang2),
    rapport_rang2: normalizeNumber(t.rapport_rang2),
    gagnant_rang3: normalizeNumber(t.gagnant_rang3),
    rapport_rang3: normalizeNumber(t.rapport_rang3),
    gagnant_rang4: normalizeNumber(t.gagnant_rang4),
    rapport_rang4: normalizeNumber(t.rapport_rang4),
    gagnant_rang5: normalizeNumber(t.gagnant_rang5),
    rapport_rang5: normalizeNumber(t.rapport_rang5),
    gagnant_rang6: normalizeNumber(t.gagnant_rang6),
    rapport_rang6: normalizeNumber(t.rapport_rang6),
    gagnant_rang7: normalizeNumber(t.gagnant_rang7),
    rapport_rang7: normalizeNumber(t.rapport_rang7),
    gagnant_rang8: normalizeNumber(t.gagnant_rang8),
    rapport_rang8: normalizeNumber(t.rapport_rang8),
    gagnant_rang9: normalizeNumber(t.gagnant_rang9),
    rapport_rang9: normalizeNumber(t.rapport_rang9),
  };
}

function keyOf(r) {
  return `${r.numero_tirage}|${r.date}|${r.tirage_type || 1}`;
}

function main() {
  ensureDir(dataDir);
  if (!fs.existsSync(historicPath)) {
    console.error('Missing historical file:', historicPath);
    process.exit(1);
  }

  const histRaw = JSON.parse(fs.readFileSync(historicPath, 'utf8'));
  const recRaw = fs.existsSync(canonicalPath) ? JSON.parse(fs.readFileSync(canonicalPath, 'utf8')) : [];

  // 1) Normalize historical and compute max historical date
  const historical = histRaw.map(normalizeHistoricRecord);
  const maxHistDate = historical.reduce((acc, r) => (new Date(r.date) > new Date(acc) ? r.date : acc), '1976-05-19');

  // 2) Normalize recents and only keep those strictly after historical max date
  const recentNormalized = recRaw.map(normalizeRecentRecord);
  const recentAfter = recentNormalized.filter(r => new Date(r.date) > new Date(maxHistDate));

  // 3) Deduplicate recents by (date|type) to avoid inserting twice the même tirage
  const recentSet = new Set();
  const uniqueRecent = [];
  for (const r of recentAfter) {
    const k = `${r.date}|${r.tirage_type || 1}`;
    if (!recentSet.has(k)) {
      recentSet.add(k);
      uniqueRecent.push(r);
    }
  }

  // 4) Build canonical: historical + unique recent
  const out = [...historical, ...uniqueRecent]
    .map(r => ({ ...r, date: normalizeDate(r.date) }))
    .filter(r => r.date <= new Date().toISOString().slice(0,10))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  fs.writeFileSync(canonicalPath, JSON.stringify(out, null, 2));
  console.log(`Written canonical file with ${out.length} tirages to ${canonicalPath}`);
}

main();


