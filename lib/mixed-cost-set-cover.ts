/**
 * SET COVER À COÛTS MIXTES
 * Implémente votre formule : grilles multiples (5,7,8,9,10) + simples
 * Optimise le coût réel selon les tarifs FDJ
 */

export interface GridCandidate {
  numbers: number[];
  size: 5 | 7 | 8 | 9 | 10;
  cost: number;
  coveredTriples: string[];
  efficiency: number; // coût par triple couvert
}

export interface MixedSetCoverResult {
  grids: GridCandidate[];
  totalCost: number;
  coverage: number;
  isOptimal: boolean;
  strategy: string;
  comparison: {
    pureSimples: { grids: number; cost: number };
    pureMultiple: { grids: number; cost: number };
    mixedOptimal: { grids: number; cost: number };
  };
}

export class MixedCostSetCover {
  
  // Coûts réels FDJ selon la taille de grille
  private readonly GRID_COSTS: Record<number, number> = {
    5: 2.20,    // Simple
    7: 46.20,   // Multiple 7
    8: 123.20,  // Multiple 8  
    9: 277.20,  // Multiple 9
    10: 554.40  // Multiple 10
  };
  
  /**
   * ALGORITHME PRINCIPAL - Set Cover à coûts mixtes
   */
  public solveMixedSetCover(selectedNumbers: number[]): MixedSetCoverResult {
    console.log(`🎯 SET COVER MIXTE pour ${selectedNumbers.length} numéros`);
    
    // Générer l'univers U = tous les triples C(n,3)
    const universe = this.generateAllTriples(selectedNumbers);
    console.log(`📊 Univers U: ${universe.length} triples à couvrir`);
    
    // Générer tous les candidats (grilles 5,7,8,9,10)
    const candidates = this.generateAllCandidates(selectedNumbers);
    console.log(`🎲 Candidats: ${candidates.length} grilles possibles`);
    
    // Calculer l'efficacité de chaque candidat
    const rankedCandidates = this.rankCandidatesByEfficiency(candidates);
    
    // STRATÉGIE 1: Algorithme glouton par efficacité
    const greedySolution = this.greedySetCover(universe, rankedCandidates);
    
    // STRATÉGIE 2: Pure simples (référence)
    const pureSimplesSolution = this.calculatePureSimplesSolution(selectedNumbers);
    
    // STRATÉGIE 3: Pure multiple (si possible)
    const pureMultipleSolution = this.calculatePureMultipleSolution(selectedNumbers);
    
    // Choisir la meilleure stratégie
    const bestSolution = this.selectBestStrategy(greedySolution, pureSimplesSolution, pureMultipleSolution);
    
    return {
      grids: bestSolution.grids,
      totalCost: bestSolution.cost,
      coverage: 100,
      isOptimal: bestSolution.isOptimal,
      strategy: bestSolution.strategy,
      comparison: {
        pureSimples: pureSimplesSolution,
        pureMultiple: pureMultipleSolution,
        mixedOptimal: { grids: bestSolution.grids.length, cost: bestSolution.cost }
      }
    };
  }
  
  /**
   * Génère tous les triples C(n,3) à couvrir
   */
  private generateAllTriples(numbers: number[]): string[] {
    const triples: string[] = [];
    
    for (let i = 0; i < numbers.length - 2; i++) {
      for (let j = i + 1; j < numbers.length - 1; j++) {
        for (let k = j + 1; k < numbers.length; k++) {
          triples.push([numbers[i], numbers[j], numbers[k]].join(','));
        }
      }
    }
    
    return triples;
  }
  
  /**
   * Génère tous les candidats (grilles de tailles 5,7,8,9,10)
   */
  private generateAllCandidates(selectedNumbers: number[]): GridCandidate[] {
    const candidates: GridCandidate[] = [];
    const maxSize = Math.min(10, selectedNumbers.length);
    
    // Pour chaque taille de grille possible
    for (const size of [5, 7, 8, 9, 10] as const) {
      if (size <= maxSize) {
        const grids = this.generateCombinations(selectedNumbers, size);
        
        for (const grid of grids) {
          const coveredTriples = this.calculateCoveredTriples(grid);
          const cost = this.GRID_COSTS[size];
          const efficiency = coveredTriples.length > 0 ? cost / coveredTriples.length : Infinity;
          
          candidates.push({
            numbers: grid,
            size,
            cost,
            coveredTriples,
            efficiency
          });
        }
      }
    }
    
    console.log(`📈 Candidats générés par taille:`);
    for (const size of [5, 7, 8, 9, 10]) {
      const count = candidates.filter(c => c.size === size).length;
      if (count > 0) {
        console.log(`   - Taille ${size}: ${count} grilles (${this.GRID_COSTS[size]}€ chacune)`);
      }
    }
    
    return candidates;
  }
  
  /**
   * Calcule quels triples sont couverts par une grille
   */
  private calculateCoveredTriples(grid: number[]): string[] {
    const triples: string[] = [];
    
    // Tous les triples C(grid,3)
    for (let i = 0; i < grid.length - 2; i++) {
      for (let j = i + 1; j < grid.length - 1; j++) {
        for (let k = j + 1; k < grid.length; k++) {
          triples.push([grid[i], grid[j], grid[k]].sort((a,b) => a-b).join(','));
        }
      }
    }
    
    return triples;
  }
  
  /**
   * Classe les candidats par efficacité (coût par triple couvert)
   */
  private rankCandidatesByEfficiency(candidates: GridCandidate[]): GridCandidate[] {
    return candidates.sort((a, b) => a.efficiency - b.efficiency);
  }
  
  /**
   * Algorithme glouton par efficacité
   */
  private greedySetCover(universe: string[], candidates: GridCandidate[]): {
    grids: GridCandidate[];
    cost: number;
    strategy: string;
    isOptimal: boolean;
  } {
    const uncovered = new Set(universe);
    const selectedGrids: GridCandidate[] = [];
    let totalCost = 0;
    
    console.log(`🔄 Démarrage algorithme glouton...`);
    
    while (uncovered.size > 0 && selectedGrids.length < 50) {
      let bestCandidate: GridCandidate | null = null;
      let bestNewlyCovered = 0;
      let bestEfficiency = Infinity;
      
      // Trouver le candidat avec la meilleure efficacité pour les triples restants
      for (const candidate of candidates) {
        const newlyCovered = candidate.coveredTriples.filter(t => uncovered.has(t)).length;
        
        if (newlyCovered > 0) {
          const currentEfficiency = candidate.cost / newlyCovered;
          
          if (newlyCovered > bestNewlyCovered || 
              (newlyCovered === bestNewlyCovered && currentEfficiency < bestEfficiency)) {
            bestCandidate = candidate;
            bestNewlyCovered = newlyCovered;
            bestEfficiency = currentEfficiency;
          }
        }
      }
      
      if (bestCandidate) {
        selectedGrids.push(bestCandidate);
        totalCost += bestCandidate.cost;
        
        // Retirer les triples couverts
        for (const triple of bestCandidate.coveredTriples) {
          uncovered.delete(triple);
        }
        
        console.log(`   ✅ Grille ${selectedGrids.length}: taille ${bestCandidate.size} (${bestCandidate.cost}€) - Couvre ${bestNewlyCovered} nouveaux triples - Reste ${uncovered.size}`);
      } else {
        console.log(`   ❌ Aucun candidat ne peut couvrir les triples restants`);
        break;
      }
    }
    
    return {
      grids: selectedGrids,
      cost: totalCost,
      strategy: `Glouton mixte (${selectedGrids.length} grilles)`,
      isOptimal: uncovered.size === 0
    };
  }
  
  /**
   * Solution pure simples (référence)
   */
  private calculatePureSimplesSolution(selectedNumbers: number[]): { grids: number; cost: number } {
    const totalCombinations = this.binomialCoefficient(selectedNumbers.length, 5);
    return {
      grids: totalCombinations,
      cost: totalCombinations * this.GRID_COSTS[5]
    };
  }
  
  /**
   * Solution pure multiple (si possible)
   */
  private calculatePureMultipleSolution(selectedNumbers: number[]): { grids: number; cost: number } {
    if (selectedNumbers.length <= 10) {
      return {
        grids: 1,
        cost: this.GRID_COSTS[Math.min(10, selectedNumbers.length) as 5|7|8|9|10]
      };
    } else {
      return {
        grids: 0,
        cost: Infinity // Impossible
      };
    }
  }
  
  /**
   * Sélectionne la meilleure stratégie
   */
  private selectBestStrategy(greedy: any, pureSimples: any, pureMultiple: any) {
    const strategies = [
      { ...greedy, name: 'Mixte Glouton' },
      { grids: [], cost: pureSimples.cost, strategy: 'Pure Simples', isOptimal: true },
      { grids: [], cost: pureMultiple.cost, strategy: 'Pure Multiple', isOptimal: pureMultiple.cost !== Infinity }
    ].filter(s => s.cost !== Infinity);
    
    // Choisir le moins cher
    const best = strategies.reduce((min, current) => 
      current.cost < min.cost ? current : min
    );
    
    console.log(`🏆 Meilleure stratégie: ${best.strategy} (${best.cost.toFixed(2)}€)`);
    
    return best;
  }
  
  /**
   * Génère toutes les combinaisons C(n,k)
   */
  private generateCombinations(elements: number[], k: number): number[][] {
    if (k === 0) return [[]];
    if (k > elements.length) return [];
    
    const result: number[][] = [];
    
    const backtrack = (start: number, current: number[]) => {
      if (current.length === k) {
        result.push([...current]);
        return;
      }
      
      for (let i = start; i < elements.length; i++) {
        current.push(elements[i]);
        backtrack(i + 1, current);
        current.pop();
      }
    };
    
    backtrack(0, []);
    return result;
  }
  
  /**
   * Coefficient binomial C(n,k)
   */
  private binomialCoefficient(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1);
    }
    
    return Math.round(result);
  }
}

