import { NextRequest, NextResponse } from 'next/server';
import { DrawProximityAnalyzer } from '@/lib/draw-proximity-analyzer';

export const dynamic = 'force-dynamic';

// Fonction pour générer des combinaisons de test
function generateTestCombinations(strategies: any[]) {
  const combinations = [];
  
  // Génère quelques combinaisons représentatives
  const testCombinations = [
    {
      id: 'hot-cold-1',
      name: 'Hot-Cold Hybride',
      strategies: ['hot-cold-hybrid'],
      combination: { mainNumbers: [7, 14, 21, 28, 35], complementaryNumber: 8 }
    },
    {
      id: 'correlations-1',
      name: 'Corrélations Fortes',
      strategies: ['correlations'],
      combination: { mainNumbers: [3, 12, 18, 27, 33], complementaryNumber: 5 }
    },
    {
      id: 'mathematical-1',
      name: 'Patterns Mathématiques',
      strategies: ['mathematical-patterns'],
      combination: { mainNumbers: [1, 4, 9, 16, 25], complementaryNumber: 2 }
    },
    {
      id: 'neural-1',
      name: 'Réseau de Neurones',
      strategies: ['neural-network'],
      combination: { mainNumbers: [5, 10, 15, 20, 25], complementaryNumber: 7 }
    },
    {
      id: 'fibonacci-1',
      name: 'Suite de Fibonacci',
      strategies: ['fibonacci'],
      combination: { mainNumbers: [1, 1, 2, 3, 5], complementaryNumber: 1 }
    },
    {
      id: 'prime-1',
      name: 'Nombres Premiers',
      strategies: ['prime-numbers'],
      combination: { mainNumbers: [2, 3, 5, 7, 11], complementaryNumber: 3 }
    },
    {
      id: 'hybrid-1',
      name: 'Hot-Cold + Corrélations',
      strategies: ['hot-cold-hybrid', 'correlations'],
      combination: { mainNumbers: [7, 12, 21, 27, 35], complementaryNumber: 6 }
    },
    {
      id: 'hybrid-2',
      name: 'Mathématiques + Neural',
      strategies: ['mathematical-patterns', 'neural-network'],
      combination: { mainNumbers: [4, 9, 15, 20, 25], complementaryNumber: 4 }
    },
    {
      id: 'hybrid-3',
      name: 'Fibonacci + Premiers',
      strategies: ['fibonacci', 'prime-numbers'],
      combination: { mainNumbers: [2, 3, 5, 7, 11], complementaryNumber: 2 }
    },
    {
      id: 'hybrid-4',
      name: 'Triple Stratégie',
      strategies: ['hot-cold-hybrid', 'correlations', 'mathematical-patterns'],
      combination: { mainNumbers: [7, 12, 16, 21, 28], complementaryNumber: 5 }
    }
  ];

  return testCombinations;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      drawResult,
      limit = 10
    } = body;

    // Validation des données
    if (!drawResult || !drawResult.mainNumbers || !Array.isArray(drawResult.mainNumbers) || 
        drawResult.mainNumbers.length !== 5 || !drawResult.complementaryNumber) {
      return NextResponse.json(
        { success: false, error: 'Format de tirage invalide. Attendu: { mainNumbers: [5 numéros], complementaryNumber: number, date?: string }' },
        { status: 400 }
      );
    }

    // Validation des numéros
    const mainNumbers = drawResult.mainNumbers;
    const complementaryNumber = drawResult.complementaryNumber;

    if (mainNumbers.some((num: number) => num < 1 || num > 49) || 
        complementaryNumber < 1 || complementaryNumber > 10) {
      return NextResponse.json(
        { success: false, error: 'Numéros invalides. Principaux: 1-49, Complémentaire: 1-10' },
        { status: 400 }
      );
    }

    // Génère les combinaisons directement (pas de dépendance au gestionnaire)
    const availableStrategies = [
      { id: 'hot-cold-hybrid', name: 'Hot-Cold Hybride', description: 'Mélange optimal' },
      { id: 'correlations', name: 'Corrélations Fortes', description: 'Corrélations statistiques' },
      { id: 'anti-correlations', name: 'Anti-Corrélations', description: 'Évite les mauvaises combinaisons' },
      { id: 'temporal-patterns', name: 'Patterns Temporels', description: 'Cycles de récurrence' },
      { id: 'mathematical-patterns', name: 'Patterns Mathématiques', description: 'Structures mathématiques' },
      { id: 'volatility-optimized', name: 'Volatilité Optimisée', description: 'Équilibre stabilité/opportunité' },
      { id: 'astrological', name: 'Astrologique', description: 'Signes astrologiques' },
      { id: 'numerology', name: 'Numérologie', description: 'Signification des nombres' },
      { id: 'geometric', name: 'Géométrique', description: 'Patterns géométriques' },
      { id: 'chaos-theory', name: 'Théorie du Chaos', description: 'Attracteurs étranges' },
      { id: 'quantum', name: 'Quantique', description: 'Superposition quantique' },
      { id: 'neural-network', name: 'Réseau de Neurones', description: 'IA et machine learning' },
      { id: 'fibonacci', name: 'Suite de Fibonacci', description: 'Nombres de Fibonacci' },
      { id: 'golden-ratio', name: 'Nombre d\'Or', description: 'Ratio d\'or (1.618)' },
      { id: 'prime-numbers', name: 'Nombres Premiers', description: 'Exclusivement des nombres premiers' }
    ];

    // Génère quelques combinaisons de test
    const combinations = generateTestCombinations(availableStrategies);

    // Initialise l'analyseur
    const analyzer = new DrawProximityAnalyzer();
    analyzer.initialize(combinations);

    // Analyse la proximité
    const analysis = analyzer.analyzeDrawProximity({
      date: drawResult.date || new Date().toISOString(),
      mainNumbers,
      complementaryNumber
    });

    // Génère le rapport détaillé
    const detailedReport = analyzer.generateDetailedReport({
      date: drawResult.date || new Date().toISOString(),
      mainNumbers,
      complementaryNumber
    });

    // Analyse la performance des stratégies
    const strategyPerformance = analyzer.analyzeStrategyPerformance({
      date: drawResult.date || new Date().toISOString(),
      mainNumbers,
      complementaryNumber
    });

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        bestMatches: analysis.bestMatches.slice(0, limit)
      },
      strategyPerformance: strategyPerformance.slice(0, 10),
      detailedReport,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de l\'analyse de proximité:', error);
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

    switch (action) {
      case 'example':
        // Retourne un exemple de format de tirage
        return NextResponse.json({
          success: true,
          example: {
            mainNumbers: [7, 14, 21, 28, 35],
            complementaryNumber: 8,
            date: new Date().toISOString()
          },
          description: 'Format attendu pour l\'analyse de proximité'
        });

      case 'stats':
        // Retourne les statistiques des combinaisons disponibles
        const testCombinations = generateTestCombinations([]);
        
        return NextResponse.json({
          success: true,
          stats: {
            totalCombinations: testCombinations.length,
            testedCombinations: 0,
            estimatedCombinations: testCombinations.length,
            lastUpdated: new Date().toISOString()
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Action non reconnue' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Erreur lors de la requête GET:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
