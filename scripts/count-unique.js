/*
 * Compte les tirages uniques en fusionnant:
 * - data/Tirages_Loto_1976_2025_COMPLET.json (historique)
 * - data/tirages.json (récents)
 * Clé d'unicité: annee_numero_de_tirage|date(YYYY-MM-DD)|type (1er/2e tirage)
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');
const histPath = path.join(dataDir, 'Tirages_Loto_1976_2025_COMPLET.json');
const recPath = path.join(dataDir, 'tirages.json');

function normalizeDate(raw) {
  if (raw == null) return '1976-05-19';
  const s = String(raw);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const digits = s.replace(/\D/g, '');
  if (digits.length >= 8) return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  const d = new Date(s);
  if (Number.isFinite(d.getTime())) return d.toISOString().slice(0, 10);
  return '1976-05-19';
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function main() {
  if (!fs.existsSync(histPath)) {
    console.error('Historique introuvable:', histPath);
    process.exit(1);
  }

  const hist = loadJson(histPath);
  const rec = fs.existsSync(recPath) ? loadJson(recPath) : [];

  const set = new Set();
  let latest = '1976-05-19';

  for (const t of hist) {
    const date = normalizeDate(t.date_de_tirage);
    const type = Number(t['1er_ou_2eme_tirage']) || 1;
    const id = t.annee_numero_de_tirage;
    const key = `${id}|${date}|${type}`;
    set.add(key);
    if (new Date(date) > new Date(latest)) latest = date;
  }

  const histUnique = set.size;

  let addedFromRec = 0;
  for (const t of rec) {
    const date = normalizeDate(t.date);
    const type = Number(t.tirage_type) || 1;
    const id = t.numero_tirage || t.id || `${date.replace(/-/g, '')}`;
    const key = `${id}|${date}|${type}`;
    if (!set.has(key)) {
      set.add(key);
      addedFromRec++;
      if (new Date(date) > new Date(latest)) latest = date;
    }
  }

  const total = set.size;
  const report = {
    historique_unique: histUnique,
    ajoutes_recents_uniques: addedFromRec,
    total_unique: total,
    derniere_date: latest,
  };
  console.log(JSON.stringify(report, null, 2));
}

main();






