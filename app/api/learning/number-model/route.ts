import { NextRequest, NextResponse } from 'next/server';
import { dataStorage } from '@/lib/data-storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Draw = {
  date: string;
  numero1?: number; numero2?: number; numero3?: number; numero4?: number; numero5?: number;
  boule_1?: number; boule_2?: number; boule_3?: number; boule_4?: number; boule_5?: number;
  complementaire?: number; numero_chance?: number;
};

function extractMain(d: Draw): number[] {
  const arr = [d.numero1, d.numero2, d.numero3, d.numero4, d.numero5, d.boule_1, d.boule_2, d.boule_3, d.boule_4, d.boule_5]
    .filter((n: any) => typeof n === 'number') as number[];
  return Array.from(new Set(arr)).filter(n => n>=1 && n<=49).slice(0,5);
}

function sigmoid(x: number) { return 1 / (1 + Math.exp(-x)); }

function getModelPath() {
  const path = require('path');
  return path.join(process.cwd(), 'data', 'learning', 'number-model.json');
}

function readModel() {
  try {
    const fs = require('fs');
    const p = getModelPath();
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch { return null; }
}

function writeModel(obj: any) {
  try {
    const fs = require('fs');
    const path = require('path');
    const p = getModelPath();
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8');
  } catch {}
}

function computeFeatures(tirages: Draw[], W: number, lambda: number) {
  const recent = tirages.slice(-W);
  const half = Math.max(1, Math.floor(W/2));
  const first = tirages.slice(-(W+half), -W);
  const second = recent;

  const freq: Record<number, number> = {}; for (let i=1;i<=49;i++) freq[i]=0;
  const freqFirst: Record<number, number> = {}; for (let i=1;i<=49;i++) freqFirst[i]=0;
  const lastSeenIdx: Record<number, number> = {}; for (let i=1;i<=49;i++) lastSeenIdx[i]=-1;

  second.forEach(d => extractMain(d).forEach(n => { freq[n]++; }));
  first.forEach(d => extractMain(d).forEach(n => { freqFirst[n]++; }));

  // gaps on all history
  tirages.forEach((d, idx) => extractMain(d).forEach(n => { lastSeenIdx[n] = idx; }));

  const nowIdx = tirages.length-1;
  const features: Record<number, { freq:number; gap:number; trend:number; parity:number; dizaine:number }>= {};
  for (let n=1;n<=49;n++) {
    const f = (freq[n] || 0) / Math.max(1, second.length);
    const f1 = (freqFirst[n] || 0) / Math.max(1, first.length || 1);
    const tr = f - f1;
    const gap = lastSeenIdx[n] >= 0 ? (nowIdx - lastSeenIdx[n]) : W;
    const gapN = Math.min(1, gap / Math.max(1, W));
    const parity = n % 2 === 0 ? 1 : 0;
    const dizaine = Math.floor((n-1)/10) / 4; // 0..4 → 0..1 approx
    // decay weight for recency (applied later if needed)
    features[n] = { freq: f, gap: gapN, trend: tr, parity, dizaine };
  }
  return features;
}

export async function GET() {
  const model = readModel();
  if (!model) return NextResponse.json({ success: false, error: 'no_model' }, { status: 404 });
  return NextResponse.json({ success: true, data: model });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { period = 200, lambda = 0.005, learningRate = 0.1 } = body || {};
    const tirages = dataStorage.getAllTirages() as Draw[];
    if (!Array.isArray(tirages) || tirages.length === 0) {
      return NextResponse.json({ success: false, error: 'Aucun tirage disponible' }, { status: 404 });
    }

    const feats = computeFeatures(tirages, Math.min(period, tirages.length), lambda);

    // Lire ou initialiser les poids globaux (w0..w4)
    const current = readModel();
    let weights: number[] = current?.weights ?? [-1.0, 3.0, 2.0, 1.0, 0.2, 0.2]; // [w0, w_freq, w_gap, w_trend, w_parity, w_dizaine]

    // Online update sur le dernier tirage (labels 1 si tirés sinon 0)
    const last = tirages[tirages.length-1];
    const ySet = new Set(extractMain(last));
    for (let n=1;n<=49;n++) {
      const f = feats[n];
      const x = [1, f.freq, -f.gap, f.trend, f.parity, f.dizaine];
      const z = weights.reduce((s, w, i) => s + w * x[i], 0);
      const p = sigmoid(z);
      const y = ySet.has(n) ? 1 : 0;
      const err = y - p;
      for (let i=0;i<weights.length;i++) weights[i] += learningRate * err * x[i];
    }

    // Probabilités pour 1..49
    const probs: Record<number, number> = {};
    for (let n=1;n<=49;n++) {
      const f = feats[n];
      const x = [1, f.freq, -f.gap, f.trend, f.parity, f.dizaine];
      const z = weights.reduce((s, w, i) => s + w * x[i], 0);
      probs[n] = Math.round(sigmoid(z) * 1000) / 1000;
    }

    const model = { updated_at: new Date().toISOString(), weights, features: feats, probs };
    writeModel(model);
    return NextResponse.json({ success: true, data: model });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Erreur interne' }, { status: 500 });
  }
}


