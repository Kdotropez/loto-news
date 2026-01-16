import { NextRequest, NextResponse } from 'next/server';
import { jsonImporter } from '@/lib/json-importer';

export async function GET(request: NextRequest) {
  try {
    const stats = jsonImporter.getJSONStats();
    
    if (!stats) {
      return NextResponse.json({
        success: false,
        message: 'Fichier JSON non trouvé ou inaccessible',
        data: null
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Statistiques du fichier JSON récupérées',
      data: {
        totalTirages: stats.totalTirages,
        dateDebut: stats.dateDebut,
        dateFin: stats.dateFin,
        hasJSONFile: jsonImporter.hasJSONFile()
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques JSON:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'import') {
      // Importer le fichier JSON complet
      const result = await jsonImporter.importJSONFile();
      
      return NextResponse.json({
        success: true,
        message: `Import JSON terminé: ${result.imported} tirages importés, ${result.errors} erreurs`,
        data: result
      });
    }

    if (action === 'check-status') {
      // Vérifier le statut du fichier JSON
      const stats = jsonImporter.getJSONStats();
      
      return NextResponse.json({
        success: true,
        data: {
          hasJSONFile: jsonImporter.hasJSONFile(),
          stats: stats,
          totalTirages: stats?.totalTirages || 0,
          dateDebut: stats?.dateDebut || '',
          dateFin: stats?.dateFin || ''
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erreur lors de l\'import JSON:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'import JSON' },
      { status: 500 }
    );
  }
}




