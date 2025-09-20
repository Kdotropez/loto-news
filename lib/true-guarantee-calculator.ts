// CORRECTION: Calculateur de VRAIES garanties - ALGORITHME PRÉCÉDENT ÉTAIT DÉFAILLANT !
import { avoidPredictablePatterns } from './grid-guarantee-calculator';

export interface TrueGuaranteeResult {
  targetRank: number;
  selectedNumbers: number[];
  complementaryNumbers: number[];
  guaranteedGrids: number[][];
  totalCost: number;
  isGuaranteed: boolean;
  coverage: string;
  explanation: string;
}

export class TrueGuaranteeCalculator {
  
  /**
   * Génère toutes les combinaisons possibles de k éléments parmi n
   */
  private generateAllCombinations(numbers: number[], k: number): number[][] {
    if (k === 0) return [[]];
    if (k > numbers.length) return [];
    
    const result: number[][] = [];
    
    const backtrack = (start: number, current: number[]) => {
      if (current.length === k) {
        result.push([...current]);
        return;
      }
      
      for (let i = start; i < numbers.length; i++) {
        current.push(numbers[i]);
        backtrack(i + 1, current);
        current.pop();
      }
    };
    
    backtrack(0, []);
    return result;
  }
  
  /**
   * ERREUR DÉTECTÉE - L'ANCIEN ALGORITHME ÉTAIT COMPLÈTEMENT FAUX !
   */
  public calculateTrueGuarantee(
    selectedNumbers: number[],
    complementaryNumbers: number[],
    targetRank: number,
    usePatternOptimization: boolean = true
  ): TrueGuaranteeResult {
    
    // Générer toutes les combinaisons possibles de tirages
    const allPossibleDraws = this.generateAllCombinations(selectedNumbers, 5);
    
    console.log(`❌ ERREUR DÉTECTÉE dans l'ancien algorithme !`);
    console.log(`📊 Pour ${selectedNumbers.length} numéros: ${allPossibleDraws.length} tirages possibles`);
    console.log(`🔍 Exemple de l'erreur: 2 grilles disjointes ne peuvent PAS couvrir tous les cas !`);
    
    // Retourner une erreur honnête
    throw new Error(`ALGORITHME DÉFAILLANT DÉTECTÉ !

L'ancien calcul était complètement FAUX.

EXEMPLE CONCRET:
- Sélection: [1,2,3,4,5,6,7,8,9,10]  
- Grilles proposées: [1,2,3,4,5] et [6,7,8,9,10]
- Tirage: [1,2,3,6,7]
- Résultat: Grille 1 = 3 numéros ✅, Grille 2 = 2 numéros ❌
- AUCUNE grille n'a 3+ numéros !

Le vrai algorithme de "Set Cover" est beaucoup plus complexe.
Implémentation correcte en cours de développement...`);
  }
  
  /**
   * Calcule les vraies garanties pour tous les rangs
   */
  public calculateAllRankGuarantees(
    selectedNumbers: number[],
    complementaryNumbers: number[],
    usePatternOptimization: boolean = true
  ): TrueGuaranteeResult[] {
    
    // PROTECTION: Éviter les calculs trop complexes
    const totalCombinations = this.calculateCombinations(selectedNumbers.length, 5);
    console.log(`📊 Calcul requis: ${totalCombinations} combinaisons pour ${selectedNumbers.length} numéros`);
    
    // Retourner une erreur honnête
    throw new Error(`ALGORITHME DÉFAILLANT DÉTECTÉ !

L'ancien système prétendait calculer des "vraies garanties" mais était complètement FAUX.

PROBLÈME: L'algorithme "greedy" naïf peut sélectionner des grilles qui ne se complètent pas.

SOLUTION: Il faut implémenter un vrai algorithme de "Set Cover Problem" ou de programmation linéaire.

Pour l'instant, utilisez les calculs probabilistes classiques en attendant la correction.`);
  }
  
  /**
   * Calcule C(n,k) - combinaisons
   */
  private calculateCombinations(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1);
    }
    return Math.round(result);
  }
}