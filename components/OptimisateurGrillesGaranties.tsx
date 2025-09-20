'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MixedSetCoverOptimizer from './MixedSetCoverOptimizer';
import TheoreticalBoundsDisplay from './TheoreticalBoundsDisplay';
import ClearSetCoverOptimizer from './ClearSetCoverOptimizer';
import CompleteScenarioDisplay from './CompleteScenarioDisplay';
import DetailedRankExplanation from './DetailedRankExplanation';
import SimulatedGainsTable from './SimulatedGainsTable';

interface SelectedNumbers {
  numbers: number[];
  complementary: number[];
  source: string;
}

interface OptimisateurGrillesGarantiesProps {
  selectedNumbers: SelectedNumbers;
}

export default function OptimisateurGrillesGaranties({ selectedNumbers }: OptimisateurGrillesGarantiesProps) {
  
  // États pour la sélection manuelle
  const [manualNumbers, setManualNumbers] = useState<number[]>([]);
  const [manualComplementary, setManualComplementary] = useState<number[]>([]);
  const [useManualSelection, setUseManualSelection] = useState(false);
  const [patternOptimizationEnabled, setPatternOptimizationEnabled] = useState(true);
  
  // États pour contrôler la quantité de numéros utilisés
  const [maxPrincipalNumbers, setMaxPrincipalNumbers] = useState(15);
  const [maxComplementaryNumbers, setMaxComplementaryNumbers] = useState(5);
  
  // Fonctions pour valider et ajuster les limites
  const adjustPrincipalNumbers = (newValue: number) => {
    const availableNumbers = useManualSelection ? manualNumbers.length : (selectedNumbers?.numbers?.length || 0);
    const validValue = Math.min(Math.max(5, newValue), Math.min(20, availableNumbers));
    setMaxPrincipalNumbers(validValue);
  };
  
  const adjustComplementaryNumbers = (newValue: number) => {
    const availableComplementary = useManualSelection ? manualComplementary.length : (selectedNumbers?.complementary?.length || 0);
    const validValue = Math.min(Math.max(0, newValue), Math.min(5, availableComplementary));
    setMaxComplementaryNumbers(validValue);
  };

  const getCurrentNumbers = () => {
    const baseNumbers = useManualSelection ? manualNumbers : (selectedNumbers?.numbers || []);
    return baseNumbers.slice(0, maxPrincipalNumbers);
  };

  const getCurrentComplementary = () => {
    const baseComplementary = useManualSelection ? manualComplementary : (selectedNumbers?.complementary || []);
    return baseComplementary.slice(0, maxComplementaryNumbers);
  };

  const addManualNumber = (num: number) => {
    if (manualNumbers.length < 20 && !manualNumbers.includes(num) && num >= 1 && num <= 49) {
      setManualNumbers([...manualNumbers, num].sort((a, b) => a - b));
    }
  };

  const removeManualNumber = (num: number) => {
    setManualNumbers(manualNumbers.filter(n => n !== num));
  };

  const addManualComplementary = (num: number) => {
    if (manualComplementary.length < 5 && !manualComplementary.includes(num) && num >= 1 && num <= 10) {
      setManualComplementary([...manualComplementary, num].sort((a, b) => a - b));
    }
  };

  const removeManualComplementary = (num: number) => {
    setManualComplementary(manualComplementary.filter(n => n !== num));
  };

  if (!selectedNumbers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-100 border border-yellow-400 p-6 rounded-lg text-center">
            <h2 className="text-xl font-bold text-yellow-800 mb-2">⚠️ Aucune sélection détectée</h2>
            <p className="text-yellow-700">
              Veuillez d'abord effectuer une sélection de numéros via l'Analyse Intelligente ou la Configuration des Stratégies.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simulation de Gains de VOS Grilles */}
      <SimulatedGainsTable 
        selectedNumbers={{
          numbers: getCurrentNumbers(),
          complementary: getCurrentComplementary(),
          source: selectedNumbers.source
        }}
      />
      
      {/* Optimisateur Clair et Simple */}
      <details className="bg-gray-50 rounded-xl p-4">
        <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900 transition-colors">
          🔧 Optimisateur avec Options de Sécurité
        </summary>
        <div className="mt-4">
          <ClearSetCoverOptimizer 
            selectedNumbers={{
              numbers: getCurrentNumbers(),
              complementary: getCurrentComplementary(),
              source: selectedNumbers.source
            }}
          />
        </div>
      </details>
      
      {/* Affichage des bornes théoriques */}
      <TheoreticalBoundsDisplay 
        selectedNumbers={getCurrentNumbers().length}
        proposedSolution={undefined}
      />
      
      {/* Set Cover Mixte Optimisé - Approche classique */}
      <details className="bg-gray-50 rounded-xl p-4">
        <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900 transition-colors">
          🔧 Optimisateur Classique (Approche Traditionnelle)
        </summary>
        <div className="mt-4">
          <MixedSetCoverOptimizer 
            selectedNumbers={{
              numbers: getCurrentNumbers(),
              complementary: getCurrentComplementary(),
              source: selectedNumbers.source
            }}
          />
        </div>
      </details>
    </div>
  );
}
