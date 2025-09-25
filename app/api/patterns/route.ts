import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Lecture serveur du catalogue de patterns (fusion v2 + v1)
    const fs = require('fs');
    const path = require('path');
    const primary = path.join(process.cwd(), 'data', 'loto_patterns_catalog_v2.json');
    const fallback = path.join(process.cwd(), 'data', 'loto_patterns_catalog.json');

    const readJson = (p: string) => {
      try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
    };

    const jsonV2 = fs.existsSync(primary) ? readJson(primary) : null;
    const jsonV1 = fs.existsSync(fallback) ? readJson(fallback) : null;

    if (!jsonV2 && !jsonV1) {
      return NextResponse.json({ success: false, error: 'Catalogue introuvable' }, { status: 404 });
    }

    const p2 = Array.isArray(jsonV2?.patterns) ? jsonV2.patterns : [];
    const p1 = Array.isArray(jsonV1?.patterns) ? jsonV1.patterns : [];

    // Fusion avec déduplication par id (v2 prioritaire)
    const map: Record<string, any> = {};
    for (const p of p1) { if (p && p.id) map[p.id] = p; }
    for (const p of p2) { if (p && p.id) map[p.id] = { ...map[p.id], ...p }; }
    const merged = Object.values(map);

    return NextResponse.json({ success: true, data: { patterns: merged } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Erreur serveur' }, { status: 500 });
  }
}



