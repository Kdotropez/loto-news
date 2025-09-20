import { NextRequest, NextResponse } from 'next/server';
import { dataStorage } from '@/lib/data-storage';
import { RetroactiveAnalyzer } from '@/lib/retroactive-analyzer';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'last20';

    console.log(`🔍 Démarrage analyse rétroactive pour période: ${period}`);

    // Récupérer TOUS les tirages réels
    const tirages = dataStorage.getAllTirages();
    
    if (tirages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aucun tirage disponible pour l\'analyse rétroactive'
      }, { status: 404 });
    }

    // Récupérer le dernier tirage comme référence
    const sortedTirages = tirages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastDraw = sortedTirages[0];

    if (!lastDraw) {
      return NextResponse.json({
        success: false,
        error: 'Aucun tirage récent trouvé'
      }, { status: 404 });
    }

    console.log(`🎯 Dernier tirage analysé: ${lastDraw.date}`);

    // Créer l'instance d'analyse rétroactive
    const analyzer = new RetroactiveAnalyzer(tirages);
    
    // Lancer l'analyse rétroactive
    const result = await analyzer.analyzeLastDraw(lastDraw, period);
    
    console.log(`✅ Analyse rétroactive terminée: ${result.bestStrategies.length} stratégies testées`);

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        totalTiragesDatabase: tirages.length,
        lastDrawDate: lastDraw.date,
        periode: period,
        timestamp: new Date().toISOString(),
        version: '1.0-retroactive'
      }
    });

  } catch (error) {
    console.error('❌ Erreur analyse rétroactive:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'analyse rétroactive',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      targetDate,
      period = 'last20',
      strategiesToTest = 'all', // 'all', 'frequency', 'gaps', 'patterns', etc.
      minScore = 0
    } = body;

    // Récupérer tous les tirages
    const tirages = dataStorage.getAllTirages();
    
    if (tirages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aucun tirage disponible'
      }, { status: 404 });
    }

    // Trouver le tirage cible
    const targetDraw = tirages.find(t => t.date === targetDate);
    if (!targetDraw) {
      return NextResponse.json({
        success: false,
        error: `Tirage du ${targetDate} non trouvé`
      }, { status: 404 });
    }

    // Créer l'instance d'analyse
    const analyzer = new RetroactiveAnalyzer(tirages);
    
    // Analyse rétroactive personnalisée
    const result = await analyzer.analyzeSpecificDraw(targetDraw, period, strategiesToTest);
    
    // Filtrer selon le score minimum
    let filteredStrategies = result.bestStrategies;
    if (minScore > 0) {
      filteredStrategies = filteredStrategies.filter(s => s.matchScore >= minScore);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        bestStrategies: filteredStrategies
      },
      filters: {
        targetDate,
        period,
        strategiesToTest,
        minScore
      },
      metadata: {
        totalTiragesDatabase: tirages.length,
        filteredResults: filteredStrategies.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur analyse rétroactive POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'analyse rétroactive personnalisée',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
