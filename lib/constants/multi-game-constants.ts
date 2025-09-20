/**
 * CONSTANTES MULTI-GAME OPTIMIZER
 * Centralisation de toutes les constantes du MultiGameOptimizer
 */

// Couleurs pour les graphiques
export const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', 
  '#00ff00', '#ff00ff', '#00ffff', '#ffff00'
] as const;

// Configuration des onglets
export const MULTI_GAME_TABS = [
  { id: 'simple-generation', label: 'Génération Simple', icon: 'Zap' },
  { id: 'best-numbers', label: 'Meilleurs Chiffres', icon: 'Star' },
  { id: 'simple-games', label: 'Jeux Simples Optimisés', icon: 'Target' },
  { id: 'multi-grids', label: 'Grilles Multiples', icon: 'Layers' },
  { id: 'strategies', label: 'Stratégies Multiples', icon: 'BarChart3' },
  { id: 'budget-optimization', label: 'Optimisation Budget', icon: 'Calculator' },
  { id: 'strategy-controls', label: 'Contrôles Stratégies', icon: 'Filter' }
] as const;

// Options par défaut des stratégies
export const DEFAULT_STRATEGY_OPTIONS = {
  forceOptimalDistribution: true,
  includeHotNumbers: true,
  includeColdNumbers: true,
  includePatterns: true,
  includeMathematical: true,
  includeRules: true,
  includeAdvanced: true,
  includeHighGapNumbers: true,
  includeFrequentSequences: true,
  includeOptimalSums: true,
  includeOptimalDecades: true
} as const;

// Niveaux de risque
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

// Types de stratégies
export const STRATEGY_TYPES = {
  CONSERVATIVE: 'conservative',
  BALANCED: 'balanced',
  AGGRESSIVE: 'aggressive'
} as const;

// Types de combinaisons
export const COMBINATION_TYPES = {
  HOT: 'hot',
  BALANCED: 'balanced', 
  PATTERN: 'pattern',
  MATHEMATICAL: 'mathematical'
} as const;

// Configuration par défaut
export const DEFAULT_CONFIG = {
  BUDGET: 50,
  COMBINATION_COUNT: 5,
  GENERATION_MODE: 'quick' as const
} as const;



