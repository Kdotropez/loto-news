import { NextRequest, NextResponse } from 'next/server';
import { dataStorage } from '@/lib/data-storage';
import TrueIntelligentAnalysis from '@/lib/true-intelligent-analysis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'last20';
    const desiredMain = parseInt(searchParams.get('desiredMain') || '15');
    const desiredComplementary = parseInt(searchParams.get('desiredComplementary') || '3');

    console.log(`🧠 Démarrage analyse intelligente pour période: ${period}`);
    console.log(`🎯 Paramètres utilisateur: ${desiredMain} principaux, ${desiredComplementary} complémentaires`);

    // Récupérer TOUS les tirages réels
    const tirages = dataStorage.getAllTirages();
    
    if (tirages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aucun tirage disponible pour l\'analyse intelligente'
      }, { status: 404 });
    }

    console.log(`📊 ${tirages.length} tirages chargés depuis la base de données`);

    // Créer l'instance d'analyse intelligente
    const analyzer = new TrueIntelligentAnalysis(tirages);
    
    // Lancer l'analyse complète avec paramètres utilisateur
    const result = await analyzer.runIntelligentAnalysis(period, {
      desiredMainNumbers: desiredMain,
      desiredComplementaryNumbers: desiredComplementary
    });
    
    console.log(`✅ Analyse terminée: ${result.numerosPrincipaux.length} numéros principaux, ${result.numerosComplementaires.length} complémentaires`);

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        totalTiragesDatabase: tirages.length,
        tiragesAnalyses: result.resumeAnalyse.totalTirages,
        periode: period,
        timestamp: new Date().toISOString(),
        version: '2.0-real-data'
      }
    });

  } catch (error) {
    console.error('❌ Erreur analyse intelligente:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'analyse intelligente',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      period = 'last20',
      focusStrategy = 'balanced', // 'frequency', 'gaps', 'trends', 'balanced'
      minScore = 0,
      maxNumbers = 12
    } = body;

    // Récupérer tous les tirages
    const tirages = dataStorage.getAllTirages();
    
    if (tirages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aucun tirage disponible'
      }, { status: 404 });
    }

    // Créer l'instance d'analyse
    const analyzer = new TrueIntelligentAnalysis(tirages);
    
    // Analyse personnalisée
    const result = await analyzer.runIntelligentAnalysis(period);
    
    // Filtrer selon les critères
    let filteredNumbers = result.numerosPrincipaux;
    
    if (focusStrategy !== 'balanced') {
      filteredNumbers = filteredNumbers.filter(n => {
        switch (focusStrategy) {
          case 'frequency':
            return n.frequence > 5;
          case 'gaps':
            return n.ecartActuel > 20;
          case 'trends':
            return n.tendance === 'montante';
          default:
            return true;
        }
      });
    }
    
    if (minScore > 0) {
      filteredNumbers = filteredNumbers.filter(n => n.scoreGlobal >= minScore);
    }
    
    filteredNumbers = filteredNumbers.slice(0, maxNumbers);

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        numerosPrincipaux: filteredNumbers
      },
      filters: {
        period,
        focusStrategy,
        minScore,
        maxNumbers
      },
      metadata: {
        totalTiragesDatabase: tirages.length,
        filteredResults: filteredNumbers.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur analyse intelligente POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'analyse intelligente personnalisée',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
