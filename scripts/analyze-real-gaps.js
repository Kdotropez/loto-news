const fs = require('fs');
const path = require('path');

// Simuler la structure de données de votre application
class DataAnalyzer {
  constructor() {
    this.tirages = [];
  }

  // Charger les données (simulation - vous devrez adapter selon votre structure)
  loadData() {
    try {
      // Essayer de charger depuis votre fichier de données principal
      const dataPath = path.join(__dirname, '../data/tirages.json');
      if (fs.existsSync(dataPath)) {
        const rawData = fs.readFileSync(dataPath, 'utf8');
        this.tirages = JSON.parse(rawData);
      } else {
        console.log('⚠️  Fichier de données principal non trouvé');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Erreur chargement données:', error.message);
      return false;
    }
  }

  // Analyser les écarts réels pour chaque numéro
  analyzeRealGaps() {
    if (this.tirages.length === 0) {
      console.log('❌ Aucune donnée à analyser');
      return null;
    }

    console.log(`📊 Analyse de ${this.tirages.length} tirages`);
    
    const gaps = {};
    const lastSeen = {};
    const maxGaps = {};
    
    // Initialiser pour tous les numéros 1-49
    for (let num = 1; num <= 49; num++) {
      gaps[num] = [];
      maxGaps[num] = 0;
      lastSeen[num] = -1;
    }

    // Trier les tirages par date (du plus ancien au plus récent)
    const sortedTirages = this.tirages.sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Analyser chaque tirage
    sortedTirages.forEach((tirage, index) => {
      // Extraire les numéros (adapter selon votre format)
      let numeros = [];
      if (tirage.numero1) {
        numeros = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
      } else if (tirage.boule_1) {
        numeros = [tirage.boule_1, tirage.boule_2, tirage.boule_3, tirage.boule_4, tirage.boule_5];
      }

      // Pour chaque numéro sorti
      numeros.forEach(numero => {
        if (numero >= 1 && numero <= 49) {
          if (lastSeen[numero] !== -1) {
            const gap = index - lastSeen[numero];
            gaps[numero].push(gap);
            maxGaps[numero] = Math.max(maxGaps[numero], gap);
          }
          lastSeen[numero] = index;
        }
      });

      // Calculer les écarts actuels pour les numéros non sortis
      for (let num = 1; num <= 49; num++) {
        if (!numeros.includes(num) && lastSeen[num] !== -1) {
          const currentGap = index - lastSeen[num];
          maxGaps[num] = Math.max(maxGaps[num], currentGap);
        }
      }
    });

    // Calculer les écarts actuels finaux
    const finalIndex = sortedTirages.length - 1;
    const currentGaps = {};
    
    for (let num = 1; num <= 49; num++) {
      if (lastSeen[num] !== -1) {
        currentGaps[num] = finalIndex - lastSeen[num];
        maxGaps[num] = Math.max(maxGaps[num], currentGaps[num]);
      } else {
        currentGaps[num] = sortedTirages.length; // Jamais sorti
        maxGaps[num] = sortedTirages.length;
      }
    }

    return {
      totalTirages: sortedTirages.length,
      maxGaps,
      currentGaps,
      gaps,
      statistics: this.calculateStatistics(maxGaps, currentGaps)
    };
  }

  calculateStatistics(maxGaps, currentGaps) {
    const maxValues = Object.values(maxGaps);
    const currentValues = Object.values(currentGaps);
    
    return {
      maxGapOverall: Math.max(...maxValues),
      minGapOverall: Math.min(...maxValues),
      averageMaxGap: Math.round(maxValues.reduce((a, b) => a + b, 0) / maxValues.length),
      maxCurrentGap: Math.max(...currentValues),
      averageCurrentGap: Math.round(currentValues.reduce((a, b) => a + b, 0) / currentValues.length),
      numbersNeverDrawn: Object.entries(currentGaps)
        .filter(([num, gap]) => gap === this.tirages.length)
        .map(([num]) => parseInt(num))
    };
  }

  displayResults(analysis) {
    if (!analysis) return;

    console.log('\n🎯 ANALYSE DES ÉCARTS RÉELS\n');
    
    console.log('📈 STATISTIQUES GLOBALES:');
    console.log(`   • Écart maximum observé: ${analysis.statistics.maxGapOverall} tirages`);
    console.log(`   • Écart minimum observé: ${analysis.statistics.minGapOverall} tirages`);
    console.log(`   • Écart maximum moyen: ${analysis.statistics.averageMaxGap} tirages`);
    console.log(`   • Écart actuel maximum: ${analysis.statistics.maxCurrentGap} tirages`);
    console.log(`   • Écart actuel moyen: ${analysis.statistics.averageCurrentGap} tirages`);
    
    if (analysis.statistics.numbersNeverDrawn.length > 0) {
      console.log(`   • Numéros jamais sortis: ${analysis.statistics.numbersNeverDrawn.join(', ')}`);
    }

    console.log('\n🔥 TOP 10 ÉCARTS MAXIMUM HISTORIQUES:');
    const sortedMaxGaps = Object.entries(analysis.maxGaps)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    sortedMaxGaps.forEach(([numero, gap], index) => {
      console.log(`   ${index + 1}. Numéro ${numero}: ${gap} tirages`);
    });

    console.log('\n❄️  TOP 10 ÉCARTS ACTUELS:');
    const sortedCurrentGaps = Object.entries(analysis.currentGaps)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    sortedCurrentGaps.forEach(([numero, gap], index) => {
      console.log(`   ${index + 1}. Numéro ${numero}: ${gap} tirages`);
    });

    console.log('\n💡 RECOMMANDATIONS POUR LES SEUILS:');
    const stats = analysis.statistics;
    console.log(`   🚨 Critique: ${Math.round(stats.maxGapOverall * 0.7)} tirages (70% du max observé)`);
    console.log(`   ⚠️  Élevé: ${Math.round(stats.maxGapOverall * 0.5)} tirages (50% du max observé)`);
    console.log(`   ⏰ Moyen: ${Math.round(stats.maxGapOverall * 0.3)} tirages (30% du max observé)`);
    console.log(`   ✅ Faible: ${Math.round(stats.maxGapOverall * 0.15)} tirages (15% du max observé)`);
  }
}

// Exécuter l'analyse
const analyzer = new DataAnalyzer();
if (analyzer.loadData()) {
  const results = analyzer.analyzeRealGaps();
  analyzer.displayResults(results);
} else {
  console.log('⚠️  Impossible de charger les données pour l\'analyse');
  console.log('💡 Suggestions basées sur des données Loto typiques:');
  console.log('   • Écart maximum typique: 80-150 tirages');
  console.log('   • Écart critique suggéré: 100 tirages');
  console.log('   • Écart élevé suggéré: 60 tirages');
  console.log('   • Écart moyen suggéré: 30 tirages');
  console.log('   • Écart faible suggéré: 15 tirages');
}
