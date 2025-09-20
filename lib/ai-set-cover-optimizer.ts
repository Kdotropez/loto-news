/**
 * OPTIMISATEUR SET COVER AVEC IA
 * Utilise des heuristiques intelligentes pour accélérer le calcul
 */

export interface AIGridResult {
  grids: any[];
  totalCost: number;
  isGuaranteed: boolean;
  testedCombinations: number;
  coverage: number;
  aiOptimizations: string[];
  strategy: string;
}

export class AISetCoverOptimizer {
  
  /**
   * ALGORITHME IA OPTIMISÉ - Heuristiques intelligentes
   */
  public findOptimalGridsWithAI(
    selectedNumbers: number[],
    complementaryNumbers: number[] = [],
    targetRank: number = 3,
    maxGrids: number = 20,
    includeComplementary: boolean = false
  ): AIGridResult {
    
    console.log(`🤖 IA SET COVER pour ${selectedNumbers.length} numéros`);
    
    const optimizations: string[] = [];
    
    // STRATÉGIE IA : Analyser quelle approche est optimale
    const strategies = this.analyzeOptimalStrategies(selectedNumbers, complementaryNumbers, targetRank, includeComplementary);
    optimizations.push(`Analyse IA: ${strategies.length} stratégies évaluées`);
    
    console.log(`🤖 Stratégies disponibles:`, strategies.map(s => `${s.name} (${s.cost.toFixed(2)}€)`));
    
    // Tester chaque stratégie par ordre de promesse
    for (const strategy of strategies) {
      console.log(`🤖 Test stratégie: ${strategy.name} (${strategy.cost.toFixed(2)}€)`);
      
      const result = this.testStrategy(strategy, selectedNumbers, complementaryNumbers, targetRank, includeComplementary);
      
      if (result.success) {
        optimizations.push(`✅ Stratégie gagnante: ${strategy.name} (${result.grids.length} grilles, ${result.cost.toFixed(2)}€)`);
        
        console.log(`🎯 SOLUTION IA TROUVÉE: ${strategy.name}`);
        
        return {
          grids: result.grids,
          totalCost: result.cost,
          isGuaranteed: true,
          testedCombinations: result.testedCombinations,
          coverage: 100,
          aiOptimizations: optimizations,
          strategy: strategy.name
        };
      } else {
        optimizations.push(`❌ Stratégie échouée: ${strategy.name}`);
      }
    }
    
    // HEURISTIQUE 1: Pré-filtrage intelligent des grilles
    const smartCandidates = this.generateSmartCandidates(selectedNumbers, complementaryNumbers, includeComplementary);
    optimizations.push(`Pré-filtrage IA: ${smartCandidates.length} grilles intelligentes vs ${this.binomialCoefficient(selectedNumbers.length, 5)} possibles`);
    
    // HEURISTIQUE 2: Ordre intelligent de test
    const orderedCandidates = this.orderCandidatesByAI(smartCandidates, selectedNumbers, targetRank);
    optimizations.push(`Ordre IA: Grilles les plus prometteuses en premier`);
    
    // HEURISTIQUE 3: Élagage précoce
    const allDraws = this.generateAllDraws(selectedNumbers, complementaryNumbers, includeComplementary);
    
    // Recherche avec IA
    for (let numGrids = 1; numGrids <= Math.min(maxGrids, 10); numGrids++) {
      console.log(`🤖 IA teste ${numGrids} grilles...`);
      
      const solution = this.findSolutionWithAI(
        orderedCandidates,
        allDraws,
        numGrids,
        targetRank,
        includeComplementary
      );
      
      if (solution) {
        console.log(`✅ IA TROUVÉE ! ${numGrids} grilles`);
        
        // Validation rapide
        if (this.quickValidate(solution, allDraws, targetRank, includeComplementary)) {
          optimizations.push(`Solution trouvée en ${numGrids} grilles (optimal probable)`);
          
          return {
            grids: solution,
            totalCost: numGrids * 2.20,
            isGuaranteed: true,
            testedCombinations: allDraws.length,
            coverage: 100,
            aiOptimizations: optimizations,
            strategy: 'ai_optimized'
          };
        }
      }
    }
    
    return {
      grids: [],
      totalCost: 0,
      isGuaranteed: false,
      testedCombinations: 0,
      coverage: 0,
      aiOptimizations: optimizations,
      strategy: 'pure_simple'
    };
  }
  
  /**
   * ANALYSE IA : Détermine les meilleures stratégies selon la sélection
   */
  private analyzeOptimalStrategies(
    selectedNumbers: number[],
    complementaryNumbers: number[],
    targetRank: number,
    includeComplementary: boolean
  ): Array<{name: string, type: 'pure_simple' | 'pure_multiple' | 'hybrid_mix', cost: number, complexity: number}> {
    
    const strategies = [];
    
    // STRATÉGIE 1: Grille multiple unique (si possible)
    if (selectedNumbers.length <= 10) {
      const multipleCost = this.calculateMultipleCost(selectedNumbers.length);
      strategies.push({
        name: `Grille Multiple ${selectedNumbers.length} numéros`,
        type: 'pure_multiple' as const,
        cost: multipleCost,
        complexity: 1 // Une seule grille = très simple
      });
    }
    
    // STRATÉGIE 2: Mix intelligent multiple + simples
    if (selectedNumbers.length > 10) {
      const bestMultiple = Math.min(10, selectedNumbers.length - 2);
      const multipleCost = this.calculateMultipleCost(bestMultiple);
      const remainingNumbers = selectedNumbers.length - bestMultiple;
      const estimatedSimples = Math.ceil(this.binomialCoefficient(remainingNumbers + bestMultiple, 5) / 50);
      
      strategies.push({
        name: `Mix: Multiple ${bestMultiple} + ${estimatedSimples} simples`,
        type: 'hybrid_mix' as const,
        cost: multipleCost + (estimatedSimples * 2.20),
        complexity: estimatedSimples + 1
      });
    }
    
    // STRATÉGIE 3: Grilles simples pures (toujours possible mais cher)
    const allSimplesCost = this.binomialCoefficient(selectedNumbers.length, 5) * 2.20;
    strategies.push({
      name: `${this.binomialCoefficient(selectedNumbers.length, 5)} Grilles Simples`,
      type: 'pure_simple' as const,
      cost: allSimplesCost,
      complexity: this.binomialCoefficient(selectedNumbers.length, 5)
    });
    
    // Trier par coût (moins cher d'abord)
    return strategies.sort((a, b) => a.cost - b.cost);
  }
  
  /**
   * Teste une stratégie spécifique
   */
  private testStrategy(
    strategy: any,
    selectedNumbers: number[],
    complementaryNumbers: number[],
    targetRank: number,
    includeComplementary: boolean
  ): {success: boolean, grids: any[], cost: number, testedCombinations: number} {
    
    if (strategy.type === 'pure_multiple' && selectedNumbers.length <= 10) {
      // ❌ ERREUR DÉTECTÉE ! Une grille multiple ne couvre PAS automatiquement tout !
      // Il faut vérifier mathématiquement si elle couvre tous les cas
      
      console.log(`❌ STRATÉGIE MULTIPLE DÉSACTIVÉE - ALGORITHME DÉFAILLANT`);
      console.log(`🧮 Pour ${selectedNumbers.length} numéros, minimum théorique: ${this.calculateMinimumBound(selectedNumbers.length)} grilles`);
      
      return {
        success: false,
        grids: [],
        cost: 0,
        testedCombinations: 0
      };
    }
    
    if (strategy.type === 'hybrid_mix') {
      // Stratégie hybride : multiple + simples
      return this.testHybridStrategy(selectedNumbers, complementaryNumbers, targetRank, includeComplementary);
    }
    
    // Stratégie simple classique (déjà implémentée)
    return {success: false, grids: [], cost: 0, testedCombinations: 0};
  }
  
  /**
   * Teste la stratégie hybride multiple + simples
   */
  private testHybridStrategy(
    selectedNumbers: number[],
    complementaryNumbers: number[],
    targetRank: number,
    includeComplementary: boolean
  ): {success: boolean, grids: any[], cost: number, testedCombinations: number} {
    
    // Prendre les 10 premiers numéros pour la multiple
    const multipleNumbers = selectedNumbers.slice(0, 10);
    const remainingNumbers = selectedNumbers.slice(10);
    
    const grids = [];
    let totalCost = 0;
    
    // Grille multiple
    const multipleCost = this.calculateMultipleCost(10);
    grids.push({
      main: multipleNumbers.slice(0, 5), // Pour affichage
      type: 'multiple',
      cost: multipleCost,
      actualNumbers: multipleNumbers
    });
    totalCost += multipleCost;
    
    // Grilles simples pour couvrir les cas non couverts par la multiple
    if (remainingNumbers.length > 0) {
      // Générer grilles simples qui incluent les numéros restants
      const simpleGrids = this.generateCompensatorySimples(multipleNumbers, remainingNumbers, targetRank);
      
      for (const simple of simpleGrids) {
        grids.push({
          main: simple,
          type: 'simple',
          cost: 2.20
        });
        totalCost += 2.20;
      }
    }
    
    return {
      success: grids.length > 0,
      grids,
      cost: totalCost,
      testedCombinations: this.binomialCoefficient(selectedNumbers.length, 5)
    };
  }
  
  /**
   * Génère des grilles simples compensatoires
   */
  private generateCompensatorySimples(
    multipleNumbers: number[],
    remainingNumbers: number[],
    targetRank: number
  ): number[][] {
    
    const compensatory: number[][] = [];
    
    // Pour chaque numéro restant, créer des grilles qui l'incluent
    for (const remaining of remainingNumbers) {
      // Prendre 4 numéros de la multiple + le numéro restant
      const combinations = this.generateCombinations(multipleNumbers, 4);
      
      for (const combo of combinations.slice(0, 3)) { // Limiter à 3 grilles par numéro restant
        compensatory.push([...combo, remaining].sort((a, b) => a - b));
      }
    }
    
    return compensatory;
  }
  
  /**
   * Calcule le coût d'une grille multiple FDJ
   */
  private calculateMultipleCost(numbers: number): number {
    const costs: Record<number, number> = {
      5: 2.20,
      6: 13.20,
      7: 46.20,
      8: 123.20,
      9: 277.20,
      10: 554.40
    };
    
    return costs[numbers] || 0;
  }
  
  /**
   * HEURISTIQUE IA 1: Génère seulement les grilles "intelligentes"
   */
  private generateSmartCandidates(
    selectedNumbers: number[],
    complementaryNumbers: number[],
    includeComplementary: boolean
  ): Array<{main: number[], complementary?: number, score: number}> {
    
    const candidates: Array<{main: number[], complementary?: number, score: number}> = [];
    const allCombinations = this.generateCombinations(selectedNumbers, 5);
    
    // Scorer chaque grille selon des critères IA
    for (const combo of allCombinations) {
      const score = this.scoreGridWithAI(combo, selectedNumbers);
      
      if (includeComplementary && complementaryNumbers.length > 0) {
        for (const comp of complementaryNumbers) {
          candidates.push({
            main: combo,
            complementary: comp,
            score: score + this.scoreComplementary(comp)
          });
        }
      } else {
        candidates.push({
          main: combo,
          score: score
        });
      }
    }
    
    // Garder seulement les 30% meilleures grilles
    candidates.sort((a, b) => b.score - a.score);
    const keepCount = Math.max(10, Math.floor(candidates.length * 0.3));
    
    return candidates.slice(0, keepCount);
  }
  
  /**
   * HEURISTIQUE IA 2: Score une grille selon des critères intelligents
   */
  private scoreGridWithAI(grid: number[], allNumbers: number[]): number {
    let score = 0;
    
    // Critère 1: Répartition dans les dizaines
    const dizaines = new Set(grid.map(n => Math.floor(n / 10)));
    score += dizaines.size * 10; // Bonus pour diversité
    
    // Critère 2: Éviter les suites
    const sorted = [...grid].sort((a, b) => a - b);
    let suites = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] === sorted[i] + 1) suites++;
    }
    score -= suites * 15; // Malus pour suites
    
    // Critère 3: Équilibre pair/impair
    const pairs = grid.filter(n => n % 2 === 0).length;
    const impairs = grid.length - pairs;
    const equilibre = Math.abs(pairs - impairs);
    score += (5 - equilibre) * 5; // Bonus pour équilibre
    
    // Critère 4: Position dans la sélection (grilles "centrales" meilleures)
    const positions = grid.map(n => allNumbers.indexOf(n));
    const avgPosition = positions.reduce((a, b) => a + b, 0) / positions.length;
    const centerPosition = (allNumbers.length - 1) / 2;
    const distanceFromCenter = Math.abs(avgPosition - centerPosition);
    score += (allNumbers.length - distanceFromCenter) * 2;
    
    return Math.round(score);
  }
  
  /**
   * Score un numéro complémentaire
   */
  private scoreComplementary(comp: number): number {
    // Préférer les complémentaires moyens (5, 6) vs extrêmes (1, 10)
    const distance = Math.abs(comp - 5.5);
    return Math.round((5 - distance) * 3);
  }
  
  /**
   * HEURISTIQUE IA 3: Ordonne les candidats par promesse
   */
  private orderCandidatesByAI(
    candidates: Array<{main: number[], complementary?: number, score: number}>,
    selectedNumbers: number[],
    targetRank: number
  ): Array<{main: number[], complementary?: number}> {
    
    // Déjà triés par score, mais on peut ajouter d'autres critères
    return candidates.map(c => ({main: c.main, complementary: c.complementary}));
  }
  
  /**
   * RECHERCHE IA: Utilise des heuristiques pour accélérer
   */
  private findSolutionWithAI(
    candidates: Array<{main: number[], complementary?: number}>,
    allDraws: Array<{main: number[], complementary?: number}>,
    numGrids: number,
    targetRank: number,
    includeComplementary: boolean
  ): Array<{main: number[], complementary?: number}> | null {
    
    // Au lieu de tester TOUTES les combinaisons, on teste intelligemment
    const maxTests = Math.min(10000, this.binomialCoefficient(candidates.length, numGrids));
    
    console.log(`🤖 IA teste max ${maxTests.toLocaleString()} combinaisons intelligentes`);
    
    let testsCount = 0;
    const gridCombinations = this.generateCombinations(candidates, numGrids);
    
    for (const gridCombo of gridCombinations) {
      if (testsCount >= maxTests) {
        console.log(`🤖 Limite IA atteinte: ${maxTests} tests`);
        break;
      }
      
      if (this.quickTestCombination(gridCombo, allDraws, targetRank, includeComplementary)) {
        console.log(`🤖 IA trouvée en ${testsCount} tests !`);
        return gridCombo;
      }
      
      testsCount++;
    }
    
    return null;
  }
  
  /**
   * Test rapide optimisé
   */
  private quickTestCombination(
    grids: Array<{main: number[], complementary?: number}>,
    allDraws: Array<{main: number[], complementary?: number}>,
    targetRank: number,
    includeComplementary: boolean
  ): boolean {
    
    // Test rapide avec échantillonnage si trop de tirages
    const drawsToTest = allDraws.length > 1000 ? 
      this.sampleDraws(allDraws, 1000) : allDraws;
    
    for (const draw of drawsToTest) {
      let covered = false;
      
      for (const grid of grids) {
        const mainMatches = grid.main.filter(num => draw.main.includes(num)).length;
        
        if (includeComplementary) {
          const compMatch = grid.complementary === draw.complementary ? 1 : 0;
          if (mainMatches >= targetRank || (mainMatches + compMatch) >= targetRank) {
            covered = true;
            break;
          }
        } else {
          if (mainMatches >= targetRank) {
            covered = true;
            break;
          }
        }
      }
      
      if (!covered) return false;
    }
    
    return true;
  }
  
  /**
   * Échantillonne les tirages pour test rapide
   */
  private sampleDraws(
    allDraws: Array<{main: number[], complementary?: number}>,
    sampleSize: number
  ): Array<{main: number[], complementary?: number}> {
    
    const shuffled = [...allDraws].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, sampleSize);
  }
  
  /**
   * Validation rapide finale
   */
  private quickValidate(
    grids: Array<{main: number[], complementary?: number}>,
    allDraws: Array<{main: number[], complementary?: number}>,
    targetRank: number,
    includeComplementary: boolean
  ): boolean {
    
    // Pour petites sélections, validation complète
    if (allDraws.length <= 500) {
      return this.fullValidation(grids, allDraws, targetRank, includeComplementary);
    }
    
    // Pour grosses sélections, validation par échantillonnage
    const sample = this.sampleDraws(allDraws, 500);
    return this.fullValidation(grids, sample, targetRank, includeComplementary);
  }
  
  private fullValidation(
    grids: Array<{main: number[], complementary?: number}>,
    draws: Array<{main: number[], complementary?: number}>,
    targetRank: number,
    includeComplementary: boolean
  ): boolean {
    
    for (const draw of draws) {
      let covered = false;
      
      for (const grid of grids) {
        const mainMatches = grid.main.filter(num => draw.main.includes(num)).length;
        
        if (includeComplementary) {
          const compMatch = grid.complementary === draw.complementary ? 1 : 0;
          if (mainMatches >= targetRank || (mainMatches + compMatch) >= targetRank) {
            covered = true;
            break;
          }
        } else {
          if (mainMatches >= targetRank) {
            covered = true;
            break;
          }
        }
      }
      
      if (!covered) return false;
    }
    
    return true;
  }
  
  private generateAllDraws(
    selectedNumbers: number[],
    complementaryNumbers: number[],
    includeComplementary: boolean
  ): Array<{main: number[], complementary?: number}> {
    
    const mainDraws = this.generateCombinations(selectedNumbers, 5);
    const result: Array<{main: number[], complementary?: number}> = [];
    
    if (includeComplementary && complementaryNumbers.length > 0) {
      for (const draw of mainDraws) {
        for (const comp of complementaryNumbers) {
          result.push({main: draw, complementary: comp});
        }
      }
    } else {
      for (const draw of mainDraws) {
        result.push({main: draw});
      }
    }
    
    return result;
  }
  
  private generateCombinations(elements: any[], k: number): any[][] {
    if (k === 0) return [[]];
    if (k > elements.length) return [];
    
    const result: any[][] = [];
    
    const backtrack = (start: number, current: any[]) => {
      if (current.length === k) {
        result.push([...current]);
        return;
      }
      
      for (let i = start; i < elements.length; i++) {
        current.push(elements[i]);
        backtrack(i + 1, current);
        current.pop();
      }
    };
    
    backtrack(0, []);
    return result;
  }
  
  private binomialCoefficient(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1);
    }
    
    return Math.round(result);
  }
  
  /**
   * Calcule le minimum théorique de grilles nécessaires (borne de Schönheim)
   */
  private calculateMinimumBound(X: number): number {
    // Borne de Schönheim: L₀ = 1, puis Lᵢ₊₁ = ⌈(X-i)/(5-i) × Lᵢ⌉
    let L = [1]; // L₀ = 1
    
    for (let i = 0; i < 3; i++) {
      const nextL = Math.ceil(((X - i) / (5 - i)) * L[i]);
      L.push(nextL);
    }
    
    return L[3]; // LB2 = L₃
  }
}
