import { NextRequest, NextResponse } from 'next/server';
import { optimizedCombinationEngine } from '@/lib/optimized-combination-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const count = parseInt(searchParams.get('count') || '10');
    const category = searchParams.get('category') || 'all';

    if (count < 1 || count > 50) {
      return NextResponse.json(
        { success: false, error: 'Le nombre de combinaisons doit être entre 1 et 50' },
        { status: 400 }
      );
    }

    const combinations = optimizedCombinationEngine.getOptimizedCombinations(count);
    
    // Filtrer par catégorie si spécifiée
    let filteredCombinations = combinations;
    if (category !== 'all') {
      filteredCombinations = combinations.filter(combo => combo.category === category);
    }

    return NextResponse.json({
      success: true,
      count: filteredCombinations.length,
      combinations: filteredCombinations,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la génération des combinaisons optimisées:', error);
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
      case 'clear_cache':
        optimizedCombinationEngine.clearCache();
        return NextResponse.json({
          success: true,
          message: 'Cache vidé avec succès'
        });
      
      case 'generate_custom':
        const { count, preferences } = body;
        const combinations = optimizedCombinationEngine.getOptimizedCombinations(count || 10);
        
        return NextResponse.json({
          success: true,
          count: combinations.length,
          combinations,
          preferences,
          generated_at: new Date().toISOString()
        });
      
      default:
        return NextResponse.json(
          { success: false, error: 'Action non reconnue' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Erreur lors de l\'action POST:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}


