'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TabletOptimizedWrapperProps {
  children: React.ReactNode;
  className?: string;
}

interface ScreenInfo {
  isTablet: boolean;
  isPortrait: boolean;
  screenWidth: number;
  screenHeight: number;
  touchDevice: boolean;
}

export default function TabletOptimizedWrapper({ children, className = '' }: TabletOptimizedWrapperProps) {
  const [screenInfo, setScreenInfo] = useState<ScreenInfo>({
    isTablet: false,
    isPortrait: false,
    screenWidth: 0,
    screenHeight: 0,
    touchDevice: false
  });

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTablet = width >= 768 && width <= 1024;
      const isPortrait = height > width;
      const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setScreenInfo({
        isTablet,
        isPortrait,
        screenWidth: width,
        screenHeight: height,
        touchDevice
      });
    };

    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', updateScreenInfo);

    return () => {
      window.removeEventListener('resize', updateScreenInfo);
      window.removeEventListener('orientationchange', updateScreenInfo);
    };
  }, []);

  // Classes CSS dynamiques basées sur le type d'écran
  const getResponsiveClasses = () => {
    const baseClasses = className;
    
    if (!screenInfo.isTablet) return baseClasses;

    let tabletClasses = baseClasses;

    // Ajustements pour tablettes
    if (screenInfo.isTablet) {
      // Espacement réduit
      tabletClasses += ' tablet-optimized';
      
      // Mode portrait vs paysage
      if (screenInfo.isPortrait) {
        tabletClasses += ' tablet-portrait';
      } else {
        tabletClasses += ' tablet-landscape';
      }

      // Device tactile
      if (screenInfo.touchDevice) {
        tabletClasses += ' touch-device';
      }
    }

    return tabletClasses;
  };

  return (
    <div className={getResponsiveClasses()}>
      {screenInfo.isTablet && screenInfo.touchDevice && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-center"
        >
          <div className="text-sm text-blue-800">
            📱 <strong>Mode Tablette Détecté</strong> - Interface optimisée
            {screenInfo.isPortrait ? ' (Portrait)' : ' (Paysage)'}
          </div>
        </motion.div>
      )}
      
      {children}
      
      <style jsx>{`
        .tablet-optimized {
          /* Boutons plus grands pour le tactile */
        }
        
        .tablet-optimized button {
          min-height: 44px;
          min-width: 44px;
          touch-action: manipulation;
        }
        
        .tablet-optimized .grid {
          gap: 0.5rem;
        }
        
        .tablet-portrait {
          /* Mode portrait - éléments empilés */
        }
        
        .tablet-portrait .flex {
          flex-direction: column;
          align-items: center;
        }
        
        .tablet-landscape {
          /* Mode paysage - hauteur réduite */
        }
        
        .tablet-landscape .py-8 {
          padding-top: 1rem;
          padding-bottom: 1rem;
        }
        
        .touch-device {
          /* Suppression des effets hover sur tactile */
        }
        
        .touch-device .hover\\:shadow-lg {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .touch-device .hover\\:scale-105 {
          transform: none;
        }
        
        @media (max-width: 1024px) and (min-width: 768px) {
          .tablet-optimized .text-4xl {
            font-size: 2rem;
          }
          
          .tablet-optimized .text-3xl {
            font-size: 1.75rem;
          }
          
          .tablet-optimized .text-2xl {
            font-size: 1.5rem;
          }
          
          .tablet-optimized .px-8 {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          
          .tablet-optimized .py-8 {
            padding-top: 1.5rem;
            padding-bottom: 1.5rem;
          }
          
          .tablet-optimized .gap-6 {
            gap: 1rem;
          }
          
          .tablet-optimized .gap-4 {
            gap: 0.75rem;
          }
          
          /* Grilles optimisées pour tablettes */
          .tablet-optimized .grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          
          .tablet-optimized .grid-cols-1.md\\:grid-cols-3 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          
          .tablet-optimized .grid-cols-1.md\\:grid-cols-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        
        @media (max-width: 1024px) and (orientation: portrait) {
          .tablet-portrait .grid {
            grid-template-columns: 1fr;
          }
          
          .tablet-portrait .flex.items-center.gap-3 {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
