import { NextRequest, NextResponse } from 'next/server';
import { csvImporter } from '@/lib/csv-importer';
import { dataStorage } from '@/lib/data-storage';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Vérifier les fichiers CSV disponibles
    const dataDir = path.join(process.cwd(), 'data');
    const csvFiles = fs.readdirSync(dataDir).filter(file => file.endsWith('.csv'));
    
    return NextResponse.json({
      success: true,
      hasFiles: csvFiles.length > 0,
      availableFiles: csvFiles,
      message: csvFiles.length > 0 ? `${csvFiles.length} fichier(s) CSV trouvé(s)` : 'Aucun fichier CSV trouvé'
    });
  } catch (error) {
    console.error('Erreur lors de la vérification des fichiers CSV:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la vérification des fichiers CSV' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, filename } = await request.json();

    if (action === 'import') {
      // Importer tous les fichiers CSV disponibles
      const result = await csvImporter.importAllCSVFiles();
      
      return NextResponse.json({
        success: true,
        message: `Import CSV terminé: ${result.imported} tirages importés, ${result.errors} erreurs`,
        data: result
      });
    }

    if (action === 'import-file' && filename) {
      // Importer un fichier CSV spécifique - fonctionnalité temporairement désactivée
      return NextResponse.json({
        success: false,
        message: 'Import de fichier spécifique temporairement désactivé',
        data: null
      });
    }

    if (action === 'check-status') {
      // Vérifier le statut de la base de données
      return NextResponse.json({
        success: true,
        data: {
          totalTirages: 0,
          derniereMiseAJour: new Date().toISOString(),
          hasData: false
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erreur lors de l\'import CSV:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'import CSV' },
      { status: 500 }
    );
  }
}
