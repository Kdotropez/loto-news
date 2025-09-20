'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface TheoreticalBoundsDisplayProps {
  selectedNumbers: number;
  proposedSolution?: number;
}

export default function TheoreticalBoundsDisplay({ selectedNumbers, proposedSolution }: TheoreticalBoundsDisplayProps) {
  
  // Calcul des bornes théoriques
  const calculateBounds = (X: number) => {
    const binomial = (n: number, k: number): number => {
      if (k > n) return 0;
      if (k === 0 || k === n) return 1;
      
      let result = 1;
      for (let i = 0; i < k; i++) {
        result = result * (n - i) / (i + 1);
      }
      
      return Math.round(result);
    };
    
    // LB1: Borne simple
    const xChoose3 = binomial(X, 3);
    const lb1 = Math.ceil(xChoose3 / 10);
    
    // LB2: Borne de Schönheim
    let L = [1]; // L₀ = 1
    for (let i = 0; i < 3; i++) {
      const nextL = Math.ceil(((X - i) / (5 - i)) * L[i]);
      L.push(nextL);
    }
    const lb2 = L[3];
    
    // UB: Borne supérieure
    const ub = Math.ceil((xChoose3 / 10) * (Math.log(xChoose3) + 1));
    
    return {
      lb1,
      lb2,
      ub,
      minimum: Math.max(lb1, lb2),
      combinations: xChoose3
    };
  };
  
  const bounds = calculateBounds(selectedNumbers);
  
  // Validation de la solution proposée
  const validateSolution = () => {
    if (!proposedSolution) return null;
    
    if (proposedSolution < bounds.minimum) {
      return {
        isValid: false,
        status: 'IMPOSSIBLE',
        message: `${proposedSolution} < ${bounds.minimum} (minimum théorique)`,
        icon: XCircle,
        color: 'red'
      };
    }
    
    if (proposedSolution === bounds.minimum) {
      return {
        isValid: true,
        status: 'OPTIMAL',
        message: `${proposedSolution} = ${bounds.minimum} (minimum théorique atteint)`,
        icon: CheckCircle,
        color: 'green'
      };
    }
    
    if (proposedSolution <= bounds.minimum * 1.5) {
      return {
        isValid: true,
        status: 'PLAUSIBLE',
        message: `${proposedSolution} proche du minimum ${bounds.minimum}`,
        icon: CheckCircle,
        color: 'blue'
      };
    }
    
    return {
      isValid: true,
      status: 'SUSPECT',
      message: `${proposedSolution} très éloigné du minimum ${bounds.minimum}`,
      icon: AlertTriangle,
      color: 'orange'
    };
  };
  
  const validation = validateSolution();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center gap-3">
          <Calculator className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">🧮 Bornes Théoriques Mathématiques</h2>
            <p className="text-blue-200">Validation scientifique des solutions Set Cover</p>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="p-6 space-y-6">
        
        {/* Paramètres */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Paramètres du Problème</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Numéros sélectionnés:</span>
              <span className="font-bold ml-2">{selectedNumbers}</span>
            </div>
            <div>
              <span className="text-gray-600">Combinaisons à couvrir:</span>
              <span className="font-bold ml-2">{bounds.combinations.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Rang cible:</span>
              <span className="font-bold ml-2">3 numéros minimum</span>
            </div>
            <div>
              <span className="text-gray-600">Couverture par grille:</span>
              <span className="font-bold ml-2">10 combinaisons max</span>
            </div>
          </div>
        </div>
        
        {/* Bornes calculées */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">🔻 Borne Inférieure Simple</h4>
            <div className="text-2xl font-bold text-red-600">{bounds.lb1}</div>
            <p className="text-sm text-red-600">⌈C({selectedNumbers},3) ÷ 10⌉</p>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 mb-2">🎯 Borne Schönheim</h4>
            <div className="text-2xl font-bold text-orange-600">{bounds.lb2}</div>
            <p className="text-sm text-orange-600">Borne plus forte</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">🔺 Borne Supérieure</h4>
            <div className="text-2xl font-bold text-blue-600">{bounds.ub}</div>
            <p className="text-sm text-blue-600">Maximum probabiliste</p>
          </div>
        </div>
        
        {/* Minimum absolu */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-6">
          <h3 className="text-xl font-bold text-purple-800 mb-2">⚡ MINIMUM THÉORIQUE INCONTOURNABLE</h3>
          <div className="text-4xl font-bold text-purple-600 mb-2">{bounds.minimum} grilles</div>
          <p className="text-purple-700">
            Il est <strong>mathématiquement IMPOSSIBLE</strong> de faire mieux que {bounds.minimum} grilles.
            Toute solution proposant moins est automatiquement <strong>FAUSSE</strong>.
          </p>
        </div>
        
        {/* Validation de la solution */}
        {validation && (
          <div className={`border-2 rounded-lg p-6 ${
            validation.color === 'red' ? 'bg-red-50 border-red-300' :
            validation.color === 'green' ? 'bg-green-50 border-green-300' :
            validation.color === 'blue' ? 'bg-blue-50 border-blue-300' :
            'bg-orange-50 border-orange-300'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <validation.icon className={`w-8 h-8 ${
                validation.color === 'red' ? 'text-red-600' :
                validation.color === 'green' ? 'text-green-600' :
                validation.color === 'blue' ? 'text-blue-600' :
                'text-orange-600'
              }`} />
              <h3 className={`text-xl font-bold ${
                validation.color === 'red' ? 'text-red-800' :
                validation.color === 'green' ? 'text-green-800' :
                validation.color === 'blue' ? 'text-blue-800' :
                'text-orange-800'
              }`}>
                {validation.status}: Solution de {proposedSolution} grilles
              </h3>
            </div>
            <p className={`text-lg ${
              validation.color === 'red' ? 'text-red-700' :
              validation.color === 'green' ? 'text-green-700' :
              validation.color === 'blue' ? 'text-blue-700' :
              'text-orange-700'
            }`}>
              {validation.message}
            </p>
            
            {!validation.isValid && (
              <div className="mt-4 p-4 bg-red-100 rounded-lg">
                <p className="text-red-800 font-semibold">
                  ❌ Cette solution viole les lois mathématiques du Set Cover Problem !
                </p>
                <p className="text-red-700 text-sm mt-1">
                  L'algorithme qui a généré cette solution contient une erreur fondamentale.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Formules mathématiques */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">📐 Formules Utilisées</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div><strong>LB₁:</strong> ⌈C({selectedNumbers},3) ÷ C(5,3)⌉ = ⌈{bounds.combinations} ÷ 10⌉ = {bounds.lb1}</div>
            <div><strong>LB₂ (Schönheim):</strong> Récurrence L₀=1, Lᵢ₊₁=⌈({selectedNumbers}-i)/(5-i)×Lᵢ⌉ → L₃ = {bounds.lb2}</div>
            <div><strong>UB:</strong> ⌈LB₁ × (ln(C({selectedNumbers},3)) + 1)⌉ = {bounds.ub}</div>
          </div>
        </div>
        
      </div>
    </motion.div>
  );
}

