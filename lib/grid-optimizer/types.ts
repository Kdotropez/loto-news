/**
 * Types et interfaces pour l'Optimisateur de Grilles Professionnel
 * Chaque type est documenté avec ses contraintes mathématiques
 */

export interface LotoNumbers {
  /** Numéros principaux (1-49, minimum 5, maximum 20) */
  main: number[];
  /** Numéros complémentaires (1-10, maximum 5) */
  complementary: number[];
}

export interface GridConstraints {
  /** Nombre minimum de numéros garantis */
  minGuaranteedNumbers: 3 | 4 | 5;
  /** Budget maximum en euros */
  maxBudget?: number;
  /** Nombre maximum de grilles */
  maxGrids?: number;
  /** Inclure les numéros complémentaires */
  includeComplementary: boolean;
}

export interface OptimizationResult {
  /** Grilles générées */
  grids: LotoGrid[];
  /** Coût total */
  totalCost: number;
  /** Garantie mathématique prouvée */
  guarantee: GuaranteeProof;
  /** Métadonnées de performance */
  metadata: OptimizationMetadata;
}

export interface LotoGrid {
  /** 5 numéros principaux */
  main: [number, number, number, number, number];
  /** Numéro complémentaire (optionnel) */
  complementary?: number;
  /** Coût de cette grille */
  cost: number;
  /** Type de grille */
  type: 'simple' | 'multiple';
}

export interface GuaranteeProof {
  /** Rang garanti (3, 4, ou 5 numéros corrects) */
  guaranteedRank: 3 | 4 | 5;
  /** Pourcentage de couverture (0-100) */
  coverage: number;
  /** Preuve mathématique */
  proof: MathematicalProof;
  /** Résultats des tests de validation */
  validation: ValidationResult;
}

export interface MathematicalProof {
  /** Nombre total de combinaisons possibles */
  totalCombinations: number;
  /** Combinaisons couvertes par les grilles */
  coveredCombinations: number;
  /** Combinaisons non couvertes (doit être 0 pour une vraie garantie) */
  uncoveredCombinations: number;
  /** Formule mathématique utilisée */
  formula: string;
  /** Références théoriques */
  references: string[];
}

export interface ValidationResult {
  /** Test exhaustif effectué */
  exhaustiveTest: boolean;
  /** Nombre de cas testés */
  testedCases: number;
  /** Nombre de cas réussis */
  successfulCases: number;
  /** Taux de succès (doit être 100% pour une vraie garantie) */
  successRate: number;
  /** Cas d'échec (doit être vide pour une vraie garantie) */
  failedCases: FailedCase[];
  /** Temps d'exécution du test */
  executionTime: number;
}

export interface FailedCase {
  /** Tirage qui a échoué */
  draw: number[];
  /** Complémentaire tiré */
  complementary: number;
  /** Meilleur résultat obtenu */
  bestResult: {
    gridIndex: number;
    matchedNumbers: number;
    expectedMinimum: number;
  };
}

export interface OptimizationMetadata {
  /** Algorithme utilisé */
  algorithm: string;
  /** Version de l'algorithme */
  version: string;
  /** Temps de calcul en millisecondes */
  computationTime: number;
  /** Complexité algorithmique */
  complexity: string;
  /** Mémoire utilisée en MB */
  memoryUsage: number;
  /** Timestamp de création */
  timestamp: string;
}

export type OptimizationStrategy = 
  | 'exact_cover'      // Couverture exacte (Set Cover Problem)
  | 'greedy_heuristic' // Heuristique gloutonne
  | 'genetic_algorithm' // Algorithme génétique
  | 'branch_and_bound'  // Branch and Bound
  | 'linear_programming'; // Programmation linéaire

export interface AlgorithmConfig {
  strategy: OptimizationStrategy;
  parameters: Record<string, any>;
  timeout: number; // en millisecondes
  maxMemory: number; // en MB
}



