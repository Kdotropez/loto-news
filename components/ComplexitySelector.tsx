'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  User,
  Star,
  Zap,
  CheckCircle,
  ArrowRight,
  Info,
  X
} from 'lucide-react';
import { complexityManager, ComplexityLevel, ComplexityConfig } from '../lib/complexity-manager';

interface ComplexitySelectorProps {
  onLevelChange?: (level: ComplexityLevel) => void;
  showAsModal?: boolean;
  onClose?: () => void;
  mode?: 'info' | 'selector'; // Mode informatif ou sélecteur
}

export default function ComplexitySelector({ 
  onLevelChange, 
  showAsModal = false, 
  onClose,
  mode = 'info'
}: ComplexitySelectorProps) {
  const [currentLevel, setCurrentLevel] = useState<ComplexityLevel>('beginner');
  const [selectedLevel, setSelectedLevel] = useState<ComplexityLevel>('beginner');
  const [showInfoModal, setShowInfoModal] = useState<ComplexityLevel | null>(null);

  useEffect(() => {
    const level = complexityManager.getCurrentLevel();
    setCurrentLevel(level);
    setSelectedLevel(level);
  }, []);

  const handleLevelChange = (level: ComplexityLevel) => {
    setSelectedLevel(level);
    complexityManager.setLevel(level);
    setCurrentLevel(level);
    onLevelChange?.(level);
    
    // Marquer que l'utilisateur a fait un choix conscient
    localStorage.setItem('complexity_manually_set', 'true');
  };

  // Plus besoin de getColorClasses - on utilise les classes CSS spécifiques
  const getColorClasses = () => {
    return {
      bg: '', // Géré par CSS
      border: '', // Géré par CSS
      text: '', // Géré par CSS
      button: '', // Géré par CSS
      accent: '' // Géré par CSS
    };
  };

  const getFeatureCount = (config: ComplexityConfig): number => {
    return Object.values(config.features).filter(Boolean).length;
  };

  const recommendation = complexityManager.recommendLevel();

  const content = (
    <div className="complexity-selector space-y-4 sm:space-y-6">
      {/* En-tête - Responsive */}
      <div className="text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-3 sm:mb-4">
          ⚙️
        </div>
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">
          Choisissez votre Niveau
        </h1>
        <p className="text-sm text-gray-600">
          Sélectionnez votre mode d'utilisation
        </p>
      </div>


      {/* Contenu selon le mode */}
      {mode === 'info' ? (
        /* Mode informatif - Affiche seulement le mode actuel */
        <div className="text-center">
          {complexityManager.getAllConfigs().map((config) => {
            const isCurrent = currentLevel === config.level;
            
            if (!isCurrent) return null;
            
            return (
              <motion.div
                key={config.level}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 rounded-xl cursor-pointer complexity-${config.level}`}
                onClick={() => setShowInfoModal(config.level)}
              >
                <div className="text-6xl mb-4">{config.icon}</div>
                <h3 className="text-2xl font-bold complexity-title mb-2">
                  {config.label}
                </h3>
                <p className="text-lg opacity-90 mb-2">
                  Mode actuel
                </p>
                <p className="text-sm opacity-80">
                  Cliquez pour plus d'informations
                </p>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Mode sélecteur - Affiche tous les modes pour changer */
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-800 text-center mb-4">
            Choisissez votre mode
          </h3>
          {complexityManager.getAllConfigs().map((config) => {
            const isCurrent = currentLevel === config.level;
            
            return (
              <motion.div
                key={config.level}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border-2 cursor-pointer complexity-${config.level} ${
                  isCurrent ? 'selected border-4' : ''
                }`}
                onClick={() => {
                  if (onLevelChange) {
                    onLevelChange(config.level);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{config.icon}</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold complexity-title">
                      {config.label}
                      {isCurrent && <span className="ml-2">✓</span>}
                    </h4>
                    <p className="text-sm opacity-90">
                      {config.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Bouton fermer uniquement */}
      {showAsModal && onClose && (
        <div className="text-center">
          <button
            onClick={onClose}
            className="py-3 px-6 rounded-lg font-semibold transition-colors btn-close"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Modale d'information */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {complexityManager.getConfig(showInfoModal).label}
              </h3>
              <button
                onClick={() => setShowInfoModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                {complexityManager.getConfig(showInfoModal).description}
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Fonctionnalités principales :</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {showInfoModal === 'beginner' && (
                    <>
                      <li>• Analyse intelligente automatique</li>
                      <li>• Génération de grilles simples</li>
                      <li>• Interface guidée étape par étape</li>
                      <li>• Sauvegarde basique</li>
                    </>
                  )}
                  {showInfoModal === 'intermediate' && (
                    <>
                      <li>• Toutes les fonctionnalités débutant</li>
                      <li>• Statistiques avancées</li>
                      <li>• Tests de combinaisons</li>
                      <li>• Analyse des patterns</li>
                      <li>• Gestion des grilles sauvegardées</li>
                    </>
                  )}
                  {showInfoModal === 'expert' && (
                    <>
                      <li>• Toutes les fonctionnalités précédentes</li>
                      <li>• Optimisateur de garanties</li>
                      <li>• Analyse rétroactive complète</li>
                      <li>• Formules mathématiques</li>
                      <li>• Bornes théoriques</li>
                      <li>• Synchronisation automatique</li>
                    </>
                  )}
                </ul>
              </div>
              
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );

  if (showAsModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-8 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative"
        >
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1 sm:p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 z-10"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
          {content}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
      {content}
    </div>
  );
}
