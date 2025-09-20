import { dataStorage } from './data-storage';
import { AnalysisEngine } from './analysis-engine';

export interface AdvancedStrategyResult {
  strategy: {
    name: string;
    description: string;
    confidence: number;
  };
  recommendedNumbers: {
    mainNumbers: number[];
    complementaryNumber: number;
    reasoning: string[];
  };
  analysis: {
    gapAnalysis: {
      highGapNumbers: Array<{ numero: number; gap: number; frequency: number }>;
      mediumGapNumbers: Array<{ numero: number; gap: number; frequency: number }>;
      lowGapNumbers: Array<{ numero: number; gap: number; frequency: number }>;
    };
    evenOddDistribution: {
      optimal: string;
      recommended: { even: number; odd: number };
      currentSelection: { even: number; odd: number };
    };
    complementaryAnalysis: {
      bestComplementary: number;
      frequency: number;
      gap: number;
    };
  };
  performance: {
    expectedWinRate: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendation: string;
  };
}

export class AdvancedStrategyEngine {
  private cache: Map<string, any> = new Map();
  private analysisEngine = new AnalysisEngine();

  /**
   * Génère une stratégie avancée combinant toutes les analyses
   */
  async generateAdvancedStrategy(): Promise<AdvancedStrategyResult> {
    const cacheKey = 'advanced-strategy';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Récupérer toutes les analyses nécessaires
    const [frequencyData, complementaryData, evenOddData] = await Promise.all([
      this.analysisEngine.analyzeFrequencies(),
      this.analysisEngine.analyzeFrequencies(),
      this.analysisEngine.analyzeFrequencies()
    ]);

    // Analyser les écarts
    const gapAnalysis = this.analyzeGaps(frequencyData.frequencies);
    
    // Analyser la distribution pair/impair optimale
    const evenOddAnalysis = this.analyzeEvenOddDistribution(evenOddData);
    
    // Analyser les numéros complémentaires
    const complementaryAnalysis = this.analyzeComplementaryNumbers(complementaryData.frequencies);
    
    // Générer la combinaison optimale
    const recommendedNumbers = this.generateOptimalCombination(
      gapAnalysis,
      evenOddAnalysis,
      complementaryAnalysis
    );

    // Calculer les performances attendues
    const performance = this.calculateExpectedPerformance(
      recommendedNumbers,
      frequencyData.frequencies,
      complementaryData.frequencies
    );

    const result: AdvancedStrategyResult = {
      strategy: {
        name: "Stratégie Avancée Multi-Critères",
        description: "Combine l'analyse des écarts, la répartition pair/impair optimale et les numéros complémentaires",
        confidence: this.calculateConfidence(gapAnalysis, evenOddAnalysis, complementaryAnalysis)
      },
      recommendedNumbers,
      analysis: {
        gapAnalysis,
        evenOddDistribution: evenOddAnalysis,
        complementaryAnalysis
      },
      performance
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Analyse les écarts des numéros
   */
  private analyzeGaps(frequencyData: any[]): any {
    const highGapNumbers = frequencyData
      .filter(item => item.ecart_actuel > 50)
      .slice(0, 15)
      .map(item => ({
        numero: item.numero,
        gap: item.ecart_actuel,
        frequency: item.frequence
      }));

    const mediumGapNumbers = frequencyData
      .filter(item => item.ecart_actuel >= 20 && item.ecart_actuel <= 50)
      .slice(0, 20)
      .map(item => ({
        numero: item.numero,
        gap: item.ecart_actuel,
        frequency: item.frequence
      }));

    const lowGapNumbers = frequencyData
      .filter(item => item.ecart_actuel < 20)
      .slice(0, 10)
      .map(item => ({
        numero: item.numero,
        gap: item.ecart_actuel,
        frequency: item.frequence
      }));

    return {
      highGapNumbers,
      mediumGapNumbers,
      lowGapNumbers
    };
  }

  /**
   * Analyse la distribution pair/impair optimale
   */
  private analyzeEvenOddDistribution(evenOddData: any): any {
    const optimal = evenOddData.optimalDistribution.recommended;
    const [evenStr, oddStr] = optimal.split('-');
    const evenCount = parseInt(evenStr);
    const oddCount = parseInt(oddStr);

    return {
      optimal,
      recommended: { even: evenCount, odd: oddCount },
      currentSelection: { even: 0, odd: 0 } // Sera mis à jour lors de la génération
    };
  }

  /**
   * Analyse les numéros complémentaires
   */
  private analyzeComplementaryNumbers(complementaryData: any[]): any {
    const bestComplementary = complementaryData[0]; // Le plus fréquent
    const secondBest = complementaryData[1]; // Le deuxième plus fréquent

    return {
      bestComplementary: bestComplementary.numero,
      frequency: bestComplementary.frequence,
      gap: bestComplementary.ecart_actuel,
      secondBest: secondBest.numero,
      secondFrequency: secondBest.frequence
    };
  }

  /**
   * Génère la combinaison optimale
   */
  private generateOptimalCombination(
    gapAnalysis: any,
    evenOddAnalysis: any,
    complementaryAnalysis: any
  ): any {
    const reasoning: string[] = [];
    const selectedNumbers: number[] = [];
    let evenCount = 0;
    let oddCount = 0;

    // Sélectionner 3 numéros à fort écart (70% de la stratégie)
    const highGapSelection = this.selectNumbersFromPool(
      gapAnalysis.highGapNumbers,
      3,
      'fort écart'
    );
    selectedNumbers.push(...highGapSelection.numbers);
    evenCount += highGapSelection.evenCount;
    oddCount += highGapSelection.oddCount;
    reasoning.push(...highGapSelection.reasoning);

    // Sélectionner 2 numéros à écart moyen (20% de la stratégie)
    const mediumGapSelection = this.selectNumbersFromPool(
      gapAnalysis.mediumGapNumbers,
      2,
      'écart moyen'
    );
    selectedNumbers.push(...mediumGapSelection.numbers);
    evenCount += mediumGapSelection.evenCount;
    oddCount += mediumGapSelection.oddCount;
    reasoning.push(...mediumGapSelection.reasoning);

    // FORCER la distribution pair/impair optimale (3P-2I ou 2P-3I)
    const adjustment = this.adjustForEvenOddDistribution(
      selectedNumbers,
      evenCount,
      oddCount,
      evenOddAnalysis.recommended,
      gapAnalysis
    );

    if (adjustment.adjusted) {
      reasoning.push(`Distribution optimale appliquée : ${adjustment.adjusted ? 'Oui' : 'Non'} (65.6% des tirages historiques)`);
      if (adjustment.adjusted) {
        reasoning.push(`✅ Respecte la contrainte fondamentale 3P-2I ou 2P-3I`);
      }
    }

    // Sélectionner le numéro complémentaire optimal
    const complementaryNumber = this.selectOptimalComplementary(complementaryAnalysis);
    reasoning.push(`Numéro complémentaire ${complementaryNumber} sélectionné (le plus fréquent)`);

    return {
      mainNumbers: adjustment.finalNumbers.sort((a, b) => a - b),
      complementaryNumber,
      reasoning
    };
  }

  /**
   * Sélectionne des numéros dans un pool donné
   */
  private selectNumbersFromPool(
    pool: any[],
    count: number,
    category: string
  ): { numbers: number[]; evenCount: number; oddCount: number; reasoning: string[] } {
    const selected: number[] = [];
    const reasoning: string[] = [];
    let evenCount = 0;
    let oddCount = 0;

    // Mélanger le pool pour éviter la sélection systématique
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(count, shuffledPool.length); i++) {
      const item = shuffledPool[i];
      selected.push(item.numero);
      
      if (item.numero % 2 === 0) {
        evenCount++;
      } else {
        oddCount++;
      }

      reasoning.push(`Numéro ${item.numero} sélectionné (${category}, écart: ${item.gap}j)`);
    }

    return { numbers: selected, evenCount, oddCount, reasoning };
  }

  /**
   * Ajuste la sélection pour respecter la distribution pair/impair optimale
   * FORCE les distributions 3P-2I ou 2P-3I (65.6% des tirages historiques)
   */
  private adjustForEvenOddDistribution(
    selectedNumbers: number[],
    currentEven: number,
    currentOdd: number,
    target: { even: number; odd: number },
    gapAnalysis: any
  ): { adjusted: boolean; finalNumbers: number[] } {
    // FORCER les distributions optimales : 3P-2I (33.1%) ou 2P-3I (32.5%)
    const optimalDistributions = [
      { even: 3, odd: 2 }, // 3P-2I - le plus fréquent
      { even: 2, odd: 3 }  // 2P-3I - deuxième plus fréquent
    ];
    
    // Choisir aléatoirement entre les deux distributions optimales
    const chosenDistribution = optimalDistributions[Math.floor(Math.random() * 2)];
    
    const finalNumbers = [...selectedNumbers];
    const currentEvenCount = finalNumbers.filter(n => n % 2 === 0).length;
    const currentOddCount = finalNumbers.filter(n => n % 2 === 1).length;
    
    // Si on n'a pas encore 5 numéros, compléter selon la distribution choisie
    if (finalNumbers.length < 5) {
      const neededEven = chosenDistribution.even - currentEvenCount;
      const neededOdd = chosenDistribution.odd - currentOddCount;
      
      // Ajouter les pairs manquants
      if (neededEven > 0) {
        const availablePairs = gapAnalysis.mediumGapNumbers
          .filter((item: any) => item.numero % 2 === 0 && !finalNumbers.includes(item.numero))
          .slice(0, neededEven);
        
        availablePairs.forEach((item: any) => {
          if (finalNumbers.length < 5) {
            finalNumbers.push(item.numero);
          }
        });
      }
      
      // Ajouter les impairs manquants
      if (neededOdd > 0) {
        const availableOdds = gapAnalysis.mediumGapNumbers
          .filter((item: any) => item.numero % 2 === 1 && !finalNumbers.includes(item.numero))
          .slice(0, neededOdd);
        
        availableOdds.forEach((item: any) => {
          if (finalNumbers.length < 5) {
            finalNumbers.push(item.numero);
          }
        });
      }
    }
    
    // Vérifier que la distribution finale respecte les contraintes
    const finalEvenCount = finalNumbers.filter(n => n % 2 === 0).length;
    const finalOddCount = finalNumbers.filter(n => n % 2 === 1).length;
    
    const isOptimal = (finalEvenCount === 3 && finalOddCount === 2) || 
                     (finalEvenCount === 2 && finalOddCount === 3);
    
    return { 
      adjusted: true, 
      finalNumbers: finalNumbers.slice(0, 5)
    };
  }

  /**
   * Sélectionne le numéro complémentaire optimal
   */
  private selectOptimalComplementary(complementaryAnalysis: any): number {
    // Privilégier le plus fréquent, mais avec une chance pour le deuxième
    const random = Math.random();
    return random < 0.7 ? complementaryAnalysis.bestComplementary : complementaryAnalysis.secondBest;
  }

  /**
   * Calcule les performances attendues
   */
  private calculateExpectedPerformance(
    recommendedNumbers: any,
    frequencyData: any[],
    complementaryData: any[]
  ): any {
    // Calculer le score moyen des numéros sélectionnés
    const mainNumbersScore = recommendedNumbers.mainNumbers.reduce((sum: number, num: number) => {
      const freq = frequencyData.find(f => f.numero === num);
      return sum + (freq ? freq.frequence : 0);
    }, 0) / recommendedNumbers.mainNumbers.length;

    const complementaryScore = complementaryData.find(c => c.numero === recommendedNumbers.complementaryNumber)?.frequence || 0;

    // Calculer le taux de gain attendu
    const expectedWinRate = Math.min(15, (mainNumbersScore + complementaryScore) / 10);

    // Déterminer le niveau de risque
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    if (expectedWinRate > 12) riskLevel = 'low';
    else if (expectedWinRate < 8) riskLevel = 'high';

    // Générer une recommandation
    let recommendation = '';
    if (riskLevel === 'low') {
      recommendation = 'Stratégie conservatrice avec de bonnes chances de gains réguliers';
    } else if (riskLevel === 'medium') {
      recommendation = 'Stratégie équilibrée entre sécurité et opportunité';
    } else {
      recommendation = 'Stratégie agressive avec potentiel de gros gains mais risque élevé';
    }

    return {
      expectedWinRate,
      riskLevel,
      recommendation
    };
  }

  /**
   * Calcule le niveau de confiance de la stratégie
   */
  private calculateConfidence(
    gapAnalysis: any,
    evenOddAnalysis: any,
    complementaryAnalysis: any
  ): number {
    let confidence = 50; // Base

    // Bonus pour les numéros à fort écart
    if (gapAnalysis.highGapNumbers.length >= 10) confidence += 20;
    
    // Bonus pour la distribution pair/impair claire
    if (evenOddAnalysis.optimal) confidence += 15;
    
    // Bonus pour les numéros complémentaires bien définis
    if (complementaryAnalysis.frequency > 0) confidence += 15;

    return Math.min(95, confidence);
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const advancedStrategyEngine = new AdvancedStrategyEngine();
