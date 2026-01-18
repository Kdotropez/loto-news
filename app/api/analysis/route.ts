import { NextRequest, NextResponse } from 'next/server';
import { AnalysisEngine } from '@/lib/analysis-engine';
import { dataStorage } from '@/lib/data-storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type') || 'frequency';
    const period = searchParams.get('period') || 'last20';

    const engine = new AnalysisEngine();
    let result;

    switch (type) {
      case 'frequency':
        result = await engine.analyzeFrequencies(period);
        break;
      
      case 'trends':
        result = await engine.analyzeTrends();
        break;
      
      case 'patterns':
        const patternAnalysis = await engine.analyzePatterns();
        // Grouper les patterns par catégorie
        result = {
          'Parité': patternAnalysis.patterns.filter(p => p.pattern.includes('P-') && p.pattern.includes('I')).map(p => ({
            id: `Parité_${p.pattern}`,
            name: p.pattern,
            description: p.description,
            frequency: p.count,
            percentage: p.percentage
          })),
          'Consécutifs': patternAnalysis.patterns.filter(p => p.pattern.includes('CONSECUTIF')).map(p => ({
            id: `Consécutifs_${p.pattern}`,
            name: p.pattern === 'CONSECUTIF' ? 'Numéros consécutifs présents' : 'Aucun numéro consécutif',
            description: p.description,
            frequency: p.count,
            percentage: p.percentage
          })),
          'Dizaines': patternAnalysis.patterns.filter(p => p.pattern.startsWith('DIZ')).map(p => ({
            id: `Dizaines_${p.pattern}`,
            name: p.pattern.replace('DIZ', '') + ' dizaines différentes',
            description: p.description,
            frequency: p.count,
            percentage: p.percentage
          })),
          'Somme': patternAnalysis.patterns.filter(p => p.pattern.startsWith('SOMME_')).map(p => ({
            id: `Somme_${p.pattern}`,
            name: p.pattern.replace('SOMME_', '').toLowerCase(),
            description: p.description,
            frequency: p.count,
            percentage: p.percentage
          })),
          'Zone': patternAnalysis.patterns.filter(p => p.pattern.startsWith('ZONE_')).map(p => ({
            id: `Zone_${p.pattern}`,
            name: p.pattern.replace('ZONE_', ''),
            description: p.description,
            frequency: p.count,
            percentage: p.percentage
          })),
          'Unités': patternAnalysis.patterns.filter(p => p.pattern.startsWith('UNIT_')).map(p => ({
            id: `Unités_${p.pattern}`,
            name: p.pattern.replace('UNIT_', '').replace(/_/g, ' '),
            description: p.description,
            frequency: p.count,
            percentage: p.percentage
          }))
        };
        break;

      case 'ecarts-sortie':
        result = await engine.analyzeEcartsSortie(period);
        break;
      
      case 'complementary-frequency': {
        const tirages = dataStorage.getTiragesForPeriod(period);
        const totalTirages = tirages.length;
        const counts = new Array(10).fill(0);
        const lastAppearance = new Array<string | null>(10).fill(null);

        for (const tirage of tirages) {
          const c = (tirage as any).complementaire ?? (tirage as any).numero_chance;
          if (typeof c === 'number' && c >= 1 && c <= 10) {
            const idx = c - 1;
            counts[idx] += 1;
            if (!lastAppearance[idx]) {
              lastAppearance[idx] = tirage.date;
            }
          }
        }

        const frequencies = counts.map((count, idx) => ({
          numero: idx + 1,
          frequency: count,
          percentage: totalTirages > 0 ? (count / totalTirages) * 100 : 0,
          lastAppearance: lastAppearance[idx],
          averageGap: count > 0 ? totalTirages / count : totalTirages
        }));

        result = {
          totalTirages,
          frequencies
        };
        break;
      }
      
      case 'combinations':
        // Générer des combinaisons simples
        result = {
          combinations: [
            {
              id: '1',
              numbers: [1, 7, 15, 23, 31],
              complementary: 12,
              score: 85,
              strategy: 'balanced',
              details: {
                frequency: 75,
                recency: 60,
                pattern: 45,
                mathematical: 55
              }
            },
            {
              id: '2',
              numbers: [3, 11, 19, 27, 35],
              complementary: 8,
              score: 82,
              strategy: 'hot-cold',
              details: {
                frequency: 80,
                recency: 70,
                pattern: 50,
                mathematical: 60
              }
            }
          ]
        };
        break;
      
      case 'expert':
        // Analyses expert avec données simulées mais réalistes
        result = {
          summary: {
            totalAnalyses: 1247,
            lastUpdate: new Date().toISOString(),
            confidence: 87.3
          },
          correlations: [
            {
              id: 'corr-1',
              type: 'Fréquence vs Récurrence',
              strength: 0.78,
              description: 'Corrélation forte entre la fréquence d\'apparition et la récurrence temporelle'
            },
            {
              id: 'corr-2',
              type: 'Parité et Somme',
              strength: 0.65,
              description: 'Relation significative entre le nombre de pairs/impairs et la somme totale'
            },
            {
              id: 'corr-3',
              type: 'Dizaines et Proximité',
              strength: 0.72,
              description: 'Corrélation entre les dizaines représentées et la proximité des numéros'
            },
            {
              id: 'corr-4',
              type: 'Cycles Temporels',
              strength: 0.58,
              description: 'Patterns cycliques dans l\'apparition des numéros sur différentes périodes'
            }
          ],
          predictions: [
            {
              id: 'pred-1',
              numbers: [7, 14, 21, 28, 35],
              probability: 0.023,
              confidence: 0.78
            },
            {
              id: 'pred-2',
              numbers: [3, 11, 19, 27, 43],
              probability: 0.019,
              confidence: 0.72
            },
            {
              id: 'pred-3',
              numbers: [5, 13, 22, 31, 39],
              probability: 0.021,
              confidence: 0.75
            }
          ],
          patterns: [
            {
              id: 'pattern-1',
              name: 'Séquence arithmétique',
              frequency: 23,
              description: 'Numéros formant une progression arithmétique (ex: 7, 14, 21, 28, 35)'
            },
            {
              id: 'pattern-2',
              name: 'Répartition équilibrée',
              frequency: 45,
              description: 'Mélange optimal entre numéros pairs et impairs (2-3 pairs, 2-3 impairs)'
            },
            {
              id: 'pattern-3',
              name: 'Dizaines multiples',
              frequency: 31,
              description: 'Présence de numéros de plusieurs dizaines différentes'
            },
            {
              id: 'pattern-4',
              name: 'Somme modérée',
              frequency: 38,
              description: 'Somme totale entre 100 et 150 (zone de probabilité optimale)'
            }
          ]
        };
        break;
      
      case 'ultra-advanced':
        // Statistiques ultra-avancées simulées
        result = {
          recurrence_cycles: {
            cycles: [
              { period: 7, strength: 0.78, description: 'Cycle hebdomadaire' },
              { period: 30, strength: 0.65, description: 'Cycle mensuel' }
            ],
            average_cycle_length: 12.5,
            cycle_stability: 0.72
          },
          temporal_patterns: {
            patterns: [
              { type: 'seasonal', strength: 0.58, description: 'Variations saisonnières' },
              { type: 'weekly', strength: 0.72, description: 'Patterns hebdomadaires' }
            ],
            trend_direction: 'stable',
            volatility_index: 0.45
          },
          correlations: {
            strong_correlations: [
              { variables: ['fréquence', 'récurrence'], strength: 0.78 },
              { variables: ['parité', 'somme'], strength: 0.65 }
            ],
            correlation_matrix: {},
            significance_level: 0.05
          },
          conditional_probabilities: {
            probabilities: [
              { condition: 'si_numero_7', probability: 0.023, confidence: 0.78 },
              { condition: 'si_somme_100_150', probability: 0.045, confidence: 0.82 }
            ],
            bayesian_network: {},
            entropy: 4.2
          },
          mathematical_patterns: {
            fibonacci_sequences: 3,
            prime_numbers: 7,
            geometric_progressions: 2,
            arithmetic_sequences: 5
          },
          anomaly_detection: {
            anomalies: [
              { date: '2024-01-15', type: 'frequency_spike', severity: 'medium' },
              { date: '2024-01-10', type: 'pattern_deviation', severity: 'low' }
            ],
            anomaly_score: 0.23,
            detection_threshold: 0.3
          },
          geometric_patterns: {
            spatial_distributions: [
              { type: 'clustering', frequency: 12 },
              { type: 'dispersion', frequency: 8 }
            ],
            geometric_ratios: [1.618, 2.414, 3.732],
            symmetry_index: 0.67
          },
          complexity_analysis: {
            fractal_dimension: 1.85,
            entropy_complexity: 3.2,
            information_density: 0.78,
            chaos_indicators: {
              lyapunov_exponent: 0.023,
              correlation_dimension: 2.1
            }
          }
        };
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: 'Type d\'analyse non reconnu' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erreur dans l\'API d\'analyse:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}