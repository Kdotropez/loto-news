'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  AlertTriangle, 
  Target,
  BarChart3,
  Settings
} from 'lucide-react';

interface ProfessionalGridOptimizerProps {
  selectedNumbers: {
    numbers: number[];
    complementary: number[];
    source: string;
  };
}

export default function ProfessionalGridOptimizer({ selectedNumbers }: ProfessionalGridOptimizerProps) {
  
  if (!selectedNumbers || selectedNumbers.numbers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-amber-800 mb-2">Sélection Requise</h2>
            <p className="text-amber-700">
              Veuillez d'abord sélectionner des numéros via l'Analyse Intelligente ou la Configuration des Stratégies.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* En-tête professionnel */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">❌ Optimisateur Défaillant</h1>
              <p className="text-red-200">
                Algorithmes détectés comme incorrects • Tests révélant des erreurs • Garanties impossibles
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-indigo-200">Source</div>
              <div className="font-semibold">{selectedNumbers.source}</div>
              <div className="text-sm text-indigo-200 mt-1">
                {selectedNumbers.numbers.length} numéros • {selectedNumbers.complementary.length} complémentaires
              </div>
            </div>
          </div>
          
          {/* Affichage détaillé des numéros sélectionnés */}
          <div className="mt-6 bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">📊 Vos Numéros Sélectionnés</h3>
            
            {/* Numéros principaux */}
            <div className="mb-4">
              <div className="text-sm text-indigo-200 mb-2">
                Numéros Principaux ({selectedNumbers.numbers.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedNumbers.numbers.map((num, index) => (
                  <div key={index} className="w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center text-sm font-bold border border-white/30">
                    {num}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Numéros complémentaires */}
            {selectedNumbers.complementary.length > 0 && (
              <div>
                <div className="text-sm text-indigo-200 mb-2">
                  Complémentaires ({selectedNumbers.complementary.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedNumbers.complementary.map((num, index) => (
                    <div key={index} className="w-10 h-10 bg-orange-400/80 text-white rounded-full flex items-center justify-center text-sm font-bold border border-orange-300/50">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Message principal - Erreur détectée */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-red-800 mb-4">Algorithme Défaillant Détecté</h2>
          
          <div className="space-y-4 text-left max-w-4xl mx-auto">
            <div className="bg-white p-4 rounded-lg border border-red-300">
              <div className="font-semibold text-red-800 mb-2">❌ Erreur Critique Identifiée</div>
              <div className="text-red-700 text-sm">
                L'algorithme "glouton" développé fait <strong>exactement la même erreur</strong> que l'ancien système !
                Il peut sélectionner des grilles disjointes qui ne garantissent rien ensemble.
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300">
              <div className="font-semibold text-yellow-800 mb-2">🔍 Exemple Concret de l'Erreur</div>
              <div className="text-yellow-700 text-sm">
                <strong>Vos numéros :</strong> [18, 12, 14, 41, 43, 48, 20, 21, 24, 7]<br />
                <strong>Grilles proposées :</strong> [18, 12, 14, 41, 43] et [48, 20, 21, 24, 7]<br />
                <strong>Si tirage :</strong> [18, 12, 14, 48, 20]<br />
                <strong>Résultat :</strong> Grille 1 = 3 numéros ✅, Grille 2 = 2 numéros ❌<br />
                <strong>❌ AUCUNE grille n'a 3+ numéros !</strong>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-300">
              <div className="font-semibold text-blue-800 mb-2">🧮 La Vraie Complexité</div>
              <div className="text-blue-700 text-sm">
                Ce problème s'appelle le <strong>"Set Cover Problem"</strong> - l'un des plus difficiles en informatique.
                Avec {selectedNumbers.numbers.length} numéros, il y a <strong>{Math.round(selectedNumbers.numbers.length * (selectedNumbers.numbers.length-1) * (selectedNumbers.numbers.length-2) * (selectedNumbers.numbers.length-3) * (selectedNumbers.numbers.length-4) / 120).toLocaleString()} combinaisons</strong> à couvrir parfaitement.
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
              <div className="font-semibold text-gray-800 mb-2">💡 Alternatives Fonctionnelles</div>
              <div className="text-gray-700 text-sm">
                En attendant un algorithme correct :<br />
                • <strong>Générateur Standard</strong> - Grilles aléatoires optimisées<br />
                • <strong>Grilles Multiples FDJ</strong> - Jusqu'à 10 numéros (554€ max)<br />
                • <strong>Stratégies Probabilistes</strong> - Maximiser les chances sans fausses garanties
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}



