import { NextRequest, NextResponse } from 'next/server';
import { dataStorage } from '@/lib/data-storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type');

    let result;

    switch (type) {
      case 'numeros':
        result = dataStorage.getStatistiquesNumeros();
        break;
      
      case 'advanced':
        // Statistiques avancées simulées
        result = {
          hotNumbers: [
            { numero: 7, frequency: 45, lastAppearance: '2024-01-15' },
            { numero: 14, frequency: 42, lastAppearance: '2024-01-12' },
            { numero: 21, frequency: 41, lastAppearance: '2024-01-10' }
          ],
          coldNumbers: [
            { numero: 1, frequency: 12, lastAppearance: '2023-12-01' },
            { numero: 49, frequency: 15, lastAppearance: '2023-11-28' }
          ],
          patterns: [
            { name: 'Séquence arithmétique', frequency: 23 },
            { name: 'Répartition équilibrée', frequency: 45 }
          ],
          frequencyData: [
            { numero: 7, frequency: 45 },
            { numero: 14, frequency: 42 },
            { numero: 21, frequency: 41 }
          ]
        };
        break;
      
      case 'summary':
        try {
          const tirages = dataStorage.getAllTirages();
          const totalTirages = tirages.length;
          const latestTirage = dataStorage.getLatestTirage();
          
          if (totalTirages === 0) {
            result = {
              totalTirages: 0,
              derniereMiseAJour: null,
              premierTirage: null,
              numerosChauds: [],
              numerosFroids: [],
              moyenneTiragesParMois: 0
            };
            break;
          }
          
          // Calculer les statistiques globales
          const numerosFrequence = new Map<number, number>();
          tirages.forEach(tirage => {
            const boules = [tirage.boule_1, tirage.boule_2, tirage.boule_3, tirage.boule_4, tirage.boule_5].filter(n => n != null);
            boules.forEach(numero => {
              if (numero != null) {
                numerosFrequence.set(numero, (numerosFrequence.get(numero) || 0) + 1);
              }
            });
          });

          const numerosChauds = Array.from(numerosFrequence.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([numero, freq]) => ({ numero, frequence: freq }));

          const numerosFroids = Array.from(numerosFrequence.entries())
            .sort((a, b) => a[1] - b[1])
            .slice(0, 10)
            .map(([numero, freq]) => ({ numero, frequence: freq }));

          // Calculer la période réelle des données
          const premierTirage = tirages[tirages.length - 1]; // Le plus ancien (trié par date décroissante)
          const dernierTirage = tirages[0]; // Le plus récent
          
          // Calculer le nombre de mois entre le premier et dernier tirage
          const dateDebut = new Date(premierTirage?.date || '1976-05-19');
          const dateFin = new Date(dernierTirage?.date || new Date().toISOString().split('T')[0]);
          const moisEcoules = Math.max(1, Math.floor((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24 * 30)));

          result = {
            totalTirages,
            derniereMiseAJour: dernierTirage?.date || null,
            premierTirage: premierTirage?.date || null,
            numerosChauds,
            numerosFroids,
            moyenneTiragesParMois: Math.round(totalTirages / moisEcoules)
          };
        } catch (error) {
          console.error('Erreur dans le calcul des statistiques:', error);
          result = {
            totalTirages: 0,
            derniereMiseAJour: null,
            premierTirage: null,
            numerosChauds: [],
            numerosFroids: [],
            moyenneTiragesParMois: 0
          };
        }
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: 'Type de statistique non reconnu' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
