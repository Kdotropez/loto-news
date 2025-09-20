import { NextRequest, NextResponse } from 'next/server';
import { dataStorage } from '@/lib/data-storage';
import { WinningRankAnalyzer } from '@/lib/winning-rank-analyzer';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetDate = searchParams.get('targetDate'); // Date spécifique à analyser
    const period = searchParams.get('period') || 'last20';

    console.log(`🎯 Analyse des rangs de gain pour ${targetDate || 'dernier tirage'}`);

    // Récupérer TOUS les tirages réels
    const tirages = dataStorage.getAllTirages();
    
    if (tirages.length < 50) {
      return NextResponse.json({
        success: false,
        error: 'Pas assez de tirages pour une analyse des rangs de gain (minimum 50 requis)'
      }, { status: 400 });
    }

    let targetDraw: any;
    let previousDraws: any[];
    
    if (targetDate) {
      // Analyse d'un tirage spécifique
      targetDraw = tirages.find(t => t.date === targetDate);
      if (!targetDraw) {
        return NextResponse.json({
          success: false,
          error: `Tirage du ${targetDate} non trouvé`
        }, { status: 404 });
      }
      
      const targetIndex = tirages.findIndex(t => t.date === targetDate);
      previousDraws = tirages.slice(0, targetIndex);
    } else {
      // Analyse du dernier tirage
      const sortedTirages = tirages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      targetDraw = sortedTirages[0];
      previousDraws = tirages.filter(t => new Date(t.date).getTime() < new Date(targetDraw.date).getTime());
    }

    if (previousDraws.length < 20) {
      return NextResponse.json({
        success: false,
        error: 'Pas assez de tirages précédents pour l\'analyse'
      }, { status: 400 });
    }

    console.log(`📊 Analyse sur ${previousDraws.length} tirages précédents`);

    // Créer l'analyseur de rangs de gain
    const analyzer = new WinningRankAnalyzer(tirages);
    
    // Lancer l'analyse complète des rangs
    const winningAnalysis = await analyzer.analyzeWinningRanks(targetDraw, previousDraws);
    
    console.log(`✅ Analyse des rangs terminée`);
    console.log(`🏆 Stratégies gagnantes trouvées: ${winningAnalysis.overallBestStrategies.filter(s => s.totalRanksWon > 0).length}`);

    return NextResponse.json({
      success: true,
      data: winningAnalysis,
      metadata: {
        totalTiragesDatabase: tirages.length,
        previousDrawsUsed: previousDraws.length,
        targetDate: targetDraw.date,
        period,
        timestamp: new Date().toISOString(),
        version: '1.0-winning-ranks'
      }
    });

  } catch (error) {
    console.error('❌ Erreur analyse rangs de gain:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'analyse des rangs de gain',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      targetDates = [], // Liste de dates à analyser
      analysisDepth = 'standard', // 'quick', 'standard', 'deep'
      focusRanks = [1, 2, 3, 4, 5], // Rangs à analyser spécifiquement
      maxStrategies = 20 // Nombre max de stratégies à tester
    } = body;

    // Récupérer tous les tirages
    const allTirages = dataStorage.getAllTirages();
    
    if (allTirages.length < 50) {
      return NextResponse.json({
        success: false,
        error: 'Dataset insuffisant pour l\'analyse des rangs'
      }, { status: 400 });
    }

    const analyzer = new WinningRankAnalyzer(allTirages);
    const results = [];

    let tiragesToAnalyze = [];
    if (targetDates.length > 0) {
      tiragesToAnalyze = allTirages.filter(t => targetDates.includes(t.date));
    } else {
      // Analyser les 5 derniers tirages par défaut
      const sortedTirages = allTirages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      tiragesToAnalyze = sortedTirages.slice(0, 5);
    }

    console.log(`🎯 Analyse des rangs par batch: ${tiragesToAnalyze.length} tirages`);

    for (const targetDraw of tiragesToAnalyze) {
      const targetIndex = allTirages.findIndex(t => t.date === targetDraw.date);
      const previousDraws = allTirages.slice(0, targetIndex);
      
      if (previousDraws.length >= 20) {
        const analysis = await analyzer.analyzeWinningRanks(targetDraw, previousDraws);
        results.push(analysis);
      }
    }

    // Analyser les patterns communs entre tous les résultats
    const commonPatterns = analyzeCommonWinningPatterns(results);
    
    // Identifier les stratégies les plus polyvalentes
    const mostVersatileStrategies = identifyVersatileStrategies(results);

    return NextResponse.json({
      success: true,
      data: {
        individualResults: results,
        commonPatterns,
        mostVersatileStrategies,
        summary: {
          totalDrawsAnalyzed: results.length,
          averageStrategiesPerRank: results.length > 0 ? 
            results.reduce((acc, r) => acc + r.overallBestStrategies.length, 0) / results.length : 0,
          mostSuccessfulOverall: mostVersatileStrategies[0]?.strategyName || 'N/A'
        }
      },
      parameters: {
        targetDates,
        analysisDepth,
        focusRanks,
        maxStrategies
      },
      metadata: {
        totalTiragesDatabase: allTirages.length,
        successfulAnalyses: results.length,
        timestamp: new Date().toISOString(),
        version: '1.0-batch-ranks'
      }
    });

  } catch (error) {
    console.error('Erreur analyse rangs POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'analyse des rangs par batch',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

// Fonctions utilitaires

function analyzeCommonWinningPatterns(results: any[]): Array<{
  pattern: string;
  frequency: number;
  averageEfficiency: number;
  ranksWon: number[];
}> {
  const patternStats = new Map<string, {
    occurrences: number;
    totalEfficiency: number;
    ranksWon: Set<number>;
  }>();

  results.forEach(result => {
    result.overallBestStrategies.forEach((strategy: any) => {
      if (strategy.totalRanksWon > 0) {
        if (!patternStats.has(strategy.strategyName)) {
          patternStats.set(strategy.strategyName, {
            occurrences: 0,
            totalEfficiency: 0,
            ranksWon: new Set()
          });
        }
        
        const stats = patternStats.get(strategy.strategyName)!;
        stats.occurrences++;
        stats.totalEfficiency += strategy.efficiency;
        
        // Ajouter les rangs gagnés (simulé pour l'exemple)
        for (let rank = strategy.highestRank; rank <= 5; rank++) {
          stats.ranksWon.add(rank);
        }
      }
    });
  });

  return Array.from(patternStats.entries())
    .map(([pattern, stats]) => ({
      pattern,
      frequency: stats.occurrences,
      averageEfficiency: stats.totalEfficiency / stats.occurrences,
      ranksWon: Array.from(stats.ranksWon).sort((a, b) => a - b)
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);
}

function identifyVersatileStrategies(results: any[]): Array<{
  strategyName: string;
  totalWins: number;
  averageRank: number;
  consistency: number;
  explanation: string;
}> {
  const strategyStats = new Map<string, {
    wins: number;
    ranks: number[];
    efficiencies: number[];
  }>();

  results.forEach(result => {
    result.overallBestStrategies.forEach((strategy: any) => {
      if (!strategyStats.has(strategy.strategyName)) {
        strategyStats.set(strategy.strategyName, {
          wins: 0,
          ranks: [],
          efficiencies: []
        });
      }
      
      const stats = strategyStats.get(strategy.strategyName)!;
      if (strategy.totalRanksWon > 0) {
        stats.wins++;
        stats.ranks.push(strategy.highestRank);
      }
      stats.efficiencies.push(strategy.efficiency);
    });
  });

  return Array.from(strategyStats.entries())
    .map(([name, stats]) => {
      const averageRank = stats.ranks.length > 0 ? 
        stats.ranks.reduce((a, b) => a + b, 0) / stats.ranks.length : 6;
      const averageEfficiency = stats.efficiencies.reduce((a, b) => a + b, 0) / stats.efficiencies.length;
      const consistency = stats.wins / results.length;
      
      return {
        strategyName: name,
        totalWins: stats.wins,
        averageRank,
        consistency,
        explanation: `Gagne ${stats.wins}/${results.length} fois (${(consistency * 100).toFixed(1)}%) avec rang moyen ${averageRank.toFixed(1)}`
      };
    })
    .sort((a, b) => b.consistency - a.consistency)
    .slice(0, 5);
}
