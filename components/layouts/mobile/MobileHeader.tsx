/**
 * HEADER MOBILE
 * En-tête optimisé pour smartphones
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Menu, Star, Target, MoreVertical, Bell
} from 'lucide-react';

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
  remainingCombinations?: number;
  remainingCombinationsSecondTirage?: number;
  lastDraw?: {
    date: string;
    numbers: number[];
    complementary: number;
    joker?: string;
  } | null;
  chanceLevel?: number;
  showStats?: boolean;
}

export default function MobileHeader({
  title,
  showBackButton = false,
  onBack,
  onMenuToggle,
  showMenuButton = true,
  remainingCombinations = 19068840,
  remainingCombinationsSecondTirage = 1906884,
  lastDraw,
  chanceLevel = 0,
  showStats = true
}: MobileHeaderProps) {

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50"
    >
      {/* Barre principale */}
      <div className="flex items-center justify-between px-4 py-3">
        
        {/* Côté gauche */}
        <div className="flex items-center gap-3">
          {showBackButton ? (
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : showMenuButton ? (
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
          ) : null}
          
          {/* Logo + titre */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                {title || 'KDO LOTO'}
              </h1>
              {showStats && (
                <p className="text-xs text-gray-500 leading-tight">
                  {(remainingCombinations / 1000000).toFixed(1)}M combinaisons
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Côté droit */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Menu options */}
          <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Barre de statistiques (optionnelle) */}
      {showStats && (
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between text-xs">
            
            {/* Niveau de chance */}
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-primary-600" />
              <span className="text-gray-600">Chance:</span>
              <span className="font-semibold text-primary-700">{chanceLevel}%</span>
            </div>

            {/* Dernier tirage (compact) */}
            {lastDraw && (
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Dernier:</span>
                <div className="flex gap-0.5">
                  {lastDraw.numbers.slice(0, 3).map((num, index) => (
                    <span key={index} className="w-4 h-4 bg-primary-100 text-primary-800 text-xs font-bold rounded-full flex items-center justify-center">
                      {num}
                    </span>
                  ))}
                  <span className="text-gray-400 mx-1">...</span>
                  <span className="w-4 h-4 bg-loto-yellow text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {lastDraw.complementary}
                  </span>
                </div>
              </div>
            )}

            {/* Second tirage */}
            <div className="flex items-center gap-1">
              <span className="text-gray-600">2nd:</span>
              <span className="font-semibold text-loto-green">
                {(remainingCombinationsSecondTirage / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.header>
  );
}



