export interface DrawResult {
  date: string;
  mainNumbers: number[];
  complementaryNumber: number;
  bonusNumber?: number;
}

export interface ProximityMatch {
  combinationId: string;
  combinationName: string;
  strategies: string[];
  combination: {
    mainNumbers: number[];
    complementaryNumber: number;
  };
  proximityScore: number;
  matches: {
    mainNumbers: number[];
    complementaryMatch: boolean;
    exactMatches: number;
    proximityDetails: {
      exactMainMatches: number;
      complementaryMatch: boolean;
      totalScore: number;
    };
  };
  rank: number;
}

export interface ProximityAnalysis {
  drawResult: DrawResult;
  totalCombinationsAnalyzed: number;
  bestMatches: ProximityMatch[];
  statistics: {
    exactMatches: number;
    nearMatches: number;
    complementaryMatches: number;
    averageProximityScore: number;
  };
  analyzedAt: string;
}

export class DrawProximityAnalyzer {
  private combinations: Array<{
    id: string;
    name: string;
    strategies: string[];
    combination: {
      mainNumbers: number[];
      complementaryNumber: number;
    };
  }> = [];

  /**
   * Initialise l'analyseur avec les combinaisons disponibles
   */
  public initialize(combinations: Array<{
    id: string;
    name: string;
    strategies: string[];
    combination: {
      mainNumbers: number[];
      complementaryNumber: number;
    };
  }>): void {
    this.combinations = combinations;
  }

  /**
   * Analyse la proximité d'un tirage avec toutes les combinaisons
   */
  public analyzeDrawProximity(drawResult: DrawResult): ProximityAnalysis {
    const allMatches: ProximityMatch[] = [];

    // Analyse chaque combinaison
    this.combinations.forEach(combination => {
      const proximityScore = this.calculateProximityScore(
        drawResult,
        combination.combination
      );

      const matchDetails = this.findMatches(
        drawResult,
        combination.combination
      );

      allMatches.push({
        combinationId: combination.id,
        combinationName: combination.name,
        strategies: combination.strategies,
        combination: combination.combination,
        proximityScore,
        matches: matchDetails,
        rank: 0 // Sera calculé après le tri
      });
    });

    // Trie par score de proximité (du plus élevé au plus bas)
    allMatches.sort((a, b) => b.proximityScore - a.proximityScore);

    // Assigne les rangs
    allMatches.forEach((match, index) => {
      match.rank = index + 1;
    });

    // Calcule les statistiques
    const statistics = this.calculateStatistics(allMatches, drawResult);

    return {
      drawResult,
      totalCombinationsAnalyzed: this.combinations.length,
      bestMatches: allMatches.slice(0, 20), // Top 20
      statistics,
      analyzedAt: new Date().toISOString()
    };
  }

  /**
   * Calcule le score de proximité entre un tirage et une combinaison
   */
  private calculateProximityScore(
    drawResult: DrawResult,
    combination: { mainNumbers: number[]; complementaryNumber: number }
  ): number {
    let score = 0;

    // Score pour les numéros principaux (0-5 points par numéro)
    const mainMatches = this.findMainNumberMatches(
      drawResult.mainNumbers,
      combination.mainNumbers
    );
    score += mainMatches.exactMatches * 5;
    score += mainMatches.nearMatches * 2; // Numéros proches (+/- 1)

    // Score pour le numéro complémentaire (10 points si exact)
    if (drawResult.complementaryNumber === combination.complementaryNumber) {
      score += 10;
    } else {
      // Score partiel pour proximité (5 points si +/- 1)
      const diff = Math.abs(drawResult.complementaryNumber - combination.complementaryNumber);
      if (diff === 1) {
        score += 5;
      }
    }

    // Bonus pour les combinaisons exactes
    if (mainMatches.exactMatches === 5 && 
        drawResult.complementaryNumber === combination.complementaryNumber) {
      score += 50; // Bonus majeur pour combinaison exacte
    }

    return score;
  }

  /**
   * Trouve les correspondances entre les numéros principaux
   */
  private findMainNumberMatches(
    drawNumbers: number[],
    combinationNumbers: number[]
  ): { exactMatches: number; nearMatches: number; matchedNumbers: number[] } {
    let exactMatches = 0;
    let nearMatches = 0;
    const matchedNumbers: number[] = [];

    combinationNumbers.forEach(comboNum => {
      if (drawNumbers.includes(comboNum)) {
        exactMatches++;
        matchedNumbers.push(comboNum);
      } else {
        // Vérifie la proximité (+/- 1)
        const isNear = drawNumbers.some(drawNum => 
          Math.abs(drawNum - comboNum) === 1
        );
        if (isNear) {
          nearMatches++;
        }
      }
    });

    return { exactMatches, nearMatches, matchedNumbers };
  }

  /**
   * Trouve les correspondances détaillées
   */
  private findMatches(
    drawResult: DrawResult,
    combination: { mainNumbers: number[]; complementaryNumber: number }
  ): ProximityMatch['matches'] {
    const mainMatches = this.findMainNumberMatches(
      drawResult.mainNumbers,
      combination.mainNumbers
    );

    const complementaryMatch = drawResult.complementaryNumber === combination.complementaryNumber;

    return {
      mainNumbers: mainMatches.matchedNumbers,
      complementaryMatch,
      exactMatches: mainMatches.exactMatches + (complementaryMatch ? 1 : 0),
      proximityDetails: {
        exactMainMatches: mainMatches.exactMatches,
        complementaryMatch,
        totalScore: this.calculateProximityScore(drawResult, combination)
      }
    };
  }

  /**
   * Calcule les statistiques globales
   */
  private calculateStatistics(
    matches: ProximityMatch[],
    drawResult: DrawResult
  ): ProximityAnalysis['statistics'] {
    const exactMatches = matches.filter(m => m.matches.exactMatches >= 4).length;
    const nearMatches = matches.filter(m => 
      m.matches.proximityDetails.exactMainMatches >= 3 || 
      m.proximityScore >= 15
    ).length;
    const complementaryMatches = matches.filter(m => m.matches.complementaryMatch).length;
    const averageProximityScore = matches.length > 0 ? 
      matches.reduce((sum, m) => sum + m.proximityScore, 0) / matches.length : 0;

    return {
      exactMatches,
      nearMatches,
      complementaryMatches,
      averageProximityScore
    };
  }

  /**
   * Trouve les combinaisons les plus proches d'un tirage spécifique
   */
  public findClosestCombinations(
    drawResult: DrawResult,
    limit: number = 10
  ): ProximityMatch[] {
    const analysis = this.analyzeDrawProximity(drawResult);
    return analysis.bestMatches.slice(0, limit);
  }

  /**
   * Analyse la performance des stratégies sur un tirage
   */
  public analyzeStrategyPerformance(drawResult: DrawResult): {
    strategy: string;
    averageProximityScore: number;
    bestScore: number;
    combinationsCount: number;
  }[] {
    const analysis = this.analyzeDrawProximity(drawResult);
    const strategyStats: Map<string, {
      totalScore: number;
      count: number;
      bestScore: number;
    }> = new Map();

    analysis.bestMatches.forEach(match => {
      match.strategies.forEach(strategy => {
        const current = strategyStats.get(strategy) || {
          totalScore: 0,
          count: 0,
          bestScore: 0
        };

        current.totalScore += match.proximityScore;
        current.count++;
        current.bestScore = Math.max(current.bestScore, match.proximityScore);

        strategyStats.set(strategy, current);
      });
    });

    return Array.from(strategyStats.entries()).map(([strategy, stats]) => ({
      strategy,
      averageProximityScore: stats.totalScore / stats.count,
      bestScore: stats.bestScore,
      combinationsCount: stats.count
    })).sort((a, b) => b.averageProximityScore - a.averageProximityScore);
  }

  /**
   * Génère un rapport détaillé
   */
  public generateDetailedReport(drawResult: DrawResult): string {
    const analysis = this.analyzeDrawProximity(drawResult);
    const strategyPerformance = this.analyzeStrategyPerformance(drawResult);

    let report = `🎯 RAPPORT D'ANALYSE DE PROXIMITÉ\n`;
    report += `=====================================\n\n`;
    report += `📅 Tirage analysé: ${drawResult.date}\n`;
    report += `🎲 Numéros: ${drawResult.mainNumbers.join(', ')} + ${drawResult.complementaryNumber}\n\n`;

    report += `📊 STATISTIQUES GLOBALES\n`;
    report += `------------------------\n`;
    report += `• Combinaisons analysées: ${analysis.totalCombinationsAnalyzed}\n`;
    report += `• Correspondances exactes (4+ numéros): ${analysis.statistics.exactMatches}\n`;
    report += `• Correspondances proches: ${analysis.statistics.nearMatches}\n`;
    report += `• Numéros complémentaires corrects: ${analysis.statistics.complementaryMatches}\n`;
    report += `• Score de proximité moyen: ${analysis.statistics.averageProximityScore.toFixed(2)}\n\n`;

    report += `🏆 TOP 5 DES MEILLEURES COMBINAISONS\n`;
    report += `-----------------------------------\n`;
    analysis.bestMatches.slice(0, 5).forEach((match, index) => {
      report += `${index + 1}. ${match.combinationName}\n`;
      report += `   Score: ${match.proximityScore} | Numéros: ${match.combination.mainNumbers.join(', ')} + ${match.combination.complementaryNumber}\n`;
      report += `   Correspondances: ${match.matches.mainNumbers.join(', ')} ${match.matches.complementaryMatch ? '+ complémentaire' : ''}\n`;
      report += `   Stratégies: ${match.strategies.join(', ')}\n\n`;
    });

    report += `📈 PERFORMANCE DES STRATÉGIES\n`;
    report += `-----------------------------\n`;
    strategyPerformance.slice(0, 5).forEach((perf, index) => {
      report += `${index + 1}. ${perf.strategy}: Score moyen ${perf.averageProximityScore.toFixed(2)} (Meilleur: ${perf.bestScore})\n`;
    });

    return report;
  }
}
