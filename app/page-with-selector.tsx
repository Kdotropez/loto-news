/**
 * PAGE PRINCIPALE AVEC SÉLECTEUR DE VERSION
 * Permet de choisir entre l'ancienne et la nouvelle architecture
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VersionSelector from '@/components/VersionSelector';

// Import dynamique des deux versions
import LegacyApp from './page-legacy';
import ResponsiveApp from './page-responsive';

export default function AppWithVersionSelector() {
  const [selectedVersion, setSelectedVersion] = useState<'legacy' | 'responsive' | null>(null);
  const [showSelector, setShowSelector] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Vérifier s'il y a une préférence sauvegardée
  useEffect(() => {
    const savedVersion = localStorage.getItem('preferred_version') as 'legacy' | 'responsive';
    const hasSeenSelector = localStorage.getItem('has_seen_version_selector');
    
    if (savedVersion && hasSeenSelector) {
      // Si l'utilisateur a déjà fait un choix, l'utiliser directement
      setSelectedVersion(savedVersion);
      setShowSelector(false);
    }
  }, []);

  const handleVersionSelect = (version: 'legacy' | 'responsive') => {
    setIsLoading(true);
    setSelectedVersion(version);
    localStorage.setItem('preferred_version', version);
    localStorage.setItem('has_seen_version_selector', 'true');
    
    // Petit délai pour l'animation
    setTimeout(() => {
      setShowSelector(false);
      setIsLoading(false);
    }, 1000);
  };

  const handleBackToSelector = () => {
    setShowSelector(true);
    setSelectedVersion(null);
    localStorage.removeItem('has_seen_version_selector');
  };

  // Afficher le sélecteur
  if (showSelector) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="selector"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen"
        >
          <VersionSelector
            onVersionSelect={handleVersionSelect}
            currentVersion={selectedVersion || 'legacy'}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Écran de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Chargement de la version {selectedVersion === 'legacy' ? 'actuelle' : 'nouvelle'}...
          </h2>
          <p className="text-gray-600">
            {selectedVersion === 'legacy' 
              ? 'Interface responsive mixte' 
              : 'Architecture 3-en-1 native'}
          </p>
        </motion.div>
      </div>
    );
  }

  // Afficher l'application sélectionnée
  return (
    <div className="min-h-screen relative">
      {/* Bouton pour revenir au sélecteur (mode développement) */}
      <div className="fixed top-4 left-4 z-50">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBackToSelector}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          title="Revenir au sélecteur de version (mode développement)"
        >
          🔄 Changer de version
        </motion.button>
      </div>

      {/* Badge de version actuelle */}
      <div className="fixed top-4 right-4 z-50">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`px-3 py-1 rounded-full text-sm font-semibold shadow-lg ${
            selectedVersion === 'legacy'
              ? 'bg-red-500 text-white'
              : 'bg-green-500 text-white'
          }`}
        >
          {selectedVersion === 'legacy' ? '🔴 Version Actuelle' : '🟢 Version Nouvelle'}
        </motion.div>
      </div>

      {/* Application sélectionnée */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedVersion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        >
          {selectedVersion === 'legacy' ? <LegacyApp /> : <ResponsiveApp />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}



