interface TirageData {
  date: string;
  numero1?: number;
  numero2?: number;
  numero3?: number;
  numero4?: number;
  numero5?: number;
  boule_1?: number;
  boule_2?: number;
  boule_3?: number;
  boule_4?: number;
  boule_5?: number;
  complementaire?: number;
  numero_chance?: number;
}

interface EcartNiveau {
  numero: number;
  niveau: 'critique' | 'eleve' | 'moyen' | 'faible';
  ecart: number;
}

interface MelangeStats {
  combinaison: string;
  frequence: number;
  pourcentage: number;
  exemples: string[];
}

interface MelangeOptimalResult {
  statistiques: MelangeStats[];
  recommandations: {
    numero: number;
    scoreOptimal: number;
    niveauRecommande: 'critique' | 'eleve' | 'moyen' | 'faible';
    raison: string;
  }[];
  resumeGlobal: {
    meilleureCombinaisonType: string;
    probabiliteOptimale: number;
    nombreTiragesAnalyses: number;
  };
}

export class MelangeOptimalAnalyzer {
  
  /**
   * Analyse les patterns de mélange optimal entre différents niveaux d'écart
   */
  async analyzeOptimalMixing(
    tirages: TirageData[], 
    period: string = 'last100',
    seuils: {
      critique: number;
      eleve: number;
      moyen: number;
    } = { critique: 20, eleve: 12, moyen: 6 }
  ): Promise<MelangeOptimalResult> {
    
    // Filtrer les tirages selon la période
    const tiragedFiltered = this.filterByPeriod(tirages, period);
    
    // Calculer les écarts pour chaque numéro à chaque tirage
    const historicalEcarts = this.calculateHistoricalEcarts(tiragedFiltered);
    
    // Analyser les combinaisons de niveaux dans chaque tirage
    const melangeStats = this.analyzeMixingPatterns(tiragedFiltered, historicalEcarts, seuils);
    
    // Générer les recommandations
    const recommandations = this.generateRecommendations(melangeStats, historicalEcarts, seuils);
    
    // Résumé global
    const resumeGlobal = this.generateGlobalSummary(melangeStats, tiragedFiltered.length);
    
    return {
      statistiques: melangeStats,
      recommandations,
      resumeGlobal
    };
  }

  private filterByPeriod(tirages: TirageData[], period: string): TirageData[] {
    const sortedTirages = tirages.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    switch (period) {
      case 'last20': return sortedTirages.slice(0, 20);
      case 'last50': return sortedTirages.slice(0, 50);
      case 'last100': return sortedTirages.slice(0, 100);
      case 'week': 
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return sortedTirages.filter(t => new Date(t.date) >= oneWeekAgo);
      case 'month':
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return sortedTirages.filter(t => new Date(t.date) >= oneMonthAgo);
      case 'year':
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return sortedTirages.filter(t => new Date(t.date) >= oneYearAgo);
      default:
        return sortedTirages;
    }
  }

  private calculateHistoricalEcarts(tirages: TirageData[]): Map<string, EcartNiveau[]> {
    const ecartsMap = new Map<string, EcartNiveau[]>();
    
    // Pour chaque tirage, calculer l'écart de chaque numéro au moment de ce tirage
    for (let i = 0; i < tirages.length; i++) {
      const tirage = tirages[i];
      const ecartsAtThisTime: EcartNiveau[] = [];
      
      // Extraire les numéros du tirage
      const numeros = this.extractNumbers(tirage);
      
      for (const numero of numeros) {
        // Calculer l'écart de ce numéro au moment de ce tirage
        const ecart = this.calculateEcartAtTime(numero, i, tirages);
        const niveau = this.determineNiveau(ecart, { critique: 20, eleve: 12, moyen: 6 });
        
        ecartsAtThisTime.push({
          numero,
          niveau,
          ecart
        });
      }
      
      ecartsMap.set(tirage.date, ecartsAtThisTime);
    }
    
    return ecartsMap;
  }

  private extractNumbers(tirage: TirageData): number[] {
    if (tirage.numero1) {
      return [tirage.numero1, tirage.numero2!, tirage.numero3!, tirage.numero4!, tirage.numero5!];
    } else {
      return [tirage.boule_1!, tirage.boule_2!, tirage.boule_3!, tirage.boule_4!, tirage.boule_5!];
    }
  }

  private calculateEcartAtTime(numero: number, currentIndex: number, tirages: TirageData[]): number {
    // Chercher la dernière sortie de ce numéro avant le tirage actuel
    for (let i = currentIndex + 1; i < tirages.length; i++) {
      const numeros = this.extractNumbers(tirages[i]);
      if (numeros.includes(numero)) {
        return i - currentIndex;
      }
    }
    
    // Si pas trouvé, retourner un écart maximum
    return Math.min(tirages.length - currentIndex, 100);
  }

  private determineNiveau(ecart: number, seuils: { critique: number; eleve: number; moyen: number }): 'critique' | 'eleve' | 'moyen' | 'faible' {
    if (ecart >= seuils.critique) return 'critique';
    if (ecart >= seuils.eleve) return 'eleve';
    if (ecart >= seuils.moyen) return 'moyen';
    return 'faible';
  }

  private analyzeMixingPatterns(
    tirages: TirageData[], 
    historicalEcarts: Map<string, EcartNiveau[]>, 
    seuils: { critique: number; eleve: number; moyen: number }
  ): MelangeStats[] {
    
    const combinaisonCounts = new Map<string, { count: number; exemples: string[] }>();
    
    // Analyser chaque tirage
    for (const tirage of tirages) {
      const ecartsData = historicalEcarts.get(tirage.date);
      if (!ecartsData) continue;
      
      // Compter les numéros par niveau
      const niveauCounts = {
        critique: ecartsData.filter(e => e.niveau === 'critique').length,
        eleve: ecartsData.filter(e => e.niveau === 'eleve').length,
        moyen: ecartsData.filter(e => e.niveau === 'moyen').length,
        faible: ecartsData.filter(e => e.niveau === 'faible').length
      };
      
      // Créer une signature de la combinaison
      const signature = `C${niveauCounts.critique}-E${niveauCounts.eleve}-M${niveauCounts.moyen}-F${niveauCounts.faible}`;
      
      if (!combinaisonCounts.has(signature)) {
        combinaisonCounts.set(signature, { count: 0, exemples: [] });
      }
      
      const entry = combinaisonCounts.get(signature)!;
      entry.count++;
      if (entry.exemples.length < 3) {
        entry.exemples.push(tirage.date);
      }
    }
    
    // Convertir en statistiques
    const totalTirages = tirages.length;
    const stats: MelangeStats[] = [];
    
    for (const [combinaison, data] of Array.from(combinaisonCounts.entries())) {
      stats.push({
        combinaison,
        frequence: data.count,
        pourcentage: (data.count / totalTirages) * 100,
        exemples: data.exemples
      });
    }
    
    // Trier par fréquence décroissante
    return stats.sort((a, b) => b.frequence - a.frequence);
  }

  private generateRecommendations(
    melangeStats: MelangeStats[],
    historicalEcarts: Map<string, EcartNiveau[]>,
    seuils: { critique: number; eleve: number; moyen: number }
  ): MelangeOptimalResult['recommandations'] {
    
    // Identifier la meilleure combinaison
    const bestCombination = melangeStats[0];
    if (!bestCombination) return [];
    
    // Parser la combinaison optimale
    const match = bestCombination.combinaison.match(/C(\d+)-E(\d+)-M(\d+)-F(\d+)/);
    if (!match) return [];
    
    const optimal = {
      critique: parseInt(match[1]),
      eleve: parseInt(match[2]),
      moyen: parseInt(match[3]),
      faible: parseInt(match[4])
    };
    
    // Générer des recommandations pour 49 numéros
    const recommandations: MelangeOptimalResult['recommandations'] = [];
    
    for (let numero = 1; numero <= 49; numero++) {
      // Calculer un score basé sur l'historique de ce numéro
      const score = this.calculateOptimalScore(numero, optimal, historicalEcarts);
      
      // Déterminer le niveau recommandé
      let niveauRecommande: 'critique' | 'eleve' | 'moyen' | 'faible';
      let raison: string;
      
      if (optimal.critique > 0 && score > 0.8) {
        niveauRecommande = 'critique';
        raison = `Numéro performant dans les combinaisons avec ${optimal.critique} numéro(s) critique(s)`;
      } else if (optimal.eleve > 0 && score > 0.6) {
        niveauRecommande = 'eleve';
        raison = `Bon potentiel dans les mélanges avec ${optimal.eleve} numéro(s) élevé(s)`;
      } else if (optimal.moyen > 0 && score > 0.4) {
        niveauRecommande = 'moyen';
        raison = `Équilibre optimal avec ${optimal.moyen} numéro(s) moyen(s)`;
      } else {
        niveauRecommande = 'faible';
        raison = `Complément idéal avec ${optimal.faible} numéro(s) faible(s)`;
      }
      
      recommandations.push({
        numero,
        scoreOptimal: Math.round(score * 100) / 100,
        niveauRecommande,
        raison
      });
    }
    
    // Trier par score décroissant
    return recommandations.sort((a, b) => b.scoreOptimal - a.scoreOptimal);
  }

  private calculateOptimalScore(
    numero: number,
    optimal: { critique: number; eleve: number; moyen: number; faible: number },
    historicalEcarts: Map<string, EcartNiveau[]>
  ): number {
    
    let totalScore = 0;
    let count = 0;
    
    // Analyser les performances historiques de ce numéro
    for (const [date, ecartsData] of Array.from(historicalEcarts.entries())) {
      const numeroData = ecartsData.find(e => e.numero === numero);
      if (!numeroData) continue;
      
      // Calculer un score basé sur la correspondance avec le pattern optimal
      let score = 0;
      
      switch (numeroData.niveau) {
        case 'critique':
          score = optimal.critique > 0 ? 1.0 : 0.2;
          break;
        case 'eleve':
          score = optimal.eleve > 0 ? 0.8 : 0.4;
          break;
        case 'moyen':
          score = optimal.moyen > 0 ? 0.6 : 0.6;
          break;
        case 'faible':
          score = optimal.faible > 0 ? 0.4 : 0.8;
          break;
      }
      
      totalScore += score;
      count++;
    }
    
    return count > 0 ? totalScore / count : 0.5;
  }

  private generateGlobalSummary(melangeStats: MelangeStats[], nombreTirages: number): MelangeOptimalResult['resumeGlobal'] {
    if (melangeStats.length === 0) {
      return {
        meilleureCombinaisonType: 'Aucune donnée',
        probabiliteOptimale: 0,
        nombreTiragesAnalyses: nombreTirages
      };
    }
    
    const best = melangeStats[0];
    
    return {
      meilleureCombinaisonType: this.formatCombinaisonName(best.combinaison),
      probabiliteOptimale: best.pourcentage,
      nombreTiragesAnalyses: nombreTirages
    };
  }

  private formatCombinaisonName(combinaison: string): string {
    const match = combinaison.match(/C(\d+)-E(\d+)-M(\d+)-F(\d+)/);
    if (!match) return combinaison;
    
    const parts = [];
    if (parseInt(match[1]) > 0) parts.push(`${match[1]} critique(s)`);
    if (parseInt(match[2]) > 0) parts.push(`${match[2]} élevé(s)`);
    if (parseInt(match[3]) > 0) parts.push(`${match[3]} moyen(s)`);
    if (parseInt(match[4]) > 0) parts.push(`${match[4]} faible(s)`);
    
    return parts.join(' + ');
  }
}

export const melangeOptimalAnalyzer = new MelangeOptimalAnalyzer();
