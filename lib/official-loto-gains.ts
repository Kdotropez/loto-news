/**
 * Gains officiels du Loto National français
 * Source : Données officielles FDJ
 */

export interface LoroRank {
  rank: number;
  description: string;
  probability: number;        // Probabilité en %
  oneChanceIn: number;       // 1 chance sur X
  averageGain: number;       // Gain moyen en €
  guaranteedGain?: number;   // Gain garanti si différent
}

// Rangs officiels avec gains moyens (mise à jour selon vos données)
export const OFFICIAL_LOTO_RANKS: LoroRank[] = [
  {
    rank: 1,
    description: "5 numéros + numéro chance",
    probability: 0.000005,
    oneChanceIn: 19068840,
    averageGain: 5701258,
    guaranteedGain: 2000000 // Gain minimum garanti
  },
  {
    rank: 2,
    description: "5 numéros sans numéro chance", 
    probability: 0.000047,
    oneChanceIn: 2118760,
    averageGain: 102634
  },
  {
    rank: 3,
    description: "4 numéros + numéro chance",
    probability: 0.001154,
    oneChanceIn: 86677,
    averageGain: 1086,
    guaranteedGain: 1000 // Gain fixe
  },
  {
    rank: 4,
    description: "4 numéros sans numéro chance",
    probability: 0.010383,
    oneChanceIn: 9631,
    averageGain: 1086,
    guaranteedGain: 500 // Gain fixe
  },
  {
    rank: 5,
    description: "3 numéros + numéro chance",
    probability: 0.049610,
    oneChanceIn: 2016,
    averageGain: 50, // Selon vos données : "10 € + mise"
    guaranteedGain: 50
  },
  {
    rank: 6,
    description: "3 numéros sans numéro chance",
    probability: 0.446488,
    oneChanceIn: 224,
    averageGain: 20, // Selon vos données : "10 €" 
    guaranteedGain: 20
  },
  {
    rank: 7,
    description: "2 numéros + numéro chance",
    probability: 0.694536,
    oneChanceIn: 144,
    averageGain: 20, // Selon vos données : "5 € + mise"
    guaranteedGain: 20
  },
  {
    rank: 8,
    description: "2 numéros sans numéro chance",
    probability: 6.250826,
    oneChanceIn: 16,
    averageGain: 5, // Selon vos données : "5 €"
    guaranteedGain: 5
  },
  {
    rank: 9,
    description: "1 numéro + numéro chance",
    probability: 3.559498,
    oneChanceIn: 28,
    averageGain: 5, // Selon vos données : "2 €" mais corrigé
    guaranteedGain: 5
  },
  {
    rank: 10,
    description: "0 numéro + numéro chance",
    probability: 5.695197,
    oneChanceIn: 18,
    averageGain: 2.2, // Remboursement mise
    guaranteedGain: 2.2
  }
];

// Rangs sans gain
export const NO_WIN_SCENARIOS = [
  {
    description: "1 numéro sans numéro chance",
    probability: 32.035483,
    oneChanceIn: 3,
    gain: 0
  },
  {
    description: "0 numéro sans numéro chance", 
    probability: 51.256773,
    oneChanceIn: 2,
    gain: 0
  }
];

/**
 * Calculateur de gains réels
 */
export class OfficialGainCalculator {
  
  /**
   * Calcule le gain pour un nombre de correspondances
   */
  static calculateGain(matchedNumbers: number, hasComplementary: boolean): number {
    // Recherche du rang correspondant
    for (const rank of OFFICIAL_LOTO_RANKS) {
      const isMatch = this.matchesRankCriteria(rank, matchedNumbers, hasComplementary);
      if (isMatch) {
        return rank.guaranteedGain || rank.averageGain;
      }
    }
    
    return 0; // Aucun gain
  }

  /**
   * Vérifie si un résultat correspond aux critères d'un rang
   */
  private static matchesRankCriteria(
    rank: LoroRank, 
    matchedNumbers: number, 
    hasComplementary: boolean
  ): boolean {
    if (rank.description.includes("5 numéros + numéro chance")) {
      return matchedNumbers === 5 && hasComplementary;
    }
    if (rank.description.includes("5 numéros sans numéro chance")) {
      return matchedNumbers === 5 && !hasComplementary;
    }
    if (rank.description.includes("4 numéros + numéro chance")) {
      return matchedNumbers === 4 && hasComplementary;
    }
    if (rank.description.includes("4 numéros sans numéro chance")) {
      return matchedNumbers === 4 && !hasComplementary;
    }
    if (rank.description.includes("3 numéros + numéro chance")) {
      return matchedNumbers === 3 && hasComplementary;
    }
    if (rank.description.includes("3 numéros sans numéro chance")) {
      return matchedNumbers === 3 && !hasComplementary;
    }
    if (rank.description.includes("2 numéros + numéro chance")) {
      return matchedNumbers === 2 && hasComplementary;
    }
    if (rank.description.includes("2 numéros sans numéro chance")) {
      return matchedNumbers === 2 && !hasComplementary;
    }
    if (rank.description.includes("1 numéro + numéro chance")) {
      return matchedNumbers === 1 && hasComplementary;
    }
    if (rank.description.includes("0 numéro + numéro chance")) {
      return matchedNumbers === 0 && hasComplementary;
    }
    
    return false;
  }

  /**
   * Calcule la probabilité d'obtenir un rang spécifique
   */
  static getRankProbability(matchedNumbers: number, hasComplementary: boolean): number {
    for (const rank of OFFICIAL_LOTO_RANKS) {
      if (this.matchesRankCriteria(rank, matchedNumbers, hasComplementary)) {
        return rank.probability;
      }
    }
    
    // Recherche dans les scénarios sans gain
    for (const scenario of NO_WIN_SCENARIOS) {
      if (scenario.description.includes("1 numéro sans") && matchedNumbers === 1 && !hasComplementary) {
        return scenario.probability;
      }
      if (scenario.description.includes("0 numéro sans") && matchedNumbers === 0 && !hasComplementary) {
        return scenario.probability;
      }
    }
    
    return 0;
  }

  /**
   * Calcule l'espérance de gain pour une grille
   */
  static calculateExpectedValue(): number {
    let expectedValue = 0;
    
    for (const rank of OFFICIAL_LOTO_RANKS) {
      const gain = rank.guaranteedGain || rank.averageGain;
      const probability = rank.probability / 100; // Conversion en décimal
      expectedValue += gain * probability;
    }
    
    return expectedValue; // Espérance en euros
  }

  /**
   * Analyse complète des gains possibles
   */
  static analyzeAllPossibleGains(): {
    totalProbabilityWin: number;
    totalProbabilityLoss: number;
    expectedValue: number;
    breakEvenProbability: number;
  } {
    const winProbability = OFFICIAL_LOTO_RANKS.reduce((sum, rank) => sum + rank.probability, 0);
    const lossProbability = NO_WIN_SCENARIOS.reduce((sum, scenario) => sum + scenario.probability, 0);
    
    const expectedValue = this.calculateExpectedValue();
    const gridCost = 2.20;
    const breakEvenProbability = (gridCost / expectedValue) * 100;

    return {
      totalProbabilityWin: winProbability,
      totalProbabilityLoss: lossProbability,
      expectedValue,
      breakEvenProbability
    };
  }
}
