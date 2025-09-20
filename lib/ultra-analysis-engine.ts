import { dataStorage, Tirage } from './data-storage';

export interface RecurrenceCycleAnalysis {
  numero: number;
  average_cycle: number;
  min_cycle: number;
  max_cycle: number;
  current_cycle: number;
  cycle_variance: number;
  last_appearance: string;
  next_predicted: string;
  cycle_stability: 'stable' | 'variable' | 'irregular';
}

export interface TemporalPatternAnalysis {
  day_of_week: {
    [key: string]: {
      frequency: number;
      percentage: number;
      hot_numbers: number[];
      cold_numbers: number[];
    };
  };
  month_pattern: {
    [key: string]: {
      frequency: number;
      percentage: number;
      average_sum: number;
      most_common_numbers: number[];
    };
  };
  season_pattern: {
    [key: string]: {
      frequency: number;
      percentage: number;
      characteristics: string[];
    };
  };
  year_pattern: {
    [key: string]: {
      frequency: number;
      percentage: number;
      trends: string[];
    };
  };
}

export interface CorrelationAnalysis {
  pair_correlations: Array<{
    numero1: number;
    numero2: number;
    correlation_strength: number;
    co_occurrence_frequency: number;
    expected_frequency: number;
    significance: 'high' | 'medium' | 'low';
  }>;
  trio_correlations: Array<{
    numeros: number[];
    correlation_strength: number;
    co_occurrence_frequency: number;
    significance: 'high' | 'medium' | 'low';
  }>;
  anti_correlations: Array<{
    numero1: number;
    numero2: number;
    avoidance_strength: number;
    significance: 'high' | 'medium' | 'low';
  }>;
}

export interface ConditionalProbabilityAnalysis {
  numero: number;
  conditional_probabilities: Array<{
    given_number: number;
    probability: number;
    confidence: number;
    sample_size: number;
  }>;
  most_likely_companions: Array<{
    numero: number;
    probability: number;
  }>;
  least_likely_companions: Array<{
    numero: number;
    probability: number;
  }>;
}

export interface MathematicalPatternAnalysis {
  fibonacci_sequences: Array<{
    sequence: number[];
    frequency: number;
    examples: Array<{
      date: string;
      numbers: number[];
    }>;
  }>;
  arithmetic_sequences: Array<{
    sequence: number[];
    difference: number;
    frequency: number;
  }>;
  geometric_sequences: Array<{
    sequence: number[];
    ratio: number;
    frequency: number;
  }>;
  prime_numbers: {
    frequency: number;
    percentage: number;
    most_common_primes: number[];
  };
  perfect_squares: {
    frequency: number;
    percentage: number;
    most_common_squares: number[];
  };
}

export interface AnomalyDetectionAnalysis {
  outliers: Array<{
    date: string;
    numbers: number[];
    anomaly_type: 'extreme_sum' | 'unusual_pattern' | 'rare_combination';
    deviation_score: number;
    description: string;
  }>;
  unusual_patterns: Array<{
    pattern: string;
    frequency: number;
    expected_frequency: number;
    deviation: number;
    examples: Array<{
      date: string;
      numbers: number[];
    }>;
  }>;
  rare_events: Array<{
    event: string;
    frequency: number;
    last_occurrence: string;
    probability: number;
  }>;
}

export interface GeometricPatternAnalysis {
  linear_patterns: Array<{
    pattern: string;
    frequency: number;
    examples: Array<{
      date: string;
      numbers: number[];
      coordinates: Array<{x: number, y: number}>;
    }>;
  }>;
  triangular_patterns: Array<{
    pattern: string;
    frequency: number;
    examples: Array<{
      date: string;
      numbers: number[];
    }>;
  }>;
  circular_patterns: Array<{
    pattern: string;
    frequency: number;
    radius: number;
    examples: Array<{
      date: string;
      numbers: number[];
    }>;
  }>;
}

export interface ComplexityAnalysis {
  entropy_scores: Array<{
    date: string;
    numbers: number[];
    entropy: number;
    complexity_level: 'low' | 'medium' | 'high';
  }>;
  information_content: {
    average_entropy: number;
    max_entropy: number;
    min_entropy: number;
    entropy_distribution: Array<{
      entropy_range: string;
      frequency: number;
    }>;
  };
  pattern_diversity: {
    unique_patterns: number;
    pattern_frequency_distribution: Array<{
      pattern_type: string;
      frequency: number;
    }>;
  };
}

export interface UltraAdvancedStatistics {
  recurrence_cycles: RecurrenceCycleAnalysis[];
  temporal_patterns: TemporalPatternAnalysis;
  correlations: CorrelationAnalysis;
  conditional_probabilities: ConditionalProbabilityAnalysis[];
  mathematical_patterns: MathematicalPatternAnalysis;
  anomaly_detection: AnomalyDetectionAnalysis;
  geometric_patterns: GeometricPatternAnalysis;
  complexity_analysis: ComplexityAnalysis;
}

export class UltraAnalysisEngine {
  
  /**
   * Analyse les cycles de récurrence des numéros
   */
  analyzeRecurrenceCycles(): RecurrenceCycleAnalysis[] {
    const tirages = dataStorage.getAllTirages().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const cycles: RecurrenceCycleAnalysis[] = [];

    for (let numero = 1; numero <= 49; numero++) {
      const appearances: string[] = [];
      
      tirages.forEach(tirage => {
        const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
        if (boules.includes(numero)) {
          appearances.push(tirage.date);
        }
      });

      if (appearances.length > 1) {
        const cycleLengths: number[] = [];
        for (let i = 1; i < appearances.length; i++) {
          const prevDate = new Date(appearances[i - 1]);
          const currDate = new Date(appearances[i]);
          const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          cycleLengths.push(daysDiff);
        }

        const averageCycle = cycleLengths.reduce((acc, cycle) => acc + cycle, 0) / cycleLengths.length;
        const variance = cycleLengths.reduce((acc, cycle) => acc + Math.pow(cycle - averageCycle, 2), 0) / cycleLengths.length;
        const currentCycle = appearances.length > 0 ? 
          Math.floor((new Date().getTime() - new Date(appearances[appearances.length - 1]).getTime()) / (1000 * 60 * 60 * 24)) : 0;

        cycles.push({
          numero,
          average_cycle: Math.round(averageCycle),
          min_cycle: Math.min(...cycleLengths),
          max_cycle: Math.max(...cycleLengths),
          current_cycle: currentCycle,
          cycle_variance: Math.round(variance),
          last_appearance: appearances[appearances.length - 1],
          next_predicted: this.predictNextAppearance(appearances[appearances.length - 1], averageCycle),
          cycle_stability: variance < 100 ? 'stable' : variance < 500 ? 'variable' : 'irregular'
        });
      }
    }

    return cycles.sort((a, b) => a.average_cycle - b.average_cycle);
  }

  private predictNextAppearance(lastAppearance: string, averageCycle: number): string {
    const lastDate = new Date(lastAppearance);
    const nextDate = new Date(lastDate.getTime() + averageCycle * 24 * 60 * 60 * 1000);
    return nextDate.toISOString().split('T')[0];
  }

  /**
   * Analyse les patterns temporels
   */
  analyzeTemporalPatterns(): TemporalPatternAnalysis {
    const tirages = dataStorage.getAllTirages();
    const dayStats: { [key: string]: any } = {};
    const monthStats: { [key: string]: any } = {};
    const seasonStats: { [key: string]: any } = {};
    const yearStats: { [key: string]: any } = {};

    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    tirages.forEach(tirage => {
      const date = new Date(tirage.date);
      const dayName = dayNames[date.getDay()];
      const monthName = monthNames[date.getMonth()];
      const year = date.getFullYear().toString();
      const season = this.getSeason(date.getMonth());
      const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
      const sum = boules.reduce((acc, num) => acc + num, 0);

      // Statistiques par jour
      if (!dayStats[dayName]) {
        dayStats[dayName] = { frequency: 0, numbers: [], sums: [] };
      }
      dayStats[dayName].frequency++;
      dayStats[dayName].numbers.push(...boules);
      dayStats[dayName].sums.push(sum);

      // Statistiques par mois
      if (!monthStats[monthName]) {
        monthStats[monthName] = { frequency: 0, numbers: [], sums: [] };
      }
      monthStats[monthName].frequency++;
      monthStats[monthName].numbers.push(...boules);
      monthStats[monthName].sums.push(sum);

      // Statistiques par saison
      if (!seasonStats[season]) {
        seasonStats[season] = { frequency: 0, numbers: [], sums: [] };
      }
      seasonStats[season].frequency++;
      seasonStats[season].numbers.push(...boules);
      seasonStats[season].sums.push(sum);

      // Statistiques par année
      if (!yearStats[year]) {
        yearStats[year] = { frequency: 0, numbers: [], sums: [] };
      }
      yearStats[year].frequency++;
      yearStats[year].numbers.push(...boules);
      yearStats[year].sums.push(sum);
    });

    // Traitement des statistiques
    const processStats = (stats: any) => {
      const result: any = {};
      Object.keys(stats).forEach(key => {
        const stat = stats[key];
        const numberFreq = new Map<number, number>();
        stat.numbers.forEach((num: number) => {
          numberFreq.set(num, (numberFreq.get(num) || 0) + 1);
        });

        const hotNumbers = Array.from(numberFreq.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([num]) => num);

        const coldNumbers = Array.from(numberFreq.entries())
          .sort((a, b) => a[1] - b[1])
          .slice(0, 5)
          .map(([num]) => num);

        result[key] = {
          frequency: stat.frequency,
          percentage: (stat.frequency / tirages.length) * 100,
          hot_numbers: hotNumbers,
          cold_numbers: coldNumbers,
          average_sum: stat.sums.length > 0 ? stat.sums.reduce((acc: number, sum: number) => acc + sum, 0) / stat.sums.length : 0,
          most_common_numbers: hotNumbers
        };
      });
      return result;
    };

    return {
      day_of_week: processStats(dayStats),
      month_pattern: processStats(monthStats),
      season_pattern: processStats(seasonStats),
      year_pattern: processStats(yearStats)
    };
  }

  private getSeason(month: number): string {
    if (month >= 2 && month <= 4) return 'Printemps';
    if (month >= 5 && month <= 7) return 'Été';
    if (month >= 8 && month <= 10) return 'Automne';
    return 'Hiver';
  }

  /**
   * Analyse les corrélations entre numéros
   */
  analyzeCorrelations(): CorrelationAnalysis {
    const tirages = dataStorage.getAllTirages();
    const pairCorrelations: any[] = [];
    const trioCorrelations: any[] = [];
    const antiCorrelations: any[] = [];

    // Analyse des corrélations par paires
    for (let i = 1; i <= 49; i++) {
      for (let j = i + 1; j <= 49; j++) {
        let coOccurrence = 0;
        let totalOccurrences = 0;

        tirages.forEach(tirage => {
          const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
          const hasI = boules.includes(i);
          const hasJ = boules.includes(j);

          if (hasI || hasJ) {
            totalOccurrences++;
            if (hasI && hasJ) {
              coOccurrence++;
            }
          }
        });

        if (totalOccurrences > 0) {
          const observedFreq = coOccurrence / totalOccurrences;
          const expectedFreq = (5/49) * (5/49); // Probabilité théorique
          const correlationStrength = observedFreq / expectedFreq;

          if (correlationStrength > 1.5) {
            pairCorrelations.push({
              numero1: i,
              numero2: j,
              correlation_strength: correlationStrength,
              co_occurrence_frequency: coOccurrence,
              expected_frequency: expectedFreq * totalOccurrences,
              significance: correlationStrength > 2 ? 'high' : 'medium'
            });
          } else if (correlationStrength < 0.5) {
            antiCorrelations.push({
              numero1: i,
              numero2: j,
              avoidance_strength: 1 / correlationStrength,
              significance: correlationStrength < 0.3 ? 'high' : 'medium'
            });
          }
        }
      }
    }

    return {
      pair_correlations: pairCorrelations.sort((a, b) => b.correlation_strength - a.correlation_strength).slice(0, 20),
      trio_correlations: trioCorrelations,
      anti_correlations: antiCorrelations.sort((a, b) => b.avoidance_strength - a.avoidance_strength).slice(0, 20)
    };
  }

  /**
   * Analyse des probabilités conditionnelles
   */
  analyzeConditionalProbabilities(): ConditionalProbabilityAnalysis[] {
    const tirages = dataStorage.getAllTirages();
    const results: ConditionalProbabilityAnalysis[] = [];

    for (let numero = 1; numero <= 49; numero++) {
      const conditionalProbs: any[] = [];
      const companions: { [key: number]: number } = {};

      tirages.forEach(tirage => {
        const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
        if (boules.includes(numero)) {
          boules.forEach(companion => {
            if (companion !== numero) {
              companions[companion] = (companions[companion] || 0) + 1;
            }
          });
        }
      });

      const totalOccurrences = Object.values(companions).reduce((acc, count) => acc + count, 0);
      
      Object.entries(companions).forEach(([companion, count]) => {
        const probability = count / totalOccurrences;
        conditionalProbs.push({
          given_number: parseInt(companion),
          probability,
          confidence: count > 10 ? 'high' : count > 5 ? 'medium' : 'low',
          sample_size: count
        });
      });

      const mostLikely = conditionalProbs
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 5)
        .map(prob => ({ numero: prob.given_number, probability: prob.probability }));

      const leastLikely = conditionalProbs
        .sort((a, b) => a.probability - b.probability)
        .slice(0, 5)
        .map(prob => ({ numero: prob.given_number, probability: prob.probability }));

      results.push({
        numero,
        conditional_probabilities: conditionalProbs.slice(0, 10),
        most_likely_companions: mostLikely,
        least_likely_companions: leastLikely
      });
    }

    return results.filter(result => result.conditional_probabilities.length > 0);
  }

  /**
   * Analyse des patterns mathématiques
   */
  analyzeMathematicalPatterns(): MathematicalPatternAnalysis {
    const tirages = dataStorage.getAllTirages();
    const fibonacciSequences: any[] = [];
    const arithmeticSequences: any[] = [];
    const geometricSequences: any[] = [];
    let primeCount = 0;
    let squareCount = 0;
    const primeNumbers = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const perfectSquares = [1, 4, 9, 16, 25, 36, 49];
    const primeFreq: { [key: number]: number } = {};
    const squareFreq: { [key: number]: number } = {};

    tirages.forEach(tirage => {
      const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5].sort((a, b) => a - b);
      
      // Vérifier les séquences de Fibonacci
      const fibSequences = this.findFibonacciSequences(boules);
      fibSequences.forEach(seq => {
        const existing = fibonacciSequences.find(f => f.sequence.join(',') === seq.join(','));
        if (existing) {
          existing.frequency++;
          if (existing.examples.length < 5) {
            existing.examples.push({ date: tirage.date, numbers: boules });
          }
        } else {
          fibonacciSequences.push({
            sequence: seq,
            frequency: 1,
            examples: [{ date: tirage.date, numbers: boules }]
          });
        }
      });

      // Vérifier les séquences arithmétiques
      const arithSequences = this.findArithmeticSequences(boules);
      arithSequences.forEach(seq => {
        const diff = seq[1] - seq[0];
        const existing = arithmeticSequences.find(a => a.sequence.join(',') === seq.join(','));
        if (existing) {
          existing.frequency++;
        } else {
          arithmeticSequences.push({
            sequence: seq,
            difference: diff,
            frequency: 1
          });
        }
      });

      // Compter les nombres premiers et carrés parfaits
      boules.forEach(num => {
        if (primeNumbers.includes(num)) {
          primeCount++;
          primeFreq[num] = (primeFreq[num] || 0) + 1;
        }
        if (perfectSquares.includes(num)) {
          squareCount++;
          squareFreq[num] = (squareFreq[num] || 0) + 1;
        }
      });
    });

    return {
      fibonacci_sequences: fibonacciSequences.sort((a, b) => b.frequency - a.frequency).slice(0, 10),
      arithmetic_sequences: arithmeticSequences.sort((a, b) => b.frequency - a.frequency).slice(0, 10),
      geometric_sequences: geometricSequences,
      prime_numbers: {
        frequency: primeCount,
        percentage: (primeCount / (tirages.length * 5)) * 100,
        most_common_primes: Object.entries(primeFreq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([num]) => parseInt(num))
      },
      perfect_squares: {
        frequency: squareCount,
        percentage: (squareCount / (tirages.length * 5)) * 100,
        most_common_squares: Object.entries(squareFreq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([num]) => parseInt(num))
      }
    };
  }

  private findFibonacciSequences(numbers: number[]): number[][] {
    const sequences: number[][] = [];
    const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34];
    
    for (let i = 0; i < numbers.length - 1; i++) {
      for (let j = i + 1; j < numbers.length; j++) {
        const seq = [numbers[i], numbers[j]];
        if (fib.includes(numbers[i]) && fib.includes(numbers[j])) {
          sequences.push(seq);
        }
      }
    }
    
    return sequences;
  }

  private findArithmeticSequences(numbers: number[]): number[][] {
    const sequences: number[][] = [];
    
    for (let i = 0; i < numbers.length - 1; i++) {
      for (let j = i + 1; j < numbers.length; j++) {
        const diff = numbers[j] - numbers[i];
        const next = numbers[j] + diff;
        if (numbers.includes(next)) {
          sequences.push([numbers[i], numbers[j], next]);
        }
      }
    }
    
    return sequences;
  }

  /**
   * Détection d'anomalies
   */
  detectAnomalies(): AnomalyDetectionAnalysis {
    const tirages = dataStorage.getAllTirages();
    const outliers: any[] = [];
    const unusualPatterns: any[] = [];
    const rareEvents: any[] = [];

    // Calculer les statistiques de base
    const sums = tirages.map(t => [t.numero1, t.numero2, t.numero3, t.numero4, t.numero5].reduce((acc, num) => acc + num, 0));
    const meanSum = sums.reduce((acc, sum) => acc + sum, 0) / sums.length;
    const stdSum = Math.sqrt(sums.reduce((acc, sum) => acc + Math.pow(sum - meanSum, 2), 0) / sums.length);

    tirages.forEach(tirage => {
      const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
      const sum = boules.reduce((acc, num) => acc + num, 0);
      
      // Détecter les sommes extrêmes
      if (Math.abs(sum - meanSum) > 2 * stdSum) {
        outliers.push({
          date: tirage.date,
          numbers: boules,
          anomaly_type: 'extreme_sum',
          deviation_score: Math.abs(sum - meanSum) / stdSum,
          description: `Somme extrême: ${sum} (moyenne: ${meanSum.toFixed(1)})`
        });
      }

      // Détecter les patterns inhabituels
      const consecutiveCount = this.findConsecutiveSequences(boules.sort((a, b) => a - b)).length;
      if (consecutiveCount >= 3) {
        outliers.push({
          date: tirage.date,
          numbers: boules,
          anomaly_type: 'unusual_pattern',
          deviation_score: consecutiveCount,
          description: `${consecutiveCount} séquences consécutives`
        });
      }
    });

    return {
      outliers: outliers.sort((a, b) => b.deviation_score - a.deviation_score).slice(0, 20),
      unusual_patterns: unusualPatterns,
      rare_events: rareEvents
    };
  }

  private findConsecutiveSequences(numbers: number[]): number[][] {
    const sequences: number[][] = [];
    let currentSequence: number[] = [numbers[0]];

    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] === numbers[i - 1] + 1) {
        currentSequence.push(numbers[i]);
      } else {
        if (currentSequence.length >= 2) {
          sequences.push([...currentSequence]);
        }
        currentSequence = [numbers[i]];
      }
    }

    if (currentSequence.length >= 2) {
      sequences.push(currentSequence);
    }

    return sequences;
  }

  /**
   * Analyse des patterns géométriques
   */
  analyzeGeometricPatterns(): GeometricPatternAnalysis {
    const tirages = dataStorage.getAllTirages();
    const linearPatterns: any[] = [];
    const triangularPatterns: any[] = [];
    const circularPatterns: any[] = [];

    // Cette analyse nécessiterait une visualisation 2D des numéros
    // Pour l'instant, on se concentre sur des patterns simples
    
    return {
      linear_patterns: linearPatterns,
      triangular_patterns: triangularPatterns,
      circular_patterns: circularPatterns
    };
  }

  /**
   * Analyse de la complexité
   */
  analyzeComplexity(): ComplexityAnalysis {
    const tirages = dataStorage.getAllTirages();
    const entropyScores: any[] = [];
    const entropies: number[] = [];

    tirages.forEach(tirage => {
      const boules = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
      const entropy = this.calculateEntropy(boules);
      entropies.push(entropy);
      
      entropyScores.push({
        date: tirage.date,
        numbers: boules,
        entropy,
        complexity_level: entropy > 2.5 ? 'high' : entropy > 2.0 ? 'medium' : 'low'
      });
    });

    const avgEntropy = entropies.reduce((acc, e) => acc + e, 0) / entropies.length;
    const maxEntropy = Math.max(...entropies);
    const minEntropy = Math.min(...entropies);

    return {
      entropy_scores: entropyScores.slice(0, 50),
      information_content: {
        average_entropy: avgEntropy,
        max_entropy: maxEntropy,
        min_entropy: minEntropy,
        entropy_distribution: this.createEntropyDistribution(entropies)
      },
      pattern_diversity: {
        unique_patterns: new Set(entropyScores.map(e => e.complexity_level)).size,
        pattern_frequency_distribution: this.getPatternDistribution(entropyScores)
      }
    };
  }

  private calculateEntropy(numbers: number[]): number {
    const uniqueNumbers = new Set(numbers);
    const probabilities = Array.from(uniqueNumbers).map(num => 
      numbers.filter(n => n === num).length / numbers.length
    );
    
    return -probabilities.reduce((acc, p) => acc + p * Math.log2(p), 0);
  }

  private createEntropyDistribution(entropies: number[]): any[] {
    const ranges = [
      { min: 0, max: 2, label: 'Faible (0-2)' },
      { min: 2, max: 2.5, label: 'Moyenne (2-2.5)' },
      { min: 2.5, max: 3, label: 'Élevée (2.5-3)' }
    ];

    return ranges.map(range => ({
      entropy_range: range.label,
      frequency: entropies.filter(e => e >= range.min && e < range.max).length
    }));
  }

  private getPatternDistribution(entropyScores: any[]): any[] {
    const distribution: { [key: string]: number } = {};
    entropyScores.forEach(score => {
      distribution[score.complexity_level] = (distribution[score.complexity_level] || 0) + 1;
    });

    return Object.entries(distribution).map(([level, frequency]) => ({
      pattern_type: level,
      frequency
    }));
  }

  /**
   * Analyse ultra-avancée complète
   */
  getUltraAdvancedStatistics(): UltraAdvancedStatistics {
    return {
      recurrence_cycles: this.analyzeRecurrenceCycles(),
      temporal_patterns: this.analyzeTemporalPatterns(),
      correlations: this.analyzeCorrelations(),
      conditional_probabilities: this.analyzeConditionalProbabilities(),
      mathematical_patterns: this.analyzeMathematicalPatterns(),
      anomaly_detection: this.detectAnomalies(),
      geometric_patterns: this.analyzeGeometricPatterns(),
      complexity_analysis: this.analyzeComplexity()
    };
  }
}

export const ultraAnalysisEngine = new UltraAnalysisEngine();










