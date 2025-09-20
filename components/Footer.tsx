'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Phone, ExternalLink, AlertTriangle } from 'lucide-react';
import GamblingWarning from './GamblingWarning';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-16">
      <div className="container mx-auto px-4">
        
        {/* Avertissement jeu responsable */}
        <div className="mb-8">
          <GamblingWarning />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Section Légal */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-yellow-400">⚖️ Mentions Légales</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                <strong>Application d'analyse statistique</strong> des tirages du Loto français.
              </p>
              <p>
                Les données sont fournies à titre informatif uniquement.
              </p>
              <p>
                Aucune garantie de gain. Le jeu est un divertissement.
              </p>
            </div>
          </div>

          {/* Section Jeu Responsable */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-red-400 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Jeu Responsable
            </h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="bg-red-900/30 p-3 rounded-lg border border-red-700/50">
                <p className="font-bold text-red-300 mb-1">
                  JOUER COMPORTE DES RISQUES
                </p>
                <p>Endettement, isolement, dépendance</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-400" />
                <div>
                  <p className="font-semibold">Aide : 09-74-75-13-13</p>
                  <p className="text-xs text-gray-400">Appel gratuit et confidentiel</p>
                </div>
              </div>

              <a 
                href="https://www.joueurs-info-service.fr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                joueurs-info-service.fr
              </a>
            </div>
          </div>

          {/* Section Technique */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-blue-400">🔧 Informations</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                <strong>Données :</strong> Tirages officiels FDJ
              </p>
              <p>
                <strong>Analyses :</strong> Statistiques descriptives
              </p>
              <p>
                <strong>Mise à jour :</strong> Après chaque tirage
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Application développée à des fins éducatives et de divertissement.
              </p>
            </div>
          </div>
        </div>

        {/* Barre de bas */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>© 2024 Loto Analyzer</span>
              <span>•</span>
              <span>Analyse statistique</span>
              <span>•</span>
              <span>Jeu responsable</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Interdit aux -18 ans</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Jeu avec modération</span>
              </div>
            </div>
          </div>

          {/* Message de disclaimer final */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 max-w-4xl mx-auto">
              <strong>Avertissement :</strong> Cette application analyse les statistiques des tirages passés à des fins éducatives. 
              Les résultats passés n'influencent pas les tirages futurs. Chaque combinaison a exactement les mêmes chances de sortir. 
              Le jeu peut créer une dépendance. Jouez avec modération et selon vos moyens.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
