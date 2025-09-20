import { NextRequest, NextResponse } from 'next/server';
import { dataStorage } from '@/lib/data-storage';
import { GlobalPatternAnalyzer } from '@/lib/global-pattern-analyzer';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all'; // 'all', 'frequency', 'gaps', 'patterns', etc.
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'successRate'; // 'successRate', 'totalTests', 'consistency'

    console.log(`📊 Démarrage analyse globale des patterns`);

    // Récupérer TOUS les tirages réels
    const tirages = dataStorage.getAllTirages();
    
    if (tirages.length < 50) {
      return NextResponse.json({
        success: false,
        error: 'Pas assez de tirages pour une analyse statistique fiable (minimum 50 requis)'
      }, { status: 400 });
    }

    console.log(`📈 ${tirages.length} tirages chargés pour analyse globale`);

    // Créer l'instance d'analyse globale
    const analyzer = new GlobalPatternAnalyzer(tirages);
    
    // Lancer l'analyse complète (peut prendre du temps)
    const globalStats = await analyzer.analyzeAllHistoricalPatterns();
    
    // Filtrer selon la catégorie demandée
    let filteredPatterns = globalStats.topPerformingPatterns;
    if (category !== 'all') {
      filteredPatterns = globalStats.patternsByCategory[category] || [];
    }
    
    // Trier selon le critère demandé
    switch (sortBy) {
      case 'totalTests':
        filteredPatterns.sort((a, b) => b.totalTests - a.totalTests);
        break;
      case 'consistency':
        // Trier par consistance (moins de volatilité dans les performances mensuelles)
        filteredPatterns.sort((a, b) => {
          const aVolatility = calculateVolatility(a);
          const bVolatility = calculateVolatility(b);
          return aVolatility - bVolatility; // Moins de volatilité = plus consistant
        });
        break;
      case 'successRate':
      default:
        filteredPatterns.sort((a, b) => b.successRate - a.successRate);
        break;
    }
    
    // Limiter les résultats
    filteredPatterns = filteredPatterns.slice(0, limit);
    
    console.log(`✅ Analyse globale terminée: ${filteredPatterns.length} patterns analysés`);

    return NextResponse.json({
      success: true,
      data: {
        ...globalStats,
        filteredPatterns,
        analysisParams: {
          category,
          limit,
          sortBy
        }
      },
      metadata: {
        totalTiragesAnalyzed: tirages.length,
        totalPatternsAnalyzed: globalStats.totalPatternsAnalyzed,
        analysisDateRange: globalStats.analysisDateRange,
        timestamp: new Date().toISOString(),
        version: '1.0-global-stats'
      }
    });

  } catch (error) {
    console.error('❌ Erreur analyse globale patterns:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'analyse globale des patterns',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      startDate,
      endDate,
      patterns = [], // Liste spécifique de patterns à analyser
      minDraws = 50,
      includeMonthlyBreakdown = true,
      includeHybridAnalysis = true
    } = body;

    // Récupérer tous les tirages
    const allTirages = dataStorage.getAllTirages();
    
    // Filtrer par date si spécifié
    let tirages = allTirages;
    if (startDate || endDate) {
      tirages = allTirages.filter(t => {
        const date = new Date(t.date);
        const start = startDate ? new Date(startDate) : new Date('1900-01-01');
        const end = endDate ? new Date(endDate) : new Date();
        return date >= start && date <= end;
      });
    }
    
    if (tirages.length < minDraws) {
      return NextResponse.json({
        success: false,
        error: `Pas assez de tirages dans la période spécifiée (${tirages.length} < ${minDraws})`
      }, { status: 400 });
    }

    // Créer l'instance d'analyse
    const analyzer = new GlobalPatternAnalyzer(tirages);
    
    // Analyse personnalisée
    const globalStats = await analyzer.analyzeAllHistoricalPatterns();
    
    // Filtrer par patterns spécifiques si demandé
    let filteredResults = globalStats.topPerformingPatterns;
    if (patterns.length > 0) {
      filteredResults = globalStats.topPerformingPatterns.filter(p => 
        patterns.includes(p.patternName)
      );
    }

    // Ajouter des analyses supplémentaires
    const enhancedResults = {
      ...globalStats,
      customAnalysis: {
        dateRange: { startDate, endDate },
        patternsAnalyzed: patterns.length > 0 ? patterns : 'all',
        drawsInPeriod: tirages.length,
        filteredResults
      }
    };

    if (!includeMonthlyBreakdown) {
      // Retirer les détails mensuels pour une réponse plus légère
      enhancedResults.topPerformingPatterns.forEach(pattern => {
        (pattern as any).monthlyStats = undefined;
      });
    }

    return NextResponse.json({
      success: true,
      data: enhancedResults,
      filters: {
        startDate,
        endDate,
        patterns,
        minDraws,
        includeMonthlyBreakdown,
        includeHybridAnalysis
      },
      metadata: {
        totalTiragesDatabase: allTirages.length,
        tiragesAnalyzed: tirages.length,
        customPatterns: patterns.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur analyse globale patterns POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'analyse globale personnalisée',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

// Fonction utilitaire pour calculer la volatilité
function calculateVolatility(pattern: any): number {
  const monthlyRates = Object.values(pattern.monthlyStats || {}).map((s: any) => s.successRate);
  if (monthlyRates.length === 0) return 0;
  
  const mean = monthlyRates.reduce((a: number, b: number) => a + b, 0) / monthlyRates.length;
  const variance = monthlyRates.reduce((acc: number, rate: number) => acc + Math.pow(rate - mean, 2), 0) / monthlyRates.length;
  return Math.sqrt(variance);
}
