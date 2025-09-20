/**
 * Validateurs pour l'Optimisateur de Grilles
 * Chaque validateur est testé unitairement
 */

import { LotoNumbers, GridConstraints, LotoGrid, ValidationResult, FailedCase } from './types';

/**
 * Validateur pour les numéros de Loto
 */
export class LotoNumberValidator {
  
  /**
   * Valide une sélection de numéros Loto
   * @param numbers Numéros à valider
   * @returns true si valide, sinon lance une erreur
   */
  static validateNumbers(numbers: LotoNumbers): boolean {
    // Validation des numéros principaux
    if (!Array.isArray(numbers.main)) {
      throw new Error('Les numéros principaux doivent être un tableau');
    }
    
    if (numbers.main.length < 5) {
      throw new Error('Minimum 5 numéros principaux requis');
    }
    
    if (numbers.main.length > 20) {
      throw new Error('Maximum 20 numéros principaux autorisés (limite FDJ)');
    }
    
    // Vérifier que tous les numéros sont dans la plage 1-49
    for (const num of numbers.main) {
      if (!Number.isInteger(num) || num < 1 || num > 49) {
        throw new Error(`Numéro principal invalide: ${num}. Doit être entre 1 et 49.`);
      }
    }
    
    // Vérifier l'unicité
    const uniqueMain = new Set(numbers.main);
    if (uniqueMain.size !== numbers.main.length) {
      throw new Error('Les numéros principaux doivent être uniques');
    }
    
    // Validation des numéros complémentaires
    if (!Array.isArray(numbers.complementary)) {
      throw new Error('Les numéros complémentaires doivent être un tableau');
    }
    
    if (numbers.complementary.length > 5) {
      throw new Error('Maximum 5 numéros complémentaires autorisés');
    }
    
    for (const num of numbers.complementary) {
      if (!Number.isInteger(num) || num < 1 || num > 10) {
        throw new Error(`Numéro complémentaire invalide: ${num}. Doit être entre 1 et 10.`);
      }
    }
    
    const uniqueComp = new Set(numbers.complementary);
    if (uniqueComp.size !== numbers.complementary.length) {
      throw new Error('Les numéros complémentaires doivent être uniques');
    }
    
    return true;
  }
  
  /**
   * Valide les contraintes d'optimisation
   */
  static validateConstraints(constraints: GridConstraints): boolean {
    if (![3, 4, 5].includes(constraints.minGuaranteedNumbers)) {
      throw new Error('minGuaranteedNumbers doit être 3, 4 ou 5');
    }
    
    if (constraints.maxBudget !== undefined && constraints.maxBudget <= 0) {
      throw new Error('maxBudget doit être positif');
    }
    
    if (constraints.maxGrids !== undefined && constraints.maxGrids <= 0) {
      throw new Error('maxGrids doit être positif');
    }
    
    return true;
  }
  
  /**
   * Valide une grille générée
   */
  static validateGrid(grid: LotoGrid): boolean {
    // Vérifier la structure
    if (!Array.isArray(grid.main) || grid.main.length !== 5) {
      throw new Error('Une grille doit contenir exactement 5 numéros principaux');
    }
    
    // Vérifier la plage des numéros principaux
    for (const num of grid.main) {
      if (!Number.isInteger(num) || num < 1 || num > 49) {
        throw new Error(`Numéro principal invalide dans la grille: ${num}`);
      }
    }
    
    // Vérifier l'unicité dans la grille
    const uniqueNumbers = new Set(grid.main);
    if (uniqueNumbers.size !== 5) {
      throw new Error('Les 5 numéros d\'une grille doivent être uniques');
    }
    
    // Vérifier le numéro complémentaire si présent
    if (grid.complementary !== undefined) {
      if (!Number.isInteger(grid.complementary) || grid.complementary < 1 || grid.complementary > 10) {
        throw new Error(`Numéro complémentaire invalide: ${grid.complementary}`);
      }
    }
    
    // Vérifier le coût
    if (typeof grid.cost !== 'number' || grid.cost <= 0) {
      throw new Error('Le coût de la grille doit être un nombre positif');
    }
    
    return true;
  }
}

/**
 * Validateur exhaustif pour les garanties
 */
export class GuaranteeValidator {
  
  /**
   * Teste exhaustivement si des grilles garantissent un rang donné
   * @param grids Grilles à tester
   * @param selectedNumbers Numéros sélectionnés par l'utilisateur
   * @param targetRank Rang à garantir (3, 4, ou 5)
   * @returns Résultat de validation complet
   */
  static async validateGuaranteeExhaustively(
    grids: LotoGrid[],
    selectedNumbers: LotoNumbers,
    targetRank: 3 | 4 | 5
  ): Promise<ValidationResult> {
    
    const startTime = performance.now();
    
    // Générer toutes les combinaisons possibles de tirages
    const allPossibleDraws = this.generateAllPossibleDraws(selectedNumbers.main);
    const complementaryNumbers = selectedNumbers.complementary.length > 0 
      ? selectedNumbers.complementary 
      : [1]; // Au moins un complémentaire pour le test
    
    let successfulCases = 0;
    const failedCases: FailedCase[] = [];
    
    console.log(`🧮 Test exhaustif: ${allPossibleDraws.length} tirages × ${complementaryNumbers.length} complémentaires`);
    
    // Tester chaque combinaison possible
    for (const draw of allPossibleDraws) {
      for (const complementary of complementaryNumbers) {
        const testResult = this.testSingleDraw(grids, draw, complementary, targetRank);
        
        if (testResult.success) {
          successfulCases++;
        } else {
          failedCases.push({
            draw,
            complementary,
            bestResult: testResult.bestResult
          });
        }
      }
    }
    
    const totalCases = allPossibleDraws.length * complementaryNumbers.length;
    const successRate = (successfulCases / totalCases) * 100;
    const executionTime = performance.now() - startTime;
    
    return {
      exhaustiveTest: true,
      testedCases: totalCases,
      successfulCases,
      successRate,
      failedCases,
      executionTime
    };
  }
  
  /**
   * Génère toutes les combinaisons possibles de 5 numéros
   */
  private static generateAllPossibleDraws(numbers: number[]): number[][] {
    const combinations: number[][] = [];
    
    const generate = (start: number, current: number[]) => {
      if (current.length === 5) {
        combinations.push([...current]);
        return;
      }
      
      for (let i = start; i < numbers.length; i++) {
        current.push(numbers[i]);
        generate(i + 1, current);
        current.pop();
      }
    };
    
    generate(0, []);
    return combinations;
  }
  
  /**
   * Teste un tirage unique contre toutes les grilles
   */
  private static testSingleDraw(
    grids: LotoGrid[],
    draw: number[],
    complementary: number,
    targetRank: number
  ): { success: boolean; bestResult: any } {
    
    let bestMatches = 0;
    let bestGridIndex = 0;
    
    // Tester chaque grille
    for (let i = 0; i < grids.length; i++) {
      const grid = grids[i];
      
      // Compter les correspondances dans les numéros principaux
      const mainMatches = grid.main.filter(num => draw.includes(num)).length;
      
      // Ajouter la correspondance complémentaire si applicable
      const compMatches = grid.complementary === complementary ? 1 : 0;
      const totalMatches = mainMatches + compMatches;
      
      if (totalMatches > bestMatches) {
        bestMatches = totalMatches;
        bestGridIndex = i;
      }
      
      // Si on atteint le rang cible, c'est un succès
      if (mainMatches >= targetRank) {
        return {
          success: true,
          bestResult: {
            gridIndex: i,
            matchedNumbers: totalMatches,
            expectedMinimum: targetRank
          }
        };
      }
    }
    
    // Aucune grille n'a atteint le rang cible
    return {
      success: false,
      bestResult: {
        gridIndex: bestGridIndex,
        matchedNumbers: bestMatches,
        expectedMinimum: targetRank
      }
    };
  }
  
  /**
   * Calcule la complexité théorique d'un test
   */
  static calculateTestComplexity(numbersCount: number, complementaryCount: number): {
    combinations: number;
    complexity: string;
    estimatedTime: string;
  } {
    // C(n,5) pour les combinaisons principales
    const mainCombinations = this.binomialCoefficient(numbersCount, 5);
    const totalCombinations = mainCombinations * Math.max(1, complementaryCount);
    
    let complexity: string;
    let estimatedTime: string;
    
    if (totalCombinations <= 1000) {
      complexity = 'Faible';
      estimatedTime = '< 1 seconde';
    } else if (totalCombinations <= 10000) {
      complexity = 'Modérée';
      estimatedTime = '1-5 secondes';
    } else if (totalCombinations <= 100000) {
      complexity = 'Élevée';
      estimatedTime = '5-30 secondes';
    } else {
      complexity = 'Très élevée';
      estimatedTime = '> 30 secondes';
    }
    
    return {
      combinations: totalCombinations,
      complexity,
      estimatedTime
    };
  }
  
  /**
   * Calcule le coefficient binomial C(n,k)
   */
  private static binomialCoefficient(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1);
    }
    
    return Math.round(result);
  }
}



