/**
 * SÉLECTEUR DE VERSION SIMPLE
 * Interface simple pour choisir entre les deux architectures
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Smartphone, ArrowRight, CheckCircle } from 'lucide-react';

interface SimpleVersionSelectorProps {
  onVersionSelect: (version: 'current' | 'new') => void;
}

export default function SimpleVersionSelector({ onVersionSelect }: SimpleVersionSelectorProps) {
  const [selectedVersion, setSelectedVersion] = useState<'current' | 'new'>('current');

  const handleSelect = (version: 'current' | 'new') => {
    setSelectedVersion(version);
    localStorage.setItem('selected_version', version);
    onVersionSelect(version);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Choisissez votre interface
          </h1>
          <p className="text-xl text-gray-600">
            Sélectionnez l'architecture responsive qui vous convient
          </p>
        </motion.div>

        {/* Sélecteur */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Version actuelle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all ${
              selectedVersion === 'current'
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => handleSelect('current')}
          >
            {selectedVersion === 'current' && (
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              🔵 Interface Actuelle
            </h3>
            <p className="text-gray-600 mb-4">Architecture responsive classique</p>
            
            <div className="space-y-2 mb-6">
              <p className="text-sm text-gray-700">✅ Stable et testée</p>
              <p className="text-sm text-gray-700">✅ Fonctionnelle actuellement</p>
              <p className="text-sm text-gray-700">✅ Interface familière</p>
            </div>

            <button
              onClick={() => handleSelect('current')}
              className={`w-full py-3 px-4 text-white font-semibold rounded-lg transition-colors ${
                selectedVersion === 'current'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-500 hover:bg-gray-600'
              }`}
            >
              {selectedVersion === 'current' ? '✓ Sélectionnée' : 'Choisir cette version'}
            </button>
          </motion.div>

          {/* Nouvelle version */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all ${
              selectedVersion === 'new'
                ? 'border-green-500 bg-green-50 ring-2 ring-green-500 ring-opacity-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => handleSelect('new')}
          >
            {selectedVersion === 'new' && (
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              🟢 Interface Moderne
            </h3>
            <p className="text-gray-600 mb-4">Architecture 3-en-1 optimisée</p>
            
            <div className="space-y-2 mb-6">
              <p className="text-sm text-gray-700">🚀 3 interfaces natives</p>
              <p className="text-sm text-gray-700">📱 Mobile/Tablette/Desktop</p>
              <p className="text-sm text-gray-700">⚡ Performance optimisée</p>
            </div>

            <button
              onClick={() => handleSelect('new')}
              className={`w-full py-3 px-4 text-white font-semibold rounded-lg transition-colors ${
                selectedVersion === 'new'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-500 hover:bg-gray-600'
              }`}
            >
              {selectedVersion === 'new' ? '✓ Sélectionnée' : 'Choisir cette version'}
            </button>
          </motion.div>
        </div>

        {/* Bouton de confirmation */}
        <div className="text-center">
          <button
            onClick={() => onVersionSelect(selectedVersion)}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <span className="flex items-center gap-2">
              Continuer avec la version {selectedVersion === 'current' ? 'actuelle' : 'moderne'}
              <ArrowRight className="w-5 h-5" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
