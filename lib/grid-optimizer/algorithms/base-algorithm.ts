/**
 * Classe de base pour tous les algorithmes d'optimisation
 * Définit l'interface commune et les méthodes de validation
 */

import { 
  LotoNumbers, 
  GridConstraints, 
  OptimizationResult, 
  LotoGrid, 
  OptimizationStrategy,
  AlgorithmConfig,
  MathematicalProof
} from '../types';

export abstract class BaseOptimizationAlgorithm {
  
  protected config: AlgorithmConfig;
  protected startTime: number = 0;
  protected memoryUsage: number = 0;
  
  constructor(config: AlgorithmConfig) {
    this.config = config;
  }
  
  /**
   * Méthode principale d'optimisation - doit être implémentée par chaque algorithme
   */
  abstract optimize(
    numbers: LotoNumbers,
    constraints: GridConstraints
  ): Promise<OptimizationResult>;
  
  /**
   * Calcule la preuve mathématique pour un ensemble de grilles
   */
  protected calculateMathematicalProof(
    grids: LotoGrid[],
    selectedNumbers: number[],
    targetRank: number
  ): MathematicalProof {
    
    const totalCombinations = this.binomialCoefficient(selectedNumbers.length, 5);
    
    // Pour l'instant, calcul simplifié - sera amélioré par algorithme
    const coveredCombinations = this.estimateCoverage(grids, selectedNumbers, targetRank);
    const uncoveredCombinations = totalCombinations - coveredCombinations;
    
    return {
      totalCombinations,
      coveredCombinations,
      uncoveredCombinations,
      formula: `C(${selectedNumbers.length}, 5) = ${totalCombinations}`,
      references: [
        'Set Cover Problem - Karp (1972)',
        'Combinatorial Optimization - Schrijver (2003)'
      ]
    };
  }
  
  /**
   * Estime la couverture d'un ensemble de grilles (à implémenter par sous-classe)
   */
  protected abstract estimateCoverage(
    grids: LotoGrid[],
    selectedNumbers: number[],
    targetRank: number
  ): number;
  
  /**
   * Démarre le monitoring des performances
   */
  protected startPerformanceMonitoring(): void {
    this.startTime = performance.now();
    
    // Monitoring mémoire (approximatif en JavaScript)
    if (typeof window !== 'undefined' && (performance as any).memory) {
      this.memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
  }
  
  /**
   * Termine le monitoring et retourne les métadonnées
   */
  protected endPerformanceMonitoring(algorithm: string) {
    const computationTime = performance.now() - this.startTime;
    
    let finalMemoryUsage = this.memoryUsage;
    if (typeof window !== 'undefined' && (performance as any).memory) {
      finalMemoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024 - this.memoryUsage;
    }
    
    return {
      algorithm,
      version: '1.0.0',
      computationTime,
      complexity: this.getComplexityDescription(),
      memoryUsage: Math.max(0, finalMemoryUsage),
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Retourne la description de la complexité algorithmique
   */
  protected abstract getComplexityDescription(): string;
  
  /**
   * Valide les paramètres d'entrée
   */
  protected validateInputs(numbers: LotoNumbers, constraints: GridConstraints): void {
    // Validation des numéros
    if (!numbers.main || numbers.main.length < 5) {
      throw new Error('Au moins 5 numéros principaux requis');
    }
    
    if (numbers.main.length > 20) {
      throw new Error('Maximum 20 numéros principaux (limite FDJ)');
    }
    
    // Validation des contraintes
    if (![3, 4, 5].includes(constraints.minGuaranteedNumbers)) {
      throw new Error('minGuaranteedNumbers doit être 3, 4 ou 5');
    }
    
    // Vérification de la faisabilité
    const minGridsNeeded = this.estimateMinimumGrids(numbers.main.length, constraints.minGuaranteedNumbers);
    
    if (constraints.maxGrids && constraints.maxGrids < minGridsNeeded) {
      console.warn(`⚠️ Limite de grilles trop faible. Minimum estimé: ${minGridsNeeded}`);
    }
  }
  
  /**
   * Estime le nombre minimum de grilles nécessaires (borne inférieure théorique)
   */
  protected estimateMinimumGrids(numbersCount: number, targetRank: number): number {
    // Estimation basée sur la théorie des codes correcteurs
    // Borne de Singleton: d ≥ n - k + 1
    
    const totalCombinations = this.binomialCoefficient(numbersCount, 5);
    const maxCoveragePerGrid = this.binomialCoefficient(5, targetRank) * 
                               this.binomialCoefficient(numbersCount - 5, 5 - targetRank);
    
    return Math.ceil(totalCombinations / maxCoveragePerGrid);
  }
  
  /**
   * Calcule le coefficient binomial C(n,k)
   */
  protected binomialCoefficient(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1);
    }
    
    return Math.round(result);
  }
  
  /**
   * Génère toutes les combinaisons de k éléments parmi n
   */
  protected generateCombinations(numbers: number[], k: number): number[][] {
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
   * Calcule le coût d'un ensemble de grilles
   */
  protected calculateTotalCost(grids: LotoGrid[]): number {
    return grids.reduce((total, grid) => total + grid.cost, 0);
  }
  
  /**
   * Vérifie si l'algorithme doit s'arrêter (timeout)
   */
  protected shouldStop(): boolean {
    if (this.config.timeout > 0) {
      return (performance.now() - this.startTime) > this.config.timeout;
    }
    return false;
  }
}
