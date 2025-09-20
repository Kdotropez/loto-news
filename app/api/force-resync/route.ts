import { NextRequest, NextResponse } from 'next/server';
import { OpenDataSoftSync } from '@/lib/opendatasoft-sync';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Resynchronisation forcée demandée...');
    
    const sync = new OpenDataSoftSync();
    const result = await sync.syncWithLocalDatabase();
    
    if (result.success) {
      console.log(`✅ Resynchronisation réussie: ${result.newTirages} nouveaux tirages`);
      return NextResponse.json({
        success: true,
        message: `Resynchronisation réussie: ${result.newTirages} nouveaux tirages`,
        data: result
      });
    } else {
      console.error('❌ Erreur de resynchronisation:', result.error);
      return NextResponse.json({
        success: false,
        message: `Erreur: ${result.error}`,
        data: result
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
