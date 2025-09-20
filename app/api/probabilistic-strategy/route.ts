import { NextRequest, NextResponse } from 'next/server';
import { dataStorage } from '@/lib/data-storage';
import ProbabilisticGapStrategy from '@/lib/probabilistic-gap-strategy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const maxNumbers = parseInt(searchParams.get('maxNumbers') || '10');
    const generateCombination = searchParams.get('combination') === 'true';

    // Récupérer tous les tirages
    const tirages = dataStorage.getAllTirages();
    
    if (tirages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aucun tirage disponible pour l\'analyse'
      }, { status: 404 });
    }

    // Créer l'instance de stratégie
    const strategy = new ProbabilisticGapStrategy(tirages);
    
    // Analyser les écarts actuels
    const currentGaps = strategy.analyzeCurrentGaps();
    
    // Générer la stratégie
    const strategyResult = strategy.generateStrategy(maxNumbers);
    
    let optimalCombination = null;
    if (generateCombination) {
      optimalCombination = strategy.generateOptimalCombination();
    }

    return NextResponse.json({
      success: true,
      data: {
        strategy: strategyResult,
        currentGaps: currentGaps.slice(0, 20), // Top 20 pour éviter trop de données
        optimalCombination,
        analysis: {
          totalTirages: tirages.length,
          criticalNumbers: currentGaps.filter(n => n.urgencyLevel === 'critique').length,
          highProbabilityNumbers: currentGaps.filter(n => n.returnProbability > 0.9).length,
          irregularNumbers: currentGaps.filter(n => n.isIrregular).length
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        strategyVersion: '1.0',
        basedOnTirages: tirages.length
      }
    });

  } catch (error) {
    console.error('Erreur stratégie probabiliste:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'analyse probabiliste',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      maxNumbers = 10, 
      focusOnCritical = false,
      includeIrregulars = true,
      minProbability = 0.8 
    } = body;

    // Récupérer tous les tirages
    const tirages = dataStorage.getAllTirages();
    
    if (tirages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aucun tirage disponible pour l\'analyse'
      }, { status: 404 });
    }

    // Créer l'instance de stratégie
    const strategy = new ProbabilisticGapStrategy(tirages);
    
    // Analyser avec filtres personnalisés
    let currentGaps = strategy.analyzeCurrentGaps();
    
    // Appliquer les filtres
    if (focusOnCritical) {
      currentGaps = currentGaps.filter(n => n.urgencyLevel === 'critique');
    }
    
    if (!includeIrregulars) {
      currentGaps = currentGaps.filter(n => !n.isIrregular);
    }
    
    if (minProbability > 0) {
      currentGaps = currentGaps.filter(n => n.returnProbability >= minProbability);
    }

    // Générer multiple combinaisons
    const combinations = [];
    for (let i = 0; i < 5; i++) {
      const combination = strategy.generateOptimalCombination();
      combinations.push({
        numbers: combination,
        confidence: strategy.generateStrategy(5).confidenceLevel,
        explanation: `Combinaison ${i + 1} - Focus sur probabilités maximales`
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        filteredNumbers: currentGaps.slice(0, maxNumbers),
        multipleCombinations: combinations,
        filterStats: {
          totalNumbers: currentGaps.length,
          averageProbability: currentGaps.length > 0 
            ? Math.round(currentGaps.reduce((sum, n) => sum + n.returnProbability, 0) / currentGaps.length * 100)
            : 0,
          averageGap: currentGaps.length > 0
            ? Math.round(currentGaps.reduce((sum, n) => sum + n.currentGap, 0) / currentGaps.length)
            : 0
        }
      },
      filters: {
        maxNumbers,
        focusOnCritical,
        includeIrregulars,
        minProbability
      },
      metadata: {
        timestamp: new Date().toISOString(),
        basedOnTirages: tirages.length
      }
    });

  } catch (error) {
    console.error('Erreur stratégie probabiliste POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'analyse probabiliste personnalisée',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
