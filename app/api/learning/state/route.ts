import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getLearningPath() {
  const path = require('path');
  return path.join(process.cwd(), 'data', 'learning', 'latest.json');
}

function ensureDirExists(filePath: string) {
  const fs = require('fs');
  const path = require('path');
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function GET() {
  try {
    const fs = require('fs');
    const filePath = getLearningPath();
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'Aucun fichier apprentissage sur disque' }, { status: 404 });
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(raw);
    return NextResponse.json({ success: true, data: json });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Erreur lecture apprentissage' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fs = require('fs');
    const filePath = getLearningPath();
    ensureDirExists(filePath);
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf8');
    return NextResponse.json({ success: true, saved: true, path: filePath });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Erreur écriture apprentissage' }, { status: 500 });
  }
}


