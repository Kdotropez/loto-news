'use client';

import { motion } from 'framer-motion';
import { Star, RefreshCw, Database } from 'lucide-react';
import LotoCountdown from './LotoCountdown';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface HeaderProps {
  onRefresh?: () => void;
  remainingCombinations?: number;
  remainingCombinationsSecondTirage?: number;
  onDataUpdate?: () => void;
  chanceLevel?: number;
  lastDraw?: {
    date: string;
    numbers: number[];
    complementary: number;
    joker?: string;
  } | null;
}

export default function Header({ onRefresh, remainingCombinations = 0, remainingCombinationsSecondTirage = 0, onDataUpdate, chanceLevel = 0, lastDraw }: HeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Mise à jour automatique depuis OpenDataSoft
      const response = await fetch('/api/opendatasoft-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'sync' }),
      });

      const result = await response.json();
      
      if (result.success) {
        if (result.result.newTirages > 0) {
          toast.success(`🎯 ${result.result.newTirages} nouveaux tirages importés depuis OpenDataSoft !`);
          // Rafraîchir les données et l'interface
          onRefresh?.();
          onDataUpdate?.();
        } else {
          toast.success('✅ Données déjà à jour');
        }
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('❌ Erreur lors de la mise à jour depuis OpenDataSoft');
      console.error('Erreur refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50"
    >
      <div className="container mx-auto px-2 py-2 md:px-4 md:py-4">
        <div className="flex items-center justify-between flex-wrap gap-2 md:gap-0">
          {/* Logo et titre */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-lg">
                <Star className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-loto-red rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">
                Kdo Loto Gagnant
              </h1>
              <p className="text-sm text-gray-600">
                Optimisez vos chances au Loto National
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-1 md:gap-3 flex-wrap"
          >
            {/* Compteur de combinaisons magiques - Tirage Principal */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg shadow-lg">
              <div className="flex items-center gap-1">
                <div className="text-lg animate-bounce">🍀</div>
                <div className="text-lg animate-bounce" style={{ animationDelay: '0.1s' }}>⭐</div>
                <div className="text-lg animate-bounce" style={{ animationDelay: '0.2s' }}>💎</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black">
                  {(remainingCombinations / 1000000).toFixed(1)} Millions
                </div>
                <div className="text-xs text-emerald-100 font-medium">
                  Combinaisons Magiques
                </div>
                <div className="text-xs text-emerald-200 font-light">
                  5 numéros + 1 complémentaire
                </div>
                <div className="text-xs text-emerald-300 font-light">
                  ({remainingCombinations.toLocaleString()} exactement)
                </div>
              </div>
            </div>

            {/* Compteur de combinaisons magiques - Second Tirage */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg shadow-lg">
              <div className="flex items-center gap-1">
                <div className="text-lg animate-bounce">🎯</div>
                <div className="text-lg animate-bounce" style={{ animationDelay: '0.1s' }}>💫</div>
                <div className="text-lg animate-bounce" style={{ animationDelay: '0.2s' }}>🌟</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black">
                  {(remainingCombinationsSecondTirage / 1000000).toFixed(1)} Millions
                </div>
                <div className="text-xs text-cyan-100 font-medium">
                  Second Tirage
                </div>
                <div className="text-xs text-cyan-200 font-light">
                  5 numéros seuls (sans complémentaire)
                </div>
                <div className="text-xs text-cyan-300 font-light">
                  ({remainingCombinationsSecondTirage.toLocaleString()} exactement)
                </div>
              </div>
            </div>

            {/* Niveau de Chance */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg shadow-lg">
              <div className="text-2xl">🍀</div>
              <div className="text-center">
                <div className="text-xl font-black">
                  {chanceLevel}%
                </div>
                <div className="text-xs text-yellow-100 font-medium">
                  Couverture
                </div>
              </div>
              <div className="w-16 bg-yellow-200/30 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-yellow-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, chanceLevel)}%` }}
                ></div>
              </div>
            </div>

            {/* Compte à rebours du prochain tirage - Affichage amélioré */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg shadow-lg">
              <div className="text-2xl animate-pulse">⏰</div>
              <div className="text-center">
                <div className="text-sm font-bold text-orange-100 mb-1">
                  PROCHAIN TIRAGE
                </div>
                <LotoCountdown compact />
                <div className="text-xs text-orange-200 mt-1 font-medium">
                  Lundi, Mercredi, Samedi à 20h30
                </div>
              </div>
            </div>

            {/* Dernier tirage - Affichage amélioré */}
            {lastDraw && (
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-lg">
                <div className="text-2xl">🎲</div>
                <div className="text-center">
                  <div className="text-sm font-bold text-purple-100 mb-1">
                    DERNIER TIRAGE OFFICIEL
                  </div>
                  <div className="text-xs text-purple-200 mb-2 font-medium">
                    {new Date(lastDraw.date).toLocaleDateString('fr-FR', { 
                      weekday: 'short', 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center gap-1 justify-center">
                    {lastDraw.numbers && lastDraw.numbers.filter(n => n).map((num, index) => (
                      <div key={index} className="w-8 h-8 bg-white text-purple-600 rounded-full flex items-center justify-center text-sm font-black border-2 border-purple-300">
                        {num}
                      </div>
                    ))}
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mx-1"></div>
                    <div className="w-8 h-8 bg-yellow-400 text-purple-900 rounded-full flex items-center justify-center text-sm font-black border-2 border-yellow-300">
                      {lastDraw.complementary || '?'}
                    </div>
                    {lastDraw.joker && (
                      <>
                        <div className="w-2 h-2 bg-orange-400 rounded-full mx-1"></div>
                        <div className="w-8 h-8 bg-orange-400 text-white rounded-full flex items-center justify-center text-sm font-black border-2 border-orange-300">
                          {lastDraw.joker}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-purple-200 mt-1 font-medium">
                    5 + Complémentaire {lastDraw.joker ? '+ Joker+' : ''}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors duration-200 disabled:opacity-50"
              title="Vérifier les mises à jour"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg">
              <Database className="w-4 h-4" />
              <span className="text-sm font-medium">Données FDJ</span>
            </div>
          </motion.div>
        </div>

        {/* Barre de progression (optionnelle) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Statut des données</span>
            <span className="text-green-600 font-medium">✓ Synchronisé</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
