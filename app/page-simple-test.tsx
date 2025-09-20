/**
 * PAGE DE TEST SIMPLE
 * Version simplifiée pour vérifier que l'application fonctionne
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

export default function SimpleTestPage() {
  const [version, setVersion] = useState<'legacy' | 'responsive'>('legacy');

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
            🚀 Test de l'application
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Application Loto V2 - Test de fonctionnement
          </p>
        </motion.div>

        {/* Sélecteur simple */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Version Legacy */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl border-2 p-6 cursor-pointer transition-all ${
              version === 'legacy'
                ? 'border-red-200 bg-red-50 ring-2 ring-offset-2 ring-blue-500'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => setVersion('legacy')}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              🔴 Version Actuelle
            </h3>
            <p className="text-gray-600 mb-4">Architecture responsive existante</p>
            <p className="text-gray-700 mb-6">
              Votre interface actuelle qui fonctionne avec les wrappers responsive
            </p>
            <button
              onClick={() => setVersion('legacy')}
              className={`w-full py-3 px-4 text-white font-semibold rounded-lg transition-colors ${
                version === 'legacy'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {version === 'legacy' ? '✓ Sélectionnée' : 'Choisir cette version'}
            </button>
          </motion.div>

          {/* Version Responsive */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`rounded-xl border-2 p-6 cursor-pointer transition-all ${
              version === 'responsive'
                ? 'border-green-200 bg-green-50 ring-2 ring-offset-2 ring-blue-500'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => setVersion('responsive')}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              🟢 Nouvelle Version
            </h3>
            <p className="text-gray-600 mb-4">Architecture 3-en-1 native</p>
            <p className="text-gray-700 mb-6">
              3 interfaces distinctes optimisées pour mobile/tablette/desktop
            </p>
            <button
              onClick={() => setVersion('responsive')}
              className={`w-full py-3 px-4 text-white font-semibold rounded-lg transition-colors ${
                version === 'responsive'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {version === 'responsive' ? '✓ Sélectionnée' : 'Choisir cette version'}
            </button>
          </motion.div>
        </div>

        {/* Informations */}
        <div className="text-center">
          <div className="inline-flex items-center gap-4 bg-white rounded-lg p-4 shadow-lg">
            <span className="text-gray-700">Version actuelle :</span>
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              version === 'legacy' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {version === 'legacy' ? '🔴 Actuelle' : '🟢 Nouvelle'}
            </div>
          </div>
        </div>

        {/* Test de responsive */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            📱 Test de responsivité
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <Smartphone className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold">Mobile</p>
              <p className="text-sm text-gray-600">≤ 767px</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <Tablet className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="font-semibold">Tablette</p>
              <p className="text-sm text-gray-600">768px - 1023px</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg text-center">
              <Monitor className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="font-semibold">Desktop</p>
              <p className="text-sm text-gray-600">≥ 1024px</p>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-4">
            Redimensionnez votre navigateur pour tester l'adaptation automatique !
          </p>
        </div>
      </div>
    </div>
  );
}

