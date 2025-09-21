import { NextRequest, NextResponse } from 'next/server';
import { FDJScraper } from '@/lib/fdj-scraper';
import { dataStorage } from '@/lib/data-storage';

export async function POST(request: NextRequest) {
  try {
    // Temporairement désactivé pour le déploiement Vercel
    return NextResponse.json({
      success: false,
      message: 'API FDJ Update temporairement désactivée pour le déploiement',
      error: 'Feature disabled'
    }, { status: 503 });
    
    /* 
    const { month, year, updateLatest } = await request.json();
    
    console.log('🚀 Début mise à jour FDJ...');
    const scraper = new FDJScraper();
    
    let results;
    
    if (updateLatest) {
      // Mise à jour automatique des derniers tirages
      results = await scraper.updateLatest();
    } else if (month && year) {
      // Mise à jour pour un mois spécifique
      results = await scraper.updateMonth(month, year);
    } else {
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants' },
        { status: 400 }
      );
    }
    
    // Sauvegarder en base de données
    let savedCount = 0;
    for (const result of results) {
      try {
        // Vérifier si le tirage existe déjà
        const existingTirage = dataStorage.getTirageByDate(result.date);
        if (!existingTirage) {
          // Créer le nouveau tirage
          const newTirage = {
            date: result.date,
            numero_tirage: 0,
            boule_1: result.numbers[0],
            boule_2: result.numbers[1],
            boule_3: result.numbers[2],
            boule_4: result.numbers[3],
            boule_5: result.numbers[4],
            numero_chance: result.complementary,
            // Nouveaux champs requis par l'interface mise à jour
            numero1: result.numbers[0],
            numero2: result.numbers[1],
            numero3: result.numbers[2],
            numero4: result.numbers[3],
            numero5: result.numbers[4],
            complementaire: result.complementary,
            gagnant_rang1: 0,
            rapport_rang1: 0,
            gagnant_rang2: 0,
            rapport_rang2: 0,
            gagnant_rang3: 0,
            rapport_rang3: 0,
            gagnant_rang4: 0,
            rapport_rang4: 0,
            gagnant_rang5: 0,
            rapport_rang5: 0,
            gagnant_rang6: 0,
            rapport_rang6: 0,
            gagnant_rang7: 0,
            rapport_rang7: 0,
            gagnant_rang8: 0,
            rapport_rang8: 0,
            gagnant_rang9: 0,
            rapport_rang9: 0,
            joker_gagnant: 0,
            joker_plus_gagnant: 0,
            numero_jokerplus: result.joker || '',
            option2_gagnant: 0,
            option2_rapport: 0,
            '1er_tirage_2nd_rang_gagnant': 0,
            '1er_tirage_2nd_rang_rapport': 0,
            '2eme_tirage_2nd_rang_gagnant': 0,
            '2eme_tirage_2nd_rang_rapport': 0,
            '3eme_tirage_2nd_rang_gagnant': 0,
            '3eme_tirage_2nd_rang_rapport': 0
          };
          dataStorage.insertTirage(newTirage);
          savedCount++;
          console.log(`✅ Nouveau tirage ajouté: ${result.date}`);
        } else {
          console.log(`ℹ️ Tirage ${result.date} existe déjà`);
        }
      } catch (error) {
        console.error(`Erreur sauvegarde tirage ${result.date}:`, error);
      }
    }
    
    console.log(`✅ ${savedCount} tirages sauvegardés`);
    
    return NextResponse.json({
      success: true,
      message: `${savedCount} tirages mis à jour depuis FDJ`,
      updated: savedCount,
      results: results.length
    });
    */
    
  } catch (error) {
    console.error('❌ Erreur API FDJ Update:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API FDJ Update - Utilisez POST pour mettre à jour les tirages',
    endpoints: {
      'POST /api/fdj-update': 'Mettre à jour les tirages',
      body: {
        updateLatest: 'boolean - Mettre à jour les derniers tirages',
        month: 'number - Mois spécifique (1-12)',
        year: 'number - Année spécifique'
      }
    }
  });
}

