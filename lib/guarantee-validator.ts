// Validateur de garanties mathématiques avec tests aléatoires
export interface TestResult {
  testId: string;
  randomDraw: {
    mainNumbers: number[];
    complementary: number;
  };
  selectedNumbers: number[];
  grids: number[][];
  results: {
    gridIndex: number;
    gridNumbers: number[];
    matches: number[];
    matchCount: number;
    rank: number;
  }[];
  guaranteeMet: boolean;
  bestRank: number;
  explanation: string;
}

export interface ValidationSummary {
  totalTests: number;
  guaranteeSuccesses: number;
  guaranteeFailures: number;
  successRate: number;
  averageRank: number;
  worstCase: TestResult | null;
  bestCase: TestResult | null;
  isGuaranteeValid: boolean;
}

export class GuaranteeValidator {
  
  /**
   * Génère un tirage aléatoire réaliste
   */
  private generateRandomDraw(): { mainNumbers: number[], complementary: number } {
    const allNumbers = Array.from({length: 49}, (_, i) => i + 1);
    const mainNumbers: number[] = [];
    
    // Sélectionner 5 numéros principaux
    while (mainNumbers.length < 5) {
      const randomIndex = Math.floor(Math.random() * allNumbers.length);
      const number = allNumbers.splice(randomIndex, 1)[0];
      mainNumbers.push(number);
    }
    
    // Sélectionner 1 complémentaire parmi les restants
    const complementary = allNumbers[Math.floor(Math.random() * allNumbers.length)];
    
    return {
      mainNumbers: mainNumbers.sort((a, b) => a - b),
      complementary
    };
  }
  
  /**
   * Génère des grilles de test basées sur la stratégie
   */
  private generateTestGrids(selectedNumbers: number[], gridCount: number): number[][] {
    const grids: number[][] = [];
    
    // Stratégie simple : sélectionner des combinaisons variées
    for (let i = 0; i < gridCount; i++) {
      const grid: number[] = [];
      const availableNumbers = [...selectedNumbers];
      
      // Sélectionner 5 numéros de façon pseudo-aléatoire mais déterministe
      while (grid.length < 5 && availableNumbers.length > 0) {
        const index = (i * 7 + grid.length * 3) % availableNumbers.length;
        const number = availableNumbers.splice(index, 1)[0];
        grid.push(number);
      }
      
      grids.push(grid.sort((a, b) => a - b));
    }
    
    return grids;
  }
  
  /**
   * Calcule le rang atteint par une grille
   */
  private calculateRank(gridNumbers: number[], drawNumbers: number[], complementary: number): number {
    const matches = gridNumbers.filter(num => drawNumbers.includes(num));
    const hasComplementary = gridNumbers.includes(complementary);
    
    const matchCount = matches.length;
    
    // Rangs du Loto
    if (matchCount === 5 && hasComplementary) return 1; // 5+1
    if (matchCount === 5) return 2; // 5+0
    if (matchCount === 4 && hasComplementary) return 3; // 4+1
    if (matchCount === 4) return 4; // 4+0
    if (matchCount === 3 && hasComplementary) return 5; // 3+1
    if (matchCount === 3) return 6; // 3+0
    if (matchCount === 2 && hasComplementary) return 7; // 2+1
    
    return 0; // Pas de gain
  }
  
  /**
   * Teste une stratégie avec un tirage aléatoire
   */
  public testStrategy(
    selectedNumbers: number[],
    gridCount: number,
    targetRank: number,
    testId: string = ''
  ): TestResult {
    
    const randomDraw = this.generateRandomDraw();
    const grids = this.generateTestGrids(selectedNumbers, gridCount);
    
    const results = grids.map((grid, index) => {
      const matches = grid.filter(num => randomDraw.mainNumbers.includes(num));
      const matchCount = matches.length;
      const rank = this.calculateRank(grid, randomDraw.mainNumbers, randomDraw.complementary);
      
      return {
        gridIndex: index,
        gridNumbers: grid,
        matches,
        matchCount,
        rank
      };
    });
    
    const bestRank = Math.min(...results.map(r => r.rank).filter(r => r > 0));
    const targetRankAchieved = results.some(r => r.matchCount >= (targetRank === 6 ? 3 : targetRank === 4 ? 4 : 5));
    
    let explanation = '';
    if (targetRankAchieved) {
      const bestResult = results.find(r => r.matchCount >= (targetRank === 6 ? 3 : targetRank === 4 ? 4 : 5));
      explanation = `✅ Garantie respectée ! Grille ${bestResult!.gridIndex + 1} a trouvé ${bestResult!.matchCount} numéros (${bestResult!.matches.join(', ')})`;
    } else {
      const bestResult = results.reduce((best, current) => 
        current.matchCount > best.matchCount ? current : best
      );
      explanation = `❌ Garantie non respectée. Meilleur résultat: ${bestResult.matchCount} numéros sur la grille ${bestResult.gridIndex + 1}`;
    }
    
    return {
      testId: testId || `test-${Date.now()}`,
      randomDraw,
      selectedNumbers,
      grids,
      results,
      guaranteeMet: targetRankAchieved,
      bestRank: isFinite(bestRank) ? bestRank : 0,
      explanation
    };
  }
  
  /**
   * Lance une série de tests pour valider une garantie
   */
  public validateGuarantee(
    selectedNumbers: number[],
    gridCount: number,
    targetRank: number,
    testCount: number = 100
  ): ValidationSummary {
    
    const tests: TestResult[] = [];
    let guaranteeSuccesses = 0;
    let totalRanks = 0;
    let validRanks = 0;
    
    for (let i = 0; i < testCount; i++) {
      const test = this.testStrategy(selectedNumbers, gridCount, targetRank, `test-${i + 1}`);
      tests.push(test);
      
      if (test.guaranteeMet) {
        guaranteeSuccesses++;
      }
      
      if (test.bestRank > 0) {
        totalRanks += test.bestRank;
        validRanks++;
      }
    }
    
    const successRate = (guaranteeSuccesses / testCount) * 100;
    const averageRank = validRanks > 0 ? totalRanks / validRanks : 0;
    
    // Trouver le pire et meilleur cas
    const worstCase = tests.reduce((worst, current) => {
      if (!current.guaranteeMet && (worst === null || !worst.guaranteeMet)) {
        const currentBest = Math.max(...current.results.map(r => r.matchCount));
        const worstBest = worst ? Math.max(...worst.results.map(r => r.matchCount)) : Infinity;
        return currentBest < worstBest ? current : worst;
      }
      return worst;
    }, null as TestResult | null);
    
    const bestCase = tests.reduce((best, current) => {
      if (current.guaranteeMet && (best === null || current.bestRank < best.bestRank)) {
        return current;
      }
      return best;
    }, null as TestResult | null);
    
    return {
      totalTests: testCount,
      guaranteeSuccesses,
      guaranteeFailures: testCount - guaranteeSuccesses,
      successRate,
      averageRank,
      worstCase,
      bestCase,
      isGuaranteeValid: successRate === 100
    };
  }
  
  /**
   * Génère un rapport détaillé des tests
   */
  public generateTestReport(summary: ValidationSummary): string {
    let report = `📊 RAPPORT DE VALIDATION\n`;
    report += `========================\n\n`;
    
    report += `Tests effectués: ${summary.totalTests}\n`;
    report += `Succès: ${summary.guaranteeSuccesses}\n`;
    report += `Échecs: ${summary.guaranteeFailures}\n`;
    report += `Taux de réussite: ${summary.successRate.toFixed(2)}%\n\n`;
    
    if (summary.isGuaranteeValid) {
      report += `✅ GARANTIE VALIDÉE: 100% des tests ont respecté la garantie\n`;
    } else {
      report += `❌ GARANTIE INVALIDÉE: ${summary.guaranteeFailures} tests ont échoué\n`;
      report += `La stratégie ne garantit pas le rang visé dans tous les cas.\n`;
    }
    
    if (summary.averageRank > 0) {
      report += `\nRang moyen atteint: ${summary.averageRank.toFixed(2)}\n`;
    }
    
    if (summary.worstCase) {
      report += `\nPire cas:\n`;
      report += `- Tirage: ${summary.worstCase.randomDraw.mainNumbers.join(', ')} + ${summary.worstCase.randomDraw.complementary}\n`;
      report += `- ${summary.worstCase.explanation}\n`;
    }
    
    if (summary.bestCase) {
      report += `\nMeilleur cas:\n`;
      report += `- Tirage: ${summary.bestCase.randomDraw.mainNumbers.join(', ')} + ${summary.bestCase.randomDraw.complementary}\n`;
      report += `- ${summary.bestCase.explanation}\n`;
    }
    
    return report;
  }
}
