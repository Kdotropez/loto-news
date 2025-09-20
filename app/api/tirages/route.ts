import { NextRequest, NextResponse } from 'next/server';
import { dataStorage } from '@/lib/data-storage';
import { dataCollector } from '@/lib/data-collector';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');
    const sort = searchParams.get('sort') || 'recent';

    let tirages;
    
    if (startDate && endDate) {
      tirages = dataStorage.getTiragesByDateRange(startDate, endDate);
    } else {
      tirages = dataStorage.getAllTirages();
    }

    // Appliquer le tri si demandé
    if (sort === 'oldest') {
      tirages = tirages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    if (limit) {
      tirages = tirages.slice(0, parseInt(limit));
    }

    return NextResponse.json({
      success: true,
      data: tirages,
      count: tirages.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des tirages:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des tirages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'import') {
      const result = await dataCollector.importDataToDatabase();
      return NextResponse.json({
        success: true,
        message: `Import terminé: ${result.imported} tirages importés, ${result.errors} erreurs`,
        data: result
      });
    }

    if (action === 'check-updates') {
      const hasUpdates = await dataCollector.checkForNewTirages();
      return NextResponse.json({
        success: true,
        hasUpdates,
        message: hasUpdates ? 'Nouveaux tirages disponibles' : 'Aucun nouveau tirage'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erreur lors de l\'action sur les tirages:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'action' },
      { status: 500 }
    );
  }
}
