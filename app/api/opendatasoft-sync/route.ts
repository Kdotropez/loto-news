import { NextRequest, NextResponse } from 'next/server';
import { openDataSoftSync } from '@/lib/opendatasoft-sync';

export const dynamic = 'force-dynamic';

/**
 * API pour synchroniser avec OpenDataSoft
 * GET: Récupère les statistiques de l'API
 * POST: Lance la synchronisation
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const action = searchParams.get('action') || 'stats';
    
    switch (action) {
      case 'stats':
        // Récupérer les statistiques de l'API
        const stats = await openDataSoftSync.getAPIStats();
        
        return NextResponse.json({
          success: true,
          stats,
          message: 'Statistiques récupérées avec succès'
        });
        
      case 'test':
        // Tester la connectivité
        const isConnected = await openDataSoftSync.testConnectivity();
        
        return NextResponse.json({
          success: isConnected,
          message: isConnected ? 'API accessible' : 'API inaccessible'
        });
        
        case 'sync':
          // Lancer la synchronisation via GET pour faciliter l'appel sans corps JSON
          const result = await openDataSoftSync.syncWithLocalDatabase();
          return NextResponse.json({
            success: result.success,
            result,
            message: result.success
              ? `Synchronisation réussie: ${result.newTirages} nouveaux tirages`
              : `Échec de synchronisation: ${result.error}`
          }, { status: result.success ? 200 : 500 });

      case 'preview':
        // Aperçu des derniers tirages sans sauvegarde
        const limit = parseInt(searchParams.get('limit') || '10');
        const tirages = await openDataSoftSync.fetchLatestTirages(undefined, limit);
        const converted = openDataSoftSync.convertToOurFormat(tirages);
        
        return NextResponse.json({
          success: true,
          preview: converted,
          total: tirages.length,
          message: `Aperçu de ${tirages.length} tirages`
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Action non reconnue. Utilisez: stats, test, ou preview'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Erreur API OpenDataSoft:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let action = 'sync';
    let sinceDate: string | undefined = undefined;
    try {
      const body = await request.json();
      action = body?.action || 'sync';
      sinceDate = body?.sinceDate;
    } catch (_) {
      // Aucun corps JSON valide, fallback vers 'sync'
    }
    
    switch (action) {
      case 'sync':
        // Lancer la synchronisation complète
        const result = await openDataSoftSync.syncWithLocalDatabase();
        
        return NextResponse.json({
          success: result.success,
          result,
          message: result.success 
            ? `Synchronisation réussie: ${result.newTirages} nouveaux tirages`
            : `Échec de synchronisation: ${result.error}`
        }, { status: result.success ? 200 : 500 });
        
      case 'fetch-since':
        // Récupérer depuis une date spécifique
        if (!sinceDate) {
          return NextResponse.json({
            success: false,
            error: 'Date requise pour fetch-since'
          }, { status: 400 });
        }
        
        const tirages = await openDataSoftSync.fetchLatestTirages(sinceDate);
        const converted = openDataSoftSync.convertToOurFormat(tirages);
        
        return NextResponse.json({
          success: true,
          tirages: converted,
          count: converted.length,
          message: `${converted.length} tirages récupérés depuis ${sinceDate}`
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Action non reconnue. Utilisez: sync ou fetch-since'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Erreur POST OpenDataSoft:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
