/**
 * UTILITAIRES MULTI-GAME OPTIMIZER
 * Fonctions utilitaires extraites du composant principal
 */

import type { MultiGameCombination, TestResult, MultiGrid } from '@/types/multi-game';

/**
 * Calcule les statistiques globales d'une grille testée
 */
export const calculateGridGlobalStats = (results: any[], grid: MultiGrid) => {
  // Vérification de sécurité
  if (!results || !Array.isArray(results)) {
    return {
      totalCombinations: 0,
      totalCost: 0,
      totalGains: 0,
      totalGainsCount: 0,
      bestGain: 0,
      worstGain: 0,
      roi: 0,
      tauxGain: 0,
      gainMoyen: 0,
      categoryStats: {}
    };
  }

  let totalGains = 0;
  let totalGainsCount = 0;
  let bestGain = 0;
  let worstGain = 0;
  const categoryStats: Record<string, number> = {};
  
  // Calculer les gains totaux
  results.forEach((result, index) => {
    if (result) {
      totalGains += result.totalGains || 0;
      totalGainsCount += result.wins || 0;
      bestGain = Math.max(bestGain, result.totalGains || 0);
      worstGain = Math.min(worstGain, result.totalGains || 0);
      
      // Compter les catégories
      Object.entries(result.categories || {}).forEach(([category, count]) => {
        categoryStats[category] = (categoryStats[category] || 0) + (count as number);
      });
    }
  });

  // Pour les grilles multiples, l'investissement total est le coût de la grille multiplié par le nombre de tirages testés
  const tiragesTestes = results.length > 0 ? results[0].totalTests : 0;
  const totalCost = grid.totalCost * tiragesTestes;

  const roi = totalCost > 0 ? ((totalGains - totalCost) / totalCost) * 100 : 0;
  const tauxGain = results.length > 0 ? (totalGainsCount / results.length) * 100 : 0;
  const gainMoyen = totalGainsCount > 0 ? totalGains / totalGainsCount : 0;

  return {
    totalCombinations: results.length,
    totalCost,
    totalGains,
    totalGainsCount,
    bestGain,
    worstGain,
    roi,
    tauxGain,
    gainMoyen,
    categoryStats
  };
};

/**
 * Formate une valeur monétaire
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Formate un pourcentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Calcule le niveau de risque basé sur le ROI et la probabilité
 */
export const calculateRiskLevel = (roi: number, winProbability: number): 'low' | 'medium' | 'high' => {
  if (roi > 20 && winProbability > 0.3) return 'low';
  if (roi > 0 && winProbability > 0.1) return 'medium';
  return 'high';
};

/**
 * Génère une couleur basée sur un index
 */
export const getColorByIndex = (index: number, colors: string[]): string => {
  return colors[index % colors.length];
};

/**
 * Valide une combinaison de numéros
 */
export const validateCombination = (numbers: number[]): boolean => {
  if (!numbers || numbers.length !== 5) return false;
  if (new Set(numbers).size !== numbers.length) return false; // Pas de doublons
  return numbers.every(num => num >= 1 && num <= 49);
};

/**
 * Calcule la somme d'une combinaison
 */
export const calculateCombinationSum = (numbers: number[]): number => {
  return numbers.reduce((sum, num) => sum + num, 0);
};

/**
 * Évalue la qualité d'une somme de combinaison
 */
export const evaluateSumQuality = (sum: number): { label: string; color: string } => {
  if (sum >= 100 && sum <= 150) {
    return { label: 'Optimale', color: 'text-green-600' };
  } else if (sum >= 80 && sum <= 170) {
    return { label: 'Acceptable', color: 'text-yellow-600' };
  } else {
    return { label: 'Faible', color: 'text-red-600' };
  }
};

/**
 * Compte les numéros consécutifs dans une combinaison
 */
export const countConsecutiveNumbers = (numbers: number[]): number => {
  const sorted = [...numbers].sort((a, b) => a - b);
  let consecutiveCount = 0;
  
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] === 1) {
      consecutiveCount++;
    }
  }
  
  return consecutiveCount;
};

/**
 * Analyse la répartition par dizaines
 */
export const analyzeDizainesDistribution = (numbers: number[]): Record<string, number> => {
  const dizaines = {
    '1-10': 0,
    '11-20': 0,
    '21-30': 0,
    '31-40': 0,
    '41-49': 0
  };

  numbers.forEach(num => {
    if (num <= 10) dizaines['1-10']++;
    else if (num <= 20) dizaines['11-20']++;
    else if (num <= 30) dizaines['21-30']++;
    else if (num <= 40) dizaines['31-40']++;
    else dizaines['41-49']++;
  });

  return dizaines;
};

/**
 * Calcule le score de diversité d'une combinaison
 */
export const calculateDiversityScore = (numbers: number[]): number => {
  const dizaines = analyzeDizainesDistribution(numbers);
  const activeDizaines = Object.values(dizaines).filter(count => count > 0).length;
  const maxInOneDizaine = Math.max(...Object.values(dizaines));
  
  // Score basé sur la répartition (plus c'est réparti, mieux c'est)
  let score = (activeDizaines / 5) * 50; // Max 50 points pour 5 dizaines
  
  // Pénalité si trop de numéros dans une seule dizaine
  if (maxInOneDizaine >= 3) score -= 20;
  
  return Math.max(0, Math.min(100, score));
};



