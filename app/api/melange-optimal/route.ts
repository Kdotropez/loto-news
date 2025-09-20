import { NextRequest, NextResponse } from 'next/server';
import { dataStorage } from '@/lib/data-storage';
import { melangeOptimalAnalyzer } from '@/lib/melange-optimal-analyzer';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'last100';
    const seuilCritique = parseInt(searchParams.get('seuilCritique') || '20');
    const seuilEleve = parseInt(searchParams.get('seuilEleve') || '12');
    const seuilMoyen = parseInt(searchParams.get('seuilMoyen') || '6');

    // Récupérer tous les tirages
    const tirages = dataStorage.getAllTirages();
    
    if (tirages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aucun tirage disponible pour l\'analyse'
      }, { status: 404 });
    }

    // Analyser le mélange optimal
    const result = await melangeOptimalAnalyzer.analyzeOptimalMixing(
      tirages,
      period,
      {
        critique: seuilCritique,
        eleve: seuilEleve,
        moyen: seuilMoyen
      }
    );

    return NextResponse.json({
      success: true,
      data: result,
      period,
      seuils: {
        critique: seuilCritique,
        eleve: seuilEleve,
        moyen: seuilMoyen
      },
      metadata: {
        totalTirages: tirages.length,
        analysedTirages: result.resumeGlobal.nombreTiragesAnalyses,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur analyse mélange optimal:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'analyse du mélange optimal',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      period = 'last100', 
      seuils = { critique: 20, eleve: 12, moyen: 6 },
      numerosCibles = [] 
    } = body;

    // Récupérer tous les tirages
    const tirages = dataStorage.getAllTirages();
    
    if (tirages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aucun tirage disponible pour l\'analyse'
      }, { status: 404 });
    }

    // Analyser le mélange optimal
    const result = await melangeOptimalAnalyzer.analyzeOptimalMixing(
      tirages,
      period,
      seuils
    );

    // Si des numéros cibles sont spécifiés, filtrer les recommandations
    let recommandationsFiltrees = result.recommandations;
    if (numerosCibles.length > 0) {
      recommandationsFiltrees = result.recommandations.filter(r => 
        numerosCibles.includes(r.numero)
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        recommandations: recommandationsFiltrees
      },
      period,
      seuils,
      numerosCibles,
      metadata: {
        totalTirages: tirages.length,
        analysedTirages: result.resumeGlobal.nombreTiragesAnalyses,
        recommendationsCount: recommandationsFiltrees.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur analyse mélange optimal POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'analyse du mélange optimal',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
