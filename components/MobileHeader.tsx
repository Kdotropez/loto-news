'use client';

import { Star, Menu } from 'lucide-react';

interface MobileHeaderProps {
  onRefresh?: () => void;
  remainingCombinations?: number;
  remainingCombinationsSecondTirage?: number;
  onMenuToggle?: () => void;
  isRefreshing?: boolean;
  lastDraw?: {
    date: string;
    numbers: number[];
    complementary: number;
    joker?: string;
  } | null;
}

export default function MobileHeader({ 
  onRefresh, 
  remainingCombinations = 19068840, 
  remainingCombinationsSecondTirage = 1906884,
  onMenuToggle,
  isRefreshing = false,
  lastDraw 
}: MobileHeaderProps) {

  return (
    <div 
      className="md:hidden"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '48px',
        boxSizing: 'border-box'
      }}
    >
      {/* Menu */}
      <button
        onClick={onMenuToggle}
        style={{
          width: '32px',
          height: '32px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <Menu size={16} />
      </button>

      {/* Logo + Titre */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, marginLeft: '12px' }}>
        <div style={{
          width: '24px',
          height: '24px',
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <Star size={14} />
        </div>
        
        <div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937', margin: 0, lineHeight: '1.2' }}>
            KDO LOTO
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280', margin: 0, lineHeight: '1.1' }}>
            {(remainingCombinations / 1000000).toFixed(1)}M combinaisons
          </div>
        </div>
      </div>

      {/* Info dernier tirage */}
      {lastDraw && lastDraw.numbers && lastDraw.numbers.length > 0 && (
        <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'right' }}>
          <div>Dernier: {new Date(lastDraw.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</div>
          <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end', marginTop: '2px' }}>
            {lastDraw.numbers.filter(n => n && n > 0).slice(0, 3).map((num, index) => (
              <span key={index} style={{
                width: '16px',
                height: '16px',
                background: '#3b82f6',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8px',
                fontWeight: '700'
              }}>
                {num}
              </span>
            ))}
            <span style={{
              width: '16px',
              height: '16px',
              background: '#f59e0b',
              color: 'black',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              fontWeight: '700'
            }}>
              {lastDraw.complementary || '?'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}