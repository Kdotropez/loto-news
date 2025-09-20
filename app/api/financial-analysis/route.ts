import { NextRequest, NextResponse } from 'next/server';
import { FinancialStrategyAnalyzer } from '@/lib/financial-strategy-analyzer';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const numbersParam = searchParams.get('numbers'); // "1,2,3,4,5,6,7"
    const complementaryParam = searchParams.get('complementary') || '1,2,3'; // "1,2,3"
    const strategyName = searchParams.get('strategy') || 'Configuration Analysée';

    if (!numbersParam) {
      return NextResponse.json({
        success: false,
        error: 'Paramètre "numbers" requis (ex: numbers=1,2,3,4,5,6)'
      }, { status: 400 });
    }

    // Parser les numéros
    const numbersSelected = numbersParam.split(',').map(n => parseInt(n.trim())).filter(n => n >= 1 && n <= 49);
    const complementarySelected = complementaryParam.split(',').map(n => parseInt(n.trim())).filter(n => n >= 1 && n <= 10);

    if (numbersSelected.length < 5) {
      return NextResponse.json({
        success: false,
        error: 'Minimum 5 numéros requis pour l\'analyse financière'
      }, { status: 400 });
    }

    if (complementarySelected.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Au moins 1 numéro complémentaire requis'
      }, { status: 400 });
    }

    console.log(`💰 Analyse financière: ${numbersSelected.length} numéros, ${complementarySelected.length} complémentaires`);

    // Créer l'analyseur financier
    const analyzer = new FinancialStrategyAnalyzer();
    
    // Lancer l'analyse complète
    const analysis = analyzer.analyzeStrategyFinancials(strategyName, numbersSelected, complementarySelected);
    
    console.log(`✅ Analyse financière terminée`);
    console.log(`💰 Coût grilles simples: ${analysis.simpleGrids.totalCost.toFixed(2)}€`);
    console.log(`💰 Coût grille multiple: ${analysis.multipleGrids.totalCost.toFixed(2)}€`);
    console.log(`🎯 Meilleure approche: ${analysis.bestApproach.type} (ROI: ${analysis.bestApproach.expectedROI.toFixed(2)}%)`);

    return NextResponse.json({
      success: true,
      data: analysis,
      metadata: {
        numbersAnalyzed: numbersSelected.length,
        complementaryAnalyzed: complementarySelected.length,
        strategyName,
        timestamp: new Date().toISOString(),
        version: '1.0-financial-analysis'
      }
    });

  } catch (error) {
    console.error('❌ Erreur analyse financière:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'analyse financière',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      strategies = [], // Liste de stratégies à comparer
      budget = 100,
      riskTolerance = 'medium', // 'low', 'medium', 'high'
      optimizationGoal = 'roi' // 'roi', 'winProbability', 'costEfficiency'
    } = body;

    if (strategies.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Au moins une stratégie requise pour la comparaison'
      }, { status: 400 });
    }

    console.log(`💰 Comparaison financière: ${strategies.length} stratégies, budget: ${budget}€`);

    const analyzer = new FinancialStrategyAnalyzer();
    const results = [];

    // Analyser chaque stratégie
    for (const strategy of strategies) {
      if (strategy.numbers && Array.isArray(strategy.numbers) && strategy.numbers.length >= 5) {
        const analysis = analyzer.analyzeStrategyFinancials(
          strategy.name || 'Stratégie',
          strategy.numbers,
          strategy.complementary || [1, 2, 3]
        );
        
        results.push({
          ...analysis,
          budgetFit: analysis.simpleGrids.totalCost <= budget ? 'fit' : 'overbudget',
          budgetUtilization: (Math.min(analysis.simpleGrids.totalCost, budget) / budget) * 100
        });
      }
    }

    // Trier selon l'objectif d'optimisation
    results.sort((a, b) => {
      switch (optimizationGoal) {
        case 'winProbability':
          const aProbSum = Object.values(a.simpleGrids.winProbabilities).reduce((acc: number, rank: any) => acc + rank.probability, 0);
          const bProbSum = Object.values(b.simpleGrids.winProbabilities).reduce((acc: number, rank: any) => acc + rank.probability, 0);
          return bProbSum - aProbSum;
        case 'costEfficiency':
          return b.performanceMetrics.costEfficiency - a.performanceMetrics.costEfficiency;
        case 'roi':
        default:
          return b.bestApproach.expectedROI - a.bestApproach.expectedROI;
      }
    });

    // Générer des recommandations personnalisées
    const recommendations = generatePersonalizedRecommendations(results, budget, riskTolerance);

    return NextResponse.json({
      success: true,
      data: {
        strategies: results,
        recommendations,
        comparison: {
          bestROI: results[0]?.bestApproach.expectedROI || 0,
          lowestCost: Math.min(...results.map(r => r.simpleGrids.totalCost)),
          highestEfficiency: Math.max(...results.map(r => r.performanceMetrics.costEfficiency)),
          budgetFriendly: results.filter(r => r.budgetFit === 'fit').length
        }
      },
      parameters: {
        budget,
        riskTolerance,
        optimizationGoal,
        strategiesCompared: strategies.length
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0-financial-comparison'
      }
    });

  } catch (error) {
    console.error('Erreur comparaison financière POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la comparaison financière',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

function generatePersonalizedRecommendations(results: any[], budget: number, riskTolerance: string): Array<{
  type: string;
  title: string;
  description: string;
  strategy: string;
  expectedCost: number;
  expectedROI: number;
}> {
  const recommendations = [];
  
  // Recommandation selon le budget
  const budgetFriendly = results.filter(r => r.simpleGrids.totalCost <= budget);
  if (budgetFriendly.length > 0) {
    const best = budgetFriendly[0];
    recommendations.push({
      type: 'budget',
      title: 'Meilleur choix pour votre budget',
      description: `Avec ${budget}€, cette stratégie offre le meilleur rapport qualité/prix`,
      strategy: best.strategyName,
      expectedCost: best.simpleGrids.totalCost,
      expectedROI: best.bestApproach.expectedROI
    });
  }
  
  // Recommandation selon la tolérance au risque
  const riskAppropriate = results.filter(r => {
    if (riskTolerance === 'low') return r.bestApproach.riskLevel === 'low';
    if (riskTolerance === 'high') return r.bestApproach.riskLevel === 'high';
    return r.bestApproach.riskLevel === 'medium';
  });
  
  if (riskAppropriate.length > 0) {
    const best = riskAppropriate[0];
    recommendations.push({
      type: 'risk',
      title: `Adapté à votre profil de risque (${riskTolerance})`,
      description: `Cette stratégie correspond à votre tolérance au risque`,
      strategy: best.strategyName,
      expectedCost: best.simpleGrids.totalCost,
      expectedROI: best.bestApproach.expectedROI
    });
  }
  
  // Recommandation d'efficacité
  const mostEfficient = results.sort((a, b) => b.performanceMetrics.costEfficiency - a.performanceMetrics.costEfficiency)[0];
  if (mostEfficient) {
    recommendations.push({
      type: 'efficiency',
      title: 'Plus efficace par euro investi',
      description: `Meilleur ratio gain potentiel / coût investi`,
      strategy: mostEfficient.strategyName,
      expectedCost: mostEfficient.simpleGrids.totalCost,
      expectedROI: mostEfficient.bestApproach.expectedROI
    });
  }
  
  return recommendations;
}
