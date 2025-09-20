interface TirageData {
  date: string;
  numero1?: number;
  numero2?: number;
  numero3?: number;
  numero4?: number;
  numero5?: number;
  complementaire?: number;
  joker?: string | null;
  // Format alternatif
  boule_1?: number;
  boule_2?: number;
  boule_3?: number;
  boule_4?: number;
  boule_5?: number;
  numero_chance?: number;
}

interface StrategyEffectiveness {
  strategyName: string;
  strategyType: 'frequency' | 'gaps' | 'patterns' | 'trends' | 'mathematical';
  matchScore: number;
  numbersMatched: number[];
  numbersTotal: number[];
  complementaryMatch: boolean;
  explanation: string;
  confidence: number;
  icon: string;
}

interface RetroactiveResult {
  lastDraw: {
    date: string;
    numbers: number[];
    complementary: number;
    joker?: string;
  };
  bestStrategies: StrategyEffectiveness[];
  worstStrategies: StrategyEffectiveness[];
  hybridRecommendation: {
    combinedStrategies: string[];
    predictedNumbers: number[];
    predictedComplementary: number;
    totalScore: number;
    explanation: string;
  };
  analysisMetadata: {
    totalStrategiesTested: number;
    analysisDate: string;
    confidenceLevel: number;
  };
}

export class RetroactiveAnalyzer {
  private tirages: TirageData[];

  constructor(tirages: TirageData[]) {
    this.tirages = tirages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Analyse rétroactive du dernier tirage
   */
  public async analyzeLastDraw(lastDraw: TirageData, period: string = 'last20'): Promise<RetroactiveResult> {
    console.log(`🔍 Analyse rétroactive du tirage ${lastDraw.date}`);
    
    // Extraire les numéros du dernier tirage
    const actualNumbers = this.extractNumbers(lastDraw);
    const actualComplementary = this.extractComplementary(lastDraw);
    
    console.log(`🎯 Numéros réels: ${actualNumbers.join(', ')} + ${actualComplementary}`);
    
    // Obtenir les tirages précédents (sans inclure le dernier)
    const previousTirages = this.tirages.filter(t => 
      new Date(t.date).getTime() < new Date(lastDraw.date).getTime()
    );
    
    const filteredTirages = this.filterByPeriod(previousTirages, period);
    
    // Tester toutes les stratégies
    const strategies = await this.testAllStrategies(filteredTirages, actualNumbers, actualComplementary);
    
    // Trier par efficacité
    const sortedStrategies = strategies.sort((a, b) => b.matchScore - a.matchScore);
    
    // Séparer meilleures et pires
    const bestStrategies = sortedStrategies.slice(0, 5);
    const worstStrategies = sortedStrategies.slice(-2);
    
    // Calculer la recommandation hybride
    const hybridRecommendation = this.calculateHybridRecommendation(bestStrategies, actualNumbers, actualComplementary);
    
    return {
      lastDraw: {
        date: lastDraw.date,
        numbers: actualNumbers,
        complementary: actualComplementary,
        joker: lastDraw.joker || undefined
      },
      bestStrategies,
      worstStrategies,
      hybridRecommendation,
      analysisMetadata: {
        totalStrategiesTested: strategies.length,
        analysisDate: new Date().toISOString(),
        confidenceLevel: Math.round(bestStrategies.reduce((acc, s) => acc + s.confidence, 0) / bestStrategies.length)
      }
    };
  }

  /**
   * Analyse rétroactive d'un tirage spécifique
   */
  public async analyzeSpecificDraw(targetDraw: TirageData, period: string, strategiesToTest: string = 'all'): Promise<RetroactiveResult> {
    return this.analyzeLastDraw(targetDraw, period);
  }

  /**
   * Teste toutes les stratégies disponibles
   */
  private async testAllStrategies(tirages: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<StrategyEffectiveness[]> {
    const strategies: StrategyEffectiveness[] = [];
    
    // 1. Stratégies de fréquence
    strategies.push(await this.testHotNumbersStrategy(tirages, actualNumbers, actualComplementary));
    strategies.push(await this.testColdNumbersStrategy(tirages, actualNumbers, actualComplementary));
    strategies.push(await this.testBalancedFrequencyStrategy(tirages, actualNumbers, actualComplementary));
    
    // 2. Stratégies d'écarts
    strategies.push(await this.testGapsStrategy(tirages, actualNumbers, actualComplementary));
    strategies.push(await this.testCriticalGapsStrategy(tirages, actualNumbers, actualComplementary));
    
    // 3. Stratégies de patterns
    strategies.push(await this.testParityStrategy(tirages, actualNumbers, actualComplementary));
    strategies.push(await this.testZonesStrategy(tirages, actualNumbers, actualComplementary));
    strategies.push(await this.testDecadesStrategy(tirages, actualNumbers, actualComplementary));
    strategies.push(await this.testUnitsStrategy(tirages, actualNumbers, actualComplementary));
    strategies.push(await this.testConsecutiveStrategy(tirages, actualNumbers, actualComplementary));
    
    // 4. Stratégies de tendances
    strategies.push(await this.testTrendsStrategy(tirages, actualNumbers, actualComplementary));
    strategies.push(await this.testTemporalStrategy(tirages, actualNumbers, actualComplementary));
    
    // 5. Stratégies mathématiques
    strategies.push(await this.testSumStrategy(tirages, actualNumbers, actualComplementary));
    strategies.push(await this.testMathematicalStrategy(tirages, actualNumbers, actualComplementary));
    
    // 6. Stratégies hybrides
    strategies.push(await this.testHybridHotColdStrategy(tirages, actualNumbers, actualComplementary));
    
    return strategies;
  }

  // STRATÉGIES DE FRÉQUENCE

  private async testHotNumbersStrategy(tirages: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<StrategyEffectiveness> {
    const frequencies = this.calculateFrequencies(tirages);
    const hotNumbers = Object.entries(frequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([num]) => parseInt(num));
    
    const matches = actualNumbers.filter(num => hotNumbers.includes(num));
    const matchScore = Math.round((matches.length / 5) * 100);
    
    return {
      strategyName: 'Numéros Chauds Exclusivement',
      strategyType: 'frequency',
      matchScore,
      numbersMatched: matches,
      numbersTotal: hotNumbers.slice(0, 7),
      complementaryMatch: hotNumbers.slice(0, 7).includes(actualComplementary),
      explanation: `Cette stratégie sélectionne les ${hotNumbers.length} numéros les plus fréquents. Elle aurait trouvé ${matches.length}/5 numéros corrects.`,
      confidence: Math.min(95, matchScore + 20),
      icon: '🔥'
    };
  }

  private async testColdNumbersStrategy(tirages: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<StrategyEffectiveness> {
    const frequencies = this.calculateFrequencies(tirages);
    const coldNumbers = Object.entries(frequencies)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 10)
      .map(([num]) => parseInt(num));
    
    const matches = actualNumbers.filter(num => coldNumbers.includes(num));
    const matchScore = Math.round((matches.length / 5) * 100);
    
    return {
      strategyName: 'Numéros Froids Exclusivement',
      strategyType: 'frequency',
      matchScore,
      numbersMatched: matches,
      numbersTotal: coldNumbers.slice(0, 7),
      complementaryMatch: coldNumbers.slice(0, 7).includes(actualComplementary),
      explanation: `Cette stratégie mise sur les numéros les moins sortis récemment. Elle aurait trouvé ${matches.length}/5 numéros corrects.`,
      confidence: Math.min(95, matchScore + 15),
      icon: '❄️'
    };
  }

  private async testBalancedFrequencyStrategy(tirages: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<StrategyEffectiveness> {
    const frequencies = this.calculateFrequencies(tirages);
    const sortedByFreq = Object.entries(frequencies).sort((a, b) => b[1] - a[1]);
    
    // Prendre 3 chauds, 2 moyens, 2 froids
    const hotNumbers = sortedByFreq.slice(0, 10).map(([num]) => parseInt(num));
    const mediumNumbers = sortedByFreq.slice(15, 25).map(([num]) => parseInt(num));
    const coldNumbers = sortedByFreq.slice(-10).map(([num]) => parseInt(num));
    
    const balancedSelection = [
      ...hotNumbers.slice(0, 3),
      ...mediumNumbers.slice(0, 2),
      ...coldNumbers.slice(0, 2)
    ];
    
    const matches = actualNumbers.filter(num => balancedSelection.includes(num));
    const matchScore = Math.round((matches.length / 5) * 100);
    
    return {
      strategyName: 'Équilibre Fréquences (Chaud/Moyen/Froid)',
      strategyType: 'frequency',
      matchScore,
      numbersMatched: matches,
      numbersTotal: balancedSelection,
      complementaryMatch: balancedSelection.includes(actualComplementary),
      explanation: `Stratégie équilibrée combinant 3 numéros chauds, 2 moyens et 2 froids. Elle aurait trouvé ${matches.length}/5 numéros corrects.`,
      confidence: Math.min(95, matchScore + 25),
      icon: '⚖️'
    };
  }

  // STRATÉGIES D'ÉCARTS

  private async testGapsStrategy(tirages: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<StrategyEffectiveness> {
    const gaps = this.calculateCurrentGaps(tirages);
    const moderateGapNumbers = Object.entries(gaps)
      .filter(([_, gap]) => gap >= 10 && gap <= 30)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([num]) => parseInt(num));
    
    const matches = actualNumbers.filter(num => moderateGapNumbers.includes(num));
    const matchScore = Math.round((matches.length / 5) * 100);
    
    return {
      strategyName: 'Écarts Modérés (10-30 tirages)',
      strategyType: 'gaps',
      matchScore,
      numbersMatched: matches,
      numbersTotal: moderateGapNumbers,
      complementaryMatch: moderateGapNumbers.includes(actualComplementary),
      explanation: `Cette stratégie cible les numéros avec un écart modéré (ni trop récents, ni trop anciens). Elle aurait trouvé ${matches.length}/5 numéros corrects.`,
      confidence: Math.min(95, matchScore + 18),
      icon: '⏰'
    };
  }

  private async testCriticalGapsStrategy(tirages: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<StrategyEffectiveness> {
    const gaps = this.calculateCurrentGaps(tirages);
    const criticalGapNumbers = Object.entries(gaps)
      .filter(([_, gap]) => gap >= 40)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([num]) => parseInt(num));
    
    const matches = actualNumbers.filter(num => criticalGapNumbers.includes(num));
    const matchScore = Math.round((matches.length / 5) * 100);
    
    return {
      strategyName: 'Retards Critiques (40+ tirages)',
      strategyType: 'gaps',
      matchScore,
      numbersMatched: matches,
      numbersTotal: criticalGapNumbers,
      complementaryMatch: criticalGapNumbers.includes(actualComplementary),
      explanation: `Cette stratégie mise sur les numéros en très grand retard. Elle aurait trouvé ${matches.length}/5 numéros corrects.`,
      confidence: Math.min(95, matchScore + 12),
      icon: '🚨'
    };
  }

  // STRATÉGIES DE PATTERNS

  private async testParityStrategy(tirages: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<StrategyEffectiveness> {
    // Analyser la répartition pair/impair historique
    let totalPairs = 0;
    let totalImpairs = 0;
    
    tirages.forEach(tirage => {
      const numbers = this.extractNumbers(tirage);
      numbers.forEach(num => {
        if (num % 2 === 0) totalPairs++;
        else totalImpairs++;
      });
    });
    
    const pairRatio = totalPairs / (totalPairs + totalImpairs);
    const preferPairs = pairRatio > 0.5;
    
    // Sélectionner selon la tendance historique
    const selectedNumbers: number[] = [];
    for (let i = 1; i <= 49; i++) {
      if ((preferPairs && i % 2 === 0) || (!preferPairs && i % 2 === 1)) {
        selectedNumbers.push(i);
        if (selectedNumbers.length >= 7) break;
      }
    }
    
    const matches = actualNumbers.filter(num => selectedNumbers.includes(num));
    const matchScore = Math.round((matches.length / 5) * 100);
    
    return {
      strategyName: `Parité ${preferPairs ? 'Pairs' : 'Impairs'} Favorisés`,
      strategyType: 'patterns',
      matchScore,
      numbersMatched: matches,
      numbersTotal: selectedNumbers,
      complementaryMatch: false,
      explanation: `Basé sur l'analyse historique, les numéros ${preferPairs ? 'pairs' : 'impairs'} sont favorisés (${Math.round(pairRatio * 100)}%). Cette stratégie aurait trouvé ${matches.length}/5 numéros corrects.`,
      confidence: Math.min(95, matchScore + 20),
      icon: '⚖️'
    };
  }

  private async testZonesStrategy(tirages: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<StrategyEffectiveness> {
    // Zones: 1-16 (gauche), 17-33 (centre), 34-49 (droite)
    const zones = { gauche: 0, centre: 0, droite: 0 };
    
    tirages.forEach(tirage => {
      const numbers = this.extractNumbers(tirage);
      numbers.forEach(num => {
        if (num <= 16) zones.gauche++;
        else if (num <= 33) zones.centre++;
        else zones.droite++;
      });
    });
    
    // Identifier la zone la plus fréquente
    const bestZone = Object.entries(zones).sort((a, b) => b[1] - a[1])[0][0];
    
    let selectedNumbers: number[] = [];
    if (bestZone === 'gauche') {
      selectedNumbers = [1, 3, 7, 11, 13, 15, 16];
    } else if (bestZone === 'centre') {
      selectedNumbers = [17, 19, 23, 27, 29, 31, 33];
    } else {
      selectedNumbers = [34, 37, 39, 41, 43, 47, 49];
    }
    
    const matches = actualNumbers.filter(num => selectedNumbers.includes(num));
    const matchScore = Math.round((matches.length / 5) * 100);
    
    return {
      strategyName: `Zone ${bestZone.charAt(0).toUpperCase() + bestZone.slice(1)} Favorisée`,
      strategyType: 'patterns',
      matchScore,
      numbersMatched: matches,
      numbersTotal: selectedNumbers,
      complementaryMatch: false,
      explanation: `L'analyse des zones montre que la zone ${bestZone} est historiquement favorisée. Cette stratégie aurait trouvé ${matches.length}/5 numéros corrects.`,
      confidence: Math.min(95, matchScore + 15),
      icon: '🗺️'
    };
  }

  private async testDecadesStrategy(tirages: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<StrategyEffectiveness> {
    // Analyser les dizaines 1-10, 11-20, 21-30, 31-40, 41-49
    const decades = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    tirages.forEach(tirage => {
      const numbers = this.extractNumbers(tirage);
      numbers.forEach(num => {
        const decade = Math.min(5, Math.ceil(num / 10));
        decades[decade as keyof typeof decades]++;
      });
    });
    
    // Prendre les 2 meilleures dizaines
    const bestDecades = Object.entries(decades)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([d]) => parseInt(d));
    
    const selectedNumbers: number[] = [];
    bestDecades.forEach(decade => {
      const start = (decade - 1) * 10 + 1;
      const end = decade === 5 ? 49 : decade * 10;
      for (let i = start; i <= end && selectedNumbers.length < 7; i++) {
        selectedNumbers.push(i);
      }
    });
    
    const matches = actualNumbers.filter(num => selectedNumbers.includes(num));
    const matchScore = Math.round((matches.length / 5) * 100);
    
    return {
      strategyName: `Dizaines ${bestDecades.join(' et ')} Favorisées`,
      strategyType: 'patterns',
      matchScore,
      numbersMatched: matches,
      numbersTotal: selectedNumbers.slice(0, 7),
      complementaryMatch: false,
      explanation: `Les dizaines ${bestDecades.join(' et ')} sont historiquement les plus actives. Cette stratégie aurait trouvé ${matches.length}/5 numéros corrects.`,
      confidence: Math.min(95, matchScore + 17),
      icon: '🔢'
    };
  }

  private async testUnitsStrategy(tirages: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<StrategyEffectiveness> {
    // Analyser les unités 0,1,2,3,4,5,6,7,8,9
    const units: Record<number, number> = {};
    for (let i = 0; i <= 9; i++) units[i] = 0;
    
    tirages.forEach(tirage => {
      const numbers = this.extractNumbers(tirage);
      numbers.forEach(num => {
        const unit = num % 10;
        units[unit]++;
      });
    });
    
    // Prendre les 3 meilleures unités
    const bestUnits = Object.entries(units)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([u]) => parseInt(u));
    
    const selectedNumbers: number[] = [];
    for (let num = 1; num <= 49 && selectedNumbers.length < 7; num++) {
      if (bestUnits.includes(num % 10)) {
        selectedNumbers.push(num);
      }
    }
    
    const matches = actualNumbers.filter(num => selectedNumbers.includes(num));
    const matchScore = Math.round((matches.length / 5) * 100);
    
    return {
      strategyName: `Unités ${bestUnits.join(', ')} Favorisées`,
      strategyType: 'patterns',
      matchScore,
      numbersMatched: matches,
      numbersTotal: selectedNumbers,
      complementaryMatch: false,
      explanation: `Les terminaisons ${bestUnits.join(', ')} sont statistiquement favorisées. Cette stratégie aurait trouvé ${matches.length}/5 numéros corrects.`,
      confidence: Math.min(95, matchScore + 16),
      icon: '🎯'
    };
  }

  private async testConsecutiveStrategy(tirages: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<StrategyEffectiveness> {
    // Analyser la fréquence des suites consécutives
    let consecutiveCount = 0;
    
    tirages.forEach(tirage => {
      const numbers = this.extractNumbers(tirage).sort((a, b) => a - b);
      for (let i = 0; i < numbers.length - 1; i++) {
        if (numbers[i + 1] - numbers[i] === 1) {
          consecutiveCount++;
          break;
        }
      }
    });
    
    const consecutiveRate = consecutiveCount / tirages.length;
    
    // Si les consécutifs sont fréquents, favoriser les numéros avec des voisins
    const selectedNumbers = consecutiveRate > 0.3 
      ? [12, 13, 23, 24, 34, 35, 45] // Numéros avec voisins potentiels
      : [7, 15, 22, 29, 36, 41, 48]; // Numéros isolés
    
    const matches = actualNumbers.filter(num => selectedNumbers.includes(num));
    const matchScore = Math.round((matches.length / 5) * 100);
    
    return {
      strategyName: consecutiveRate > 0.3 ? 'Favorise les Suites' : 'Évite les Suites',
      strategyType: 'patterns',
      matchScore,
      numbersMatched: matches,
      numbersTotal: selectedNumbers,
      complementaryMatch: false,
      explanation: `Les suites consécutives apparaissent dans ${Math.round(consecutiveRate * 100)}% des tirages. Cette stratégie ${consecutiveRate > 0.3 ? 'favorise' : 'évite'} les numéros consécutifs et aurait trouvé ${matches.length}/5 numéros corrects.`,
      confidence: Math.min(95, matchScore + 14),
      icon: '🔗'
    };
  }

  // STRATÉGIES DE TENDANCES

  private async testTrendsStrategy(tirages: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<StrategyEffectiveness> {
    // Analyser les tendances sur les 3 dernières périodes
    const recentTirages = tirages.slice(-30);
    const frequencies = this.calculateFrequencies(recentTirages);
    
    // Numéros en tendance montante (plus fréquents récemment)
    const trendingNumbers = Object.entries(frequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([num]) => parseInt(num));
    
    const matches = actualNumbers.filter(num => trendingNumbers.includes(num));
    const matchScore = Math.round((matches.length / 5) * 100);
    
    return {
      strategyName: 'Tendances Montantes Récentes',
      strategyType: 'trends',
      matchScore,
      numbersMatched: matches,
      numbersTotal: trendingNumbers,
      complementaryMatch: false,
      explanation: `Cette stratégie identifie les numéros en tendance montante sur les 30 derniers tirages. Elle aurait trouvé ${matches.length}/5 numéros corrects.`,
      confidence: Math.min(95, matchScore + 19),
      icon: '📈'
    };
  }

  private async testTemporalStrategy(tirages: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<StrategyEffectiveness> {
    // Analyser les patterns selon le jour de la semaine du dernier tirage
    const lastDrawDate = new Date(tirages[tirages.length - 1].date);
    const dayOfWeek = lastDrawDate.getDay();
    
    // Sélection basée sur le jour (exemple simplifié)
    let selectedNumbers: number[];
    switch (dayOfWeek) {
      case 1: // Lundi
        selectedNumbers = [1, 8, 15, 22, 29, 36, 43];
        break;
      case 3: // Mercredi  
        selectedNumbers = [3, 10, 17, 24, 31, 38, 45];
        break;
      case 6: // Samedi
        selectedNumbers = [6, 13, 20, 27, 34, 41, 48];
        break;
      default:
        selectedNumbers = [7, 14, 21, 28, 35, 42, 49];
    }
    
    const matches = actualNumbers.filter(num => selectedNumbers.includes(num));
    const matchScore = Math.round((matches.length / 5) * 100);
    
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    
    return {
      strategyName: `Pattern ${dayNames[dayOfWeek]}`,
      strategyType: 'trends',
      matchScore,
      numbersMatched: matches,
      numbersTotal: selectedNumbers,
      complementaryMatch: false,
      explanation: `Cette stratégie utilise des patterns spécifiques au jour du tirage (${dayNames[dayOfWeek]}). Elle aurait trouvé ${matches.length}/5 numéros corrects.`,
      confidence: Math.min(95, matchScore + 13),
      icon: '📅'
    };
  }

  // STRATÉGIES MATHÉMATIQUES

  private async testSumStrategy(tirages: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<StrategyEffectiveness> {
    // Calculer la somme moyenne des tirages
    const sums = tirages.map(tirage => {
      const numbers = this.extractNumbers(tirage);
      return numbers.reduce((acc, num) => acc + num, 0);
    });
    
    const averageSum = sums.reduce((acc, sum) => acc + sum, 0) / sums.length;
    const targetSum = Math.round(averageSum);
    
    // Sélectionner des numéros qui se rapprochent de cette somme moyenne
    const selectedNumbers = this.findNumbersForTargetSum(targetSum);
    
    const matches = actualNumbers.filter(num => selectedNumbers.includes(num));
    const matchScore = Math.round((matches.length / 5) * 100);
    
    return {
      strategyName: `Somme Optimale (~${targetSum})`,
      strategyType: 'mathematical',
      matchScore,
      numbersMatched: matches,
      numbersTotal: selectedNumbers,
      complementaryMatch: selectedNumbers.includes(actualComplementary),
      explanation: `Cette stratégie vise une somme proche de la moyenne historique (${targetSum}). Elle aurait trouvé ${matches.length}/5 numéros corrects.`,
      confidence: Math.min(95, matchScore + 16),
      icon: '📊'
    };
  }

  private async testMathematicalStrategy(tirages: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<StrategyEffectiveness> {
    // Stratégie basée sur les nombres premiers et carrés parfaits
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const squares = [1, 4, 9, 16, 25, 36, 49];
    
    // Mix de nombres premiers et carrés
    const selectedNumbers = [...primes.slice(0, 4), ...squares.slice(0, 3)];
    
    const matches = actualNumbers.filter(num => selectedNumbers.includes(num));
    const matchScore = Math.round((matches.length / 5) * 100);
    
    return {
      strategyName: 'Nombres Premiers + Carrés Parfaits',
      strategyType: 'mathematical',
      matchScore,
      numbersMatched: matches,
      numbersTotal: selectedNumbers,
      complementaryMatch: false,
      explanation: `Cette stratégie combine nombres premiers et carrés parfaits. Elle aurait trouvé ${matches.length}/5 numéros corrects.`,
      confidence: Math.min(95, matchScore + 12),
      icon: '🔬'
    };
  }

  // STRATÉGIES HYBRIDES

  private async testHybridHotColdStrategy(tirages: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<StrategyEffectiveness> {
    const frequencies = this.calculateFrequencies(tirages);
    const gaps = this.calculateCurrentGaps(tirages);
    
    const sortedByFreq = Object.entries(frequencies).sort((a, b) => b[1] - a[1]);
    const hotNumbers = sortedByFreq.slice(0, 5).map(([num]) => parseInt(num));
    
    const moderateGaps = Object.entries(gaps)
      .filter(([_, gap]) => gap >= 15 && gap <= 35)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([num]) => parseInt(num));
    
    const selectedNumbers = [...hotNumbers.slice(0, 3), ...moderateGaps.slice(0, 2)];
    
    const matches = actualNumbers.filter(num => selectedNumbers.includes(num));
    const matchScore = Math.round((matches.length / 5) * 100);
    
    return {
      strategyName: 'Hybride Chauds + Écarts Modérés',
      strategyType: 'frequency',
      matchScore,
      numbersMatched: matches,
      numbersTotal: selectedNumbers,
      complementaryMatch: false,
      explanation: `Cette stratégie combine 3 numéros chauds avec 2 numéros à écart modéré. Elle aurait trouvé ${matches.length}/5 numéros corrects.`,
      confidence: Math.min(95, matchScore + 22),
      icon: '🔥❄️'
    };
  }

  // MÉTHODES UTILITAIRES

  private extractNumbers(tirage: TirageData): number[] {
    if (tirage.numero1) {
      return [tirage.numero1, tirage.numero2!, tirage.numero3!, tirage.numero4!, tirage.numero5!];
    } else if (tirage.boule_1) {
      return [tirage.boule_1, tirage.boule_2!, tirage.boule_3!, tirage.boule_4!, tirage.boule_5!];
    }
    return [];
  }

  private extractComplementary(tirage: TirageData): number {
    return tirage.complementaire || tirage.numero_chance || 1;
  }

  private calculateFrequencies(tirages: TirageData[]): Record<number, number> {
    const frequencies: Record<number, number> = {};
    
    for (let i = 1; i <= 49; i++) {
      frequencies[i] = 0;
    }
    
    tirages.forEach(tirage => {
      const numbers = this.extractNumbers(tirage);
      numbers.forEach(num => {
        if (num >= 1 && num <= 49) {
          frequencies[num]++;
        }
      });
    });
    
    return frequencies;
  }

  private calculateCurrentGaps(tirages: TirageData[]): Record<number, number> {
    const gaps: Record<number, number> = {};
    const lastAppearance: Record<number, number> = {};
    
    // Initialiser
    for (let i = 1; i <= 49; i++) {
      gaps[i] = tirages.length;
      lastAppearance[i] = -1;
    }
    
    // Calculer les dernières apparitions
    tirages.forEach((tirage, index) => {
      const numbers = this.extractNumbers(tirage);
      numbers.forEach(num => {
        if (num >= 1 && num <= 49) {
          lastAppearance[num] = index;
        }
      });
    });
    
    // Calculer les écarts actuels
    for (let i = 1; i <= 49; i++) {
      if (lastAppearance[i] >= 0) {
        gaps[i] = tirages.length - 1 - lastAppearance[i];
      }
    }
    
    return gaps;
  }

  private findNumbersForTargetSum(targetSum: number): number[] {
    // Algorithme simple pour trouver des numéros qui se rapprochent de la somme cible
    const selectedNumbers: number[] = [];
    let currentSum = 0;
    
    // Commencer par des numéros moyens et ajuster
    const candidates = [10, 15, 20, 25, 30, 35, 40, 5, 45, 12, 18, 22, 28, 33];
    
    for (const num of candidates) {
      if (selectedNumbers.length < 7 && currentSum + num <= targetSum + 20) {
        selectedNumbers.push(num);
        currentSum += num;
      }
    }
    
    return selectedNumbers.slice(0, 7);
  }

  private filterByPeriod(tirages: TirageData[], period: string): TirageData[] {
    const sortedTirages = [...tirages].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    switch (period) {
      case 'week':
        return sortedTirages.slice(0, 2);
      case 'month':
        return sortedTirages.slice(0, 8);
      case 'year':
        return sortedTirages.slice(0, 104);
      case 'last20':
        return sortedTirages.slice(0, 20);
      case 'last50':
        return sortedTirages.slice(0, 50);
      case 'last100':
        return sortedTirages.slice(0, 100);
      case 'all':
      default:
        return sortedTirages;
    }
  }

  private calculateHybridRecommendation(
    bestStrategies: StrategyEffectiveness[], 
    actualNumbers: number[], 
    actualComplementary: number
  ): {
    combinedStrategies: string[];
    predictedNumbers: number[];
    predictedComplementary: number;
    totalScore: number;
    explanation: string;
    totalNumbersSelected: number;
    efficiency: number;
  } {
    // Filtrer seulement les stratégies qui ont trouvé au moins un numéro
    const strategiesWithMatches = bestStrategies.filter(strategy => strategy.numbersMatched.length > 0);
    
    // Combiner les numéros de TOUTES les stratégies qui ont trouvé quelque chose
    const allPredictedNumbers = new Set<number>();
    const strategyNames: string[] = [];
    
    strategiesWithMatches.forEach(strategy => {
      strategy.numbersTotal.forEach(num => allPredictedNumbers.add(num));
      strategyNames.push(strategy.strategyName.split(' ')[0]); // Premier mot
    });
    
    const combinedNumbers = Array.from(allPredictedNumbers);
    
    // CALCUL HONNÊTE : Combien de numéros différents au total ?
    const totalNumbersSelected = combinedNumbers.length;
    
    // Calculer le score de correspondance RÉEL - TOUS les numéros trouvés
    const matches = actualNumbers.filter(num => combinedNumbers.includes(num));
    const rawScore = (matches.length / 5) * 100;
    
    // Calculer l'EFFICACITÉ RÉELLE (pénaliser si trop de numéros)
    const efficiency = totalNumbersSelected > 0 ? (matches.length / totalNumbersSelected) * 100 : 0;
    
    // Score ajusté selon l'efficacité
    let adjustedScore = rawScore;
    if (totalNumbersSelected > 20) {
      // Pénaliser fortement si plus de 20 numéros
      adjustedScore = rawScore * (20 / totalNumbersSelected);
    } else if (totalNumbersSelected > 15) {
      // Pénaliser légèrement si plus de 15 numéros
      adjustedScore = rawScore * 0.9;
    }
    
    // Vérifier le complémentaire dans les stratégies qui ont un match complémentaire
    const complementaryMatch = bestStrategies.some(strategy => strategy.complementaryMatch);
    
    return {
      combinedStrategies: strategyNames,
      predictedNumbers: matches.sort((a, b) => a - b), // CORRIGÉ : Tous les numéros trouvés, triés
      predictedComplementary: complementaryMatch ? actualComplementary : 0,
      totalScore: Math.round(adjustedScore),
      totalNumbersSelected,
      efficiency: Math.round(efficiency * 10) / 10,
      explanation: `En combinant ${strategyNames.length} stratégies → ${totalNumbersSelected} numéros sélectionnés → ${matches.length}/5 trouvés (${matches.sort((a, b) => a - b).join(', ')}) → Efficacité réelle: ${efficiency.toFixed(1)}% (${matches.length}/${totalNumbersSelected})`
    };
  }
}
