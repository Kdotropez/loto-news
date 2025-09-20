/**
 * HOOK DE DÉTECTION D'APPAREIL
 * Hook React pour la gestion responsive centralisée
 */

import { useState, useEffect } from 'react';
import { deviceDetector, DeviceInfo, DeviceType, Orientation } from '@/lib/device-detection';

export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => 
    deviceDetector.getDeviceInfo()
  );

  useEffect(() => {
    // Mettre à jour l'état initial
    setDeviceInfo(deviceDetector.getDeviceInfo());

    // Écouter les changements
    const handleDeviceChange = (newDeviceInfo: DeviceInfo) => {
      setDeviceInfo(newDeviceInfo);
    };

    deviceDetector.addListener(handleDeviceChange);
    deviceDetector.startListening();

    return () => {
      deviceDetector.removeListener(handleDeviceChange);
      deviceDetector.stopListening();
    };
  }, []);

  return {
    // Informations de base
    deviceInfo,
    deviceType: deviceInfo.type,
    orientation: deviceInfo.orientation,
    isTouch: deviceInfo.isTouch,
    
    // Helpers booléens
    isMobile: deviceInfo.isMobileDevice,
    isTablet: deviceInfo.isTabletDevice,
    isDesktop: deviceInfo.isDesktopDevice,
    isPortrait: deviceInfo.orientation === 'portrait',
    isLandscape: deviceInfo.orientation === 'landscape',
    
    // Helpers de vérification
    isDevice: (type: DeviceType) => deviceInfo.type === type,
    isOrientation: (orientation: Orientation) => deviceInfo.orientation === orientation,
    
    // Configuration d'affichage
    displayConfig: deviceDetector.getDisplayConfig(),
    deviceClasses: deviceDetector.getDeviceClasses(),
    
    // Dimensions
    screenWidth: deviceInfo.width,
    screenHeight: deviceInfo.height,
    pixelRatio: deviceInfo.pixelRatio
  };
};

/**
 * Hook simplifié pour vérifier un type d'appareil spécifique
 */
export const useIsMobile = () => {
  const { isMobile } = useDeviceDetection();
  return isMobile;
};

export const useIsTablet = () => {
  const { isTablet } = useDeviceDetection();
  return isTablet;
};

export const useIsDesktop = () => {
  const { isDesktop } = useDeviceDetection();
  return isDesktop;
};

/**
 * Hook pour la configuration d'affichage responsive
 */
export const useResponsiveConfig = () => {
  const { displayConfig, deviceType, orientation } = useDeviceDetection();
  
  return {
    ...displayConfig,
    deviceType,
    orientation,
    
    // Helpers pour les grilles
    gridCols: displayConfig.columns,
    maxItems: displayConfig.itemsPerPage,
    
    // Helpers pour l'UI
    shouldShowSidebar: displayConfig.showSidebar,
    shouldUseCompactMode: displayConfig.compactMode,
    
    // Classes CSS
    getGridClasses: () => {
      switch (displayConfig.columns) {
        case 1: return 'grid-cols-1';
        case 2: return 'grid-cols-1 md:grid-cols-2';
        case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
        default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      }
    },
    
    getContainerClasses: () => {
      if (displayConfig.compactMode) {
        return 'container-compact px-2 py-2';
      }
      return 'container mx-auto px-4 py-6';
    }
  };
};



