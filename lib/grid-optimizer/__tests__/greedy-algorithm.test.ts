/**
 * Tests unitaires pour l'algorithme glouton
 * Chaque test vérifie un aspect spécifique de l'algorithme
 */

import { GreedyOptimizationAlgorithm, createGreedyAlgorithm } from '../algorithms/greedy-algorithm';
import { LotoNumbers, GridConstraints } from '../types';

describe('GreedyOptimizationAlgorithm', () => {
  
  let algorithm: GreedyOptimizationAlgorithm;
  
  beforeEach(() => {
    algorithm = createGreedyAlgorithm({
      timeout: 10000 // 10 secondes pour les tests
    });
  });
  
  describe('Validation des entrées', () => {
    
    test('devrait accepter une sélection valide de 5 numéros', () => {
      const numbers: LotoNumbers = {
        main: [1, 2, 3, 4, 5],
        complementary: [1]
      };
      
      const constraints: GridConstraints = {
        minGuaranteedNumbers: 3,
        includeComplementary: false
      };
      
      expect(() => {
        (algorithm as any).validateInputs(numbers, constraints);
      }).not.toThrow();
    });
    
    test('devrait rejeter moins de 5 numéros principaux', () => {
      const numbers: LotoNumbers = {
        main: [1, 2, 3],
        complementary: []
      };
      
      const constraints: GridConstraints = {
        minGuaranteedNumbers: 3,
        includeComplementary: false
      };
      
      expect(() => {
        (algorithm as any).validateInputs(numbers, constraints);
      }).toThrow('Au moins 5 numéros principaux requis');
    });
    
    test('devrait rejeter plus de 20 numéros principaux', () => {
      const numbers: LotoNumbers = {
        main: Array.from({length: 21}, (_, i) => i + 1),
        complementary: []
      };
      
      const constraints: GridConstraints = {
        minGuaranteedNumbers: 3,
        includeComplementary: false
      };
      
      expect(() => {
        (algorithm as any).validateInputs(numbers, constraints);
      }).toThrow('Maximum 20 numéros principaux');
    });
    
    test('devrait rejeter un rang de garantie invalide', () => {
      const numbers: LotoNumbers = {
        main: [1, 2, 3, 4, 5],
        complementary: []
      };
      
      const constraints: GridConstraints = {
        minGuaranteedNumbers: 6 as any, // Invalide
        includeComplementary: false
      };
      
      expect(() => {
        (algorithm as any).validateInputs(numbers, constraints);
      }).toThrow('minGuaranteedNumbers doit être 3, 4 ou 5');
    });
  });
  
  describe('Génération des combinaisons', () => {
    
    test('devrait générer toutes les combinaisons C(5,5)', () => {
      const numbers = [1, 2, 3, 4, 5];
      const combinations = (algorithm as any).generateCombinations(numbers, 5);
      
      expect(combinations).toHaveLength(1);
      expect(combinations[0]).toEqual([1, 2, 3, 4, 5]);
    });
    
    test('devrait générer C(6,5) = 6 combinaisons', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const combinations = (algorithm as any).generateCombinations(numbers, 5);
      
      expect(combinations).toHaveLength(6);
      
      // Vérifier quelques combinaisons spécifiques
      expect(combinations).toContainEqual([1, 2, 3, 4, 5]);
      expect(combinations).toContainEqual([2, 3, 4, 5, 6]);
    });
    
    test('devrait calculer correctement le coefficient binomial', () => {
      // C(5,3) = 10
      expect((algorithm as any).binomialCoefficient(5, 3)).toBe(10);
      
      // C(10,5) = 252
      expect((algorithm as any).binomialCoefficient(10, 5)).toBe(252);
      
      // C(n,0) = 1
      expect((algorithm as any).binomialCoefficient(10, 0)).toBe(1);
      
      // C(n,n) = 1
      expect((algorithm as any).binomialCoefficient(10, 10)).toBe(1);
      
      // C(n,k) = 0 si k > n
      expect((algorithm as any).binomialCoefficient(5, 7)).toBe(0);
    });
  });
  
  describe('Optimisation complète', () => {
    
    test('devrait optimiser avec succès une petite sélection', async () => {
      const numbers: LotoNumbers = {
        main: [1, 2, 3, 4, 5, 6],
        complementary: [1, 2]
      };
      
      const constraints: GridConstraints = {
        minGuaranteedNumbers: 3,
        includeComplementary: false,
        maxGrids: 10
      };
      
      const result = await algorithm.optimize(numbers, constraints);
      
      // Vérifications de base
      expect(result.grids).toBeDefined();
      expect(result.grids.length).toBeGreaterThan(0);
      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.guarantee).toBeDefined();
      expect(result.metadata).toBeDefined();
      
      // Vérifier que chaque grille est valide
      for (const grid of result.grids) {
        expect(grid.main).toHaveLength(5);
        expect(grid.cost).toBeGreaterThan(0);
        expect(grid.type).toBe('simple');
        
        // Tous les numéros doivent être dans la sélection
        for (const num of grid.main) {
          expect(numbers.main).toContain(num);
        }
      }
    });
    
    test('devrait respecter la contrainte de budget', async () => {
      const numbers: LotoNumbers = {
        main: [1, 2, 3, 4, 5, 6, 7],
        complementary: []
      };
      
      const maxBudget = 10; // Seulement ~4-5 grilles possibles
      
      const constraints: GridConstraints = {
        minGuaranteedNumbers: 3,
        includeComplementary: false,
        maxBudget
      };
      
      const result = await algorithm.optimize(numbers, constraints);
      
      expect(result.totalCost).toBeLessThanOrEqual(maxBudget);
    });
    
    test('devrait respecter la contrainte de nombre de grilles', async () => {
      const numbers: LotoNumbers = {
        main: [1, 2, 3, 4, 5, 6, 7, 8],
        complementary: []
      };
      
      const maxGrids = 3;
      
      const constraints: GridConstraints = {
        minGuaranteedNumbers: 3,
        includeComplementary: false,
        maxGrids
      };
      
      const result = await algorithm.optimize(numbers, constraints);
      
      expect(result.grids.length).toBeLessThanOrEqual(maxGrids);
    });
  });
  
  describe('Validation des garanties', () => {
    
    test('devrait avoir une couverture de 100% pour une sélection simple', async () => {
      // Avec seulement 5 numéros, 1 grille suffit pour garantir rang 3
      const numbers: LotoNumbers = {
        main: [1, 2, 3, 4, 5],
        complementary: []
      };
      
      const constraints: GridConstraints = {
        minGuaranteedNumbers: 3,
        includeComplementary: false
      };
      
      const result = await algorithm.optimize(numbers, constraints);
      
      expect(result.guarantee.coverage).toBe(100);
      expect(result.guarantee.validation.failedCases).toHaveLength(0);
    });
    
    test('devrait calculer correctement les métadonnées de performance', async () => {
      const numbers: LotoNumbers = {
        main: [1, 2, 3, 4, 5, 6],
        complementary: []
      };
      
      const constraints: GridConstraints = {
        minGuaranteedNumbers: 3,
        includeComplementary: false
      };
      
      const result = await algorithm.optimize(numbers, constraints);
      
      expect(result.metadata.algorithm).toBe('Greedy Algorithm');
      expect(result.metadata.version).toBe('1.0.0');
      expect(result.metadata.computationTime).toBeGreaterThan(0);
      expect(result.metadata.complexity).toContain('O(');
      expect(result.metadata.timestamp).toBeDefined();
    });
  });
  
  describe('Cas limites', () => {
    
    test('devrait gérer le timeout gracieusement', async () => {
      const shortTimeoutAlgorithm = createGreedyAlgorithm({
        timeout: 1 // 1ms - très court
      });
      
      const numbers: LotoNumbers = {
        main: Array.from({length: 15}, (_, i) => i + 1), // Beaucoup de numéros
        complementary: []
      };
      
      const constraints: GridConstraints = {
        minGuaranteedNumbers: 3,
        includeComplementary: false
      };
      
      // Ne devrait pas planter, mais peut donner un résultat partiel
      const result = await shortTimeoutAlgorithm.optimize(numbers, constraints);
      expect(result.grids).toBeDefined();
    });
    
    test('devrait estimer correctement la complexité', () => {
      const numbers: LotoNumbers = {
        main: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        complementary: []
      };
      
      const minGrids = (algorithm as any).estimateMinimumGrids(10, 3);
      
      // Pour 10 numéros et rang 3, on s'attend à au moins quelques grilles
      expect(minGrids).toBeGreaterThan(0);
      expect(minGrids).toBeLessThan(100); // Mais pas trop non plus
    });
  });
});

/**
 * Tests d'intégration avec des données réelles
 */
describe('Tests d\'intégration Greedy Algorithm', () => {
  
  test('Cas réel: 10 numéros pour garantir rang 3', async () => {
    const algorithm = createGreedyAlgorithm();
    
    const numbers: LotoNumbers = {
      main: [7, 12, 18, 24, 31, 38, 41, 43, 46, 48],
      complementary: [2, 6]
    };
    
    const constraints: GridConstraints = {
      minGuaranteedNumbers: 3,
      includeComplementary: false,
      maxBudget: 50 // 50€ maximum
    };
    
    const result = await algorithm.optimize(numbers, constraints);
    
    // Vérifications réalistes
    expect(result.grids.length).toBeGreaterThan(1);
    expect(result.grids.length).toBeLessThan(30); // Pas trop de grilles non plus
    expect(result.totalCost).toBeLessThanOrEqual(50);
    expect(result.guarantee.coverage).toBeGreaterThan(90); // Au moins 90% de couverture
    
    console.log(`📊 Résultat test réel: ${result.grids.length} grilles, ${result.totalCost.toFixed(2)}€, ${result.guarantee.coverage.toFixed(1)}% couverture`);
  });
});



