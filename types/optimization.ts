import { LucideIcon } from 'lucide-react';

export interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  enabled: boolean;
}

export interface OptimizedCombination {
  id: string;
  numbers: number[];
  complementaryNumber: number;
  strategy: string;
  score: number;
  probability: number;
  risk: 'low' | 'medium' | 'high';
  reasons: string[];
  cost: number;
  expectedGain: number;
}

export interface TestResult {
  totalGains: number;
  wins: number;
  totalTests: number;
  winRate: number;
  roi: number;
  averageGain: number;
  categories: Record<string, number>;
}










