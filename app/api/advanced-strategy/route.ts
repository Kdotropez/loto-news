import { NextRequest, NextResponse } from 'next/server';
import { advancedStrategyEngine } from '@/lib/advanced-strategy-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const action = searchParams.get('action');

    switch (action) {
      case 'generate':
        const strategy = await advancedStrategyEngine.generateAdvancedStrategy();
        return NextResponse.json({
          success: true,
          data: strategy,
          generated_at: new Date().toISOString()
        });
      
      case 'clear-cache':
        advancedStrategyEngine.clearCache();
        return NextResponse.json({
          success: true,
          message: 'Cache de la stratégie avancée vidé'
        });
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Action non reconnue'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Erreur lors de la génération de la stratégie avancée:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'generate-strategy':
        const strategy = await advancedStrategyEngine.generateAdvancedStrategy();
        return NextResponse.json({
          success: true,
          data: strategy,
          generated_at: new Date().toISOString()
        });
      
      case 'clear-cache':
        advancedStrategyEngine.clearCache();
        return NextResponse.json({
          success: true,
          message: 'Cache vidé avec succès'
        });
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Action non reconnue'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Erreur lors de la génération de la stratégie avancée:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}


