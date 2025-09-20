/**
 * Algorithme Glouton pour l'optimisation de grilles Loto
 * 
 * THÉORIE MATHÉMATIQUE:
 * - Basé sur le Set Cover Problem (problème NP-complet)
 * - Approximation avec ratio ln(n) où n est le nombre d'éléments à couvrir
 * - Garantit une solution dans un facteur logarithmique de l'optimal
 * 
 * RÉFÉRENCES:
 * - Johnson, D. S. (1974). "Approximation algorithms for combinatorial problems"
 * - Chvátal, V. (1979). "A greedy heuristic for the set-cover problem"
 */

import { BaseOptimizationAlgorithm } from './base-algorithm';
import { 
  LotoNumbers, 
  GridConstraints, 
  OptimizationResult, 
  LotoGrid,
  AlgorithmConfig,
  GuaranteeProof
} from '../types';
import { GuaranteeValidator } from '../validators';

export class GreedyOptimizationAlgorithm extends BaseOptimizationAlgorithm {
  
  constructor(config: AlgorithmConfig) {
    super(config);
  }
  
  /**
   * Optimise les grilles avec l'algorithme glouton
   */
  async optimize(
    numbers: LotoNumbers,
    constraints: GridConstraints
  ): Promise<OptimizationResult> {
    
    this.validateInputs(numbers, constraints);
    this.startPerformanceMonitoring();
    
    console.log(`🧮 Algorithme Glouton - Optimisation pour ${numbers.main.length} numéros`);
    
    try {
      // Générer toutes les combinaisons possibles de tirages à couvrir
      const targetDraws = this.generateCombinations(numbers.main, 5);
      console.log(`🎯 ${targetDraws.length} tirages à couvrir pour garantir rang ${constraints.minGuaranteedNumbers}`);
      
      // Générer toutes les grilles candidates
      const candidateGrids = this.generateCandidateGrids(numbers, constraints);
      console.log(`📋 ${candidateGrids.length} grilles candidates générées`);
      
      // Algorithme glouton: sélectionner les meilleures grilles
      const selectedGrids = await this.greedySelection(
        candidateGrids,
        targetDraws,
        constraints
      );
      
      console.log(`✅ ${selectedGrids.length} grilles sélectionnées`);
      
      // Calculer la preuve mathématique
      const proof = this.calculateMathematicalProof(
        selectedGrids,
        numbers.main,
        constraints.minGuaranteedNumbers
      );
      
      // Validation exhaustive
      const validation = await GuaranteeValidator.validateGuaranteeExhaustively(
        selectedGrids,
        numbers,
        constraints.minGuaranteedNumbers
      );
      
      const guarantee: GuaranteeProof = {
        guaranteedRank: constraints.minGuaranteedNumbers,
        coverage: validation.successRate,
        proof,
        validation
      };
      
      const metadata = this.endPerformanceMonitoring('Greedy Algorithm');
      
      return {
        grids: selectedGrids,
        totalCost: this.calculateTotalCost(selectedGrids),
        guarantee,
        metadata
      };
      
    } catch (error) {
      console.error('❌ Erreur dans l\'algorithme glouton:', error);
      throw error;
    }
  }
  
  /**
   * Génère toutes les grilles candidates possibles
   */
  private generateCandidateGrids(
    numbers: LotoNumbers,
    constraints: GridConstraints
  ): LotoGrid[] {
    
    const grids: LotoGrid[] = [];
    const gridCombinations = this.generateCombinations(numbers.main, 5);
    
    // Générer les grilles simples
    for (const combination of gridCombinations) {
      const grid: LotoGrid = {
        main: combination as [number, number, number, number, number],
        cost: 2.20, // Prix standard d'une grille simple
        type: 'simple'
      };
      
      // Ajouter complémentaire si requis
      if (constraints.includeComplementary && numbers.complementary.length > 0) {
        grid.complementary = numbers.complementary[0]; // Prendre le premier pour simplifier
        grid.cost = 2.20; // Le prix reste le même
      }
      
      grids.push(grid);
    }
    
    console.log(`📊 ${grids.length} grilles candidates créées`);
    return grids;
  }
  
  /**
   * Sélection gloutonne des meilleures grilles
   * À chaque étape, choisit la grille qui couvre le plus de tirages non encore couverts
   */
  private async greedySelection(
    candidateGrids: LotoGrid[],
    targetDraws: number[][],
    constraints: GridConstraints
  ): Promise<LotoGrid[]> {
    
    const selectedGrids: LotoGrid[] = [];
    const uncoveredDraws = new Set(targetDraws.map(draw => draw.join(',')));
    let iteration = 0;
    
    console.log(`🔄 Début de la sélection gloutonne...`);
    
    while (uncoveredDraws.size > 0 && iteration < 1000) { // Limite de sécurité
      
      if (this.shouldStop()) {
        console.log('⏱️ Timeout atteint, arrêt de l\'algorithme');
        break;
      }
      
      let bestGrid: LotoGrid | null = null;
      let bestCoverage = 0;
      let bestCoveredDraws: string[] = [];
      
      // Évaluer chaque grille candidate
      for (const grid of candidateGrids) {
        const coveredDraws = this.calculateCoverage(grid, uncoveredDraws, constraints.minGuaranteedNumbers);
        
        if (coveredDraws.length > bestCoverage) {
          bestCoverage = coveredDraws.length;
          bestGrid = grid;
          bestCoveredDraws = coveredDraws;
        }
      }
      
      // Si aucune amélioration possible, arrêter
      if (!bestGrid || bestCoverage === 0) {
        console.log('⚠️ Aucune grille ne peut améliorer la couverture');
        break;
      }
      
      // Ajouter la meilleure grille
      selectedGrids.push(bestGrid);
      
      // Retirer les tirages couverts
      for (const drawKey of bestCoveredDraws) {
        uncoveredDraws.delete(drawKey);
      }
      
      console.log(`➕ Grille ${selectedGrids.length}: [${bestGrid.main.join(', ')}] couvre ${bestCoverage} tirages. Restant: ${uncoveredDraws.size}`);
      
      // Vérifier les contraintes de budget et nombre de grilles
      if (constraints.maxGrids && selectedGrids.length >= constraints.maxGrids) {
        console.log(`📊 Limite de grilles atteinte: ${constraints.maxGrids}`);
        break;
      }
      
      if (constraints.maxBudget && this.calculateTotalCost(selectedGrids) >= constraints.maxBudget) {
        console.log(`💰 Budget maximum atteint: ${constraints.maxBudget}€`);
        break;
      }
      
      iteration++;
    }
    
    console.log(`✅ Sélection terminée: ${selectedGrids.length} grilles, ${uncoveredDraws.size} tirages non couverts`);
    
    return selectedGrids;
  }
  
  /**
   * Calcule quels tirages une grille peut couvrir
   */
  private calculateCoverage(
    grid: LotoGrid,
    uncoveredDraws: Set<string>,
    targetRank: number
  ): string[] {
    
    const coveredDraws: string[] = [];
    
    for (const drawKey of Array.from(uncoveredDraws)) {
      const draw = drawKey.split(',').map(Number);
      
      // Compter les correspondances
      const matches = grid.main.filter(num => draw.includes(num)).length;
      
      // Si la grille couvre ce tirage pour le rang cible
      if (matches >= targetRank) {
        coveredDraws.push(drawKey);
      }
    }
    
    return coveredDraws;
  }
  
  /**
   * Estime la couverture d'un ensemble de grilles
   */
  protected estimateCoverage(
    grids: LotoGrid[],
    selectedNumbers: number[],
    targetRank: number
  ): number {
    
    const allDraws = this.generateCombinations(selectedNumbers, 5);
    let coveredCount = 0;
    
    for (const draw of allDraws) {
      // Vérifier si au moins une grille couvre ce tirage
      const isCovered = grids.some(grid => {
        const matches = grid.main.filter(num => draw.includes(num)).length;
        return matches >= targetRank;
      });
      
      if (isCovered) {
        coveredCount++;
      }
    }
    
    return coveredCount;
  }
  
  /**
   * Retourne la description de complexité
   */
  protected getComplexityDescription(): string {
    return 'O(n × m × k) où n=tirages, m=grilles candidates, k=itérations';
  }
}

/**
 * Factory pour créer l'algorithme glouton avec configuration par défaut
 */
export function createGreedyAlgorithm(options: Partial<AlgorithmConfig> = {}): GreedyOptimizationAlgorithm {
  const defaultConfig: AlgorithmConfig = {
    strategy: 'greedy_heuristic',
    parameters: {
      maxIterations: 1000,
      convergenceThreshold: 0.01
    },
    timeout: 30000, // 30 secondes
    maxMemory: 512 // 512 MB
  };
  
  const config = { ...defaultConfig, ...options };
  return new GreedyOptimizationAlgorithm(config);
}
