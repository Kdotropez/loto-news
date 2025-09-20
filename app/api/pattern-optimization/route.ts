import { NextRequest, NextResponse } from 'next/server';
import { patternOptimizationEngine, PatternOptimizationOptions } from '@/lib/pattern-optimization-engine';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Gérer les deux formats possibles
    let options: PatternOptimizationOptions;
    
    if (body.options) {
      // Format existant
      options = body.options;
    } else {
      // Nouveau format direct
      options = {
        includeParityPatterns: body.selectedParityPatterns?.length > 0,
        selectedParityPatterns: body.selectedParityPatterns || [],
        includeConsecutivePatterns: body.selectedConsecutivePatterns?.length > 0,
        selectedConsecutivePatterns: body.selectedConsecutivePatterns || [],
        includeDizainePatterns: body.selectedDizainePatterns?.length > 0,
        selectedDizainePatterns: body.selectedDizainePatterns || [],
        includeSommePatterns: body.selectedSommePatterns?.length > 0,
        selectedSommePatterns: body.selectedSommePatterns || [],
        includeZonePatterns: body.selectedZonePatterns?.length > 0,
        selectedZonePatterns: body.selectedZonePatterns || [],
        includeUnitesPatterns: body.selectedUnitesPatterns?.length > 0,
        selectedUnitesPatterns: body.selectedUnitesPatterns || [],
        numberOfCombinations: body.numberOfCombinations || 10,
        forcePatternCompliance: body.forcePatternCompliance || true
      };
    }

    // Validation des options
    if (!options || typeof options.numberOfCombinations !== 'number') {
      return NextResponse.json({
        success: false,
        error: 'Options invalides'
      }, { status: 400 });
    }

    // Générer les combinaisons optimisées
    const combinations = await patternOptimizationEngine.generatePatternOptimizedCombinations(options);

    return NextResponse.json({
      success: true,
      data: {
        combinations,
        totalGenerated: combinations.length,
        patternsUsed: Array.from(new Set(combinations.flatMap(c => c.patterns))),
        options
      }
    });

  } catch (error) {
    console.error('Erreur lors de la génération de combinaisons optimisées:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la génération des combinaisons'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Retourner les patterns disponibles
    const availablePatterns = await patternOptimizationEngine.getAvailablePatterns();

    return NextResponse.json({
      success: true,
      data: {
        patterns: availablePatterns
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des patterns:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des patterns'
    }, { status: 500 });
  }
}
