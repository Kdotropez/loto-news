/**
 * TYPES MULTI-GAME OPTIMIZER
 * Centralisation de tous les types du MultiGameOptimizer
 */

export interface BestNumbersSet {
  numbers: number[];
  score: number;
  confidence: number;
  reasons: string[];
  frequency: number;
  recency: number;
  pattern: number;
  mathematical: number;
}

export interface MultiGameCombination {
  numbers: number[];
  complementary: number;
  score: number;
  confidence: number;
  cost: number;
  expectedReturn: number;
  strategy: 'hot' | 'balanced' | 'pattern' | 'mathematical';
  reasons: string[];
}

export interface MultiGrid {
  id: number;
  name: string;
  combinations: MultiGameCombination[];
  totalCost: number;
  expectedReturn: number;
  roi: number;
  winProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  strategy: 'conservative' | 'balanced' | 'aggressive';
  description: string;
}

export interface SimpleGame {
  id: number;
  name: string;
  combination: MultiGameCombination;
  cost: number;
  expectedReturn: number;
  roi: number;
  winProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  strategy: 'hot' | 'balanced' | 'pattern' | 'mathematical';
  description: string;
}

export interface MultiGameStrategy {
  name: string;
  description: string;
  combinations: MultiGameCombination[];
  totalCost: number;
  expectedReturn: number;
  roi: number;
  winProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  strategy: 'conservative' | 'balanced' | 'aggressive';
}

export interface BudgetOptimization {
  budget: number;
  recommendation: MultiGameStrategy;
  alternatives: MultiGameStrategy[];
}

export interface StrategyOptions {
  forceOptimalDistribution: boolean;
  includeHotNumbers: boolean;
  includeColdNumbers: boolean;
  includePatterns: boolean;
  includeMathematical: boolean;
  includeRules: boolean;
  includeAdvanced: boolean;
  includeHighGapNumbers: boolean;
  includeFrequentSequences: boolean;
  includeOptimalSums: boolean;
  includeOptimalDecades: boolean;
}

export interface TestResult {
  combination: MultiGameCombination;
  totalTests: number;
  wins: number;
  totalGains: number;
  categories: Record<string, number>;
  roi: number;
  winRate: number;
}

export interface MultiGridTestResult {
  grid: MultiGrid;
  results: TestResult[];
  globalStats: {
    totalCombinations: number;
    totalCost: number;
    totalGains: number;
    totalGainsCount: number;
    bestGain: number;
    worstGain: number;
    roi: number;
    tauxGain: number;
    gainMoyen: number;
    categoryStats: Record<string, number>;
  };
}

export type MultiGameTab = 
  | 'simple-generation' 
  | 'best-numbers' 
  | 'simple-games' 
  | 'multi-grids' 
  | 'strategies' 
  | 'budget-optimization' 
  | 'strategy-controls';

export type GenerationMode = 'quick' | 'advanced';



