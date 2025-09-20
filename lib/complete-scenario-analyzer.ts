/**
 * Analyseur Complet de Scénarios
 * Calcule les gains pour TOUS les cas possibles (1/5, 2/5, 3/5, 4/5, 5/5)
 */

export interface ScenarioDetail {
  correspondances: number;          // Numéros qui correspondent (1 à 5)
  gridsWithExactMatch: number;      // Grilles avec exactement ce nombre
  maxPossibleRank: number;          // Meilleur rang possible
  guaranteedGains: number;          // Gains garantis totaux
  averageGains: number;             // Gains moyens totaux
  worstCaseGains: number;           // Gains minimum
  explanation: string;              // Explication détaillée
  worthPlaying: boolean;            // Recommandation
}

export interface CompleteAnalysis {
  selectedNumbers: number;
  totalGrids: number;
  baseCost: number;
  scenarios: ScenarioDetail[];
  recommendation: string;
  expectedROI: number;
}

export class CompleteScenarioAnalyzer {
  
  /**
   * Analyse complète de tous les scénarios possibles
   */
  analyzeAllScenarios(selectedNumbers: number[], baseCost: number = 2.20): CompleteAnalysis {
    const n = selectedNumbers.length;
    const totalGrids = Math.ceil(this.binomialCoefficient(n, 3) / 10);
    const scenarios: ScenarioDetail[] = [];

    // Analyser chaque cas de correspondance
    for (let match = 1; match <= 5; match++) {
      scenarios.push(this.analyzeScenario(n, match, totalGrids));
    }

    const expectedROI = this.calculateExpectedROI(scenarios, totalGrids, baseCost);
    const recommendation = this.generateRecommendation(scenarios, expectedROI);

    return {
      selectedNumbers: n,
      totalGrids,
      baseCost: totalGrids * baseCost,
      scenarios,
      recommendation,
      expectedROI
    };
  }

  /**
   * Analyse un scénario spécifique (X/5 correspondances)
   */
  private analyzeScenario(n: number, correspondances: number, totalGrids: number): ScenarioDetail {
    const totalGridsPossible = this.binomialCoefficient(n, 5);
    
    switch (correspondances) {
      case 5:
        return this.analyze5of5(n, totalGridsPossible);
      case 4:
        return this.analyze4of5(n, totalGridsPossible);
      case 3:
        return this.analyze3of5(n, totalGridsPossible);
      case 2:
        return this.analyze2of5(n, totalGridsPossible);
      case 1:
        return this.analyze1of5(n, totalGridsPossible);
      default:
        throw new Error(`Correspondances invalides: ${correspondances}`);
    }
  }

  /**
   * Cas 5/5 : Correspondance parfaite
   */
  private analyze5of5(n: number, totalGridsPossible: number): ScenarioDetail {
    // 1 grille avec 5 bons = Rang 1 ou 2
    const grids5 = 1;
    // ~C(n,4) grilles avec 4 bons = Rang 3 ou 4  
    const grids4 = this.binomialCoefficient(n, 4) * 5 / totalGridsPossible * totalGridsPossible;
    // ~C(n,3) grilles avec 3 bons = Rang 5 ou 6
    const grids3 = this.binomialCoefficient(n, 3) * 10 / totalGridsPossible * totalGridsPossible;

    const guaranteedGains = 
      1 * 2000000 +           // 1 jackpot minimum
      grids4 * 500 +          // 4 bons nums minimum
      grids3 * 20;            // 3 bons nums minimum

    const averageGains = 
      1 * 5701258 +           // Jackpot moyen
      grids4 * 793 +          // 4 bons nums moyen
      grids3 * 35 +           // 3 bons nums moyen
      (totalGridsPossible - grids5 - grids4 - grids3) * 8; // Autres rangs

    return {
      correspondances: 5,
      gridsWithExactMatch: totalGridsPossible,
      maxPossibleRank: 1,
      guaranteedGains,
      averageGains,
      worstCaseGains: guaranteedGains,
      explanation: `JACKPOT ASSURÉ ! Toutes vos ${totalGridsPossible} grilles auront au moins 3 bons numéros. 1 grille aura les 5 bons = jackpot garanti !`,
      worthPlaying: true
    };
  }

  /**
   * Cas 4/5 : 4 correspondances
   */
  private analyze4of5(n: number, totalGridsPossible: number): ScenarioDetail {
    // Maximum 4 bons numéros possibles
    const grids4 = this.binomialCoefficient(4, 4) * this.binomialCoefficient(n - 4, 1); // C(4,4) × C(n-4,1)
    const grids3 = this.binomialCoefficient(4, 3) * this.binomialCoefficient(n - 4, 2); // C(4,3) × C(n-4,2)
    const grids2 = this.binomialCoefficient(4, 2) * this.binomialCoefficient(n - 4, 3); // C(4,2) × C(n-4,3)
    const gridsWithGains = grids4 + grids3 + grids2;

    const guaranteedGains = 
      grids4 * 500 +          // 4 bons = Rang 4 minimum
      grids3 * 20 +           // 3 bons = Rang 6 minimum  
      grids2 * 5;             // 2 bons = Rang 8 minimum

    const averageGains = 
      grids4 * 793 +          // 4 bons moyen
      grids3 * 35 +           // 3 bons moyen
      grids2 * 12.5;          // 2 bons moyen

    return {
      correspondances: 4,
      gridsWithExactMatch: gridsWithGains,
      maxPossibleRank: 3,
      guaranteedGains,
      averageGains,
      worstCaseGains: guaranteedGains,
      explanation: `${grids4} grilles avec 4 bons (Rang 3-4), ${grids3} avec 3 bons (Rang 5-6), ${grids2} avec 2 bons (Rang 7-8). Taux de succès: ${((gridsWithGains / totalGridsPossible) * 100).toFixed(1)}%`,
      worthPlaying: (gridsWithGains / totalGridsPossible) > 0.05 // > 5%
    };
  }

  /**
   * Cas 3/5 : 3 correspondances
   */
  private analyze3of5(n: number, totalGridsPossible: number): ScenarioDetail {
    // Maximum 3 bons numéros possibles
    const grids3 = this.binomialCoefficient(3, 3) * this.binomialCoefficient(n - 3, 2); // C(3,3) × C(n-3,2)
    const grids2 = this.binomialCoefficient(3, 2) * this.binomialCoefficient(n - 3, 3); // C(3,2) × C(n-3,3)
    const grids1 = this.binomialCoefficient(3, 1) * this.binomialCoefficient(n - 3, 4); // C(3,1) × C(n-3,4)
    const gridsWithGains = grids3 + grids2 + grids1;

    const guaranteedGains = 
      grids3 * 20 +           // 3 bons = Rang 6 minimum
      grids2 * 5 +            // 2 bons = Rang 8 minimum
      grids1 * 0;             // 1 bon = Pas de gain garanti

    const averageGains = 
      grids3 * 35 +           // 3 bons moyen
      grids2 * 12.5 +         // 2 bons moyen
      grids1 * 1;             // 1 bon moyen (très faible)

    return {
      correspondances: 3,
      gridsWithExactMatch: grids3,
      maxPossibleRank: 5,
      guaranteedGains,
      averageGains,
      worstCaseGains: grids3 * 20, // Seulement les 3 bons garantis
      explanation: `${grids3} grilles avec 3 bons (Rang 5-6 = 20-50€), ${grids2} avec 2 bons (Rang 7-8 = 5-20€), ${grids1} avec 1 bon (pas de gain). Taux de succès 3+: ${((grids3 / totalGridsPossible) * 100).toFixed(1)}%`,
      worthPlaying: false // Généralement pas rentable
    };
  }

  /**
   * Cas 2/5 : 2 correspondances
   */
  private analyze2of5(n: number, totalGridsPossible: number): ScenarioDetail {
    // Maximum 2 bons numéros possibles
    const grids2 = this.binomialCoefficient(2, 2) * this.binomialCoefficient(n - 2, 3); // C(2,2) × C(n-2,3)
    const grids1 = this.binomialCoefficient(2, 1) * this.binomialCoefficient(n - 2, 4); // C(2,1) × C(n-2,4)

    const guaranteedGains = grids2 * 5; // 2 bons = Rang 8 = 5€
    const averageGains = grids2 * 12.5 + grids1 * 1; // Avec complémentaires possibles

    return {
      correspondances: 2,
      gridsWithExactMatch: grids2,
      maxPossibleRank: 7,
      guaranteedGains,
      averageGains,
      worstCaseGains: guaranteedGains,
      explanation: `${grids2} grilles avec 2 bons (Rang 7-8 = 5-20€), ${grids1} avec 1 bon (Rang 9 possible avec complémentaire). Aucune grille avec 3+ bons numéros !`,
      worthPlaying: false
    };
  }

  /**
   * Cas 1/5 : 1 correspondance
   */
  private analyze1of5(n: number, totalGridsPossible: number): ScenarioDetail {
    // Maximum 1 bon numéro possible
    const grids1 = this.binomialCoefficient(1, 1) * this.binomialCoefficient(n - 1, 4); // C(1,1) × C(n-1,4)

    const guaranteedGains = 0; // 1 bon seul = pas de gain garanti
    const averageGains = grids1 * 0.5; // Très faible chance avec complémentaire

    return {
      correspondances: 1,
      gridsWithExactMatch: grids1,
      maxPossibleRank: 9,
      guaranteedGains,
      averageGains,
      worstCaseGains: 0,
      explanation: `${grids1} grilles avec 1 bon (Rang 9 possible avec complémentaire = 5€). Aucune grille avec 2+ bons numéros ! Échec quasi-total.`,
      worthPlaying: false
    };
  }

  /**
   * Calcule le ROI attendu selon la probabilité de chaque scénario
   */
  private calculateExpectedROI(scenarios: ScenarioDetail[], totalGrids: number, baseCost: number): number {
    // Estimation des probabilités selon la qualité de la sélection
    const probabilities = [0.1, 0.15, 0.25, 0.35, 0.15]; // 1/5, 2/5, 3/5, 4/5, 5/5
    
    let expectedGains = 0;
    for (let i = 0; i < scenarios.length; i++) {
      expectedGains += scenarios[i].averageGains * probabilities[i];
    }
    
    const totalCost = totalGrids * baseCost;
    return ((expectedGains - totalCost) / totalCost) * 100;
  }

  /**
   * Génère une recommandation basée sur l'analyse
   */
  private generateRecommendation(scenarios: ScenarioDetail[], expectedROI: number): string {
    const scenario5 = scenarios[4]; // 5/5
    const scenario4 = scenarios[3]; // 4/5
    const scenario3 = scenarios[2]; // 3/5

    if (expectedROI > 100) {
      return `🎯 EXCELLENT : ROI attendu de ${expectedROI.toFixed(1)}%. Votre sélection semble très prometteuse !`;
    } else if (expectedROI > 0) {
      return `✅ POSITIF : ROI attendu de ${expectedROI.toFixed(1)}%. Stratégie viable si votre sélection est bonne.`;
    } else if (expectedROI > -50) {
      return `⚠️ RISQUÉ : ROI attendu de ${expectedROI.toFixed(1)}%. Rentable seulement si 4-5 correspondances.`;
    } else {
      return `❌ DÉFAVORABLE : ROI attendu de ${expectedROI.toFixed(1)}%. Stratégie non recommandée avec cette sélection.`;
    }
  }

  /**
   * Calcule le coefficient binomial C(n,k)
   */
  private binomialCoefficient(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result = result * (n - i + 1) / i;
    }
    return Math.round(result);
  }
}

// Instance singleton
export const completeAnalyzer = new CompleteScenarioAnalyzer();
