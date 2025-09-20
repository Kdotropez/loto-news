/**
 * Gestionnaire principal de l'Optimisateur de Grilles Professionnel
 * Orchestre les différents algorithmes et fournit une interface unifiée
 */

import { 
  LotoNumbers, 
  GridConstraints, 
  OptimizationResult, 
  OptimizationStrategy,
  AlgorithmConfig
} from './types';
import { LotoNumberValidator, GuaranteeValidator } from './validators';
import { GreedyOptimizationAlgorithm, createGreedyAlgorithm } from './algorithms/greedy-algorithm';

/**
 * Gestionnaire principal pour l'optimisation de grilles
 */
export class GridOptimizerManager {
  
  private algorithms: Map<OptimizationStrategy, any> = new Map();
  
  constructor() {
    this.initializeAlgorithms();
  }
  
  /**
   * Initialise tous les algorithmes disponibles
   */
  private initializeAlgorithms(): void {
    // Algorithme glouton (implémenté)
    this.algorithms.set('greedy_heuristic', createGreedyAlgorithm);
    
    // Autres algorithmes (à implémenter)
    // this.algorithms.set('exact_cover', createExactCoverAlgorithm);
    // this.algorithms.set('genetic_algorithm', createGeneticAlgorithm);
    // this.algorithms.set('branch_and_bound', createBranchAndBoundAlgorithm);
  }
  
  /**
   * Optimise les grilles avec la stratégie spécifiée
   */
  async optimizeGrids(
    numbers: LotoNumbers,
    constraints: GridConstraints,
    strategy: OptimizationStrategy = 'greedy_heuristic',
    config: Partial<AlgorithmConfig> = {}
  ): Promise<OptimizationResult> {
    
    console.log(`🚀 Démarrage optimisation: ${strategy} pour ${numbers.main.length} numéros`);
    
    // Validation des entrées
    LotoNumberValidator.validateNumbers(numbers);
    LotoNumberValidator.validateConstraints(constraints);
    
    // Vérifier la disponibilité de l'algorithme
    if (!this.algorithms.has(strategy)) {
      throw new Error(`Algorithme non disponible: ${strategy}`);
    }
    
    // Estimer la complexité avant de commencer
    const complexity = GuaranteeValidator.calculateTestComplexity(
      numbers.main.length,
      numbers.complementary.length
    );
    
    console.log(`📊 Complexité estimée: ${complexity.complexity} (${complexity.combinations.toLocaleString()} cas, ~${complexity.estimatedTime})`);
    
    // Créer et configurer l'algorithme
    const algorithmFactory = this.algorithms.get(strategy);
    const algorithm = algorithmFactory(config);
    
    try {
      // Lancer l'optimisation
      const result = await algorithm.optimize(numbers, constraints);
      
      // Validation finale
      await this.validateResult(result, numbers, constraints);
      
      console.log(`✅ Optimisation terminée: ${result.grids.length} grilles, ${result.totalCost.toFixed(2)}€, ${result.guarantee.coverage.toFixed(1)}% couverture`);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Erreur lors de l'optimisation:`, error);
      throw error;
    }
  }
  
  /**
   * Valide le résultat d'optimisation
   */
  private async validateResult(
    result: OptimizationResult,
    numbers: LotoNumbers,
    constraints: GridConstraints
  ): Promise<void> {
    
    // Vérifier que toutes les grilles sont valides
    for (const grid of result.grids) {
      LotoNumberValidator.validateGrid(grid);
    }
    
    // Vérifier les contraintes de budget
    if (constraints.maxBudget && result.totalCost > constraints.maxBudget) {
      throw new Error(`Budget dépassé: ${result.totalCost.toFixed(2)}€ > ${constraints.maxBudget}€`);
    }
    
    // Vérifier les contraintes de nombre de grilles
    if (constraints.maxGrids && result.grids.length > constraints.maxGrids) {
      throw new Error(`Nombre de grilles dépassé: ${result.grids.length} > ${constraints.maxGrids}`);
    }
    
    // Vérifier la cohérence de la garantie
    if (result.guarantee.coverage < 0 || result.guarantee.coverage > 100) {
      throw new Error(`Couverture invalide: ${result.guarantee.coverage}%`);
    }
  }
  
  /**
   * Retourne les stratégies d'optimisation disponibles
   */
  getAvailableStrategies(): OptimizationStrategy[] {
    return Array.from(this.algorithms.keys());
  }
  
  /**
   * Estime les ressources nécessaires pour une optimisation
   */
  estimateResources(
    numbers: LotoNumbers,
    constraints: GridConstraints,
    strategy: OptimizationStrategy
  ): {
    complexity: string;
    estimatedTime: string;
    estimatedMemory: string;
    combinations: number;
  } {
    
    const complexity = GuaranteeValidator.calculateTestComplexity(
      numbers.main.length,
      numbers.complementary.length
    );
    
    // Estimation de la mémoire basée sur le nombre de grilles candidates
    const candidateGrids = this.calculateCandidateGrids(numbers.main.length);
    const estimatedMemoryMB = Math.ceil(candidateGrids * 0.001); // ~1KB par grille
    
    let estimatedMemory: string;
    if (estimatedMemoryMB < 10) {
      estimatedMemory = '< 10 MB';
    } else if (estimatedMemoryMB < 100) {
      estimatedMemory = `~${estimatedMemoryMB} MB`;
    } else {
      estimatedMemory = `> 100 MB`;
    }
    
    return {
      complexity: complexity.complexity,
      estimatedTime: complexity.estimatedTime,
      estimatedMemory,
      combinations: complexity.combinations
    };
  }
  
  /**
   * Calcule le nombre de grilles candidates
   */
  private calculateCandidateGrids(numbersCount: number): number {
    // C(n,5) pour les grilles simples
    return this.binomialCoefficient(numbersCount, 5);
  }
  
  /**
   * Calcule le coefficient binomial
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
  
  /**
   * Compare plusieurs stratégies d'optimisation
   */
  async compareStrategies(
    numbers: LotoNumbers,
    constraints: GridConstraints,
    strategies: OptimizationStrategy[] = ['greedy_heuristic']
  ): Promise<{
    strategy: OptimizationStrategy;
    result: OptimizationResult;
    rank: number;
  }[]> {
    
    const results: {
      strategy: OptimizationStrategy;
      result: OptimizationResult;
      rank: number;
    }[] = [];
    
    console.log(`🔄 Comparaison de ${strategies.length} stratégies...`);
    
    // Tester chaque stratégie
    for (const strategy of strategies) {
      try {
        console.log(`🧮 Test de ${strategy}...`);
        const result = await this.optimizeGrids(numbers, constraints, strategy);
        results.push({
          strategy,
          result,
          rank: 0 // Sera calculé après
        });
      } catch (error) {
        console.error(`❌ Erreur avec ${strategy}:`, error);
      }
    }
    
    // Classer les résultats (meilleure couverture d'abord, puis coût le plus bas)
    results.sort((a, b) => {
      const coverageDiff = b.result.guarantee.coverage - a.result.guarantee.coverage;
      if (Math.abs(coverageDiff) > 0.1) {
        return coverageDiff;
      }
      return a.result.totalCost - b.result.totalCost;
    });
    
    // Assigner les rangs
    results.forEach((result, index) => {
      result.rank = index + 1;
    });
    
    console.log(`📊 Comparaison terminée: ${results.length} résultats`);
    
    return results;
  }
}

/**
 * Instance singleton du gestionnaire
 */
export const gridOptimizer = new GridOptimizerManager();

/**
 * Interface simplifiée pour l'utilisation dans les composants React
 */
export async function optimizeLotoGrids(
  selectedNumbers: number[],
  complementaryNumbers: number[] = [],
  options: {
    guaranteeRank?: 3 | 4 | 5;
    maxBudget?: number;
    maxGrids?: number;
    includeComplementary?: boolean;
    strategy?: OptimizationStrategy;
  } = {}
): Promise<OptimizationResult> {
  
  const numbers: LotoNumbers = {
    main: selectedNumbers,
    complementary: complementaryNumbers
  };
  
  const constraints: GridConstraints = {
    minGuaranteedNumbers: options.guaranteeRank || 3,
    maxBudget: options.maxBudget,
    maxGrids: options.maxGrids,
    includeComplementary: options.includeComplementary || false
  };
  
  return gridOptimizer.optimizeGrids(
    numbers,
    constraints,
    options.strategy || 'greedy_heuristic'
  );
}



