/**
 * ROUTEUR RESPONSIVE
 * Dirige automatiquement vers la bonne version selon l'appareil
 */

'use client';

import React from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import DesktopLayout from './layouts/DesktopLayout';
import TabletLayout from './layouts/TabletLayout';
import MobileLayout from './layouts/MobileLayout';

interface ResponsiveRouterProps {
  children: React.ReactNode;
  
  // Configuration commune
  title?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  
  // Props pour les headers
  headerProps?: {
    remainingCombinations?: number;
    remainingCombinationsSecondTirage?: number;
    onDataUpdate?: () => void;
    lastDraw?: any;
    chanceLevel?: number;
  };
  
  // Navigation
  navigationItems?: Array<{
    id: string;
    label: string;
    icon: any;
    color?: string;
    badge?: string | number;
    component?: React.ComponentType;
  }>;
  
  // Configuration spécifique desktop
  desktopConfig?: {
    showSidebar?: boolean;
    sidebarContent?: React.ReactNode;
  };
  
  // Configuration spécifique mobile
  mobileConfig?: {
    showBackButton?: boolean;
    onBack?: () => void;
    showQuickActions?: boolean;
    quickActions?: Array<{
      id: string;
      label: string;
      icon: any;
      action: () => void;
      color?: string;
    }>;
  };
  
  // Forcer un type d'appareil (pour les tests)
  forceDeviceType?: 'mobile' | 'tablet' | 'desktop';
}

export default function ResponsiveRouter({
  children,
  title,
  activeTab,
  onTabChange,
  headerProps,
  navigationItems = [],
  desktopConfig = {},
  mobileConfig = {},
  forceDeviceType
}: ResponsiveRouterProps) {
  const { deviceType } = useDeviceDetection();
  
  // Utiliser le type forcé ou détecté
  const currentDeviceType = forceDeviceType || deviceType;
  
  // Rendu conditionnel selon le type d'appareil
  switch (currentDeviceType) {
    case 'mobile':
      return (
        <MobileLayout
          title={title}
          activeTab={activeTab}
          onTabChange={onTabChange}
          navigationItems={navigationItems}
          headerProps={headerProps}
          {...mobileConfig}
        >
          {children}
        </MobileLayout>
      );
    
    case 'tablet':
      return (
        <TabletLayout
          activeTab={activeTab}
          onTabChange={onTabChange}
          navigationItems={navigationItems}
          headerProps={headerProps}
        >
          {children}
        </TabletLayout>
      );
    
    case 'desktop':
    default:
      return (
        <DesktopLayout
          headerProps={headerProps}
          {...desktopConfig}
        >
          {children}
        </DesktopLayout>
      );
  }
}

/**
 * Hook pour obtenir la configuration responsive recommandée
 */
export const useResponsiveLayout = () => {
  const { deviceType, displayConfig, isPortrait, isLandscape } = useDeviceDetection();
  
  return {
    // Type d'appareil
    deviceType,
    isPortrait,
    isLandscape,
    
    // Configuration d'affichage
    ...displayConfig,
    
    // Recommandations de layout
    getLayoutRecommendations: () => {
      switch (deviceType) {
        case 'mobile':
          return {
            containerPadding: 'px-3 py-4',
            cardSpacing: 'gap-3',
            fontSize: 'text-sm',
            buttonSize: 'px-4 py-2',
            gridCols: 'grid-cols-1',
            showFullScreenModals: true,
            useBottomNavigation: true,
            maxModalHeight: '90vh'
          };
          
        case 'tablet':
          return {
            containerPadding: isPortrait ? 'px-4 py-4' : 'px-6 py-6',
            cardSpacing: 'gap-4',
            fontSize: 'text-base',
            buttonSize: 'px-6 py-3',
            gridCols: isPortrait ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 lg:grid-cols-3',
            showFullScreenModals: isPortrait,
            useBottomNavigation: isPortrait,
            maxModalHeight: '80vh'
          };
          
        case 'desktop':
        default:
          return {
            containerPadding: 'px-6 py-8',
            cardSpacing: 'gap-6',
            fontSize: 'text-base',
            buttonSize: 'px-6 py-3',
            gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
            showFullScreenModals: false,
            useBottomNavigation: false,
            maxModalHeight: '70vh'
          };
      }
    }
  };
};



