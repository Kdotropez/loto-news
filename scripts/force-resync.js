/**
 * Script de resynchronisation forcée avec le bon format
 */

const { OpenDataSoftSync } = require('../lib/opendatasoft-sync.ts');

async function forceResync() {
  console.log('🔄 Démarrage de la resynchronisation forcée...');
  
  try {
    const sync = new OpenDataSoftSync();
    
    // Forcer la resynchronisation
    const result = await sync.syncWithLocalDatabase();
    
    if (result.success) {
      console.log(`✅ Resynchronisation réussie: ${result.newTirages} nouveaux tirages`);
      console.log(`📅 Dernier tirage: ${result.latestDate}`);
      console.log(`📊 Total disponible: ${result.totalAvailable}`);
    } else {
      console.error('❌ Erreur de resynchronisation:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

forceResync();
