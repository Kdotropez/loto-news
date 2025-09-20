import { NextRequest, NextResponse } from 'next/server';
import { dataStorage } from '@/lib/data-storage';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Paramètre date manquant' },
        { status: 400 }
      );
    }
    
    // Vérifier si le tirage existe
    const existingTirage = dataStorage.getTirageByDate(date);
    if (!existingTirage) {
      return NextResponse.json({
        success: false,
        message: `Aucun tirage trouvé pour la date ${date}`
      });
    }
    
    // Supprimer le tirage
    const tirages = dataStorage.getAllTirages();
    const filteredTirages = tirages.filter(tirage => tirage.date !== date);
    
    // Sauvegarder la liste mise à jour
    dataStorage['tirages'] = filteredTirages;
    dataStorage['saveTirages']();
    
    return NextResponse.json({
      success: true,
      message: `Tirage du ${date} supprimé avec succès`,
      deletedTirage: existingTirage
    });
    
  } catch (error) {
    console.error('Erreur lors de la suppression du tirage:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du tirage' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API Delete Tirage - Utilisez DELETE pour supprimer un tirage',
    example: 'DELETE /api/delete-tirage?date=2025-09-15'
  });
}

