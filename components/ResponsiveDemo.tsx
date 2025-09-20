/**
 * DÉMO D'ADAPTATION AUTOMATIQUE
 * Exemple concret de l'adaptation en temps réel
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, Tablet, Smartphone, RotateCcw, 
  Maximize2, Minimize2, Eye, Info
} from 'lucide-react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

export default function ResponsiveDemo() {
  const { 
    deviceType, 
    orientation, 
    screenWidth, 
    screenHeight,
    isMobile,
    isTablet, 
    isDesktop,
    isPortrait,
    isLandscape,
    displayConfig,
    deviceClasses
  } = useDeviceDetection();

  const [showDetails, setShowDetails] = useState(false);

  // Icône selon le type d'appareil
  const DeviceIcon = () => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-6 h-6" />;
      case 'tablet': return <Tablet className="w-6 h-6" />;
      case 'desktop': return <Monitor className="w-6 h-6" />;
      default: return <Monitor className="w-6 h-6" />;
    }
  };

  // Couleur selon le type d'appareil
  const getDeviceColor = () => {
    switch (deviceType) {
      case 'mobile': return 'bg-green-500 text-white';
      case 'tablet': return 'bg-blue-500 text-white';
      case 'desktop': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Détection automatique en temps réel */}
      <motion.div
        key={`${deviceType}-${orientation}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            🔄 Adaptation Automatique Active
          </h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Status actuel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Type d'appareil */}
          <div className={`rounded-lg p-4 ${getDeviceColor()}`}>
            <div className="flex items-center gap-2 mb-2">
              <DeviceIcon />
              <span className="font-semibold capitalize">{deviceType}</span>
            </div>
            <p className="text-sm opacity-90">
              {screenWidth}×{screenHeight}px
            </p>
          </div>

          {/* Orientation */}
          <div className="bg-gray-700 text-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <RotateCcw className="w-6 h-6" />
              <span className="font-semibold capitalize">{orientation}</span>
            </div>
            <p className="text-sm opacity-90">
              {isPortrait ? 'Portrait' : 'Paysage'}
            </p>
          </div>

          {/* Configuration */}
          <div className="bg-orange-500 text-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Maximize2 className="w-6 h-6" />
              <span className="font-semibold">Config Auto</span>
            </div>
            <p className="text-sm opacity-90">
              {displayConfig.columns} colonnes
            </p>
          </div>
        </div>

        {/* Démonstration visuelle */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">
            Interface adaptée automatiquement :
          </h4>
          
          {/* Grille adaptative */}
          <div className={`grid gap-3 ${
            displayConfig.columns === 1 ? 'grid-cols-1' :
            displayConfig.columns === 2 ? 'grid-cols-2' :
            displayConfig.columns === 3 ? 'grid-cols-3' :
            'grid-cols-4'
          }`}>
            {Array.from({ length: Math.min(8, displayConfig.columns * 2) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-gradient-to-r from-blue-400 to-orange-500 text-white p-3 rounded-lg text-center"
              >
                <span className="text-sm font-medium">Item {i + 1}</span>
              </motion.div>
            ))}
          </div>

          {/* Navigation adaptative */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">Navigation adaptée :</p>
            {isMobile && (
              <div className="bg-blue-100 p-3 rounded-lg">
                📱 <strong>Mobile :</strong> Navigation en bas + Menu drawer
              </div>
            )}
            {isTablet && (
              <div className="bg-green-100 p-3 rounded-lg">
                📟 <strong>Tablette :</strong> Navigation {isPortrait ? 'en bas (portrait)' : 'latérale (paysage)'}
              </div>
            )}
            {isDesktop && (
              <div className="bg-orange-100 p-3 rounded-lg">
                🖥️ <strong>Desktop :</strong> Header complet + Sidebar optionnelle
              </div>
            )}
          </div>
        </div>

        {/* Détails techniques */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-4 bg-gray-50 rounded-lg"
          >
            <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Détails techniques
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Breakpoints :</strong>
                <ul className="mt-1 space-y-1">
                  <li>📱 Mobile: 0-767px</li>
                  <li>📟 Tablette: 768-1023px</li>
                  <li>🖥️ Desktop: ≥1024px</li>
                </ul>
              </div>
              <div>
                <strong>Configuration actuelle :</strong>
                <ul className="mt-1 space-y-1">
                  <li>Colonnes: {displayConfig.columns}</li>
                  <li>Items/page: {displayConfig.itemsPerPage}</li>
                  <li>Mode compact: {displayConfig.compactMode ? 'Oui' : 'Non'}</li>
                  <li>Sidebar: {displayConfig.showSidebar ? 'Oui' : 'Non'}</li>
                </ul>
              </div>
            </div>
            <div className="mt-3">
              <strong>Classes CSS auto :</strong>
              <code className="block mt-1 p-2 bg-gray-200 rounded text-xs">
                {deviceClasses}
              </code>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Instructions pour tester */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">
          🧪 Testez l'adaptation automatique :
        </h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>Redimensionnez votre navigateur</strong> → L'interface s'adapte instantanément</li>
          <li>• <strong>Basculez en mode responsive</strong> (F12 → icône mobile) → Changement automatique</li>
          <li>• <strong>Changez l'orientation</strong> (tablette) → Navigation et grilles s'ajustent</li>
          <li>• <strong>Testez sur vrai appareil</strong> → Expérience native optimisée</li>
        </ul>
      </div>
    </div>
  );
}



