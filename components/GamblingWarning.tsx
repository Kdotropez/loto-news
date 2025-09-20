'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ExternalLink, Shield, Phone } from 'lucide-react';

interface GamblingWarningProps {
  className?: string;
  compact?: boolean;
}

export default function GamblingWarning({ className = '', compact = false }: GamblingWarningProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  if (compact) {
    return (
      <div className={`bg-red-50 border-l-4 border-red-400 p-2 ${className}`}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <div className="text-xs text-red-800">
            <strong>Jeu responsable :</strong> Jouer comporte des risques. 
            <button 
              onClick={() => setIsExpanded(true)}
              className="text-red-600 underline ml-1"
            >
              Plus d'infos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Bannière principale */}
      <motion.div 
        className={`bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-300 rounded-xl p-4 ${className}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-800 mb-2">
              ⚠️ Avertissement Jeu Responsable
            </h3>
            
            <div className="text-sm text-red-700 space-y-2">
              <p>
                <strong>JOUER COMPORTE DES RISQUES :</strong> endettement, isolement, dépendance. 
                Pour être aidé, appelez le <strong>09-74-75-13-13</strong> (appel non surtaxé).
              </p>
              
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center gap-1 text-xs">
                  <Shield className="w-4 h-4" />
                  <span>Interdit aux mineurs</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Phone className="w-4 h-4" />
                  <span>Aide : 09-74-75-13-13</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <ExternalLink className="w-4 h-4" />
                  <a 
                    href="https://www.joueurs-info-service.fr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    joueurs-info-service.fr
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(true)}
            className="text-red-600 hover:text-red-800 text-sm underline"
          >
            Plus d'infos
          </button>
          
          <button
            onClick={() => setIsDismissed(true)}
            className="text-red-400 hover:text-red-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Modal détaillée */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-red-800 flex items-center gap-2">
                    <Shield className="w-6 h-6" />
                    Jeu Responsable
                  </h2>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6 text-gray-700">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h3 className="font-bold text-red-800 mb-2">⚠️ AVERTISSEMENT OFFICIEL</h3>
                    <p className="text-red-700">
                      <strong>JOUER COMPORTE DES RISQUES :</strong> endettement, isolement, dépendance. 
                      Pour être aidé, appelez le <strong>09-74-75-13-13</strong> (appel non surtaxé).
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">🎯 À propos de cette application</h3>
                    <p>
                      Cette application est un <strong>outil d'analyse statistique</strong> des tirages du Loto. 
                      Elle ne garantit aucun gain et ne constitue pas une méthode infaillible.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">📊 Rappels importants</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Le Loto est un jeu de <strong>pur hasard</strong></li>
                      <li>Les analyses statistiques <strong>n'influencent pas</strong> les tirages futurs</li>
                      <li>Chaque combinaison a exactement les <strong>mêmes chances</strong> de sortir</li>
                      <li>Il n'existe <strong>aucune stratégie</strong> pour garantir un gain</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">🛡️ Signes d'alerte</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Vous jouez plus que prévu</li>
                      <li>Vous empruntez pour jouer</li>
                      <li>Le jeu affecte votre travail ou vos relations</li>
                      <li>Vous mentez sur vos habitudes de jeu</li>
                      <li>Vous jouez pour récupérer vos pertes</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">📞 Aide et soutien</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <strong>Joueurs Info Service : 09-74-75-13-13</strong>
                        </div>
                        <p className="text-sm">Appel non surtaxé, anonyme et confidentiel</p>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <ExternalLink className="w-4 h-4 text-blue-600" />
                          <a 
                            href="https://www.joueurs-info-service.fr" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:no-underline"
                          >
                            www.joueurs-info-service.fr
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Jeu interdit aux mineurs • Ne peut pas être considéré comme un placement financier
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
