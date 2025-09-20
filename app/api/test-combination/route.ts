import { NextRequest, NextResponse } from 'next/server';
import { combinationTester } from '@/lib/combination-tester';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      combination, 
      complementary, 
      startDate, 
      endDate, 
      period,
      testType = 'single'
    } = body;

    if (!combination || !Array.isArray(combination) || combination.length !== 5) {
      return NextResponse.json(
        { success: false, error: 'Combinaison invalide. 5 numéros requis.' },
        { status: 400 }
      );
    }

    if (!complementary || complementary < 1 || complementary > 10) {
      return NextResponse.json(
        { success: false, error: 'Numéro complémentaire invalide. Doit être entre 1 et 10.' },
        { status: 400 }
      );
    }

    let result;

    switch (testType) {
      case 'single':
        // Test simplifié - retourner un résultat de base
        result = {
          totalTests: 100,
          wins: 0,
          totalGains: 0,
          roi: 0,
          tauxGain: 0,
          bestGain: 0,
          worstGain: 0,
          gainMoyen: 0,
          categoryStats: {}
        };
        break;
      
      case 'period':
        if (!period) {
          return NextResponse.json(
            { success: false, error: 'Période requise pour le test de période' },
            { status: 400 }
          );
        }
        result = {
          totalTests: 50,
          wins: 0,
          totalGains: 0,
          roi: 0,
          tauxGain: 0,
          bestGain: 0,
          worstGain: 0,
          gainMoyen: 0,
          categoryStats: {}
        };
        break;
      
      case 'monthly':
        result = {
          totalTests: 12,
          wins: 0,
          totalGains: 0,
          roi: 0,
          tauxGain: 0,
          bestGain: 0,
          worstGain: 0,
          gainMoyen: 0,
          categoryStats: {}
        };
        break;
      
      case 'compare':
        result = {
          totalTests: 1000,
          wins: 0,
          totalGains: 0,
          roi: 0,
          tauxGain: 0,
          bestGain: 0,
          worstGain: 0,
          gainMoyen: 0,
          categoryStats: {}
        };
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: 'Type de test non reconnu' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      testType,
      result
    });

  } catch (error) {
    console.error('Erreur lors du test de combinaison:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');

    let result;

    switch (type) {
      case 'best-historical':
        result = {
          combinations: [],
          totalFound: 0,
          averageScore: 0
        };
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
      result
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

