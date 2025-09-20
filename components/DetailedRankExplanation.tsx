'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, TrendingUp, DollarSign, Percent, Target, AlertTriangle } from 'lucide-react';

interface RankDetail {
  rank: number;
  description: string;
  probability: number;
  oneChanceIn: number;
  averageGain: number;
  examples: string[];
  color: string;
}

// Données officielles selon votre tableau
const OFFICIAL_RANKS: RankDetail[] = [
  {
    rank: 1,
    description: "5 numéros + numéro chance",
    probability: 0.000005,
    oneChanceIn: 19068840,
    averageGain: 5701258,
    examples: ["[1,2,3,4,5] + chance 6 = tirage [1,2,3,4,5] + 6"],
    color: "purple"
  },
  {
    rank: 2,
    description: "5 numéros sans numéro chance", 
    probability: 0.000047,
    oneChanceIn: 2118760,
    averageGain: 102634,
    examples: ["[1,2,3,4,5] + chance 6 = tirage [1,2,3,4,5] + 7"],
    color: "indigo"
  },
  {
    rank: 3,
    description: "4 numéros + numéro chance",
    probability: 0.001154,
    oneChanceIn: 86677,
    averageGain: 1086,
    examples: ["[1,2,3,4,5] + chance 6 = tirage [1,2,3,4,7] + 6"],
    color: "blue"
  },
  {
    rank: 4,
    description: "4 numéros sans numéro chance",
    probability: 0.010383,
    oneChanceIn: 9631,
    averageGain: 1086,
    examples: ["[1,2,3,4,5] + chance 6 = tirage [1,2,3,4,7] + 8"],
    color: "cyan"
  },
  {
    rank: 5,
    description: "3 numéros + numéro chance",
    probability: 0.049610,
    oneChanceIn: 2016,
    averageGain: 50, // Correction selon vos données
    examples: ["[1,2,3,4,5] + chance 6 = tirage [1,2,3,7,8] + 6"],
    color: "green"
  },
  {
    rank: 6,
    description: "3 numéros sans numéro chance",
    probability: 0.446488,
    oneChanceIn: 224,
    averageGain: 20, // Correction selon vos données
    examples: ["[1,2,3,4,5] + chance 6 = tirage [1,2,3,7,8] + 9"],
    color: "emerald"
  },
  {
    rank: 7,
    description: "2 numéros + numéro chance",
    probability: 0.694536,
    oneChanceIn: 144,
    averageGain: 20, // Correction selon vos données
    examples: ["[1,2,3,4,5] + chance 6 = tirage [1,2,7,8,9] + 6"],
    color: "yellow"
  },
  {
    rank: 8,
    description: "2 numéros sans numéro chance",
    probability: 6.250826,
    oneChanceIn: 16,
    averageGain: 5,
    examples: ["[1,2,3,4,5] + chance 6 = tirage [1,2,7,8,9] + 10"],
    color: "orange"
  },
  {
    rank: 9,
    description: "1 numéro + numéro chance",
    probability: 3.559498,
    oneChanceIn: 28,
    averageGain: 5, // Correction selon vos données
    examples: ["[1,2,3,4,5] + chance 6 = tirage [1,7,8,9,10] + 6"],
    color: "red"
  },
  {
    rank: 10,
    description: "0 numéro + numéro chance",
    probability: 5.695197,
    oneChanceIn: 18,
    averageGain: 2.2, // Remboursement de la mise
    examples: ["[1,2,3,4,5] + chance 6 = tirage [7,8,9,10,11] + 6"],
    color: "pink"
  }
];

const NO_WIN_CASES = [
  {
    description: "1 numéro sans numéro chance",
    probability: 32.035483,
    oneChanceIn: 3,
    examples: ["[1,2,3,4,5] + chance 6 = tirage [1,7,8,9,10] + 10"]
  },
  {
    description: "0 numéro sans numéro chance",
    probability: 51.256773,
    oneChanceIn: 2,
    examples: ["[1,2,3,4,5] + chance 6 = tirage [7,8,9,10,11] + 10"]
  }
];

interface DetailedRankExplanationProps {
  selectedNumbers: number;
  onRankSelect?: (rank: number) => void;
}

export default function DetailedRankExplanation({ 
  selectedNumbers, 
  onRankSelect 
}: DetailedRankExplanationProps) {
  const [selectedRank, setSelectedRank] = useState<number | null>(null);
  const [showNoWinCases, setShowNoWinCases] = useState(false);

  const handleRankClick = (rank: number) => {
    setSelectedRank(selectedRank === rank ? null : rank);
    onRankSelect?.(rank);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      purple: 'bg-purple-50 border-purple-200 text-purple-900',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      cyan: 'bg-cyan-50 border-cyan-200 text-cyan-900',
      green: 'bg-green-50 border-green-200 text-green-900',
      emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      orange: 'bg-orange-50 border-orange-200 text-orange-900',
      red: 'bg-red-50 border-red-200 text-red-900',
      pink: 'bg-pink-50 border-pink-200 text-pink-900'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      
      {/* Introduction */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h2 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
          <Info className="w-6 h-6" />
          Explication Détaillée des Rangs de Gains
        </h2>
        <p className="text-blue-700 mb-3">
          Le Loto propose <strong>10 rangs de gains</strong> selon le nombre de numéros corrects et la présence du numéro chance.
          Les gains indiqués sont les <strong>moyennes historiques</strong> (06/10/08 à 10/05/16).
        </p>
        <div className="bg-blue-100 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>💡 Important :</strong> Avec vos {selectedNumbers} numéros sélectionnés, 
            vos grilles ne peuvent atteindre certains rangs que si les numéros du tirage correspondent à votre sélection.
          </p>
        </div>
      </div>

      {/* Rangs Gagnants */}
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-500" />
          Rangs de Gains (Cliquez pour détails)
        </h3>
        
        <div className="grid gap-3">
          {OFFICIAL_RANKS.map((rank) => (
            <motion.div
              key={rank.rank}
              className={`${getColorClasses(rank.color)} border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all`}
              onClick={() => handleRankClick(rank.rank)}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 bg-${rank.color}-500 text-white rounded-full flex items-center justify-center font-bold text-sm`}>
                    {rank.rank}
                  </div>
                  <div>
                    <div className="font-semibold">{rank.description}</div>
                    <div className="text-sm opacity-75">
                      1 chance sur {rank.oneChanceIn.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-lg">{rank.averageGain.toLocaleString()}€</div>
                  <div className="text-sm opacity-75">{rank.probability}%</div>
                </div>
              </div>

              {selectedRank === rank.rank && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className={`mt-3 p-3 bg-${rank.color}-100 rounded border-l-4 border-${rank.color}-500`}
                >
                  <h4 className="font-semibold mb-2">📋 Détails du Rang {rank.rank}</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-sm font-medium mb-1">Probabilité :</div>
                      <div className="text-sm">{rank.probability}% (1 sur {rank.oneChanceIn.toLocaleString()})</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Gain moyen :</div>
                      <div className="text-sm">{rank.averageGain.toLocaleString()}€</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-sm font-medium mb-1">Exemple concret :</div>
                    <div className="text-sm font-mono bg-white p-2 rounded">
                      {rank.examples[0]}
                    </div>
                  </div>

                  <div className="text-xs opacity-75">
                    <strong>Note :</strong> Les gains sont des moyennes historiques. Le gain réel peut varier selon le nombre de gagnants et la cagnotte.
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Cas sans gains */}
        <div className="mt-6">
          <button
            onClick={() => setShowNoWinCases(!showNoWinCases)}
            className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <span className="font-medium">Cas sans gains ({(NO_WIN_CASES.reduce((sum, c) => sum + c.probability, 0)).toFixed(1)}%)</span>
            <span className="text-sm">{showNoWinCases ? 'Masquer' : 'Afficher'}</span>
          </button>

          {showNoWinCases && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-3 space-y-2"
            >
              {NO_WIN_CASES.map((noWin, index) => (
                <div key={index} className="bg-gray-100 border border-gray-300 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-700">{noWin.description}</div>
                      <div className="text-sm text-gray-600">
                        {noWin.probability}% (1 sur {noWin.oneChanceIn})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-600">0€</div>
                      <div className="text-xs text-gray-500">Aucun gain</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 font-mono">
                    Exemple : {noWin.examples[0]}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Récapitulatif Statistique */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Récapitulatif Statistique Officiel
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {(OFFICIAL_RANKS.reduce((sum, rank) => sum + rank.probability, 0)).toFixed(3)}%
            </div>
            <div className="text-sm text-gray-600">Chance de gagner</div>
            <div className="text-xs text-gray-500">Tous rangs confondus</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {(OFFICIAL_RANKS.reduce((sum, rank) => sum + (rank.averageGain * rank.probability / 100), 0)).toFixed(2)}€
            </div>
            <div className="text-sm text-gray-600">Espérance de gain</div>
            <div className="text-xs text-gray-500">Par grille jouée</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {(((OFFICIAL_RANKS.reduce((sum, rank) => sum + (rank.averageGain * rank.probability / 100), 0)) - 2.20) / 2.20 * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">ROI théorique</div>
            <div className="text-xs text-gray-500">Espérance - Mise</div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-green-100 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-800 mb-1">📊 Données Officielles</h4>
              <p className="text-green-700 text-sm">
                Ces statistiques sont basées sur l'historique officiel FDJ (06/10/08 à 10/05/16). 
                Les gains moyens peuvent varier selon la cagnotte et le nombre de gagnants par tirage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
