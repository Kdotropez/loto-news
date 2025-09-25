const fs = require('fs');
const path = require('path');

class GapReturnAnalyzer {
  constructor() {
    this.tirages = [];
    this.gapReturnPatterns = {};
    this.numberStats = {};
  }

  loadData() {
    try {
      // Priorité au fichier JSON complet
      const dataPathComplet = path.join(__dirname, '../data/Tirages_Loto_1976_2025_COMPLET.json');
      const dataPath = path.join(__dirname, '../data/tirages.json');
      
      if (fs.existsSync(dataPathComplet)) {
        const rawData = fs.readFileSync(dataPathComplet, 'utf8');
        const jsonData = JSON.parse(rawData);
        
        // Convertir le format JSON complet vers le format standard
        this.tirages = jsonData.map((t) => ({
          id: t.annee_numero_de_tirage,
          date: new Date(t.date_de_tirage).toISOString().split('T')[0],
          numero1: t.boule_1,
          numero2: t.boule_2,
          numero3: t.boule_3,
          numero4: t.boule_4,
          numero5: t.boule_5,
          complementaire: t.numero_chance || (t.boule_complementaire % 10 + 1),
        }));
        
        console.log(`📊 ${this.tirages.length} tirages chargés depuis le fichier JSON complet`);
        return true;
      } else if (fs.existsSync(dataPath)) {
        const rawData = fs.readFileSync(dataPath, 'utf8');
        this.tirages = JSON.parse(rawData);
        console.log(`📊 ${this.tirages.length} tirages chargés depuis l'ancien fichier`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur chargement:', error.message);
      return false;
    }
  }

  analyzeGapReturnPatterns() {
    console.log(`🔍 Analyse des patterns écart-retour sur ${this.tirages.length} tirages\n`);
    
    // Trier par date
    const sortedTirages = this.tirages.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Pour chaque numéro, tracker ses écarts et retours
    for (let numero = 1; numero <= 49; numero++) {
      this.numberStats[numero] = {
        appearances: [],
        gaps: [],
        gapReturnPairs: [],
        totalAppearances: 0,
        maxGap: 0,
        avgGap: 0
      };
    }

    // Identifier toutes les apparitions de chaque numéro
    sortedTirages.forEach((tirage, index) => {
      let numeros = this.extractNumbers(tirage);
      
      numeros.forEach(numero => {
        if (numero >= 1 && numero <= 49) {
          this.numberStats[numero].appearances.push(index);
          this.numberStats[numero].totalAppearances++;
        }
      });
    });

    // Calculer les écarts et patterns de retour
    for (let numero = 1; numero <= 49; numero++) {
      const stats = this.numberStats[numero];
      const appearances = stats.appearances;
      
      for (let i = 1; i < appearances.length; i++) {
        const gap = appearances[i] - appearances[i-1];
        stats.gaps.push(gap);
        stats.maxGap = Math.max(stats.maxGap, gap);
        
        // Analyser ce qui se passe APRÈS un écart de cette taille
        if (i < appearances.length - 1) {
          const nextGap = appearances[i+1] - appearances[i];
          stats.gapReturnPairs.push({ gap, nextGap });
        }
      }
      
      if (stats.gaps.length > 0) {
        stats.avgGap = Math.round(stats.gaps.reduce((a, b) => a + b, 0) / stats.gaps.length);
      }
    }

    return this.generateInsights();
  }

  extractNumbers(tirage) {
    if (tirage.numero1) {
      return [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
    } else if (tirage.boule_1) {
      return [tirage.boule_1, tirage.boule_2, tirage.boule_3, tirage.boule_4, tirage.boule_5];
    }
    return [];
  }

  generateInsights() {
    const insights = {
      gapReturnPatterns: {},
      probabilityByGap: {},
      numberBehaviors: {},
      globalStats: {}
    };

    // 1. PATTERNS ÉCART-RETOUR GLOBAUX
    const allGapReturnPairs = [];
    Object.values(this.numberStats).forEach(stats => {
      allGapReturnPairs.push(...stats.gapReturnPairs);
    });

    // Grouper par taille d'écart
    const gapGroups = {
      'petit': { range: [1, 10], pairs: [] },
      'moyen': { range: [11, 30], pairs: [] },
      'grand': { range: [31, 80], pairs: [] },
      'énorme': { range: [81, 999], pairs: [] }
    };

    allGapReturnPairs.forEach(pair => {
      Object.entries(gapGroups).forEach(([category, group]) => {
        if (pair.gap >= group.range[0] && pair.gap <= group.range[1]) {
          group.pairs.push(pair);
        }
      });
    });

    // 2. PROBABILITÉ DE SORTIE SELON L'ÉCART
    insights.probabilityByGap = {};
    Object.entries(gapGroups).forEach(([category, group]) => {
      if (group.pairs.length > 0) {
        const nextGaps = group.pairs.map(p => p.nextGap);
        const avgNextGap = nextGaps.reduce((a, b) => a + b, 0) / nextGaps.length;
        const quickReturns = nextGaps.filter(gap => gap <= 10).length;
        const quickReturnRate = (quickReturns / nextGaps.length) * 100;
        
        insights.probabilityByGap[category] = {
          avgGap: Math.round(group.pairs.reduce((a, b) => a + b.gap, 0) / group.pairs.length),
          avgNextGap: Math.round(avgNextGap),
          quickReturnRate: Math.round(quickReturnRate),
          totalCases: group.pairs.length,
          distribution: this.getDistribution(nextGaps)
        };
      }
    });

    // 3. COMPORTEMENTS SPÉCIFIQUES PAR NUMÉRO
    insights.numberBehaviors = {};
    Object.entries(this.numberStats).forEach(([numero, stats]) => {
      if (stats.gapReturnPairs.length > 5) { // Assez de données
        const bigGaps = stats.gapReturnPairs.filter(p => p.gap > 50);
        if (bigGaps.length > 0) {
          const avgReturnAfterBigGap = bigGaps.reduce((a, b) => a + b.nextGap, 0) / bigGaps.length;
          insights.numberBehaviors[numero] = {
            maxGap: stats.maxGap,
            avgGap: stats.avgGap,
            bigGapsCount: bigGaps.length,
            avgReturnAfterBigGap: Math.round(avgReturnAfterBigGap),
            isRegular: stats.avgGap < 30 && stats.maxGap < 100,
            isIrregular: stats.maxGap > 120,
            totalAppearances: stats.totalAppearances
          };
        }
      }
    });

    return insights;
  }

  getDistribution(gaps) {
    const ranges = {
      'immédiat (1-5)': gaps.filter(g => g <= 5).length,
      'rapide (6-15)': gaps.filter(g => g > 5 && g <= 15).length,
      'normal (16-40)': gaps.filter(g => g > 15 && g <= 40).length,
      'lent (41+)': gaps.filter(g => g > 40).length
    };
    
    const total = gaps.length;
    Object.keys(ranges).forEach(key => {
      ranges[key] = Math.round((ranges[key] / total) * 100);
    });
    
    return ranges;
  }

  displayResults(insights) {
    console.log('🎯 ANALYSE DES PATTERNS ÉCART-RETOUR\n');
    
    // 1. PROBABILITÉS SELON LA TAILLE DE L'ÉCART
    console.log('📊 PROBABILITÉ DE RETOUR SELON L\'ÉCART PRÉCÉDENT:\n');
    Object.entries(insights.probabilityByGap).forEach(([category, data]) => {
      console.log(`🔸 Après un écart ${category.toUpperCase()} (${data.avgGap} tirages en moyenne):`);
      console.log(`   • Retour rapide (≤10 tirages): ${data.quickReturnRate}%`);
      console.log(`   • Écart suivant moyen: ${data.avgNextGap} tirages`);
      console.log(`   • Basé sur ${data.totalCases} cas observés`);
      console.log(`   • Distribution des retours:`);
      Object.entries(data.distribution).forEach(([range, percent]) => {
        console.log(`     - ${range}: ${percent}%`);
      });
      console.log('');
    });

    // 2. NUMÉROS À COMPORTEMENT PARTICULIER
    console.log('🎭 NUMÉROS À COMPORTEMENTS SPÉCIAUX:\n');
    
    const regulars = Object.entries(insights.numberBehaviors)
      .filter(([num, behavior]) => behavior.isRegular)
      .sort(([,a], [,b]) => a.avgGap - b.avgGap)
      .slice(0, 5);
      
    const irregulars = Object.entries(insights.numberBehaviors)
      .filter(([num, behavior]) => behavior.isIrregular)
      .sort(([,a], [,b]) => b.maxGap - a.maxGap)
      .slice(0, 5);

    console.log('✅ TOP 5 NUMÉROS RÉGULIERS (retours prévisibles):');
    regulars.forEach(([numero, behavior]) => {
      console.log(`   ${numero}: Écart moyen ${behavior.avgGap}, max ${behavior.maxGap} (${behavior.totalAppearances} sorties)`);
    });

    console.log('\n⚠️  TOP 5 NUMÉROS IRRÉGULIERS (grands écarts fréquents):');
    irregulars.forEach(([numero, behavior]) => {
      console.log(`   ${numero}: Max ${behavior.maxGap}, ${behavior.bigGapsCount} gros écarts, retour moyen après gros écart: ${behavior.avgReturnAfterBigGap}`);
    });

    // 3. RECOMMANDATIONS STRATÉGIQUES
    console.log('\n💡 RECOMMANDATIONS STRATÉGIQUES:\n');
    
    const petitEcart = insights.probabilityByGap['petit'];
    const grandEcart = insights.probabilityByGap['énorme'];
    
    if (petitEcart && grandEcart) {
      console.log('🎯 STRATÉGIE OPTIMALE:');
      console.log(`   • Après petit écart: ${petitEcart.quickReturnRate}% de retour rapide`);
      console.log(`   • Après énorme écart: ${grandEcart.quickReturnRate}% de retour rapide`);
      
      if (grandEcart.quickReturnRate > petitEcart.quickReturnRate) {
        console.log('   ⚡ INSIGHT: Les numéros reviennent PLUS vite après de très gros écarts !');
        console.log('   📈 Stratégie: Privilégier les numéros en écart critique');
      } else {
        console.log('   🔄 INSIGHT: Les retours sont plus prévisibles après petits écarts');
        console.log('   📈 Stratégie: Éviter les numéros en très gros écart');
      }
    }
  }
}

// Exécution
const analyzer = new GapReturnAnalyzer();
if (analyzer.loadData()) {
  const insights = analyzer.analyzeGapReturnPatterns();
  analyzer.displayResults(insights);
} else {
  console.log('❌ Impossible de charger les données');
}
