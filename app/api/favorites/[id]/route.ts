import { NextRequest, NextResponse } from 'next/server';
import { dataStorage } from '@/lib/data-storage';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }

    const success = dataStorage.deleteFavorite(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Combinaison non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Combinaison supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la combinaison:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
