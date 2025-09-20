import { NextRequest, NextResponse } from 'next/server';
import { performanceCache } from '@/lib/performance-cache';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      action, 
      combination, 
      complementary, 
      maxTirages = 1000,
      startDate,
      endDate,
      combinations 
    } = body;

    let result;

    switch (action) {
      case 'test-single':
        if (!combination || !Array.isArray(combination) || combination.length !== 5) {
          return NextResponse.json(
            { success: false, error: 'Combinaison invalide (5 numéros requis)' },
            { status: 400 }
          );
        }
        
        result = await performanceCache.testCombinationFast(
          combination,
          complementary || 1,
          maxTirages,
          startDate,
          endDate
        );
        break;

      case 'test-multiple':
        if (!combinations || !Array.isArray(combinations)) {
          return NextResponse.json(
            { success: false, error: 'Liste de combinaisons invalide' },
            { status: 400 }
          );
        }
        
        result = await performanceCache.testMultipleCombinationsFast(
          combinations,
          maxTirages
        );
        break;

      case 'initialize-cache':
        result = await performanceCache.initializeCache();
        break;

      case 'get-cache-stats':
        result = performanceCache.getCacheStats();
        break;

      case 'refresh-cache':
        await performanceCache.refreshCache();
        result = { message: 'Cache rafraîchi avec succès' };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Action non reconnue' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors du test rapide:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const action = searchParams.get('action');

    let result;

    switch (action) {
      case 'cache-stats':
        result = performanceCache.getCacheStats();
        break;

      case 'initialize-cache':
        result = await performanceCache.initializeCache();
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Action non reconnue' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la requête GET:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}


