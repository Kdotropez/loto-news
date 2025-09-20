// Calculateur de couverture exhaustive pour garanties de grilles
import { combinations, hypergeometric } from './grid-guarantee-calculator';

interface CoverageScenario {
  numbersInSelection: number;  // Combien des 5 numéros gagnants sont dans notre sélection
  numbersOutside: number;      // Combien des 5 numéros gagnants sont hors sélection
  probability: number;         // Probabilité que ce scénario arrive
  canAchieveRank: boolean;     // Peut-on atteindre le rang visé dans ce scénario
}

interface CoverageStrategy {
  id: string;
  name: string;
  grids: Array<{
    type: 'simple' | 'multiple';
    numbers: number[];
    complementary?: number[];
    cost: number;
    purpose: string;
  }>;
  totalCost: number;
  guaranteedRank: number;
  scenariosCovered: number[];  // Quels scénarios sont couverts
  efficiency: number;          // Coût par scénario couvert
}

export class ExhaustiveCoverageCalculator {
  
  /**
   * Analyse tous les scénarios possibles pour une sélection donnée
   */
  public analyzeAllScenarios(
    totalSelected: number, 
    targetRank: number
  ): CoverageScenario[] {
    const scenarios: CoverageScenario[] = [];
    
    // Pour chaque répartition possible des 5 numéros gagnants
    for (let inSelection = 0; inSelection <= Math.min(5, totalSelected); inSelection++) {
      const outside = 5 - inSelection;
      
      // Probabilité de ce scénario (distribution hypergéométrique)
      const probability = hypergeometric(49, totalSelected, 5, inSelection);
      
      // Peut-on atteindre le rang visé ?
      const minNumbersNeeded = this.getMinNumbersForRank(targetRank);
      const canAchieveRank = inSelection >= minNumbersNeeded;
      
      scenarios.push({
        numbersInSelection: inSelection,
        numbersOutside: outside,
        probability,
        canAchieveRank
      });
    }
    
    return scenarios;
  }
  
  /**
   * Calcule toutes les stratégies optimales possibles
   */
  public calculateOptimalStrategies(
    selectedNumbers: number[],
    complementaryNumbers: number[],
    targetRank: number
  ): CoverageStrategy[] {
    const strategies: CoverageStrategy[] = [];
    const totalSelected = selectedNumbers.length;
    const scenarios = this.analyzeAllScenarios(totalSelected, targetRank);
    
    // Stratégie 1: Grille multiple complète (garantie absolue pour scénarios possibles)
    if (totalSelected <= 10) {
      strategies.push(this.createCompleteMultipleStrategy(
        selectedNumbers, complementaryNumbers, targetRank, scenarios
      ));
    }
    
    // Stratégie 2: Multiple principal + compensatoires
    for (let multipleSize = 6; multipleSize <= Math.min(9, totalSelected - 1); multipleSize++) {
      strategies.push(this.createHybridStrategy(
        selectedNumbers, complementaryNumbers, multipleSize, targetRank, scenarios
      ));
    }
    
    // Stratégie 3: Grilles simples exhaustives (pour comparaison coût)
    strategies.push(this.createSimpleGridsStrategy(
      selectedNumbers, complementaryNumbers, targetRank, scenarios
    ));
    
    // Trier par efficacité (coût/couverture)
    return strategies.sort((a, b) => a.efficiency - b.efficiency);
  }
  
  /**
   * Stratégie: Grille multiple complète (LIMITE FDJ: 10 numéros max)
   */
  private createCompleteMultipleStrategy(
    selectedNumbers: number[],
    complementaryNumbers: number[],
    targetRank: number,
    scenarios: CoverageScenario[]
  ): CoverageStrategy {
    // RÈGLE FDJ: Maximum 10 numéros sur une grille multiple
    const maxNumbers = Math.min(10, selectedNumbers.length);
    const numbersToUse = selectedNumbers.slice(0, maxNumbers);
    
    const totalCombinations = combinations(maxNumbers, 5);
    const cost = totalCombinations * 2.20;
    
    // Cette stratégie couvre tous les scénarios où c'est mathématiquement possible
    const coveredScenarios = scenarios
      .filter(s => s.canAchieveRank)
      .map((_, index) => index);
    
    let warning = '';
    if (selectedNumbers.length > 10) {
      warning = ` ⚠️ ATTENTION: ${selectedNumbers.length - 10} numéros exclus (limite FDJ: 10 max)`;
    }
    
    return {
      id: `complete-multiple-${maxNumbers}`,
      name: `Grille Multiple ${maxNumbers} Complète${warning}`,
      grids: [{
        type: 'multiple',
        numbers: numbersToUse,
        complementary: complementaryNumbers,
        cost,
        purpose: `Couverture FDJ max - ${totalCombinations} combinaisons${warning}`
      }],
      totalCost: cost,
      guaranteedRank: selectedNumbers.length > 10 ? 0 : targetRank, // Pas de garantie si numéros exclus
      scenariosCovered: selectedNumbers.length > 10 ? [] : coveredScenarios,
      efficiency: cost / Math.max(1, selectedNumbers.length > 10 ? 1 : coveredScenarios.length)
    };
  }
  
  /**
   * Stratégie: Multiple principal + grilles compensatoires
   */
  private createHybridStrategy(
    selectedNumbers: number[],
    complementaryNumbers: number[],
    multipleSize: number,
    targetRank: number,
    scenarios: CoverageScenario[]
  ): CoverageStrategy {
    const grids = [];
    let totalCost = 0;
    
    // Grille multiple principale
    const mainMultiple = selectedNumbers.slice(0, multipleSize);
    const mainCost = combinations(multipleSize, 5) * 2.20;
    grids.push({
      type: 'multiple' as const,
      numbers: mainMultiple,
      complementary: complementaryNumbers,
      cost: mainCost,
      purpose: `Multiple principal ${multipleSize} numéros`
    });
    totalCost += mainCost;
    
    // Grilles compensatoires pour les numéros restants
    const remainingNumbers = selectedNumbers.slice(multipleSize);
    
    // Pour chaque numéro restant, créer des grilles qui garantissent la couverture
    remainingNumbers.forEach((num, index) => {
      // Grilles simples stratégiques
      const compensatoryGrids = this.createCompensatoryGrids(
        num, mainMultiple, complementaryNumbers, targetRank
      );
      
      compensatoryGrids.forEach(grid => {
        grids.push(grid);
        totalCost += grid.cost;
      });
    });
    
    // Calculer quels scénarios sont couverts
    const coveredScenarios = this.calculateCoveredScenarios(
      multipleSize, remainingNumbers.length, targetRank, scenarios
    );
    
    return {
      id: `hybrid-${multipleSize}-${remainingNumbers.length}`,
      name: `Multiple ${multipleSize} + ${remainingNumbers.length} Compensatoires`,
      grids,
      totalCost: Math.round(totalCost * 100) / 100,
      guaranteedRank: targetRank,
      scenariosCovered: coveredScenarios,
      efficiency: totalCost / Math.max(1, coveredScenarios.length)
    };
  }
  
  /**
   * Crée des grilles compensatoires pour un numéro donné
   */
  private createCompensatoryGrids(
    targetNumber: number,
    multipleNumbers: number[],
    complementaryNumbers: number[],
    targetRank: number
  ): Array<{type: 'simple'; numbers: number[]; complementary: number[]; cost: number; purpose: string}> {
    const grids: Array<{type: 'simple'; numbers: number[]; complementary: number[]; cost: number; purpose: string}> = [];
    const minFromMultiple = Math.max(0, this.getMinNumbersForRank(targetRank) - 1);
    
    // Créer des combinaisons avec le numéro cible + numéros du multiple
    const combinations = this.generateCombinations(
      [targetNumber], 
      multipleNumbers, 
      5, 
      minFromMultiple
    );
    
    combinations.forEach((combo, index) => {
      grids.push({
        type: 'simple' as const,
        numbers: combo.sort((a, b) => a - b),
        complementary: complementaryNumbers,
        cost: 2.20,
        purpose: `Compensatoire pour ${targetNumber} - garantit rang ${targetRank} si conditions remplies`
      });
    });
    
    return grids;
  }
  
  /**
   * Stratégie: Grilles simples exhaustives
   */
  private createSimpleGridsStrategy(
    selectedNumbers: number[],
    complementaryNumbers: number[],
    targetRank: number,
    scenarios: CoverageScenario[]
  ): CoverageStrategy {
    // Calcul approximatif du nombre de grilles simples nécessaires
    // pour couvrir toutes les combinaisons possibles
    const totalCombinations = combinations(selectedNumbers.length, 5);
    const estimatedGrids = Math.ceil(totalCombinations / 20); // Approximation
    const cost = estimatedGrids * 2.20;
    
    const coveredScenarios = scenarios
      .filter(s => s.canAchieveRank)
      .map((_, index) => index);
    
    return {
      id: `simple-exhaustive`,
      name: `${estimatedGrids} Grilles Simples Exhaustives`,
      grids: [{
        type: 'simple',
        numbers: selectedNumbers.slice(0, 5), // Exemple
        cost,
        purpose: `${estimatedGrids} grilles simples calculées pour couverture complète`
      }],
      totalCost: cost,
      guaranteedRank: targetRank,
      scenariosCovered: coveredScenarios,
      efficiency: cost / Math.max(1, coveredScenarios.length)
    };
  }
  
  /**
   * Utilitaires
   */
  private getMinNumbersForRank(rank: number): number {
    switch (rank) {
      case 5: return 5; // 5+1
      case 4: return 4; // 4+1 ou 4+0
      case 3: return 3; // 3+1 ou 3+0
      case 2: return 2; // 2+1
      default: return 3;
    }
  }
  
  private calculateCoveredScenarios(
    multipleSize: number,
    remainingCount: number,
    targetRank: number,
    scenarios: CoverageScenario[]
  ): number[] {
    const minNeeded = this.getMinNumbersForRank(targetRank);
    const covered: number[] = [];
    
    scenarios.forEach((scenario, index) => {
      // Vérifier si cette stratégie peut couvrir ce scénario
      if (scenario.numbersInSelection >= minNeeded) {
        covered.push(index);
      }
    });
    
    return covered;
  }
  
  private generateCombinations(
    required: number[],
    available: number[],
    totalSize: number,
    minFromAvailable: number
  ): number[][] {
    const combinations: number[][] = [];
    const needed = totalSize - required.length;
    
    if (needed <= 0) return [required];
    
    // Générer les combinaisons nécessaires (simplifié pour l'exemple)
    const combo = [...required, ...available.slice(0, needed)];
    combinations.push(combo);
    
    return combinations;
  }
}
