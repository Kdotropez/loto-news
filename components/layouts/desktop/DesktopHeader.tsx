/**
 * HEADER DESKTOP
 * En-tête optimisé pour écrans larges
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, RefreshCw, Settings, Bell, User, Search,
  TrendingUp, DollarSign, Target, Award
} from 'lucide-react';

interface DesktopHeaderProps {
  remainingCombinations?: number;
  remainingCombinationsSecondTirage?: number;
  onDataUpdate?: () => void;
  lastDraw?: {
    date: string;
    numbers: number[];
    complementary: number;
    joker?: string;
  } | null;
  chanceLevel?: number;
}

export default function DesktopHeader({
  remainingCombinations = 19068840,
  remainingCombinationsSecondTirage = 1906884,
  onDataUpdate,
  lastDraw,
  chanceLevel = 0
}: DesktopHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onDataUpdate?.();
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
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo et titre */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-lg">
                <Star className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-loto-red rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Kdo Loto Gagnant
              </h1>
              <p className="text-gray-600">
                Optimisez vos chances au Loto National
              </p>
            </div>
          </motion.div>

          {/* Statistiques centrales */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:flex items-center gap-8"
          >
            {/* Combinaisons restantes */}
            <div className="text-center">
              <div className="flex items-center gap-2 text-2xl font-bold text-primary-700">
                <Target className="w-6 h-6" />
                {(remainingCombinations / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-gray-500">Combinaisons principales</p>
            </div>

            {/* Second tirage */}
            <div className="text-center">
              <div className="flex items-center gap-2 text-xl font-bold text-loto-green">
                <Award className="w-5 h-5" />
                {(remainingCombinationsSecondTirage / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-gray-500">Second tirage</p>
            </div>

            {/* Niveau de chance */}
            <div className="text-center">
              <div className="flex items-center gap-2 text-xl font-bold text-loto-yellow">
                <TrendingUp className="w-5 h-5" />
                {chanceLevel}%
              </div>
              <p className="text-xs text-gray-500">Niveau chance</p>
            </div>

            {/* Dernier tirage */}
            {lastDraw && (
              <div className="text-center">
                <div className="flex items-center gap-1">
                  {lastDraw.numbers.map((num, index) => (
                    <span key={index} className="w-6 h-6 bg-primary-100 text-primary-800 text-xs font-bold rounded-full flex items-center justify-center">
                      {num}
                    </span>
                  ))}
                  <span className="w-6 h-6 bg-loto-yellow text-white text-xs font-bold rounded-full flex items-center justify-center ml-1">
                    {lastDraw.complementary}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(lastDraw.date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
          </motion.div>

          {/* Actions utilisateur */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4"
          >
            {/* Barre de recherche */}
            <div className="hidden xl:flex items-center bg-gray-100 rounded-lg px-4 py-2 w-64">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="bg-transparent flex-1 text-sm focus:outline-none"
              />
            </div>

            {/* Actualiser */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Actualiser les données"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>

            {/* Paramètres */}
            <button
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Paramètres"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Profil utilisateur */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden lg:block text-sm font-medium">Utilisateur</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Barre de progression pour les mises à jour */}
        {isRefreshing && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute bottom-0 left-0 h-1 bg-primary-600 origin-left"
            style={{ width: '100%' }}
          />
        )}
      </div>
    </motion.header>
  );
}



