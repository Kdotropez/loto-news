'use client';

import { useEffect, useState } from 'react';
import { complexityManager, ComplexityLevel } from '@/lib/complexity-manager';

interface PhoneBannerProps {
  onMenuToggle?: () => void;
  remainingCombinations?: number;
  lastDraw?: {
    date: string;
    numbers: number[];
    complementary: number;
  } | null;
}

export default function PhoneBanner({ 
  onMenuToggle,
  remainingCombinations = 19068840,
  lastDraw 
}: PhoneBannerProps) {
  
  const [timeLeft, setTimeLeft] = useState('');
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [currentMode, setCurrentMode] = useState<ComplexityLevel>('beginner');

  // Charger le mode actuel
  useEffect(() => {
    const mode = complexityManager.getCurrentLevel();
    setCurrentMode(mode);
  }, []);

  // Calcul du compte à rebours
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      const drawDays = [1, 3, 6]; // lundi, mercredi, samedi
      const drawTime = { hour: 20, minute: 30 };
      
      let nextDraw = new Date();
      
      for (let i = 0; i < 7; i++) {
        const checkDay = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
        const dayOfWeek = checkDay.getDay();
        
        if (drawDays.includes(dayOfWeek)) {
          nextDraw = new Date(checkDay);
          nextDraw.setHours(drawTime.hour, drawTime.minute, 0, 0);
          
          if (i === 0 && (currentHour > drawTime.hour || 
              (currentHour === drawTime.hour && currentMinute >= drawTime.minute))) {
            continue;
          }
          break;
        }
      }
      
      const diff = nextDraw.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft('En cours');
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeLeft(`${days}j ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Gérer le changement de mode
  const handleModeChange = (mode: ComplexityLevel) => {
    complexityManager.setLevel(mode);
    setCurrentMode(mode);
    setShowModeMenu(false);
    window.location.reload(); // Recharger pour appliquer le nouveau mode
  };

  // Gérer le clic sur le menu
  const handleMenuClick = () => {
    setShowModeMenu(!showModeMenu);
  };

  const bannerStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    width: '100vw',
    height: 'auto',
    minHeight: '60px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderBottom: '2px solid #4c1d95',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    padding: '6px 12px',
    boxSizing: 'border-box' as const,
    overflow: 'visible'
  };

  const buttonStyle = {
    flex: '1',
    height: '50px',
    background: 'linear-gradient(145deg, #ffd700 0%, #ffb347 100%)',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '800',
    boxShadow: '0 3px 6px rgba(255, 215, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.8), inset 0 -1px 2px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as const,
    padding: '6px'
  };

  const logoStyle = {
    width: '28px',
    height: '28px',
    background: 'linear-gradient(145deg, #ffd700 0%, #ffb347 100%)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: 'white',
    boxShadow: '0 3px 6px rgba(255, 215, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.8), inset 0 -1px 2px rgba(0, 0, 0, 0.1)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
    flexShrink: 0
  };

  return (
    <div style={bannerStyle}>
      {/* 3 BOUTONS MAXIMISÉS */}
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px', width: '100%', padding: '3px' }}>
        {/* LIGNE 1: Dernier tirage en priorité (plein largeur) */}
        {lastDraw && lastDraw.numbers && lastDraw.numbers.length > 0 && (
          <div style={{ ...buttonStyle, flex: '1 1 100%' }}>
            <div style={{ textAlign: 'center', lineHeight: '1.1' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', marginBottom: '2px' }}>DERNIER</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', flexWrap: 'wrap' as const }}>
                {lastDraw.numbers.filter(n => n && n > 0).slice(0, 5).map((num, index) => (
                  <div key={index} style={{
                    width: '18px',
                    height: '18px',
                    background: '#ffffff',
                    color: '#000000',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: '900',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                  }}>
                    {num}
                  </div>
                ))}
                <div style={{
                  width: '18px',
                  height: '18px',
                  background: '#ff6b6b',
                  color: '#000000',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '900',
                  marginLeft: '3px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}>
                  {lastDraw.complementary || '?'}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* LIGNE 2: Menu + Titre/Compte à rebours/Combinaisons */}
        {/* Bouton 1: Menu avec mode actuel */}
        <button style={buttonStyle} onClick={handleMenuClick}>
          <div style={{ textAlign: 'center', lineHeight: '1.1' }}>
            <div style={{ fontSize: '16px' }}>☰</div>
            <div style={{ fontSize: '8px', fontWeight: '700' }}>
              {currentMode === 'beginner' ? 'DÉBUTANT' : 
               currentMode === 'intermediate' ? 'INTER' : 'EXPERT'}
            </div>
          </div>
        </button>

        {/* Bouton 2: Titre + Combinaisons */}
        <div style={buttonStyle}>
          <div style={{ textAlign: 'center', lineHeight: '1.1' }}>
            <div style={{ fontSize: '14px', fontWeight: '900' }}>KDO LOTO</div>
            {/* Compte à rebours entre le titre et le nombre de combinaisons */}
            <div style={{ fontSize: '13px', fontWeight: '900', margin: '2px 0' }}>
              {timeLeft || 'Calcul...'}
            </div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#000000 !important' }}>
              {(remainingCombinations / 1000000).toFixed(1)} M
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700' }}>combinaisons</div>
          </div>
        </div>
        
      </div>

      {/* Menu déroulant des modes */}
      {showModeMenu && (
        <div style={{
          position: 'fixed',
          top: '60px',
          left: '6px',
          right: '6px',
          background: 'linear-gradient(145deg, #ffd700 0%, #ffb347 100%)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 100000,
          padding: '8px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#000000' }}>CHOISIR MODE</div>
          </div>
          
        {/* Centre Loto Unifié */}
          <button 
            onClick={() => handleModeChange('beginner')}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '4px',
              background: currentMode === 'beginner' ? '#10b981' : '#ffffff',
              color: currentMode === 'beginner' ? '#ffffff' : '#000000',
              border: 'none',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '800',
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '16px' }}>🌱</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '900' }}>DÉBUTANT</div>
                <div style={{ fontSize: '9px', opacity: 0.8 }}>Interface simple, fonctions essentielles</div>
              </div>
            </div>
          </button>

          {/* Mode Intermédiaire */}
          <button 
            onClick={() => handleModeChange('intermediate')}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '4px',
              background: currentMode === 'intermediate' ? '#f59e0b' : '#ffffff',
              color: currentMode === 'intermediate' ? '#000000' : '#000000',
              border: 'none',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '800',
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '16px' }}>⚖️</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '900' }}>INTERMÉDIAIRE</div>
                <div style={{ fontSize: '9px', opacity: 0.8 }}>Plus d'options, analyses moyennes</div>
              </div>
            </div>
          </button>

          {/* Mode Expert */}
          <button 
            onClick={() => handleModeChange('expert')}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '8px',
              background: currentMode === 'expert' ? '#ef4444' : '#ffffff',
              color: currentMode === 'expert' ? '#ffffff' : '#000000',
              border: 'none',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '800',
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '16px' }}>🎯</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '900' }}>EXPERT</div>
                <div style={{ fontSize: '9px', opacity: 0.8 }}>Toutes les fonctionnalités avancées</div>
              </div>
            </div>
          </button>

          {/* Bouton fermer */}
          <button 
            onClick={() => setShowModeMenu(false)}
            style={{
              width: '100%',
              padding: '8px',
              background: '#6b7280',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            FERMER
          </button>
        </div>
      )}
    </div>
  );
}