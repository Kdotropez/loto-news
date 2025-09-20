/**
 * CALCULATEUR DE BORNES THÉORIQUES POUR SET COVER
 * Implémente les formules mathématiques de bornes inférieures et supérieures
 */

export interface TheoreticalBounds {
  lowerBound1: number;  // LB1 = ⌈(X choose 3) / 10⌉
  lowerBound2: number;  // LB2 = Schönheim bound
  upperBound: number;   // UB = borne probabiliste
  optimalRange: string; // Estimation de l'optimal
  explanation: string;
}

export class TheoreticalBoundsCalculator {
  
  /**
   * Calcule toutes les bornes théoriques pour X numéros sélectionnés
   */
  public calculateBounds(X: number): TheoreticalBounds {
    console.log(`🧮 Calcul des bornes théoriques pour X = ${X} numéros`);
    
    // LB1: Borne inférieure simple
    const lb1 = this.calculateLowerBound1(X);
    
    // LB2: Borne de Schönheim (plus forte)
    const lb2 = this.calculateSchonheimBound(X);
    
    // UB: Borne supérieure probabiliste
    const ub = this.calculateUpperBound(X);
    
    const bestLowerBound = Math.max(lb1, lb2);
    
    return {
      lowerBound1: lb1,
      lowerBound2: lb2,
      upperBound: ub,
      optimalRange: `${bestLowerBound} - ${Math.min(ub, bestLowerBound * 2)}`,
      explanation: this.generateExplanation(X, lb1, lb2, ub)
    };
  }
  
  /**
   * LB1 = ⌈(X choose 3) / (5 choose 3)⌉ = ⌈(X choose 3) / 10⌉
   */
  private calculateLowerBound1(X: number): number {
    const xChoose3 = this.binomialCoefficient(X, 3);
    const fiveChoose3 = 10; // C(5,3) = 10
    
    const lb1 = Math.ceil(xChoose3 / fiveChoose3);
    
    console.log(`📊 LB1: ⌈C(${X},3) / 10⌉ = ⌈${xChoose3} / 10⌉ = ${lb1}`);
    
    return lb1;
  }
  
  /**
   * Borne de Schönheim - souvent plus forte que LB1
   * L₀ = 1, puis Lᵢ₊₁ = ⌈(X-i)/(5-i) × Lᵢ⌉ pour i = 0,1,2
   * LB2 = L₃
   */
  private calculateSchonheimBound(X: number): number {
    let L = [1]; // L₀ = 1
    
    console.log(`🔢 Schönheim: L₀ = ${L[0]}`);
    
    // Calculer L₁, L₂, L₃
    for (let i = 0; i < 3; i++) {
      const nextL = Math.ceil(((X - i) / (5 - i)) * L[i]);
      L.push(nextL);
      console.log(`🔢 Schönheim: L${i+1} = ⌈(${X-i})/(${5-i}) × ${L[i]}⌉ = ⌈${((X-i)/(5-i)).toFixed(2)} × ${L[i]}⌉ = ${nextL}`);
    }
    
    const lb2 = L[3];
    console.log(`📊 LB2 (Schönheim): ${lb2}`);
    
    return lb2;
  }
  
  /**
   * Borne supérieure probabiliste (très lâche mais sûre)
   * UB = ⌈(X choose 3) / (5 choose 3) × (ln(X choose 3) + 1)⌉
   */
  private calculateUpperBound(X: number): number {
    const xChoose3 = this.binomialCoefficient(X, 3);
    const fiveChoose3 = 10;
    
    const logFactor = Math.log(xChoose3) + 1;
    const ub = Math.ceil((xChoose3 / fiveChoose3) * logFactor);
    
    console.log(`📊 UB: ⌈${xChoose3}/10 × (ln(${xChoose3}) + 1)⌉ = ⌈${(xChoose3/10).toFixed(2)} × ${logFactor.toFixed(2)}⌉ = ${ub}`);
    
    return ub;
  }
  
  /**
   * Génère une explication détaillée des bornes
   */
  private generateExplanation(X: number, lb1: number, lb2: number, ub: number): string {
    const bestLB = Math.max(lb1, lb2);
    const xChoose3 = this.binomialCoefficient(X, 3);
    
    return `
📈 ANALYSE THÉORIQUE pour ${X} numéros sélectionnés:

🎯 MINIMUM ABSOLU: ${bestLB} grilles
   → Il est IMPOSSIBLE de faire mieux que ${bestLB} grilles
   → Toute solution avec moins de ${bestLB} grilles est MATHÉMATIQUEMENT FAUSSE

📊 COMBINAISONS À COUVRIR: ${xChoose3.toLocaleString()}
   → Chaque tirage de 5 numéros dans votre sélection de ${X}
   → Une grille couvre au maximum 10 combinaisons (C(5,3) = 10)

🔍 BORNES CALCULÉES:
   → LB1 (simple): ${lb1} grilles
   → LB2 (Schönheim): ${lb2} grilles  
   → Minimum théorique: ${bestLB} grilles
   → Maximum probable: ${ub} grilles

✅ OPTIMAL RÉALISTE: ${bestLB} - ${Math.min(ub, bestLB * 2)} grilles
`;
  }
  
  /**
   * Valide si une solution respecte les bornes théoriques
   */
  public validateSolution(X: number, proposedGrids: number): {
    isValid: boolean;
    analysis: string;
    confidence: 'IMPOSSIBLE' | 'SUSPECT' | 'PLAUSIBLE' | 'OPTIMAL';
  } {
    
    const bounds = this.calculateBounds(X);
    const minPossible = Math.max(bounds.lowerBound1, bounds.lowerBound2);
    
    if (proposedGrids < minPossible) {
      return {
        isValid: false,
        analysis: `❌ IMPOSSIBLE: ${proposedGrids} < ${minPossible} (minimum théorique)`,
        confidence: 'IMPOSSIBLE'
      };
    }
    
    if (proposedGrids === minPossible) {
      return {
        isValid: true,
        analysis: `🎯 OPTIMAL: ${proposedGrids} = ${minPossible} (minimum théorique atteint)`,
        confidence: 'OPTIMAL'
      };
    }
    
    if (proposedGrids <= minPossible * 2) {
      return {
        isValid: true,
        analysis: `✅ PLAUSIBLE: ${proposedGrids} proche du minimum ${minPossible}`,
        confidence: 'PLAUSIBLE'
      };
    }
    
    return {
      isValid: true,
      analysis: `⚠️ SUSPECT: ${proposedGrids} très éloigné du minimum ${minPossible}`,
      confidence: 'SUSPECT'
    };
  }
  
  /**
   * Coefficient binomial C(n,k)
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

