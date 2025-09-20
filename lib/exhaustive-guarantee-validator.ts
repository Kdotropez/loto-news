// Validateur exhaustif de garanties - teste TOUTES les combinaisons possibles
export interface ExhaustiveTestResult {
  testId: string;
  selectedNumbers: number[];
  complementaryNumbers: number[];
  grids: number[][];
  totalCombinations: number;
  testedCombinations: number;
  guaranteeSuccesses: number;
  guaranteeFailures: number;
  successRate: number;
  failedCombinations: {
    draw: { mainNumbers: number[], complementary: number };
    bestResult: { gridIndex: number, matches: number[], matchCount: number };
  }[];
  winningGridsStats: {
    gridIndex: number;
    winCount: number;
    winRate: number;
    bestRanks: { rank: number, count: number }[];
  }[];
  isGuaranteeValid: boolean;
  executionTime: number;
}

export class ExhaustiveGuaranteeValidator {
  
  /**
   * Génère toutes les combinaisons possibles de k éléments parmi n
   */
  private generateAllCombinations(numbers: number[], k: number): number[][] {
    if (k === 0) return [[]];
    if (k > numbers.length) return [];
    
    const result: number[][] = [];
    
    const backtrack = (start: number, current: number[]) => {
      if (current.length === k) {
        result.push([...current]);
        return;
      }
      
      for (let i = start; i < numbers.length; i++) {
        current.push(numbers[i]);
        backtrack(i + 1, current);
        current.pop();
      }
    };
    
    backtrack(0, []);
    return result;
  }
  
  /**
   * Calcule le rang atteint par une grille contre un tirage
   */
  private calculateRank(gridNumbers: number[], drawNumbers: number[], complementary: number): {
    rank: number;
    matches: number[];
    matchCount: number;
    hasComplementary: boolean;
  } {
    const matches = gridNumbers.filter(num => drawNumbers.includes(num));
    const hasComplementary = gridNumbers.includes(complementary);
    const matchCount = matches.length;
    
    let rank = 0;
    if (matchCount === 5 && hasComplementary) rank = 1; // 5+1
    else if (matchCount === 5) rank = 2; // 5+0
    else if (matchCount === 4 && hasComplementary) rank = 3; // 4+1
    else if (matchCount === 4) rank = 4; // 4+0
    else if (matchCount === 3 && hasComplementary) rank = 5; // 3+1
    else if (matchCount === 3) rank = 6; // 3+0
    else if (matchCount === 2 && hasComplementary) rank = 7; // 2+1
    
    return { rank, matches, matchCount, hasComplementary };
  }
  
  /**
   * Génère des grilles de test basées sur la stratégie
   */
  private generateTestGrids(selectedNumbers: number[], gridCount: number): number[][] {
    const grids: number[][] = [];
    const allCombinations = this.generateAllCombinations(selectedNumbers, 5);
    
    if (gridCount >= allCombinations.length) {
      // Si on demande plus de grilles qu'il n'y a de combinaisons, on prend toutes
      return allCombinations;
    }
    
    // Sélectionner les grilles de façon équilibrée
    const step = Math.floor(allCombinations.length / gridCount);
    for (let i = 0; i < gridCount; i++) {
      const index = (i * step) % allCombinations.length;
      grids.push(allCombinations[index]);
    }
    
    return grids;
  }
  
  /**
   * Test exhaustif d'une stratégie contre TOUTES les combinaisons possibles DANS LA SÉLECTION
   */
  public async testStrategyExhaustively(
    selectedNumbers: number[],
    complementaryNumbers: number[],
    gridCount: number,
    targetRank: number,
    maxCombinations: number = 10000 // Limite pour éviter les calculs trop longs
  ): Promise<ExhaustiveTestResult> {
    
    const startTime = Date.now();
    
    // Générer les grilles de test
    const grids = this.generateTestGrids(selectedNumbers, gridCount);
    
    // CORRECTION MAJEURE : Générer toutes les combinaisons possibles de 5 numéros PARMI LES SÉLECTIONNÉS
    const allMainCombinations = this.generateAllCombinations(selectedNumbers, 5);
    
    console.log(`🔬 Test exhaustif: ${allMainCombinations.length} combinaisons possibles parmi vos ${selectedNumbers.length} numéros`);
    
    // Pas de limite - on teste TOUT car c'est le vrai test
    const combinationsToTest = allMainCombinations;
    
    let guaranteeSuccesses = 0;
    const failedCombinations: any[] = [];
    const winningGridsStats = grids.map((_, index) => ({
      gridIndex: index,
      winCount: 0,
      winRate: 0,
      bestRanks: [] as { rank: number, count: number }[]
    }));
    
    // Tester chaque combinaison possible PARMI VOS NUMÉROS SÉLECTIONNÉS
    for (const mainNumbers of combinationsToTest) {
      // Pour chaque complémentaire possible PARMI VOS COMPLÉMENTAIRES
      for (const complementary of complementaryNumbers) {
        
        let bestResult = { gridIndex: -1, matches: [] as number[], matchCount: 0, rank: 0 };
        let guaranteeMet = false;
        
        // Tester chaque grille contre ce tirage
        grids.forEach((grid, gridIndex) => {
          const result = this.calculateRank(grid, mainNumbers, complementary);
          
          // Mettre à jour les stats de cette grille
          if (result.rank > 0) {
            winningGridsStats[gridIndex].winCount++;
            
            // Mettre à jour les rangs
            const existingRank = winningGridsStats[gridIndex].bestRanks.find(r => r.rank === result.rank);
            if (existingRank) {
              existingRank.count++;
            } else {
              winningGridsStats[gridIndex].bestRanks.push({ rank: result.rank, count: 1 });
            }
          }
          
          // Vérifier si cette grille respecte la garantie
          const meetsTarget = (targetRank === 6 && result.matchCount >= 3) ||
                             (targetRank === 4 && result.matchCount >= 4) ||
                             (targetRank === 2 && result.matchCount >= 5);
          
          if (meetsTarget) {
            guaranteeMet = true;
          }
          
          // Garder le meilleur résultat pour ce tirage
          if (result.matchCount > bestResult.matchCount) {
            bestResult = {
              gridIndex,
              matches: result.matches,
              matchCount: result.matchCount,
              rank: result.rank
            };
          }
        });
        
        if (guaranteeMet) {
          guaranteeSuccesses++;
        } else {
          // Enregistrer les échecs (limiter à 100 exemples max)
          if (failedCombinations.length < 100) {
            failedCombinations.push({
              draw: { mainNumbers: [...mainNumbers], complementary },
              bestResult
            });
          }
        }
      }
    }
    
    const totalTests = combinationsToTest.length * complementaryNumbers.length;
    const successRate = (guaranteeSuccesses / totalTests) * 100;
    
    // Calculer les taux de victoire des grilles
    winningGridsStats.forEach(stats => {
      stats.winRate = (stats.winCount / totalTests) * 100;
      stats.bestRanks.sort((a, b) => a.rank - b.rank);
    });
    
    const executionTime = Date.now() - startTime;
    
    console.log(`✅ Test terminé: ${guaranteeSuccesses}/${totalTests} succès (${successRate.toFixed(2)}%)`);
    
    return {
      testId: `exhaustive-${Date.now()}`,
      selectedNumbers,
      complementaryNumbers,
      grids,
      totalCombinations: allMainCombinations.length * complementaryNumbers.length,
      testedCombinations: totalTests,
      guaranteeSuccesses,
      guaranteeFailures: totalTests - guaranteeSuccesses,
      successRate,
      failedCombinations,
      winningGridsStats,
      isGuaranteeValid: successRate === 100,
      executionTime
    };
  }
  
  /**
   * Génère un rapport détaillé des résultats exhaustifs
   */
  public generateExhaustiveReport(result: ExhaustiveTestResult): string {
    let report = `🔬 RAPPORT DE TEST EXHAUSTIF\n`;
    report += `================================\n\n`;
    
    report += `⏱️  Temps d'exécution: ${(result.executionTime / 1000).toFixed(2)}s\n`;
    report += `🧮 Combinaisons testées: ${result.testedCombinations.toLocaleString()}\n`;
    report += `✅ Succès: ${result.guaranteeSuccesses.toLocaleString()}\n`;
    report += `❌ Échecs: ${result.guaranteeFailures.toLocaleString()}\n`;
    report += `📊 Taux de réussite: ${result.successRate.toFixed(4)}%\n\n`;
    
    if (result.isGuaranteeValid) {
      report += `🎉 GARANTIE MATHÉMATIQUEMENT PROUVÉE !\n`;
      report += `Toutes les ${result.testedCombinations.toLocaleString()} combinaisons testées respectent la garantie.\n\n`;
    } else {
      report += `⚠️  GARANTIE INVALIDÉE !\n`;
      report += `${result.guaranteeFailures.toLocaleString()} combinaisons ne respectent pas la garantie.\n\n`;
      
      if (result.failedCombinations.length > 0) {
        report += `📋 Exemples d'échecs:\n`;
        result.failedCombinations.slice(0, 5).forEach((failure, index) => {
          report += `${index + 1}. Tirage: ${failure.draw.mainNumbers.join(', ')} + ${failure.draw.complementary}\n`;
          report += `   Meilleur résultat: ${failure.bestResult.matchCount} numéros (grille ${failure.bestResult.gridIndex + 1})\n`;
        });
        report += `\n`;
      }
    }
    
    report += `🏆 PERFORMANCE DES GRILLES:\n`;
    result.winningGridsStats
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 10)
      .forEach((stats, index) => {
        report += `${index + 1}. Grille ${stats.gridIndex + 1}: ${stats.winRate.toFixed(2)}% de victoires\n`;
        if (stats.bestRanks.length > 0) {
          const bestRank = stats.bestRanks[0];
          report += `   Meilleur rang: ${bestRank.rank} (${bestRank.count} fois)\n`;
        }
      });
    
    return report;
  }
}
