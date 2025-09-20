/**
 * TEST DE L'API OPENDATASOFT POUR LES RÉSULTATS LOTO
 * Analyse la structure et teste la récupération des derniers tirages
 */

async function testOpenDataSoftAPI() {
  console.log('🔍 Test de l\'API OpenDataSoft Loto...\n');
  
  try {
    // Test 1: Récupérer les 5 derniers tirages
    console.log('📊 Test 1: Structure des données');
    const response1 = await fetch('https://data.opendatasoft.com/api/explore/v2.1/catalog/datasets/resultats-loto-2019-a-aujourd-hui@agrall/records?limit=5');
    const data1 = await response1.json();
    
    console.log('Total disponible:', data1.total_count);
    console.log('Exemple de tirage:');
    console.log(JSON.stringify(data1.results[0], null, 2));
    
    // Test 2: Récupérer les tirages récents avec tri
    console.log('\n📅 Test 2: Tirages les plus récents');
    const response2 = await fetch('https://data.opendatasoft.com/api/explore/v2.1/catalog/datasets/resultats-loto-2019-a-aujourd-hui@agrall/records?limit=10&order_by=date_de_tirage%20desc');
    const data2 = await response2.json();
    
    console.log('Derniers tirages:');
    data2.results.forEach((tirage, index) => {
      console.log(`${index + 1}. ${tirage.date_de_tirage}: [${tirage.boule_1}, ${tirage.boule_2}, ${tirage.boule_3}, ${tirage.boule_4}, ${tirage.boule_5}] + ${tirage.numero_chance}`);
    });
    
    // Test 3: Analyser la structure complète
    console.log('\n🔍 Test 3: Analyse de la structure');
    const sampleTirage = data1.results[0];
    console.log('Champs disponibles:');
    Object.keys(sampleTirage).forEach(key => {
      console.log(`- ${key}: ${typeof sampleTirage[key]} = ${sampleTirage[key]}`);
    });
    
    // Test 4: Vérifier les dates récentes
    console.log('\n📆 Test 4: Vérification des dates');
    const latestDate = data2.results[0].date_de_tirage;
    const oldestInSample = data2.results[data2.results.length - 1].date_de_tirage;
    console.log(`Plus récent: ${latestDate}`);
    console.log(`Plus ancien (échantillon): ${oldestInSample}`);
    
    // Test 5: Format pour notre base de données
    console.log('\n🔄 Test 5: Conversion pour notre format');
    const converted = data2.results.map(tirage => ({
      date: tirage.date_de_tirage,
      numero1: tirage.boule_1,
      numero2: tirage.boule_2,
      numero3: tirage.boule_3,
      numero4: tirage.boule_4,
      numero5: tirage.boule_5,
      complementaire: tirage.numero_chance,
      // Champs additionnels si disponibles
      annee_numero: tirage.annee_numero_de_tirage || null
    }));
    
    console.log('Format converti (premier tirage):');
    console.log(JSON.stringify(converted[0], null, 2));
    
    return {
      success: true,
      totalAvailable: data1.total_count,
      latestDate,
      sampleData: converted.slice(0, 3),
      apiStructure: Object.keys(sampleTirage)
    };
    
  } catch (error) {
    console.error('❌ Erreur lors du test API:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Exécuter le test
testOpenDataSoftAPI().then(result => {
  console.log('\n📋 RÉSUMÉ DU TEST:');
  console.log('Success:', result.success);
  if (result.success) {
    console.log('Total tirages disponibles:', result.totalAvailable);
    console.log('Date la plus récente:', result.latestDate);
    console.log('Structure API:', result.apiStructure);
  } else {
    console.log('Erreur:', result.error);
  }
});
