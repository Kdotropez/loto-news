import { NextRequest, NextResponse } from 'next/server';
import { dataStorage } from '@/lib/data-storage';

export async function GET() {
  try {
    const favorites = dataStorage.getAllFavorites();

    return NextResponse.json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des favoris' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nom, boule_1, boule_2, boule_3, boule_4, boule_5, numero_chance } = await request.json();

    if (!nom || !boule_1 || !boule_2 || !boule_3 || !boule_4 || !boule_5 || !numero_chance) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    const result = dataStorage.addFavorite({
      nom,
      boule_1,
      boule_2,
      boule_3,
      boule_4,
      boule_5,
      numero_chance
    });

    return NextResponse.json({
      success: true,
      message: 'Combinaison sauvegardée avec succès',
      data: { id: result.id }
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la combinaison:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}
