const fs = require('fs');
const path = require('path');

// Simuler l'appel API en testant directement la classe
async function testIntelligentAnalysis() {
  try {
    // Charger les données
    const dataPath = path.join(__dirname, '../data/tirages.json');
    if (!fs.existsSync(dataPath)) {
      console.log('❌ Fichier tirages.json non trouvé');
      return;
    }

    const rawData = fs.readFileSync(dataPath, 'utf8');
    const tirages = JSON.parse(rawData);
    
    console.log(`📊 ${tirages.length} tirages chargés`);
    
    // Test de l'extraction des numéros
    const testTirage = tirages[0];
    console.log('🔍 Test tirage:', testTirage);
    
    let numeros = [];
    if (testTirage.numero1) {
      numeros = [testTirage.numero1, testTirage.numero2, testTirage.numero3, testTirage.numero4, testTirage.numero5];
    } else if (testTirage.boule_1) {
      numeros = [testTirage.boule_1, testTirage.boule_2, testTirage.boule_3, testTirage.boule_4, testTirage.boule_5];
    }
    
    console.log('🎯 Numéros extraits:', numeros);
    
    // Test analyse des fréquences sur les 20 derniers
    const last20 = tirages.slice(-20);
    const frequencies = {};
    
    for (let i = 1; i <= 49; i++) {
      frequencies[i] = 0;
    }
    
    last20.forEach(tirage => {
      let nums = [];
      if (tirage.numero1) {
        nums = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
      } else if (tirage.boule_1) {
        nums = [tirage.boule_1, tirage.boule_2, tirage.boule_3, tirage.boule_4, tirage.boule_5];
      }
      
      nums.forEach(num => {
        if (num >= 1 && num <= 49) {
          frequencies[num]++;
        }
      });
    });
    
    // Afficher les numéros les plus fréquents
    const sortedFreqs = Object.entries(frequencies)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    console.log('\n🔥 TOP 10 NUMÉROS CHAUDS (20 derniers tirages):');
    sortedFreqs.forEach(([num, freq], index) => {
      console.log(`   ${index + 1}. Numéro ${num}: ${freq} sorties`);
    });
    
    // Test des écarts
    const gaps = {};
    const lastSeen = {};
    
    // Initialiser
    for (let i = 1; i <= 49; i++) {
      lastSeen[i] = -1;
    }
    
    // Calculer les écarts
    tirages.forEach((tirage, index) => {
      let nums = [];
      if (tirage.numero1) {
        nums = [tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5];
      } else if (tirage.boule_1) {
        nums = [tirage.boule_1, tirage.boule_2, tirage.boule_3, tirage.boule_4, tirage.boule_5];
      }
      
      nums.forEach(num => {
        if (num >= 1 && num <= 49) {
          lastSeen[num] = index;
        }
      });
    });
    
    // Calculer les écarts actuels
    const finalIndex = tirages.length - 1;
    for (let num = 1; num <= 49; num++) {
      const currentGap = lastSeen[num] !== -1 ? finalIndex - lastSeen[num] : tirages.length;
      gaps[num] = currentGap;
    }
    
    // Afficher les plus gros écarts
    const sortedGaps = Object.entries(gaps)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    console.log('\n⏰ TOP 10 PLUS GROS ÉCARTS ACTUELS:');
    sortedGaps.forEach(([num, gap], index) => {
      console.log(`   ${index + 1}. Numéro ${num}: ${gap} tirages d'écart`);
    });
    
  } catch (error) {
    console.error('❌ Erreur test:', error);
  }
}

testIntelligentAnalysis();
