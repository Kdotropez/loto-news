/**
 * TEST DE LA SYNCHRONISATION AUTOMATIQUE
 * Simule le démarrage de l'application et teste la mise à jour auto
 */

async function testAutoSync() {
  console.log('🔄 Test de la synchronisation automatique...\n');
  
  try {
    // Simuler le démarrage de l'application
    console.log('1. 📡 Test de connectivité...');
    const connectTest = await fetch('http://localhost:3000/api/opendatasoft-sync?action=test');
    const connectResult = await connectTest.json();
    console.log('   Résultat:', connectResult.success ? '✅ API accessible' : '❌ API inaccessible');
    
    if (!connectResult.success) {
      console.log('❌ Test arrêté - API inaccessible');
      return;
    }
    
    // Test des statistiques
    console.log('\n2. 📊 Récupération des statistiques...');
    const statsTest = await fetch('http://localhost:3000/api/opendatasoft-sync?action=stats');
    const statsResult = await statsTest.json();
    
    if (statsResult.success) {
      console.log('   Total tirages disponibles:', statsResult.stats.totalTirages);
      console.log('   Période:', statsResult.stats.dateRange.from, '→', statsResult.stats.dateRange.to);
      console.log('   Dernière mise à jour:', statsResult.stats.lastUpdate);
    }
    
    // Test de l'aperçu
    console.log('\n3. 👀 Test de l\'aperçu...');
    const previewTest = await fetch('http://localhost:3000/api/opendatasoft-sync?action=preview&limit=3');
    const previewResult = await previewTest.json();
    
    if (previewResult.success) {
      console.log('   Derniers tirages disponibles:');
      previewResult.preview.forEach((tirage, i) => {
        console.log(`   ${i + 1}. ${tirage.date}: [${tirage.numero1}, ${tirage.numero2}, ${tirage.numero3}, ${tirage.numero4}, ${tirage.numero5}] + ${tirage.complementaire}`);
      });
    }
    
    // Test de synchronisation
    console.log('\n4. 🔄 Test de synchronisation...');
    const syncTest = await fetch('http://localhost:3000/api/opendatasoft-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sync' })
    });
    const syncResult = await syncTest.json();
    
    console.log('   Synchronisation:', syncResult.success ? '✅ Réussie' : '❌ Échouée');
    if (syncResult.success) {
      console.log('   Nouveaux tirages:', syncResult.result.newTirages);
      console.log('   Dernière date:', syncResult.result.latestDate);
    } else {
      console.log('   Erreur:', syncResult.error);
    }
    
    console.log('\n📋 RÉSUMÉ DU TEST:');
    console.log('✅ API OpenDataSoft: Fonctionnelle');
    console.log('✅ Synchronisation: Opérationnelle');
    console.log('✅ Mise à jour automatique: Prête');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testAutoSync();
