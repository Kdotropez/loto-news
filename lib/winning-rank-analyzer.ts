interface TirageData {
  date: string;
  numero1?: number;
  numero2?: number;
  numero3?: number;
  numero4?: number;
  numero5?: number;
  complementaire?: number;
  joker?: string | null;
  boule_1?: number;
  boule_2?: number;
  boule_3?: number;
  boule_4?: number;
  boule_5?: number;
  numero_chance?: number;
}

interface RankAnalysis {
  rank: 1 | 2 | 3 | 4 | 5;
  description: string;
  requiredMatch: {
    mainNumbers: number;
    complementary: boolean;
  };
  strategiesThatWouldWin: Array<{
    strategyName: string;
    patterns: string[];
    numbersGenerated: number[];
    complementaryGenerated: number[];
    matchedMainNumbers: number[];
    matchedComplementary: boolean;
    efficiency: number; // matches/total_generated
    wouldWinThisRank: boolean;
    explanation: string;
  }>;
  bestStrategyForThisRank: {
    name: string;
    efficiency: number;
    numbersUsed: number;
    explanation: string;
  };
}

interface CompleteWinningAnalysis {
  targetDraw: {
    date: string;
    numbers: number[];
    complementary: number;
  };
  rankAnalyses: RankAnalysis[];
  overallBestStrategies: Array<{
    strategyName: string;
    totalRanksWon: number;
    highestRank: number;
    efficiency: number;
    numbersUsed: number;
    explanation: string;
  }>;
  strategicInsights: {
    mostVersatileStrategy: string; // Gagne le plus de rangs différents
    mostEfficientStrategy: string; // Meilleur ratio succès/numéros
    bestForJackpot: string; // Meilleur pour rang 1
    bestForFrequentWins: string; // Meilleur pour rangs 3-5
  };
}

export class WinningRankAnalyzer {
  private tirages: TirageData[];

  constructor(tirages: TirageData[]) {
    this.tirages = tirages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Analyse complète des rangs de gain pour un tirage donné
   */
  public async analyzeWinningRanks(targetDraw: TirageData, previousDraws: TirageData[]): Promise<CompleteWinningAnalysis> {
    console.log(`🎯 Analyse des rangs de gain pour ${targetDraw.date}`);
    
    const actualNumbers = this.extractNumbers(targetDraw);
    const actualComplementary = this.extractComplementary(targetDraw);
    
    console.log(`🎲 Tirage réel: ${actualNumbers.join(', ')} + ${actualComplementary}`);
    
    // Analyser chaque rang de gain
    const rankAnalyses: RankAnalysis[] = [
      await this.analyzeRank1(actualNumbers, actualComplementary, previousDraws), // 5+1
      await this.analyzeRank2(actualNumbers, actualComplementary, previousDraws), // 5
      await this.analyzeRank3(actualNumbers, actualComplementary, previousDraws), // 4+1
      await this.analyzeRank4(actualNumbers, actualComplementary, previousDraws), // 4
      await this.analyzeRank5(actualNumbers, actualComplementary, previousDraws)  // 3
    ];
    
    // Identifier les meilleures stratégies globales
    const overallBestStrategies = this.calculateOverallBestStrategies(rankAnalyses);
    
    // Générer les insights stratégiques
    const strategicInsights = this.generateStrategicInsights(rankAnalyses, overallBestStrategies);
    
    return {
      targetDraw: {
        date: targetDraw.date,
        numbers: actualNumbers,
        complementary: actualComplementary
      },
      rankAnalyses,
      overallBestStrategies,
      strategicInsights
    };
  }

  /**
   * Analyse Rang 1 : 5 numéros + complémentaire
   */
  private async analyzeRank1(actualNumbers: number[], actualComplementary: number, previousDraws: TirageData[]): Promise<RankAnalysis> {
    const strategies = await this.generateAllStrategies(previousDraws);
    const strategiesThatWouldWin = [];
    
    for (const strategy of strategies) {
      const mainMatches = actualNumbers.filter(num => strategy.numbersGenerated.includes(num));
      const complementaryMatch = strategy.complementaryGenerated.includes(actualComplementary);
      
      const wouldWin = mainMatches.length === 5 && complementaryMatch;
      const efficiency = wouldWin ? 100 : 0; // Tout ou rien pour le jackpot
      
      strategiesThatWouldWin.push({
        strategyName: strategy.name,
        patterns: strategy.patterns,
        numbersGenerated: strategy.numbersGenerated,
        complementaryGenerated: strategy.complementaryGenerated,
        matchedMainNumbers: mainMatches,
        matchedComplementary: complementaryMatch,
        efficiency,
        wouldWinThisRank: wouldWin,
        explanation: wouldWin 
          ? `🏆 JACKPOT ! Cette stratégie aurait trouvé les 5 numéros (${mainMatches.join(', ')}) + le complémentaire (${actualComplementary})`
          : `❌ Manqué: ${5 - mainMatches.length} numéro(s) et/ou complémentaire`
      });
    }
    
    // Trier par efficacité (les gagnants d'abord)
    strategiesThatWouldWin.sort((a, b) => b.efficiency - a.efficiency);
    
    const winners = strategiesThatWouldWin.filter(s => s.wouldWinThisRank);
    const bestStrategy = winners.length > 0 
      ? winners.sort((a, b) => a.numbersGenerated.length - b.numbersGenerated.length)[0] // Le plus efficace = moins de numéros
      : strategiesThatWouldWin[0];
    
    return {
      rank: 1,
      description: "Jackpot (5 numéros + complémentaire)",
      requiredMatch: { mainNumbers: 5, complementary: true },
      strategiesThatWouldWin,
      bestStrategyForThisRank: {
        name: bestStrategy.strategyName,
        efficiency: bestStrategy.efficiency,
        numbersUsed: bestStrategy.numbersGenerated.length,
        explanation: bestStrategy.explanation
      }
    };
  }

  /**
   * Analyse Rang 2 : 5 numéros (sans complémentaire)
   */
  private async analyzeRank2(actualNumbers: number[], actualComplementary: number, previousDraws: TirageData[]): Promise<RankAnalysis> {
    const strategies = await this.generateAllStrategies(previousDraws);
    const strategiesThatWouldWin = [];
    
    for (const strategy of strategies) {
      const mainMatches = actualNumbers.filter(num => strategy.numbersGenerated.includes(num));
      const complementaryMatch = strategy.complementaryGenerated.includes(actualComplementary);
      
      const wouldWin = mainMatches.length === 5 && !complementaryMatch;
      const efficiency = mainMatches.length === 5 ? (wouldWin ? 90 : 85) : (mainMatches.length / 5) * 80;
      
      strategiesThatWouldWin.push({
        strategyName: strategy.name,
        patterns: strategy.patterns,
        numbersGenerated: strategy.numbersGenerated,
        complementaryGenerated: strategy.complementaryGenerated,
        matchedMainNumbers: mainMatches,
        matchedComplementary: complementaryMatch,
        efficiency,
        wouldWinThisRank: wouldWin,
        explanation: wouldWin 
          ? `🥈 Rang 2 ! Trouvé les 5 numéros (${mainMatches.join(', ')}) mais pas le complémentaire`
          : `Trouvé ${mainMatches.length}/5 numéros principaux`
      });
    }
    
    strategiesThatWouldWin.sort((a, b) => b.efficiency - a.efficiency);
    
    const winners = strategiesThatWouldWin.filter(s => s.wouldWinThisRank);
    const bestStrategy = winners.length > 0 
      ? winners.sort((a, b) => a.numbersGenerated.length - b.numbersGenerated.length)[0]
      : strategiesThatWouldWin[0];
    
    return {
      rank: 2,
      description: "Rang 2 (5 numéros, sans complémentaire)",
      requiredMatch: { mainNumbers: 5, complementary: false },
      strategiesThatWouldWin,
      bestStrategyForThisRank: {
        name: bestStrategy.strategyName,
        efficiency: bestStrategy.efficiency,
        numbersUsed: bestStrategy.numbersGenerated.length,
        explanation: bestStrategy.explanation
      }
    };
  }

  /**
   * Analyse Rang 3 : 4 numéros + complémentaire
   */
  private async analyzeRank3(actualNumbers: number[], actualComplementary: number, previousDraws: TirageData[]): Promise<RankAnalysis> {
    const strategies = await this.generateAllStrategies(previousDraws);
    const strategiesThatWouldWin = [];
    
    for (const strategy of strategies) {
      const mainMatches = actualNumbers.filter(num => strategy.numbersGenerated.includes(num));
      const complementaryMatch = strategy.complementaryGenerated.includes(actualComplementary);
      
      const wouldWin = mainMatches.length === 4 && complementaryMatch;
      const efficiency = mainMatches.length >= 4 && complementaryMatch ? 75 : (mainMatches.length / 5) * 60;
      
      strategiesThatWouldWin.push({
        strategyName: strategy.name,
        patterns: strategy.patterns,
        numbersGenerated: strategy.numbersGenerated,
        complementaryGenerated: strategy.complementaryGenerated,
        matchedMainNumbers: mainMatches,
        matchedComplementary: complementaryMatch,
        efficiency,
        wouldWinThisRank: wouldWin,
        explanation: wouldWin 
          ? `🥉 Rang 3 ! Trouvé 4 numéros (${mainMatches.slice(0, 4).join(', ')}) + complémentaire (${actualComplementary})`
          : `Trouvé ${mainMatches.length}/5 numéros ${complementaryMatch ? '+ complémentaire' : 'sans complémentaire'}`
      });
    }
    
    strategiesThatWouldWin.sort((a, b) => b.efficiency - a.efficiency);
    
    const winners = strategiesThatWouldWin.filter(s => s.wouldWinThisRank);
    const bestStrategy = winners.length > 0 
      ? winners.sort((a, b) => a.numbersGenerated.length - b.numbersGenerated.length)[0]
      : strategiesThatWouldWin[0];
    
    return {
      rank: 3,
      description: "Rang 3 (4 numéros + complémentaire)",
      requiredMatch: { mainNumbers: 4, complementary: true },
      strategiesThatWouldWin,
      bestStrategyForThisRank: {
        name: bestStrategy.strategyName,
        efficiency: bestStrategy.efficiency,
        numbersUsed: bestStrategy.numbersGenerated.length,
        explanation: bestStrategy.explanation
      }
    };
  }

  /**
   * Analyse Rang 4 : 4 numéros (sans complémentaire)
   */
  private async analyzeRank4(actualNumbers: number[], actualComplementary: number, previousDraws: TirageData[]): Promise<RankAnalysis> {
    const strategies = await this.generateAllStrategies(previousDraws);
    const strategiesThatWouldWin = [];
    
    for (const strategy of strategies) {
      const mainMatches = actualNumbers.filter(num => strategy.numbersGenerated.includes(num));
      const complementaryMatch = strategy.complementaryGenerated.includes(actualComplementary);
      
      const wouldWin = mainMatches.length === 4 && !complementaryMatch;
      const efficiency = mainMatches.length >= 4 ? 65 : (mainMatches.length / 5) * 50;
      
      strategiesThatWouldWin.push({
        strategyName: strategy.name,
        patterns: strategy.patterns,
        numbersGenerated: strategy.numbersGenerated,
        complementaryGenerated: strategy.complementaryGenerated,
        matchedMainNumbers: mainMatches,
        matchedComplementary: complementaryMatch,
        efficiency,
        wouldWinThisRank: wouldWin,
        explanation: wouldWin 
          ? `🎯 Rang 4 ! Trouvé 4 numéros (${mainMatches.slice(0, 4).join(', ')}) sans le complémentaire`
          : `Trouvé ${mainMatches.length}/5 numéros`
      });
    }
    
    strategiesThatWouldWin.sort((a, b) => b.efficiency - a.efficiency);
    
    const winners = strategiesThatWouldWin.filter(s => s.wouldWinThisRank);
    const bestStrategy = winners.length > 0 
      ? winners.sort((a, b) => a.numbersGenerated.length - b.numbersGenerated.length)[0]
      : strategiesThatWouldWin[0];
    
    return {
      rank: 4,
      description: "Rang 4 (4 numéros, sans complémentaire)",
      requiredMatch: { mainNumbers: 4, complementary: false },
      strategiesThatWouldWin,
      bestStrategyForThisRank: {
        name: bestStrategy.strategyName,
        efficiency: bestStrategy.efficiency,
        numbersUsed: bestStrategy.numbersGenerated.length,
        explanation: bestStrategy.explanation
      }
    };
  }

  /**
   * Analyse Rang 5 : 3 numéros (le plus accessible)
   */
  private async analyzeRank5(actualNumbers: number[], actualComplementary: number, previousDraws: TirageData[]): Promise<RankAnalysis> {
    const strategies = await this.generateAllStrategies(previousDraws);
    const strategiesThatWouldWin = [];
    
    for (const strategy of strategies) {
      const mainMatches = actualNumbers.filter(num => strategy.numbersGenerated.includes(num));
      
      const wouldWin = mainMatches.length >= 3;
      const efficiency = wouldWin ? (mainMatches.length / strategy.numbersGenerated.length) * 100 : 0;
      
      strategiesThatWouldWin.push({
        strategyName: strategy.name,
        patterns: strategy.patterns,
        numbersGenerated: strategy.numbersGenerated,
        complementaryGenerated: strategy.complementaryGenerated,
        matchedMainNumbers: mainMatches,
        matchedComplementary: strategy.complementaryGenerated.includes(actualComplementary),
        efficiency,
        wouldWinThisRank: wouldWin,
        explanation: wouldWin 
          ? `⭐ Rang 5 ! Trouvé ${mainMatches.length} numéros (${mainMatches.join(', ')}) - Efficacité: ${efficiency.toFixed(1)}%`
          : `Seulement ${mainMatches.length}/3 numéros minimum`
      });
    }
    
    strategiesThatWouldWin.sort((a, b) => b.efficiency - a.efficiency);
    
    const winners = strategiesThatWouldWin.filter(s => s.wouldWinThisRank);
    const bestStrategy = winners.length > 0 
      ? winners[0] // Le plus efficace
      : strategiesThatWouldWin[0];
    
    return {
      rank: 5,
      description: "Rang 5 (3 numéros minimum)",
      requiredMatch: { mainNumbers: 3, complementary: false },
      strategiesThatWouldWin,
      bestStrategyForThisRank: {
        name: bestStrategy.strategyName,
        efficiency: bestStrategy.efficiency,
        numbersUsed: bestStrategy.numbersGenerated.length,
        explanation: bestStrategy.explanation
      }
    };
  }

  /**
   * Génère toutes les stratégies à tester
   */
  private async generateAllStrategies(previousDraws: TirageData[]): Promise<Array<{
    name: string;
    patterns: string[];
    numbersGenerated: number[];
    complementaryGenerated: number[];
  }>> {
    const frequencies = this.calculateFrequencies(previousDraws);
    const gaps = this.calculateCurrentGaps(previousDraws);
    
    const strategies = [];
    
    // Stratégies de taille réduite (optimisées)
    strategies.push({
      name: 'Top 6 Chauds',
      patterns: ['hot_numbers'],
      numbersGenerated: Object.entries(frequencies).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([num]) => parseInt(num)),
      complementaryGenerated: [1, 2, 3] // Top 3 complémentaires
    });
    
    strategies.push({
      name: 'Top 8 Chauds',
      patterns: ['hot_numbers'],
      numbersGenerated: Object.entries(frequencies).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([num]) => parseInt(num)),
      complementaryGenerated: [1, 2, 3]
    });
    
    strategies.push({
      name: 'Top 10 Chauds',
      patterns: ['hot_numbers'],
      numbersGenerated: Object.entries(frequencies).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([num]) => parseInt(num)),
      complementaryGenerated: [1, 2, 3]
    });
    
    strategies.push({
      name: 'Écarts Modérés (6)',
      patterns: ['moderate_gaps'],
      numbersGenerated: Object.entries(gaps).filter(([_, gap]) => gap >= 5 && gap <= 20).slice(0, 6).map(([num]) => parseInt(num)),
      complementaryGenerated: [3, 7, 5]
    });
    
    strategies.push({
      name: 'Écarts Modérés (10)',
      patterns: ['moderate_gaps'],
      numbersGenerated: Object.entries(gaps).filter(([_, gap]) => gap >= 5 && gap <= 20).slice(0, 10).map(([num]) => parseInt(num)),
      complementaryGenerated: [3, 7, 5]
    });
    
    strategies.push({
      name: 'Zone Centre (8)',
      patterns: ['zones_center'],
      numbersGenerated: [17, 18, 19, 20, 21, 22, 23, 24],
      complementaryGenerated: [2, 4, 6]
    });
    
    strategies.push({
      name: 'Pairs Optimaux (8)',
      patterns: ['parity_even'],
      numbersGenerated: [2, 4, 6, 8, 10, 12, 14, 16],
      complementaryGenerated: [2, 4, 6, 8, 10]
    });
    
    strategies.push({
      name: 'Impairs Optimaux (8)',
      patterns: ['parity_odd'],
      numbersGenerated: [1, 3, 5, 7, 9, 11, 13, 15],
      complementaryGenerated: [1, 3, 5, 7, 9]
    });
    
    // Stratégies hybrides optimisées
    strategies.push({
      name: 'Hybride 3+3 (Chauds+Écarts)',
      patterns: ['hot_numbers', 'moderate_gaps'],
      numbersGenerated: [
        ...Object.entries(frequencies).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([num]) => parseInt(num)),
        ...Object.entries(gaps).filter(([_, gap]) => gap >= 10 && gap <= 25).slice(0, 3).map(([num]) => parseInt(num))
      ],
      complementaryGenerated: [1, 5, 8]
    });
    
    strategies.push({
      name: 'Hybride 4+4 (Chauds+Zones)',
      patterns: ['hot_numbers', 'zones_center'],
      numbersGenerated: [
        ...Object.entries(frequencies).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([num]) => parseInt(num)),
        ...([20, 25, 30, 35])
      ],
      complementaryGenerated: [1, 3, 7]
    });
    
    strategies.push({
      name: 'Équilibré 2+2+2 (Chaud+Moyen+Froid)',
      patterns: ['balanced_frequency'],
      numbersGenerated: [
        ...Object.entries(frequencies).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([num]) => parseInt(num)),
        ...Object.entries(frequencies).sort((a, b) => b[1] - a[1]).slice(20, 22).map(([num]) => parseInt(num)),
        ...Object.entries(frequencies).sort((a, b) => a[1] - b[1]).slice(0, 2).map(([num]) => parseInt(num))
      ],
      complementaryGenerated: [5, 2, 8]
    });
    
    // Filtrer les stratégies vides
    return strategies.filter(s => s.numbersGenerated.length > 0);
  }

  /**
   * Calcule les meilleures stratégies globales
   */
  private calculateOverallBestStrategies(rankAnalyses: RankAnalysis[]): CompleteWinningAnalysis['overallBestStrategies'] {
    const strategyPerformances = new Map<string, {
      ranksWon: number[];
      totalEfficiency: number;
      numbersUsed: number;
      occurrences: number;
    }>();
    
    // Agréger les performances de toutes les stratégies
    rankAnalyses.forEach((rankAnalysis, rankIndex) => {
      rankAnalysis.strategiesThatWouldWin.forEach(strategy => {
        if (!strategyPerformances.has(strategy.strategyName)) {
          strategyPerformances.set(strategy.strategyName, {
            ranksWon: [],
            totalEfficiency: 0,
            numbersUsed: strategy.numbersGenerated.length,
            occurrences: 0
          });
        }
        
        const perf = strategyPerformances.get(strategy.strategyName)!;
        perf.occurrences++;
        perf.totalEfficiency += strategy.efficiency;
        
        if (strategy.wouldWinThisRank) {
          perf.ranksWon.push(rankIndex + 1);
        }
      });
    });
    
    // Convertir en tableau et calculer les métriques
    const results = Array.from(strategyPerformances.entries()).map(([name, perf]) => ({
      strategyName: name,
      totalRanksWon: perf.ranksWon.length,
      highestRank: perf.ranksWon.length > 0 ? Math.min(...perf.ranksWon) : 6,
      efficiency: perf.totalEfficiency / perf.occurrences,
      numbersUsed: perf.numbersUsed,
      explanation: perf.ranksWon.length > 0 
        ? `Aurait gagné ${perf.ranksWon.length} rang(s) : ${perf.ranksWon.join(', ')} avec ${perf.numbersUsed} numéros`
        : `Aucun gain avec ${perf.numbersUsed} numéros - Efficacité moyenne: ${(perf.totalEfficiency / perf.occurrences).toFixed(1)}%`
    }));
    
    // Trier par nombre de rangs gagnés, puis par rang le plus élevé, puis par efficacité
    results.sort((a, b) => {
      if (a.totalRanksWon !== b.totalRanksWon) return b.totalRanksWon - a.totalRanksWon;
      if (a.highestRank !== b.highestRank) return a.highestRank - b.highestRank;
      return b.efficiency - a.efficiency;
    });
    
    return results.slice(0, 10);
  }

  /**
   * Génère les insights stratégiques
   */
  private generateStrategicInsights(rankAnalyses: RankAnalysis[], overallBest: CompleteWinningAnalysis['overallBestStrategies']): CompleteWinningAnalysis['strategicInsights'] {
    // Stratégie la plus polyvalente (gagne le plus de rangs)
    const mostVersatile = overallBest.find(s => s.totalRanksWon > 0) || overallBest[0];
    
    // Stratégie la plus efficace (meilleur ratio)
    const mostEfficient = overallBest.sort((a, b) => (b.efficiency / b.numbersUsed) - (a.efficiency / a.numbersUsed))[0];
    
    // Meilleure pour le jackpot (rang 1)
    const jackpotWinners = rankAnalyses[0].strategiesThatWouldWin.filter(s => s.wouldWinThisRank);
    const bestForJackpot = jackpotWinners.length > 0 
      ? jackpotWinners.sort((a, b) => a.numbersGenerated.length - b.numbersGenerated.length)[0]
      : rankAnalyses[0].strategiesThatWouldWin[0];
    
    // Meilleure pour les gains fréquents (rangs 3-5)
    const frequentWinners = rankAnalyses.slice(2).flatMap(rank => 
      rank.strategiesThatWouldWin.filter(s => s.wouldWinThisRank)
    );
    const bestForFrequent = frequentWinners.length > 0
      ? frequentWinners.sort((a, b) => b.efficiency - a.efficiency)[0]
      : rankAnalyses[4].strategiesThatWouldWin[0];
    
    return {
      mostVersatileStrategy: mostVersatile.strategyName,
      mostEfficientStrategy: mostEfficient.strategyName,
      bestForJackpot: bestForJackpot.strategyName,
      bestForFrequentWins: bestForFrequent.strategyName
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
    for (let i = 1; i <= 49; i++) frequencies[i] = 0;
    
    tirages.forEach(tirage => {
      const numbers = this.extractNumbers(tirage);
      numbers.forEach(num => {
        if (num >= 1 && num <= 49) frequencies[num]++;
      });
    });
    
    return frequencies;
  }

  private calculateCurrentGaps(tirages: TirageData[]): Record<number, number> {
    const gaps: Record<number, number> = {};
    const lastAppearance: Record<number, number> = {};
    
    for (let i = 1; i <= 49; i++) {
      gaps[i] = tirages.length;
      lastAppearance[i] = -1;
    }
    
    tirages.forEach((tirage, index) => {
      const numbers = this.extractNumbers(tirage);
      numbers.forEach(num => {
        if (num >= 1 && num <= 49) {
          lastAppearance[num] = index;
        }
      });
    });
    
    for (let i = 1; i <= 49; i++) {
      if (lastAppearance[i] >= 0) {
        gaps[i] = tirages.length - 1 - lastAppearance[i];
      }
    }
    
    return gaps;
  }
}
