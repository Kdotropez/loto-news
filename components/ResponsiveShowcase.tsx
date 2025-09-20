/**
 * VITRINE RESPONSIVE
 * Démonstration visuelle de l'adaptation automatique
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import ResponsiveRouter from './ResponsiveRouter';

export default function ResponsiveShowcase() {
  const { deviceType, orientation, screenWidth } = useDeviceDetection();

  // Contenu qui s'adapte automatiquement
  const adaptiveContent = (
    <div className="space-y-6">
      {/* Titre adaptatif */}
      <motion.h1 
        className={`font-bold text-center ${
          deviceType === 'mobile' ? 'text-2xl' :
          deviceType === 'tablet' ? 'text-3xl' :
          'text-4xl'
        }`}
      >
        🎯 Interface {deviceType === 'mobile' ? 'Mobile' : deviceType === 'tablet' ? 'Tablette' : 'Desktop'}
      </motion.h1>

      {/* Grille adaptative automatique */}
      <div className={`grid gap-4 ${
        deviceType === 'mobile' ? 'grid-cols-1' :
        deviceType === 'tablet' ? 
          (orientation === 'portrait' ? 'grid-cols-2' : 'grid-cols-3') :
        'grid-cols-4'
      }`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gradient-to-r from-blue-500 to-orange-500 text-white p-6 rounded-lg shadow-lg"
          >
            <h3 className="font-semibold mb-2">Carte {i + 1}</h3>
            <p className="text-sm opacity-90">
              Adaptée pour {deviceType}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Informations d'adaptation */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">📊 Adaptation Automatique Active</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="font-semibold text-blue-800">Type détecté</div>
            <div className="text-2xl font-bold text-blue-600 capitalize">{deviceType}</div>
            <div className="text-sm text-blue-600">{screenWidth}px de large</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="font-semibold text-green-800">Orientation</div>
            <div className="text-2xl font-bold text-green-600 capitalize">{orientation}</div>
            <div className="text-sm text-green-600">
              {orientation === 'portrait' ? 'Plus haut que large' : 'Plus large que haut'}
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="font-semibold text-orange-800">Interface</div>
            <div className="text-2xl font-bold text-orange-600">
              {deviceType === 'mobile' ? '📱 Tactile' :
               deviceType === 'tablet' ? '📟 Hybride' : '🖥️ Bureau'}
            </div>
            <div className="text-sm text-orange-600">Optimisée automatiquement</div>
          </div>
        </div>
      </div>

      {/* Instructions de test */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">
          🧪 Testez l'adaptation en temps réel :
        </h4>
        <ul className="text-yellow-700 space-y-1 text-sm">
          <li>1. <strong>Redimensionnez cette fenêtre</strong> → L'interface change automatiquement</li>
          <li>2. <strong>Ouvrez les outils développeur</strong> (F12) → Mode responsive</li>
          <li>3. <strong>Changez la taille d'écran</strong> → Observez les transitions</li>
          <li>4. <strong>Testez l'orientation</strong> (tablette) → Navigation s'adapte</li>
        </ul>
      </div>
    </div>
  );

  return (
    <ResponsiveRouter
      title={`App ${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}`}
      headerProps={{
        remainingCombinations: 19068840,
        chanceLevel: 75
      }}
      navigationItems={[
        { id: 'home', label: 'Accueil', icon: 'Home' },
        { id: 'demo', label: 'Démo', icon: 'Eye' },
        { id: 'settings', label: 'Paramètres', icon: 'Settings' }
      ]}
      mobileConfig={{
        showQuickActions: true,
        quickActions: [
          {
            id: 'refresh',
            label: 'Actualiser',
            icon: 'RefreshCw',
            action: () => window.location.reload(),
            color: 'bg-blue-600'
          }
        ]
      }}
    >
      {adaptiveContent}
    </ResponsiveRouter>
  );
}



