'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileOptimizedWrapperProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function MobileOptimizedWrapper({ 
  children, 
  title,
  showBackButton = false,
  onBack 
}: MobileOptimizedWrapperProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="mobile-optimized-wrapper min-h-screen bg-gray-50">
      {/* Header Mobile */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          {showBackButton && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronDown className="w-5 h-5 rotate-90" />
            </button>
          )}
          
          {title && (
            <h1 className="text-lg font-semibold text-gray-900 truncate flex-1 text-center">
              {title}
            </h1>
          )}
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu Mobile */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t bg-white overflow-hidden"
            >
              <div className="p-4 space-y-2">
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium">Mode Compact</span>
                  {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">
                    Actualiser
                  </button>
                  <button className="p-3 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
                    Partager
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contenu Principal */}
      <div className={`mobile-content ${isCollapsed ? 'compact-mode' : ''}`}>
        {children}
      </div>

      {/* Styles inline pour le mode compact */}
      <style jsx>{`
        .mobile-content.compact-mode {
          font-size: 0.875rem;
        }
        
        .mobile-content.compact-mode .card {
          padding: 0.75rem;
          margin: 0.5rem 0;
        }
        
        .mobile-content.compact-mode .numero-boule {
          width: 32px;
          height: 32px;
          font-size: 0.75rem;
        }
        
        .mobile-content.compact-mode .text-2xl {
          font-size: 1rem;
        }
        
        .mobile-content.compact-mode .text-xl {
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
