/**
 * SYSTÈME DE DÉTECTION D'APPAREIL CENTRALISÉ
 * Gestion unifiée des breakpoints et types d'appareils
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

export interface DeviceInfo {
  type: DeviceType;
  orientation: Orientation;
  width: number;
  height: number;
  isTouch: boolean;
  pixelRatio: number;
  isMobileDevice: boolean;
  isTabletDevice: boolean;
  isDesktopDevice: boolean;
}

export interface DeviceBreakpoints {
  mobile: {
    min: number;
    max: number;
  };
  tablet: {
    min: number;
    max: number;
  };
  desktop: {
    min: number;
    max: number;
  };
}

// Breakpoints standardisés
export const DEVICE_BREAKPOINTS: DeviceBreakpoints = {
  mobile: {
    min: 0,
    max: 767
  },
  tablet: {
    min: 768,
    max: 1023
  },
  desktop: {
    min: 1024,
    max: 9999
  }
} as const;

/**
 * Classe de détection d'appareil
 */
export class DeviceDetector {
  private listeners: Set<(deviceInfo: DeviceInfo) => void> = new Set();
  private currentDeviceInfo: DeviceInfo | null = null;

  /**
   * Détecte le type d'appareil basé sur la largeur d'écran
   */
  private detectDeviceType(width: number): DeviceType {
    if (width <= DEVICE_BREAKPOINTS.mobile.max) {
      return 'mobile';
    } else if (width <= DEVICE_BREAKPOINTS.tablet.max) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  /**
   * Détecte l'orientation
   */
  private detectOrientation(width: number, height: number): Orientation {
    return width > height ? 'landscape' : 'portrait';
  }

  /**
   * Détecte si c'est un appareil tactile
   */
  private detectTouch(): boolean {
    return 'ontouchstart' in window || 
           navigator.maxTouchPoints > 0 || 
           (window as any).DocumentTouch && document instanceof (window as any).DocumentTouch;
  }

  /**
   * Obtient les informations complètes de l'appareil
   */
  getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
      // Server-side rendering - valeurs par défaut
      return {
        type: 'desktop',
        orientation: 'landscape',
        width: 1024,
        height: 768,
        isTouch: false,
        pixelRatio: 1,
        isMobileDevice: false,
        isTabletDevice: false,
        isDesktopDevice: true
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const type = this.detectDeviceType(width);
    const orientation = this.detectOrientation(width, height);
    const isTouch = this.detectTouch();
    const pixelRatio = window.devicePixelRatio || 1;

    const deviceInfo: DeviceInfo = {
      type,
      orientation,
      width,
      height,
      isTouch,
      pixelRatio,
      isMobileDevice: type === 'mobile',
      isTabletDevice: type === 'tablet',
      isDesktopDevice: type === 'desktop'
    };

    this.currentDeviceInfo = deviceInfo;
    return deviceInfo;
  }

  /**
   * Démarre l'écoute des changements d'appareil
   */
  startListening(): void {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const newDeviceInfo = this.getDeviceInfo();
      
      // Notifier seulement si le type d'appareil a changé
      if (!this.currentDeviceInfo || 
          this.currentDeviceInfo.type !== newDeviceInfo.type ||
          this.currentDeviceInfo.orientation !== newDeviceInfo.orientation) {
        
        this.listeners.forEach(listener => listener(newDeviceInfo));
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Écoute initiale
    handleResize();
  }

  /**
   * Arrête l'écoute des changements
   */
  stopListening(): void {
    if (typeof window === 'undefined') return;

    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleResize);
  }

  private handleResize = () => {
    const newDeviceInfo = this.getDeviceInfo();
    
    if (!this.currentDeviceInfo || 
        this.currentDeviceInfo.type !== newDeviceInfo.type ||
        this.currentDeviceInfo.orientation !== newDeviceInfo.orientation) {
      
      this.listeners.forEach(listener => listener(newDeviceInfo));
    }
  };

  /**
   * Ajoute un listener pour les changements d'appareil
   */
  addListener(callback: (deviceInfo: DeviceInfo) => void): void {
    this.listeners.add(callback);
  }

  /**
   * Supprime un listener
   */
  removeListener(callback: (deviceInfo: DeviceInfo) => void): void {
    this.listeners.delete(callback);
  }

  /**
   * Vérifie si l'appareil actuel correspond à un type
   */
  isDevice(type: DeviceType): boolean {
    const deviceInfo = this.getDeviceInfo();
    return deviceInfo.type === type;
  }

  /**
   * Vérifie si l'orientation correspond
   */
  isOrientation(orientation: Orientation): boolean {
    const deviceInfo = this.getDeviceInfo();
    return deviceInfo.orientation === orientation;
  }

  /**
   * Obtient les classes CSS adaptées à l'appareil
   */
  getDeviceClasses(): string {
    const deviceInfo = this.getDeviceInfo();
    const classes = [
      `device-${deviceInfo.type}`,
      `orientation-${deviceInfo.orientation}`
    ];

    if (deviceInfo.isTouch) {
      classes.push('touch-device');
    }

    if (deviceInfo.pixelRatio > 1) {
      classes.push('high-dpi');
    }

    return classes.join(' ');
  }

  /**
   * Obtient la configuration d'affichage recommandée
   */
  getDisplayConfig(): {
    columns: number;
    itemsPerPage: number;
    compactMode: boolean;
    showSidebar: boolean;
  } {
    const deviceInfo = this.getDeviceInfo();

    switch (deviceInfo.type) {
      case 'mobile':
        return {
          columns: 1,
          itemsPerPage: 5,
          compactMode: true,
          showSidebar: false
        };

      case 'tablet':
        return {
          columns: deviceInfo.orientation === 'portrait' ? 2 : 3,
          itemsPerPage: deviceInfo.orientation === 'portrait' ? 8 : 12,
          compactMode: true,
          showSidebar: deviceInfo.orientation === 'landscape'
        };

      case 'desktop':
        return {
          columns: 4,
          itemsPerPage: 20,
          compactMode: false,
          showSidebar: true
        };

      default:
        return {
          columns: 3,
          itemsPerPage: 12,
          compactMode: false,
          showSidebar: true
        };
    }
  }
}

// Instance singleton
export const deviceDetector = new DeviceDetector();

// Hook pour React (sera créé dans un fichier séparé)
export const useDeviceDetection = () => {
  if (typeof window === 'undefined') {
    return deviceDetector.getDeviceInfo();
  }
  
  // Cette partie sera implémentée dans le hook React
  return deviceDetector.getDeviceInfo();
};



