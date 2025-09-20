'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Calculator, 
  Target, 
  Info, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign
} from 'lucide-react';
import DetailedRankExplanation from './DetailedRankExplanation';
import SimulatedGainsTable from './SimulatedGainsTable';

interface SelectedNumbers {
  numbers: number[];
  complementary: number[];
  source: string;
}

interface RulesTabProps {
  selectedNumbers: SelectedNumbers;
}

export default function RulesTab({ selectedNumbers }: RulesTabProps) {
  const [activeSection, setActiveSection] = useState<'rules' | 'simulation'>('rules');

  const sections = [
    {
      id: 'rules',
      label: 'Règles Officielles',
      icon: BookOpen,
      description: 'Rangs de gains et probabilités FDJ'
    },
    {
      id: 'simulation',
      label: 'Simulation Vos Grilles',
      icon: Calculator,
      description: 'Gains estimés selon vos numéros'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Navigation des sections */}
      <div className="bg-white rounded-xl p-2 shadow-lg border">
        <div className="flex gap-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as 'rules' | 'simulation')}
                className={`flex-1 flex items-center gap-3 p-4 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">{section.label}</div>
                  <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                    {section.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu selon la section active */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeSection === 'rules' && (
          <div className="space-y-6">
            {/* En-tête Règles */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h2 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Règles Officielles du Loto National
              </h2>
              <p className="text-blue-700">
                Comprendre les 10 rangs de gains, leurs probabilités et les gains moyens historiques.
              </p>
            </div>

            {/* Composant des règles détaillées */}
            <DetailedRankExplanation 
              selectedNumbers={selectedNumbers.numbers.length}
            />
          </div>
        )}

        {activeSection === 'simulation' && (
          <div className="space-y-6">
            {/* En-tête Simulation */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h2 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
                <Calculator className="w-6 h-6" />
                Simulation de VOS Grilles
              </h2>
              <p className="text-purple-700 mb-3">
                Estimation des gains de vos grilles selon le nombre de correspondances avec le tirage réel.
              </p>
              
              {selectedNumbers.numbers.length >= 5 ? (
                <div className="bg-purple-100 rounded-lg p-3">
                  <p className="text-sm text-purple-800">
                    <strong>🎯 Votre Stratégie :</strong> {selectedNumbers.numbers.length} numéros sélectionnés 
                    → {Math.ceil(((selectedNumbers.numbers.length * (selectedNumbers.numbers.length - 1) * (selectedNumbers.numbers.length - 2)) / 6) / 10)} grilles LB1 
                    → {(Math.ceil(((selectedNumbers.numbers.length * (selectedNumbers.numbers.length - 1) * (selectedNumbers.numbers.length - 2)) / 6) / 10) * 2.20).toFixed(2)}€
                  </p>
                </div>
              ) : (
                <div className="bg-amber-100 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    <strong>⚠️ Sélectionnez au moins 5 numéros</strong> pour voir la simulation de vos grilles.
                  </p>
                </div>
              )}
            </div>

            {/* Composant de simulation */}
            <SimulatedGainsTable 
              selectedNumbers={selectedNumbers}
            />
          </div>
        )}
      </motion.div>

      {/* Pied de page informatif */}
      <div className="bg-gray-50 rounded-xl p-4 border">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <strong>💡 Utilisation :</strong> Consultez les <strong>Règles Officielles</strong> pour comprendre 
            le fonctionnement du Loto, puis utilisez la <strong>Simulation</strong> pour estimer les gains 
            de votre stratégie spécifique selon différents scénarios de correspondance.
          </div>
        </div>
      </div>
    </div>
  );
}
