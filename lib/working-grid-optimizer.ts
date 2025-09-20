/**
 * OPTIMISATEUR QUI MARCHE - Solution par force brute
 * Simple mais FONCTIONNEL pour petites sélections
 */

export interface WorkingGridResult {
  grids: Array<{main: number[], complementary?: number}>;
  totalCost: number;
  isGuaranteed: boolean;
  testedCombinations: number;
  coverage: number;
  includesComplementary: boolean;
}

export class WorkingGridOptimizer {
  
  /**
   * ALGORITHME SET COVER QUI MARCHE - Force brute optimisée
   */
  public findWorkingGrids(
    selectedNumbers: number[],
    complementaryNumbers: number[] = [],
    targetRank: number = 3,
    maxGrids: number = 50,
    includeComplementary: boolean = false
  ): WorkingGridResult {
    
    console.log(`🚀 SET COVER ALGORITHM pour ${selectedNumbers.length} numéros + ${complementaryNumbers.length} complémentaires`);
    console.log(`🎯 Complémentaires inclus: ${includeComplementary}`);
    
    // PROTECTION CONTRE LES CRASHS
    const totalCombinations = this.binomialCoefficient(selectedNumbers.length, 5);
    const candidateGridsCount = totalCombinations;
    
    // Estimation de la complexité
    let estimatedTests = 0;
    for (let g = 1; g <= Math.min(maxGrids, 10); g++) {
      estimatedTests += this.binomialCoefficient(candidateGridsCount, g);
      if (estimatedTests > 1000000) break; // Limite à 1 million de tests
    }
    
    console.log(`📊 Estimation: ${estimatedTests.toLocaleString()} tests maximum`);
    
    if (estimatedTests > 1000000) {
      throw new Error(`CALCUL TROP COMPLEXE !\n\nAvec ${selectedNumbers.length} numéros:\n- ${totalCombinations} tirages à couvrir\n- ${candidateGridsCount} grilles candidates\n- > 1 million de tests nécessaires\n\nLimitez à 10 numéros maximum pour des calculs rapides.`);
    }
    
    // Générer TOUS les tirages possibles à couvrir (5 numéros principaux)
    const allPossibleDraws = this.generateCombinations(selectedNumbers, 5);
    console.log(`📊 ${allPossibleDraws.length} tirages principaux à couvrir`);
    
    // Générer toutes les combinaisons de tirages avec complémentaires si inclus
    let allDrawsWithComplementary: Array<{main: number[], complementary?: number}> = [];
    
    if (includeComplementary && complementaryNumbers.length > 0) {
      for (const draw of allPossibleDraws) {
        for (const comp of complementaryNumbers) {
          allDrawsWithComplementary.push({main: draw, complementary: comp});
        }
      }
      console.log(`📊 ${allDrawsWithComplementary.length} tirages avec complémentaires à couvrir`);
    } else {
      allDrawsWithComplementary = allPossibleDraws.map(draw => ({main: draw}));
      console.log(`📊 ${allDrawsWithComplementary.length} tirages sans complémentaires à couvrir`);
    }
    
    // Générer TOUTES les grilles candidates
    const candidateGrids = this.generateCandidateGridsWithComplementary(
      selectedNumbers, 
      complementaryNumbers, 
      includeComplementary
    );
    console.log(`🎯 ${candidateGrids.length} grilles candidates disponibles`);
    
    // STRATÉGIE 1: Essayer le minimum de grilles d'abord (limite sécurisée)
    const maxSafeGrids = selectedNumbers.length <= 8 ? 15 : selectedNumbers.length <= 10 ? 10 : 5;
    
    for (let numGrids = 1; numGrids <= Math.min(maxGrids, maxSafeGrids); numGrids++) {
      console.log(`🔄 TEST ${numGrids} grilles...`);
      
      // Essayer toutes les combinaisons de cette taille
      const solution = this.findSolutionWithNGridsAndComplementary(
        candidateGrids, 
        allDrawsWithComplementary, 
        numGrids, 
        targetRank,
        includeComplementary
      );
      
      if (solution) {
        console.log(`✅ SOLUTION TROUVÉE ! ${numGrids} grilles suffisent`);
        
        // VALIDATION FINALE : vérifier que ça marche vraiment
        const isValid = this.validateSolutionWithComplementary(
          solution, 
          allDrawsWithComplementary, 
          targetRank,
          includeComplementary
        );
        
        if (isValid) {
          return {
            grids: solution,
            totalCost: numGrids * 2.20,
            isGuaranteed: true,
            testedCombinations: allDrawsWithComplementary.length,
            coverage: 100,
            includesComplementary: includeComplementary
          };
        } else {
          console.log(`❌ Solution invalide détectée !`);
        }
      }
    }
    
    console.log(`❌ Aucune solution trouvée avec max ${maxGrids} grilles`);
    
    return {
      grids: [],
      totalCost: 0,
      isGuaranteed: false,
      testedCombinations: allDrawsWithComplementary.length,
      coverage: 0,
      includesComplementary: includeComplementary
    };
  }
  
  /**
   * Génère les grilles candidates avec ou sans complémentaires
   */
  private generateCandidateGridsWithComplementary(
    selectedNumbers: number[],
    complementaryNumbers: number[],
    includeComplementary: boolean
  ): Array<{main: number[], complementary?: number}> {
    
    const grids: Array<{main: number[], complementary?: number}> = [];
    const mainCombinations = this.generateCombinations(selectedNumbers, 5);
    
    if (includeComplementary && complementaryNumbers.length > 0) {
      // Générer grilles avec chaque complémentaire
      for (const mainCombo of mainCombinations) {
        for (const comp of complementaryNumbers) {
          grids.push({
            main: mainCombo,
            complementary: comp
          });
        }
      }
    } else {
      // Générer grilles sans complémentaires
      for (const mainCombo of mainCombinations) {
        grids.push({
          main: mainCombo
        });
      }
    }
    
    return grids;
  }
  
  /**
   * Trouve une solution avec exactement N grilles (avec complémentaires)
   */
  private findSolutionWithNGridsAndComplementary(
    candidateGrids: Array<{main: number[], complementary?: number}>,
    allDraws: Array<{main: number[], complementary?: number}>,
    numGrids: number,
    targetRank: number,
    includeComplementary: boolean
  ): Array<{main: number[], complementary?: number}> | null {
    
    // Générer toutes les combinaisons de N grilles
    const gridCombinations = this.generateCombinations(candidateGrids, numGrids);
    
    // Tester chaque combinaison
    for (const gridCombo of gridCombinations) {
      if (this.testGridCombinationWithComplementary(gridCombo, allDraws, targetRank, includeComplementary)) {
        return gridCombo;
      }
    }
    
    return null;
  }
  
  /**
   * Teste si une combinaison de grilles couvre TOUS les tirages (avec complémentaires)
   */
  private testGridCombinationWithComplementary(
    grids: Array<{main: number[], complementary?: number}>,
    allDraws: Array<{main: number[], complementary?: number}>,
    targetRank: number,
    includeComplementary: boolean
  ): boolean {
    
    // Pour chaque tirage possible
    for (const draw of allDraws) {
      let hasValidGrid = false;
      
      // Vérifier si au moins une grille couvre ce tirage
      for (const grid of grids) {
        const mainMatches = grid.main.filter(num => draw.main.includes(num)).length;
        
        let totalMatches = mainMatches;
        
        // Ajouter le match complémentaire si applicable
        if (includeComplementary && grid.complementary && draw.complementary) {
          if (grid.complementary === draw.complementary) {
            totalMatches += 1;
          }
        }
        
        // Vérifier si cette grille couvre le tirage
        if (includeComplementary) {
          // Avec complémentaires : besoin de targetRank numéros principaux OU (targetRank-1) + complémentaire
          if (mainMatches >= targetRank || totalMatches >= targetRank) {
            hasValidGrid = true;
            break;
          }
        } else {
          // Sans complémentaires : besoin de targetRank numéros principaux
          if (mainMatches >= targetRank) {
            hasValidGrid = true;
            break;
          }
        }
      }
      
      // Si ce tirage n'est couvert par aucune grille, échec
      if (!hasValidGrid) {
        return false;
      }
    }
    
    // Tous les tirages sont couverts !
    return true;
  }
  
  /**
   * VALIDATION FINALE avec complémentaires
   */
  private validateSolutionWithComplementary(
    grids: Array<{main: number[], complementary?: number}>,
    allDraws: Array<{main: number[], complementary?: number}>,
    targetRank: number,
    includeComplementary: boolean
  ): boolean {
    
    console.log(`🔍 VALIDATION de ${grids.length} grilles (complémentaires: ${includeComplementary})...`);
    
    let coveredDraws = 0;
    
    for (const draw of allDraws) {
      let isCovered = false;
      
      // Vérifier si au moins une grille couvre ce tirage
      for (const grid of grids) {
        const mainMatches = grid.main.filter(num => draw.main.includes(num)).length;
        
        let totalMatches = mainMatches;
        if (includeComplementary && grid.complementary && draw.complementary) {
          if (grid.complementary === draw.complementary) {
            totalMatches += 1;
          }
        }
        
        const isValidMatch = includeComplementary 
          ? (mainMatches >= targetRank || totalMatches >= targetRank)
          : (mainMatches >= targetRank);
        
        if (isValidMatch) {
          isCovered = true;
          break;
        }
      }
      
      if (isCovered) {
        coveredDraws++;
      } else {
        console.log(`❌ Tirage non couvert: [${draw.main.join(', ')}]${draw.complementary ? ` + ${draw.complementary}` : ''}`);
        return false;
      }
    }
    
    console.log(`✅ VALIDATION RÉUSSIE: ${coveredDraws}/${allDraws.length} tirages couverts`);
    return coveredDraws === allDraws.length;
  }
  
  /**
   * Trouve une solution avec exactement N grilles
   */
  private findSolutionWithNGrids(
    candidateGrids: number[][],
    allDraws: number[][],
    numGrids: number,
    targetRank: number
  ): number[][] | null {
    
    // Générer toutes les combinaisons de N grilles
    const gridCombinations = this.generateCombinations(candidateGrids, numGrids);
    
    // Tester chaque combinaison
    for (const gridCombo of gridCombinations) {
      if (this.testGridCombination(gridCombo, allDraws, targetRank)) {
        return gridCombo;
      }
    }
    
    return null;
  }
  
  /**
   * VALIDATION FINALE : vérifie qu'une solution marche vraiment
   */
  private validateSolution(
    grids: number[][],
    allDraws: number[][],
    targetRank: number
  ): boolean {
    
    console.log(`🔍 VALIDATION de ${grids.length} grilles...`);
    
    let coveredDraws = 0;
    
    for (const draw of allDraws) {
      let isCovered = false;
      
      // Vérifier si au moins une grille couvre ce tirage
      for (const grid of grids) {
        const matches = grid.filter(num => draw.includes(num)).length;
        if (matches >= targetRank) {
          isCovered = true;
          break;
        }
      }
      
      if (isCovered) {
        coveredDraws++;
      } else {
        console.log(`❌ Tirage non couvert: [${draw.join(', ')}]`);
        return false;
      }
    }
    
    console.log(`✅ VALIDATION RÉUSSIE: ${coveredDraws}/${allDraws.length} tirages couverts`);
    return coveredDraws === allDraws.length;
  }
  
  /**
   * Teste si une combinaison de grilles couvre TOUS les tirages
   */
  private testGridCombination(
    grids: number[][],
    allDraws: number[][],
    targetRank: number
  ): boolean {
    
    // Pour chaque tirage possible
    for (const draw of allDraws) {
      let hasValidGrid = false;
      
      // Vérifier si au moins une grille a assez de numéros corrects
      for (const grid of grids) {
        const matches = grid.filter(num => draw.includes(num)).length;
        if (matches >= targetRank) {
          hasValidGrid = true;
          break;
        }
      }
      
      // Si ce tirage n'est couvert par aucune grille, échec
      if (!hasValidGrid) {
        return false;
      }
    }
    
    // Tous les tirages sont couverts !
    return true;
  }
  
  /**
   * Génère toutes les combinaisons de k éléments parmi n
   */
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
  
  /**
   * Estime si le calcul est faisable
   */
  public estimateFeasibility(selectedNumbers: number[], maxGrids: number = 50, useAI: boolean = false): {
    feasible: boolean;
    reason: string;
    estimatedTime: string;
    combinations: number;
  } {
    
    const totalDraws = this.binomialCoefficient(selectedNumbers.length, 5);
    const candidateGrids = totalDraws;
    
    // Estimation grossière du nombre de tests
    let totalTests = 0;
    for (let g = 1; g <= Math.min(maxGrids, 20); g++) {
      totalTests += this.binomialCoefficient(candidateGrids, g);
    }
    
    // Avec IA, les limites sont différentes !
    if (useAI) {
      if (selectedNumbers.length <= 10) {
        return {
          feasible: true,
          reason: "🤖 IA: Grille multiple possible - Solution instantanée !",
          estimatedTime: "< 1 seconde",
          combinations: totalDraws
        };
      } else if (selectedNumbers.length <= 15) {
        return {
          feasible: true,
          reason: "🤖 IA: Mix hybride intelligent - Grille multiple + simples",
          estimatedTime: "1-10 secondes",
          combinations: totalDraws
        };
      } else {
        return {
          feasible: true,
          reason: "🤖 IA: Heuristiques avancées - Calcul optimisé",
          estimatedTime: "10-60 secondes",
          combinations: totalDraws
        };
      }
    } else {
      // Force brute classique
      if (selectedNumbers.length <= 8) {
        return {
          feasible: true,
          reason: "Petite sélection - Calcul rapide garanti",
          estimatedTime: "< 5 secondes",
          combinations: totalDraws
        };
      } else if (selectedNumbers.length <= 10) {
        return {
          feasible: true,
          reason: "Sélection modérée - Calcul possible",
          estimatedTime: "5-30 secondes",
          combinations: totalDraws
        };
      } else {
        return {
          feasible: false,
          reason: "❌ Force brute impossible - Utilisez l'IA !",
          estimatedTime: "Crash garanti sans IA",
          combinations: totalDraws
        };
      }
    }
  }
  
  /**
   * Calcule le coefficient binomial C(n,k)
   */
  private binomialCoefficient(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1);
    }
    
    return Math.round(result);
  }
}
