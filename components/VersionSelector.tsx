/**
 * SÉLECTEUR DE VERSION
 * Permet de choisir entre l'ancienne et la nouvelle architecture responsive
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, Smartphone, Tablet, 
  ArrowRight, Eye, Settings, 
  CheckCircle, AlertTriangle
} from 'lucide-react';

interface VersionSelectorProps {
  onVersionSelect: (version: 'legacy' | 'responsive') => void;
  currentVersion?: 'legacy' | 'responsive';
}

export default function VersionSelector({ 
  onVersionSelect, 
  currentVersion = 'legacy' 
}: VersionSelectorProps) {
  const [selectedVersion, setSelectedVersion] = useState<'legacy' | 'responsive'>(currentVersion);
  const [showComparison, setShowComparison] = useState(false);

  // Sauvegarder la préférence
  useEffect(() => {
    const savedVersion = localStorage.getItem('preferred_version') as 'legacy' | 'responsive';
    if (savedVersion) {
      setSelectedVersion(savedVersion);
    }
  }, []);

  const handleVersionChange = (version: 'legacy' | 'responsive') => {
    setSelectedVersion(version);
    localStorage.setItem('preferred_version', version);
    onVersionSelect(version);
  };

  const versionData = {
    legacy: {
      title: '🔴 Version Actuelle (Legacy)',
      subtitle: 'Architecture responsive mixte',
      description: 'Interface qui s\'adapte avec des wrappers et CSS responsive',
      color: 'border-red-200 bg-red-50',
      buttonColor: 'bg-red-500 hover:bg-red-600'
    },
    responsive: {
      title: '🟢 Nouvelle Version (3-en-1)',
      subtitle: 'Architecture responsive native séparée',
      description: '3 interfaces distinctes optimisées pour chaque appareil',
      color: 'border-green-200 bg-green-50',
      buttonColor: 'bg-green-500 hover:bg-green-600'
    }
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
            🚀 Choisissez votre version
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Comparez et sélectionnez l'architecture responsive qui vous convient
          </p>
        </motion.div>

        {/* Sélecteur de versions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {Object.entries(versionData).map(([key, data]) => {
            const version = key as 'legacy' | 'responsive';
            const isSelected = selectedVersion === version;
            
            return (
              <motion.div
                key={version}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: version === 'legacy' ? 0.1 : 0.2 }}
                className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all ${
                  isSelected 
                    ? data.color + ' ring-2 ring-offset-2 ring-blue-500' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => handleVersionChange(version)}
              >
                {/* Badge de sélection */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </motion.div>
                )}

                {/* Titre */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {data.title}
                </h3>
                <p className="text-gray-600 mb-4">{data.subtitle}</p>
                
                {/* Description */}
                <p className="text-gray-700 mb-6">{data.description}</p>

                {/* Avantages/Inconvénients */}
                <div className="space-y-3 mb-6">
                  {version === 'legacy' ? (
                    <>
                      <div>
                        <h5 className="font-medium text-green-700 mb-1">Avantages :</h5>
                        <ul className="space-y-1">
                          <li className="text-xs text-green-600">✅ Stable et testé</li>
                          <li className="text-xs text-green-600">✅ Fonctionnel actuellement</li>
                          <li className="text-xs text-green-600">✅ Pas de changement requis</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-red-700 mb-1">Inconvénients :</h5>
                        <ul className="space-y-1">
                          <li className="text-xs text-red-600">❌ Code dupliqué (40%)</li>
                          <li className="text-xs text-red-600">❌ CSS complexe à maintenir</li>
                          <li className="text-xs text-red-600">❌ Expérience tablette limitée</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h5 className="font-medium text-green-700 mb-1">Avantages :</h5>
                        <ul className="space-y-1">
                          <li className="text-xs text-green-600">✅ 3 expériences natives</li>
                          <li className="text-xs text-green-600">✅ Code maintenable (-60% duplication)</li>
                          <li className="text-xs text-green-600">✅ Performance optimisée (+50%)</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-yellow-700 mb-1">À considérer :</h5>
                        <ul className="space-y-1">
                          <li className="text-xs text-yellow-600">⚠️ Nouvelle architecture</li>
                          <li className="text-xs text-yellow-600">⚠️ Composants à finaliser</li>
                          <li className="text-xs text-yellow-600">⚠️ Tests supplémentaires</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>

                {/* Bouton de sélection */}
                <button
                  onClick={() => handleVersionChange(version)}
                  className={`w-full py-3 px-4 text-white font-semibold rounded-lg transition-colors ${
                    isSelected 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : data.buttonColor
                  }`}
                >
                  {isSelected ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Version sélectionnée
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ArrowRight className="w-5 h-5" />
                      Choisir cette version
                    </span>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="text-center">
          <div className="inline-flex items-center gap-4 bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">Version sélectionnée :</span>
            </div>
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              selectedVersion === 'legacy' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {selectedVersion === 'legacy' ? '🔴 Actuelle' : '🟢 Nouvelle'}
            </div>
            <button
              onClick={() => onVersionSelect(selectedVersion)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Continuer avec cette version
            </button>
          </div>
        </div>

        {/* Note de développement */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            Mode développement - Ce sélecteur sera retiré en production
          </div>
        </div>
      </div>
    </div>
  );
}