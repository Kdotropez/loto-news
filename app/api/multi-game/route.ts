import { NextRequest, NextResponse } from 'next/server';
import { multiGameOptimizer } from '@/lib/multi-game-optimizer';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type');
    const count = parseInt(searchParams.get('count') || '15');
    const budget = parseFloat(searchParams.get('budget') || '50');

    let result;

    switch (type) {
      case 'best-numbers':
        result = multiGameOptimizer.getBestNumbersSet(count);
        break;
      
      case 'optimal-combinations':
        const optimalNumbersSet = searchParams.get('numbersSet');
        if (!optimalNumbersSet) {
          return NextResponse.json(
            { success: false, error: 'Ensemble de numéros requis' },
            { status: 400 }
          );
        }
        const optimalNumbers = optimalNumbersSet.split(',').map(n => parseInt(n.trim()));
        result = multiGameOptimizer.generateOptimalCombinations(optimalNumbers, count);
        break;
      
      case 'strategies':
        result = multiGameOptimizer.createMultiGameStrategies(budget);
        break;
      
      case 'budget-optimization':
        result = multiGameOptimizer.optimizeBudget(budget);
        break;
      
      case 'multi-grids':
        const multiGridNumbersSet = searchParams.get('numbersSet');
        if (!multiGridNumbersSet) {
          return NextResponse.json(
            { success: false, error: 'Ensemble de numéros requis' },
            { status: 400 }
          );
        }
        const multiGridNumbers = multiGridNumbersSet.split(',').map(n => parseInt(n.trim()));
        result = multiGameOptimizer.generateMultiGrids(multiGridNumbers, budget);
        break;
      
      case 'simple-games':
        const simpleGamesNumbersSet = searchParams.get('numbersSet');
        if (!simpleGamesNumbersSet) {
          return NextResponse.json(
            { success: false, error: 'Ensemble de numéros requis' },
            { status: 400 }
          );
        }
        const simpleGamesNumbers = simpleGamesNumbersSet.split(',').map(n => parseInt(n.trim()));
        result = multiGameOptimizer.generateSimpleGames(simpleGamesNumbers, count);
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: 'Type de requête non reconnu' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      result,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la génération des jeux multiples:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, budget, numbersSet, count, strategyOptions } = body;

    let result;

    switch (action) {
      case 'generate-strategies':
        result = multiGameOptimizer.createMultiGameStrategies(budget, numbersSet);
        break;
      
      case 'optimize-budget':
        result = multiGameOptimizer.optimizeBudget(budget);
        break;
      
      case 'generate-combinations':
        if (!numbersSet || !Array.isArray(numbersSet)) {
          return NextResponse.json(
            { success: false, error: 'Ensemble de numéros invalide' },
            { status: 400 }
          );
        }
        result = multiGameOptimizer.generateOptimalCombinations(numbersSet, count || 10, strategyOptions);
        break;
      
      case 'generate-simple-games':
        if (!numbersSet || !Array.isArray(numbersSet)) {
          return NextResponse.json(
            { success: false, error: 'Ensemble de numéros invalide' },
            { status: 400 }
          );
        }
        result = multiGameOptimizer.generateSimpleGames(numbersSet, count || 8, strategyOptions);
        break;
      
      case 'generate-multi-grids':
        if (!numbersSet || !Array.isArray(numbersSet)) {
          return NextResponse.json(
            { success: false, error: 'Ensemble de numéros invalide' },
            { status: 400 }
          );
        }
        result = multiGameOptimizer.generateMultiGrids(numbersSet, budget || 50, strategyOptions);
        break;
      
      case 'get-best-numbers':
        result = multiGameOptimizer.getBestNumbersSet(count || 15);
        break;
      
      case 'clear-cache':
        multiGameOptimizer.clearCache();
        return NextResponse.json({
          success: true,
          message: 'Cache vidé avec succès'
        });
      
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
    console.error('Erreur lors de l\'action POST:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
