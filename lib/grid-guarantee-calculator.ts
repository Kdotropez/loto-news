// Calculateur avancé pour les garanties de grilles

interface DetailedWinAnalysis {
  combinationsTotal: number;
  combinationsCovered: number;
  coveragePercentage: number;
  expectedWins: {
    rank5plus1: { probability: number; expectedGain: number; };
    rank5: { probability: number; expectedGain: number; };
    rank4plus1: { probability: number; expectedGain: number; };
    rank4: { probability: number; expectedGain: number; };
    rank3plus1: { probability: number; expectedGain: number; };
    rank3: { probability: number; expectedGain: number; };
  };
  roi: number;
  breakEvenProbability: number;
}

// Prix moyens FDJ (approximatifs)
const AVERAGE_PRIZES = {
  rank5plus1: 24000000,
  rank5: 100000,
  rank4plus1: 2000,
  rank4: 500,
  rank3plus1: 50,
  rank3: 20
};

export function combinations(n: number, k: number): number {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return Math.round(result);
}

export function hypergeometric(N: number, K: number, n: number, k: number): number {
  const numerator = combinations(K, k) * combinations(N - K, n - k);
  const denominator = combinations(N, n);
  return numerator / denominator;
}

export function avoidPredictablePatterns(numbers: number[], targetSize: number): number[] {
  const result: number[] = [];
  const used = new Set<number>();
  
  for (const num of numbers) {
    if (result.length >= targetSize) break;
    
    let shouldAdd = true;
    
    // Éviter les consécutifs
    if (result.length > 0 && result.some(existing => Math.abs(existing - num) === 1)) {
      shouldAdd = false;
    }
    
    // Éviter trop de numéros de la même dizaine
    if (result.length > 0) {
      const dizaine = Math.floor((num - 1) / 10);
      const sameDizaineCount = result.filter(existing => Math.floor((existing - 1) / 10) === dizaine).length;
      if (sameDizaineCount >= 2) {
        shouldAdd = false;
      }
    }
    
    // Éviter les terminaisons identiques
    if (result.length >= 2) {
      const terminaison = num % 10;
      const sameEndingCount = result.filter(existing => existing % 10 === terminaison).length;
      if (sameEndingCount >= 2) {
        shouldAdd = false;
      }
    }
    
    if (shouldAdd && !used.has(num)) {
      result.push(num);
      used.add(num);
    }
  }
  
  // Compléter si nécessaire
  while (result.length < targetSize) {
    for (const num of numbers) {
      if (!used.has(num) && result.length < targetSize) {
        result.push(num);
        used.add(num);
      }
    }
    break;
  }
  
  return result.sort((a, b) => a - b);
}

export function calculateDetailedWinAnalysis(
  selectedNumbers: number[],
  gridCount: number,
  guarantee: number,
  withComplementary: boolean,
  optimization: string
): DetailedWinAnalysis {
  const n = selectedNumbers.length;
  const totalCombinations = combinations(49, 5);
  const ourCombinations = combinations(n, 5);
  
  const probabilities = {
    rank5plus1: calculateRankProbability(n, 5, 5, withComplementary) * gridCount,
    rank5: calculateRankProbability(n, 5, 5, false) * gridCount,
    rank4plus1: calculateRankProbability(n, 5, 4, withComplementary) * gridCount,
    rank4: calculateRankProbability(n, 5, 4, false) * gridCount,
    rank3plus1: calculateRankProbability(n, 5, 3, withComplementary) * gridCount,
    rank3: calculateRankProbability(n, 5, 3, false) * gridCount
  };

  const expectedWins = {
    rank5plus1: {
      probability: probabilities.rank5plus1,
      expectedGain: probabilities.rank5plus1 * AVERAGE_PRIZES.rank5plus1
    },
    rank5: {
      probability: probabilities.rank5,
      expectedGain: probabilities.rank5 * AVERAGE_PRIZES.rank5
    },
    rank4plus1: {
      probability: probabilities.rank4plus1,
      expectedGain: probabilities.rank4plus1 * AVERAGE_PRIZES.rank4plus1
    },
    rank4: {
      probability: probabilities.rank4,
      expectedGain: probabilities.rank4 * AVERAGE_PRIZES.rank4
    },
    rank3plus1: {
      probability: probabilities.rank3plus1,
      expectedGain: probabilities.rank3plus1 * AVERAGE_PRIZES.rank3plus1
    },
    rank3: {
      probability: probabilities.rank3,
      expectedGain: probabilities.rank3 * AVERAGE_PRIZES.rank3
    }
  };

  const totalExpectedGain = Object.values(expectedWins).reduce((sum, win) => sum + win.expectedGain, 0);
  const totalCost = gridCount * 2.20;
  const roi = totalCost > 0 ? ((totalExpectedGain - totalCost) / totalCost) * 100 : -100;
  const breakEvenProbability = totalCost / AVERAGE_PRIZES.rank3;

  return {
    combinationsTotal: totalCombinations,
    combinationsCovered: ourCombinations * gridCount,
    coveragePercentage: (ourCombinations * gridCount / totalCombinations) * 100,
    expectedWins,
    roi: Math.round(roi * 100) / 100,
    breakEvenProbability: Math.round(breakEvenProbability * 10000) / 100
  };
}

export function calculateRankProbability(
  selectedNumbers: number,
  numbersPerGrid: number,
  targetMatches: number,
  withComplementary: boolean
): number {
  const totalNumbers = 49;
  const drawnNumbers = 5;
  
  const mainProbability = hypergeometric(totalNumbers, selectedNumbers, drawnNumbers, targetMatches);
  
  if (!withComplementary) {
    return mainProbability;
  }
  
  return mainProbability * 0.1;
}

// NOUVELLE stratégie : Mix Intelligent avec Couverture Systématique
export function calculateOptimalMix(
  selectedNumbers: number[],
  complementaryNumbers: number[],
  guaranteeLevel: number
): {
  multipleGrid: any;
  simpleGrids: any[];
  totalCost: number;
  coverage: string;
  guaranteedNumbers: number;
  warning?: string;
} {
  const totalNumbers = selectedNumbers.length;
  
  // ATTENTION : Le mix simple est DANGEREUX pour les garanties !
  // Il ne peut PAS garantir tous les cas de répartition
  
  if (totalNumbers <= 7) {
    // Pour 7 numéros ou moins, une grille multiple complète est plus sûre
    const multipleGrid = {
      id: 'mix-complete',
      numbers: selectedNumbers,
      complementary: complementaryNumbers,
      type: 'multiple',
      cost: combinations(totalNumbers, 5) * 2.20,
      combinations: combinations(totalNumbers, 5),
      purpose: `Grille multiple complète pour garantie absolue`
    };
    
    return {
      multipleGrid,
      simpleGrids: [],
      totalCost: multipleGrid.cost,
      coverage: `Grille multiple ${totalNumbers} → Garantie 100% si condition remplie`,
      guaranteedNumbers: guaranteeLevel
    };
  }
  
  // Pour 8+ numéros : Mix avec AVERTISSEMENT
  const multipleSize = 7;
  const multipleNumbers = selectedNumbers.slice(0, multipleSize);
  const remainingNumbers = selectedNumbers.slice(multipleSize);
  
  // PROBLÈME : Ce mix ne peut PAS garantir tous les cas !
  // Exemple : Si seulement 2 numéros du multiple sortent + 3 des restants
  // → Aucune grille ne garantira 3+ numéros
  
  const multipleGrid = {
    id: 'mix-partial',
    numbers: multipleNumbers,
    complementary: complementaryNumbers,
    type: 'multiple',
    cost: combinations(multipleSize, 5) * 2.20,
    combinations: combinations(multipleSize, 5),
    purpose: `Multiple partiel - NE GARANTIT PAS tous les cas !`
  };
  
  // Grilles simples basiques (insuffisantes pour garantie complète)
  const simpleGrids = remainingNumbers.map((num, i) => ({
    id: `mix-simple-${i}`,
    numbers: [num, ...multipleNumbers.slice(0, 4)].sort((a, b) => a - b),
    complementary: complementaryNumbers[0] || 1,
    type: 'simple',
    cost: 2.20,
    purpose: `Tentative de couverture pour ${num} - NON GARANTIE`
  }));
  
  const totalCost = multipleGrid.cost + (simpleGrids.length * 2.20);
  
  return {
    multipleGrid,
    simpleGrids,
    totalCost: Math.round(totalCost * 100) / 100,
    coverage: `ATTENTION : Mix non-garanti pour ${totalNumbers} numéros`,
    guaranteedNumbers: 0, // Aucune garantie réelle !
    warning: `⚠️ Ce mix ne garantit PAS tous les cas de répartition ! Pour une garantie absolue, utilisez une grille multiple ${totalNumbers}.`
  };
}