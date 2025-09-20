'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  preventClose?: boolean;
  className?: string;
}

export default function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  preventClose = false,
  className = ''
}: ResponsiveModalProps) {
  
  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Ajouter padding pour compenser la scrollbar
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // Gestion des touches clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !preventClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, preventClose]);

  const getSizeClasses = () => {
    const baseClasses = 'w-full max-h-[90vh] overflow-y-auto';
    
    switch (size) {
      case 'sm':
        return `${baseClasses} max-w-md`;
      case 'md':
        return `${baseClasses} max-w-lg`;
      case 'lg':
        return `${baseClasses} max-w-2xl`;
      case 'xl':
        return `${baseClasses} max-w-4xl`;
      case 'full':
        return 'w-full h-full max-w-none max-h-none overflow-y-auto';
      default:
        return `${baseClasses} max-w-lg`;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={!preventClose ? onClose : undefined}
          />

          {/* Modal Container - Responsive */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={`
              relative z-10 mx-4 
              ${getSizeClasses()}
              bg-white rounded-lg shadow-xl
              ${className}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                {title && (
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 pr-4">
                    {title}
                  </h2>
                )}
                {showCloseButton && !preventClose && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-4 sm:p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Variante pour mobile - Modal plein écran sur petits écrans
export function MobileFullScreenModal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  preventClose = false,
  className = ''
}: Omit<ResponsiveModalProps, 'size'>) {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !preventClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, preventClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Mobile: Plein écran, Desktop: Modal centré */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: "spring", duration: 0.3 }}
            className={`
              absolute inset-0 bg-white
              md:relative md:inset-auto md:mx-auto md:my-8
              md:max-w-2xl md:rounded-lg md:shadow-xl
              flex flex-col
              ${className}
            `}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                {title && (
                  <h2 className="text-lg font-semibold text-gray-900 pr-4">
                    {title}
                  </h2>
                )}
                {showCloseButton && !preventClose && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              {children}
            </div>
          </motion.div>

          {/* Desktop backdrop */}
          <div className="hidden md:block absolute inset-0 bg-black bg-opacity-50 -z-10" onClick={!preventClose ? onClose : undefined} />
        </div>
      )}
    </AnimatePresence>
  );
}
