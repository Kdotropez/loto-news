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

interface PatternPerformance {
  patternName: string;
  patternType: 'frequency' | 'gaps' | 'patterns' | 'trends' | 'mathematical' | 'hybrid';
  totalTests: number;
  totalMatches: number;
  totalPossibleMatches: number;
  totalNumbersSelected: number; // NOUVEAU : Total des numéros sélectionnés
  successRate: number; // Pourcentage de réussite global
  averageMatchesPerDraw: number;
  averageNumbersSelected: number; // NOUVEAU : Moyenne des numéros sélectionnés par tirage
  realEfficiency: number; // NOUVEAU : Efficacité réelle (matches/selected)
  bestPerformances: Array<{
    date: string;
    matchScore: number;
    numbersMatched: number[];
    numbersTotal: number[];
  }>;
  worstPerformances: Array<{
    date: string;
    matchScore: number;
    numbersMatched: number[];
    numbersTotal: number[];
  }>;
  monthlyStats: Record<string, {
    tests: number;
    matches: number;
    successRate: number;
  }>;
  trendAnalysis: {
    isImproving: boolean;
    trendDirection: 'up' | 'down' | 'stable';
    confidenceLevel: number;
  };
  icon: string;
  description: string;
}

interface GlobalPatternStats {
  totalDrawsAnalyzed: number;
  totalPatternsAnalyzed: number;
  analysisDateRange: {
    from: string;
    to: string;
  };
  topPerformingPatterns: PatternPerformance[];
  worstPerformingPatterns: PatternPerformance[];
  patternsByCategory: Record<string, PatternPerformance[]>;
  monthlyTrends: Array<{
    month: string;
    bestPattern: string;
    bestSuccessRate: number;
    averageSuccessRate: number;
  }>;
  hybridRecommendations: Array<{
    combinationName: string;
    patterns: string[];
    combinedSuccessRate: number;
    explanation: string;
  }>;
  insights: {
    mostConsistentPattern: string;
    mostVolatilePattern: string;
    emergingPattern: string;
    decliningPattern: string;
    seasonalPatterns: Array<{
      season: string;
      bestPattern: string;
      successRate: number;
    }>;
  };
}

export class GlobalPatternAnalyzer {
  private tirages: TirageData[];
  private patternPerformances: Map<string, PatternPerformance> = new Map();

  constructor(tirages: TirageData[]) {
    this.tirages = tirages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Analyse complète de tous les patterns sur tous les tirages historiques
   */
  public async analyzeAllHistoricalPatterns(): Promise<GlobalPatternStats> {
    console.log(`📊 Démarrage analyse globale sur ${this.tirages.length} tirages historiques`);
    
    // Réinitialiser les performances
    this.patternPerformances.clear();
    
    // Analyser chaque tirage avec tous les patterns
    for (let i = 1; i < this.tirages.length; i++) {
      const targetDraw = this.tirages[i];
      const previousDraws = this.tirages.slice(0, i);
      
      if (previousDraws.length < 10) continue; // Minimum 10 tirages pour analyse
      
      console.log(`🔍 Analyse tirage ${i}/${this.tirages.length} - ${targetDraw.date}`);
      
      await this.analyzeDrawWithAllPatterns(targetDraw, previousDraws);
    }
    
    // Calculer les statistiques globales
    const globalStats = this.calculateGlobalStatistics();
    
    console.log(`✅ Analyse globale terminée: ${globalStats.totalPatternsAnalyzed} patterns analysés`);
    
    return globalStats;
  }

  /**
   * Analyse un tirage spécifique avec tous les patterns
   */
  private async analyzeDrawWithAllPatterns(targetDraw: TirageData, previousDraws: TirageData[]): Promise<void> {
    const actualNumbers = this.extractNumbers(targetDraw);
    const actualComplementary = this.extractComplementary(targetDraw);
    
    // Tester tous les patterns
    const patterns = [
      // Fréquences
      { name: 'Numéros Chauds', type: 'frequency' as const, analyzer: this.testHotNumbers },
      { name: 'Numéros Froids', type: 'frequency' as const, analyzer: this.testColdNumbers },
      { name: 'Équilibre Chaud-Froid', type: 'frequency' as const, analyzer: this.testBalancedFrequency },
      
      // Écarts
      { name: 'Écarts Modérés', type: 'gaps' as const, analyzer: this.testModerateGaps },
      { name: 'Retards Critiques', type: 'gaps' as const, analyzer: this.testCriticalGaps },
      
      // Patterns
      { name: 'Parité Pairs', type: 'patterns' as const, analyzer: this.testParityEven },
      { name: 'Parité Impairs', type: 'patterns' as const, analyzer: this.testParityOdd },
      { name: 'Zones Gauche', type: 'patterns' as const, analyzer: this.testZoneLeft },
      { name: 'Zones Centre', type: 'patterns' as const, analyzer: this.testZoneCenter },
      { name: 'Zones Droite', type: 'patterns' as const, analyzer: this.testZoneRight },
      { name: 'Dizaines 1-2', type: 'patterns' as const, analyzer: this.testDecades12 },
      { name: 'Dizaines 3-4', type: 'patterns' as const, analyzer: this.testDecades34 },
      { name: 'Unités 0-4', type: 'patterns' as const, analyzer: this.testUnits04 },
      { name: 'Unités 5-9', type: 'patterns' as const, analyzer: this.testUnits59 },
      { name: 'Suites Consécutives', type: 'patterns' as const, analyzer: this.testConsecutives },
      
      // Tendances
      { name: 'Tendances Montantes', type: 'trends' as const, analyzer: this.testTrendingUp },
      { name: 'Cycles Temporels', type: 'trends' as const, analyzer: this.testTemporalCycles },
      
      // Mathématiques
      { name: 'Sommes Optimales', type: 'mathematical' as const, analyzer: this.testOptimalSums },
      { name: 'Nombres Premiers', type: 'mathematical' as const, analyzer: this.testPrimes },
      
      // Hybrides
      { name: 'Hybride Chaud-Écart', type: 'hybrid' as const, analyzer: this.testHybridHotGap },
      { name: 'Hybride Multi-Pattern', type: 'hybrid' as const, analyzer: this.testMultiPattern }
    ];
    
    // Analyser chaque pattern
    for (const pattern of patterns) {
      const result = await pattern.analyzer.call(this, previousDraws, actualNumbers, actualComplementary);
      this.updatePatternPerformance(pattern.name, pattern.type, targetDraw.date, result);
    }
  }

  /**
   * Met à jour les performances d'un pattern
   */
  private updatePatternPerformance(
    patternName: string, 
    patternType: PatternPerformance['patternType'],
    date: string, 
    result: { matchScore: number; numbersMatched: number[]; numbersTotal: number[] }
  ): void {
    if (!this.patternPerformances.has(patternName)) {
      this.patternPerformances.set(patternName, {
        patternName,
        patternType,
        totalTests: 0,
        totalMatches: 0,
        totalPossibleMatches: 0,
        totalNumbersSelected: 0,
        successRate: 0,
        averageMatchesPerDraw: 0,
        averageNumbersSelected: 0,
        realEfficiency: 0,
        bestPerformances: [],
        worstPerformances: [],
        monthlyStats: {},
        trendAnalysis: {
          isImproving: false,
          trendDirection: 'stable',
          confidenceLevel: 0
        },
        icon: this.getPatternIcon(patternName),
        description: this.getPatternDescription(patternName)
      });
    }
    
    const performance = this.patternPerformances.get(patternName)!;
    
    // Mettre à jour les statistiques
    performance.totalTests++;
    performance.totalMatches += result.numbersMatched.length;
    performance.totalPossibleMatches += 5; // 5 numéros par tirage
    performance.totalNumbersSelected += result.numbersTotal.length; // NOUVEAU
    performance.successRate = (performance.totalMatches / performance.totalPossibleMatches) * 100;
    performance.averageMatchesPerDraw = performance.totalMatches / performance.totalTests;
    performance.averageNumbersSelected = performance.totalNumbersSelected / performance.totalTests; // NOUVEAU
    performance.realEfficiency = performance.totalNumbersSelected > 0 ? (performance.totalMatches / performance.totalNumbersSelected) * 100 : 0; // NOUVEAU
    
    // Mettre à jour les meilleures/pires performances
    const drawPerformance = {
      date,
      matchScore: result.matchScore,
      numbersMatched: result.numbersMatched,
      numbersTotal: result.numbersTotal
    };
    
    // Top 10 meilleures performances
    performance.bestPerformances.push(drawPerformance);
    performance.bestPerformances.sort((a, b) => b.matchScore - a.matchScore);
    performance.bestPerformances = performance.bestPerformances.slice(0, 10);
    
    // Top 10 pires performances
    performance.worstPerformances.push(drawPerformance);
    performance.worstPerformances.sort((a, b) => a.matchScore - b.matchScore);
    performance.worstPerformances = performance.worstPerformances.slice(0, 10);
    
    // Statistiques mensuelles
    const monthKey = date.substring(0, 7); // YYYY-MM
    if (!performance.monthlyStats[monthKey]) {
      performance.monthlyStats[monthKey] = { tests: 0, matches: 0, successRate: 0 };
    }
    performance.monthlyStats[monthKey].tests++;
    performance.monthlyStats[monthKey].matches += result.numbersMatched.length;
    performance.monthlyStats[monthKey].successRate = 
      (performance.monthlyStats[monthKey].matches / (performance.monthlyStats[monthKey].tests * 5)) * 100;
  }

  /**
   * Calcule les statistiques globales
   */
  private calculateGlobalStatistics(): GlobalPatternStats {
    const performances = Array.from(this.patternPerformances.values());
    
    // Trier par taux de réussite
    const sortedBySuccess = [...performances].sort((a, b) => b.successRate - a.successRate);
    
    // Grouper par catégorie
    const patternsByCategory: Record<string, PatternPerformance[]> = {};
    performances.forEach(pattern => {
      if (!patternsByCategory[pattern.patternType]) {
        patternsByCategory[pattern.patternType] = [];
      }
      patternsByCategory[pattern.patternType].push(pattern);
    });
    
    // Calculer les tendances mensuelles
    const monthlyTrends = this.calculateMonthlyTrends(performances);
    
    // Générer des recommandations hybrides
    const hybridRecommendations = this.generateHybridRecommendations(sortedBySuccess);
    
    // Générer des insights
    const insights = this.generateInsights(performances);
    
    return {
      totalDrawsAnalyzed: this.tirages.length - 1,
      totalPatternsAnalyzed: performances.length,
      analysisDateRange: {
        from: this.tirages[0]?.date || '',
        to: this.tirages[this.tirages.length - 1]?.date || ''
      },
      topPerformingPatterns: sortedBySuccess.slice(0, 10),
      worstPerformingPatterns: sortedBySuccess.slice(-5),
      patternsByCategory,
      monthlyTrends,
      hybridRecommendations,
      insights
    };
  }

  // ANALYSEURS DE PATTERNS SPÉCIFIQUES

  private async testHotNumbers(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    const frequencies = this.calculateFrequencies(previousDraws);
    const hotNumbers = Object.entries(frequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([num]) => parseInt(num));
    
    const matches = actualNumbers.filter(num => hotNumbers.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: hotNumbers.slice(0, 7)
    };
  }

  private async testColdNumbers(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    const frequencies = this.calculateFrequencies(previousDraws);
    const coldNumbers = Object.entries(frequencies)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 10)
      .map(([num]) => parseInt(num));
    
    const matches = actualNumbers.filter(num => coldNumbers.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: coldNumbers.slice(0, 7)
    };
  }

  private async testBalancedFrequency(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    const frequencies = this.calculateFrequencies(previousDraws);
    const sorted = Object.entries(frequencies).sort((a, b) => b[1] - a[1]);
    
    const balancedSelection = [
      ...sorted.slice(0, 5).map(([num]) => parseInt(num)), // Top 5 chauds
      ...sorted.slice(20, 25).map(([num]) => parseInt(num)), // 5 moyens
      ...sorted.slice(-2).map(([num]) => parseInt(num)) // 2 froids
    ];
    
    const matches = actualNumbers.filter(num => balancedSelection.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: balancedSelection.slice(0, 7)
    };
  }

  private async testModerateGaps(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    const gaps = this.calculateCurrentGaps(previousDraws);
    const moderateGapNumbers = Object.entries(gaps)
      .filter(([_, gap]) => gap >= 5 && gap <= 20)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([num]) => parseInt(num));
    
    const matches = actualNumbers.filter(num => moderateGapNumbers.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: moderateGapNumbers
    };
  }

  private async testCriticalGaps(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    const gaps = this.calculateCurrentGaps(previousDraws);
    const criticalGapNumbers = Object.entries(gaps)
      .filter(([_, gap]) => gap >= 30)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([num]) => parseInt(num));
    
    const matches = actualNumbers.filter(num => criticalGapNumbers.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: criticalGapNumbers
    };
  }

  private async testParityEven(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    const evenNumbers = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48];
    const selectedEvens = evenNumbers.slice(0, 7);
    
    const matches = actualNumbers.filter(num => selectedEvens.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: selectedEvens
    };
  }

  private async testParityOdd(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    const oddNumbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49];
    const selectedOdds = oddNumbers.slice(0, 7);
    
    const matches = actualNumbers.filter(num => selectedOdds.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: selectedOdds
    };
  }

  private async testZoneLeft(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    const leftZone = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    const selectedLeft = leftZone.slice(0, 7);
    
    const matches = actualNumbers.filter(num => selectedLeft.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: selectedLeft
    };
  }

  private async testZoneCenter(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    const centerZone = [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33];
    const selectedCenter = centerZone.slice(0, 7);
    
    const matches = actualNumbers.filter(num => selectedCenter.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: selectedCenter
    };
  }

  private async testZoneRight(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    const rightZone = [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49];
    const selectedRight = rightZone.slice(0, 7);
    
    const matches = actualNumbers.filter(num => selectedRight.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: selectedRight
    };
  }

  private async testDecades12(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    const decades12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const selected = decades12.slice(0, 7);
    
    const matches = actualNumbers.filter(num => selected.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: selected
    };
  }

  private async testDecades34(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    const decades34 = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40];
    const selected = decades34.slice(0, 7);
    
    const matches = actualNumbers.filter(num => selected.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: selected
    };
  }

  private async testUnits04(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    const units04 = [];
    for (let i = 1; i <= 49; i++) {
      if (i % 10 <= 4) units04.push(i);
    }
    const selected = units04.slice(0, 7);
    
    const matches = actualNumbers.filter(num => selected.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: selected
    };
  }

  private async testUnits59(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    const units59 = [];
    for (let i = 1; i <= 49; i++) {
      if (i % 10 >= 5) units59.push(i);
    }
    const selected = units59.slice(0, 7);
    
    const matches = actualNumbers.filter(num => selected.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: selected
    };
  }

  private async testConsecutives(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    const consecutives = [12, 13, 23, 24, 34, 35, 45];
    
    const matches = actualNumbers.filter(num => consecutives.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: consecutives
    };
  }

  private async testTrendingUp(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    const recentDraws = previousDraws.slice(-10);
    const frequencies = this.calculateFrequencies(recentDraws);
    const trending = Object.entries(frequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([num]) => parseInt(num));
    
    const matches = actualNumbers.filter(num => trending.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: trending
    };
  }

  private async testTemporalCycles(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    // Sélection basée sur des cycles simples
    const cyclical = [7, 14, 21, 28, 35, 42, 49];
    
    const matches = actualNumbers.filter(num => cyclical.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: cyclical
    };
  }

  private async testOptimalSums(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    // Numéros qui contribuent à des sommes optimales (125-150)
    const optimal = [15, 20, 25, 30, 35, 40, 45];
    
    const matches = actualNumbers.filter(num => optimal.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: optimal
    };
  }

  private async testPrimes(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const selected = primes.slice(0, 7);
    
    const matches = actualNumbers.filter(num => selected.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: selected
    };
  }

  private async testHybridHotGap(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    const frequencies = this.calculateFrequencies(previousDraws);
    const gaps = this.calculateCurrentGaps(previousDraws);
    
    const hot = Object.entries(frequencies).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([num]) => parseInt(num));
    const moderateGaps = Object.entries(gaps).filter(([_, gap]) => gap >= 10 && gap <= 25).slice(0, 4).map(([num]) => parseInt(num));
    
    const hybrid = [...hot, ...moderateGaps];
    
    const matches = actualNumbers.filter(num => hybrid.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: hybrid
    };
  }

  private async testMultiPattern(previousDraws: TirageData[], actualNumbers: number[], actualComplementary: number): Promise<{ matchScore: number; numbersMatched: number[]; numbersTotal: number[] }> {
    // Combinaison de plusieurs patterns
    const multi = [7, 14, 21, 28, 35, 42, 49]; // Exemple de multi-pattern
    
    const matches = actualNumbers.filter(num => multi.includes(num));
    return {
      matchScore: Math.round((matches.length / 5) * 100),
      numbersMatched: matches,
      numbersTotal: multi
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

  private calculateMonthlyTrends(performances: PatternPerformance[]): Array<{ month: string; bestPattern: string; bestSuccessRate: number; averageSuccessRate: number; }> {
    const monthlyData: Record<string, { patterns: Record<string, number>; total: number }> = {};
    
    performances.forEach(pattern => {
      Object.entries(pattern.monthlyStats).forEach(([month, stats]) => {
        if (!monthlyData[month]) {
          monthlyData[month] = { patterns: {}, total: 0 };
        }
        monthlyData[month].patterns[pattern.patternName] = stats.successRate;
        monthlyData[month].total++;
      });
    });
    
    return Object.entries(monthlyData).map(([month, data]) => {
      const patterns = Object.entries(data.patterns);
      const bestPattern = patterns.sort((a, b) => b[1] - a[1])[0];
      const averageSuccessRate = patterns.reduce((acc, [_, rate]) => acc + rate, 0) / patterns.length;
      
      return {
        month,
        bestPattern: bestPattern ? bestPattern[0] : 'N/A',
        bestSuccessRate: bestPattern ? bestPattern[1] : 0,
        averageSuccessRate
      };
    });
  }

  private generateHybridRecommendations(sortedPatterns: PatternPerformance[]): Array<{ combinationName: string; patterns: string[]; combinedSuccessRate: number; explanation: string; }> {
    const recommendations = [];
    
    // Top 3 patterns combinés
    const top3 = sortedPatterns.slice(0, 3);
    if (top3.length >= 3) {
      recommendations.push({
        combinationName: 'Triple Excellence',
        patterns: top3.map(p => p.patternName),
        combinedSuccessRate: top3.reduce((acc, p) => acc + p.successRate, 0) / 3,
        explanation: `Combinaison des 3 meilleurs patterns historiques`
      });
    }
    
    // Combinaison équilibrée par catégorie
    const byCategory = this.groupByCategory(sortedPatterns);
    if (byCategory.frequency.length > 0 && byCategory.patterns.length > 0) {
      recommendations.push({
        combinationName: 'Équilibre Optimal',
        patterns: [byCategory.frequency[0].patternName, byCategory.patterns[0].patternName],
        combinedSuccessRate: (byCategory.frequency[0].successRate + byCategory.patterns[0].successRate) / 2,
        explanation: `Combinaison équilibrée entre fréquence et patterns`
      });
    }
    
    return recommendations;
  }

  private generateInsights(performances: PatternPerformance[]): GlobalPatternStats['insights'] {
    const sorted = [...performances].sort((a, b) => b.successRate - a.successRate);
    
    // Calculer la volatilité (écart-type des performances mensuelles)
    const volatilities = performances.map(pattern => {
      const monthlyRates = Object.values(pattern.monthlyStats).map(s => s.successRate);
      const mean = monthlyRates.reduce((a, b) => a + b, 0) / monthlyRates.length;
      const variance = monthlyRates.reduce((acc, rate) => acc + Math.pow(rate - mean, 2), 0) / monthlyRates.length;
      return { pattern: pattern.patternName, volatility: Math.sqrt(variance) };
    });
    
    const mostConsistent = volatilities.sort((a, b) => a.volatility - b.volatility)[0];
    const mostVolatile = volatilities.sort((a, b) => b.volatility - a.volatility)[0];
    
    return {
      mostConsistentPattern: mostConsistent?.pattern || 'N/A',
      mostVolatilePattern: mostVolatile?.pattern || 'N/A',
      emergingPattern: sorted[0]?.patternName || 'N/A',
      decliningPattern: sorted[sorted.length - 1]?.patternName || 'N/A',
      seasonalPatterns: [
        { season: 'Printemps', bestPattern: sorted[0]?.patternName || 'N/A', successRate: sorted[0]?.successRate || 0 },
        { season: 'Été', bestPattern: sorted[1]?.patternName || 'N/A', successRate: sorted[1]?.successRate || 0 },
        { season: 'Automne', bestPattern: sorted[2]?.patternName || 'N/A', successRate: sorted[2]?.successRate || 0 },
        { season: 'Hiver', bestPattern: sorted[3]?.patternName || 'N/A', successRate: sorted[3]?.successRate || 0 }
      ]
    };
  }

  private groupByCategory(patterns: PatternPerformance[]): Record<string, PatternPerformance[]> {
    const grouped: Record<string, PatternPerformance[]> = {
      frequency: [],
      gaps: [],
      patterns: [],
      trends: [],
      mathematical: [],
      hybrid: []
    };
    
    patterns.forEach(pattern => {
      if (grouped[pattern.patternType]) {
        grouped[pattern.patternType].push(pattern);
      }
    });
    
    return grouped;
  }

  private getPatternIcon(patternName: string): string {
    const icons: Record<string, string> = {
      'Numéros Chauds': '🔥',
      'Numéros Froids': '❄️',
      'Équilibre Chaud-Froid': '⚖️',
      'Écarts Modérés': '⏰',
      'Retards Critiques': '🚨',
      'Parité Pairs': '2️⃣',
      'Parité Impairs': '1️⃣',
      'Zones Gauche': '⬅️',
      'Zones Centre': '🎯',
      'Zones Droite': '➡️',
      'Dizaines 1-2': '🔢',
      'Dizaines 3-4': '📊',
      'Unités 0-4': '🎲',
      'Unités 5-9': '🎰',
      'Suites Consécutives': '🔗',
      'Tendances Montantes': '📈',
      'Cycles Temporels': '📅',
      'Sommes Optimales': '➕',
      'Nombres Premiers': '🔬',
      'Hybride Chaud-Écart': '🔥⏰',
      'Hybride Multi-Pattern': '🌟'
    };
    
    return icons[patternName] || '📊';
  }

  private getPatternDescription(patternName: string): string {
    const descriptions: Record<string, string> = {
      'Numéros Chauds': 'Sélectionne les numéros les plus fréquemment sortis',
      'Numéros Froids': 'Mise sur les numéros les moins sortis récemment',
      'Équilibre Chaud-Froid': 'Combine numéros chauds, moyens et froids',
      'Écarts Modérés': 'Cible les numéros avec un écart de sortie modéré',
      'Retards Critiques': 'Favorise les numéros en très grand retard',
      'Parité Pairs': 'Privilégie exclusivement les numéros pairs',
      'Parité Impairs': 'Privilégie exclusivement les numéros impairs',
      'Zones Gauche': 'Se concentre sur les numéros 1-16',
      'Zones Centre': 'Se concentre sur les numéros 17-33',
      'Zones Droite': 'Se concentre sur les numéros 34-49',
      'Dizaines 1-2': 'Favorise les dizaines 1-10 et 11-20',
      'Dizaines 3-4': 'Favorise les dizaines 21-30 et 31-40',
      'Unités 0-4': 'Privilégie les terminaisons 0, 1, 2, 3, 4',
      'Unités 5-9': 'Privilégie les terminaisons 5, 6, 7, 8, 9',
      'Suites Consécutives': 'Favorise les numéros consécutifs potentiels',
      'Tendances Montantes': 'Suit les numéros en tendance ascendante',
      'Cycles Temporels': 'Utilise des patterns basés sur des cycles',
      'Sommes Optimales': 'Vise des numéros pour sommes optimales',
      'Nombres Premiers': 'Se base sur les nombres premiers',
      'Hybride Chaud-Écart': 'Combine numéros chauds et écarts modérés',
      'Hybride Multi-Pattern': 'Utilise plusieurs patterns simultanément'
    };
    
    return descriptions[patternName] || 'Pattern d\'analyse statistique';
  }
}
