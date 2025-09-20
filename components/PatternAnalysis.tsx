'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, BarChart3, Download, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

interface PatternData {
  pattern: string;
  count: number;
  percentage: number;
  description: string;
  examples: Array<{
    date: string;
    numbers: number[];
    consecutive_sequence: number[];
  }>;
}

interface PatternAnalysisProps {
  analysisPeriod?: 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100';
}

export default function PatternAnalysis({ analysisPeriod = 'last20' }: PatternAnalysisProps) {
  const [patternData, setPatternData] = useState<PatternData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'consecutifs' | 'parite' | 'dizaines' | 'somme' | 'unites'>('all');

  useEffect(() => {
    loadPatternData();
  }, [analysisPeriod]);

  const loadPatternData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analysis?type=patterns&period=${analysisPeriod}`);
      const result = await response.json();
      
      if (result.success) {
        // Convertir l'objet de catégories en tableau plat
        const allPatterns: PatternData[] = [];
        const categories = result.data;
        
        Object.keys(categories).forEach(categoryName => {
          const categoryPatterns = categories[categoryName];
          if (Array.isArray(categoryPatterns)) {
            categoryPatterns.forEach(pattern => {
              allPatterns.push({
                pattern: pattern.name || pattern.id,
                count: pattern.frequency,
                percentage: pattern.percentage,
                description: pattern.description,
                examples: [] // Les exemples ne sont pas dans la nouvelle structure
              });
            });
          }
        });
        
        setPatternData(allPatterns);
      } else {
        toast.error('Erreur lors du chargement des données de patterns');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredData = () => {
    const data = Array.isArray(patternData) ? patternData : [];
    if (filter === 'all') return data;
    
    const filtered = data.filter(item => {
      switch (filter) {
        case 'consecutifs':
          // Filtrer les patterns de consécutifs
          return item.pattern === 'CONSECUTIF';
        case 'parite':
          // Filtrer les patterns de parité (3P-2I, 2P-3I, etc.)
          return item.pattern.includes('P-') && item.pattern.includes('I');
        case 'dizaines':
          // Filtrer les patterns de dizaines
          return item.pattern.startsWith('DIZ');
        case 'somme':
          // Filtrer les patterns de somme
          return item.pattern.startsWith('SOMME_');
        case 'unites':
          // Filtrer les patterns d'unités
          return item.pattern.startsWith('UNIT_');
        default:
          return true;
      }
    });
    return filtered;
  };

  const getPatternLabel = (pattern: string) => {
    // Patterns de parité (3P-2I, 2P-3I, etc.)
    if (pattern.includes('P-') && pattern.includes('I')) {
      const [pairs, impairs] = pattern.split('-');
      const pairCount = pairs.replace('P', '');
      const impairCount = impairs.replace('I', '');
      return `Distribution ${pairCount} Pairs - ${impairCount} Impairs`;
    }
    
    // Patterns de consécutifs
    if (pattern === 'CONSECUTIF') {
      return 'Numéros consécutifs présents';
    } else if (pattern === 'NON-CONSECUTIF') {
      return 'Aucun numéro consécutif';
    }
    
    // Patterns de dizaines
    if (pattern.startsWith('DIZ')) {
      const count = pattern.replace('DIZ', '');
      return `Utilise ${count} dizaines différentes`;
    }
    
    // Patterns de somme
    if (pattern === 'SOMME_FAIBLE') {
      return 'Somme faible (< 100)';
    } else if (pattern === 'SOMME_OPTIMALE') {
      return 'Somme optimale (100-150)';
    } else if (pattern === 'SOMME_ELEVEE') {
      return 'Somme élevée (> 150)';
    }
    
    // Patterns de zones
    if (pattern.startsWith('ZONE_')) {
      const zones = pattern.replace('ZONE_', '').split('-');
      return `Répartition par zones: ${zones.join('-')}`;
    }
    
    // Patterns d'unités
    if (pattern.startsWith('UNIT_')) {
      if (pattern.includes('_5_DIFFERENTES_')) {
        const units = pattern.split('_5_DIFFERENTES_')[1];
        return `5 unités différentes: ${units.split('-').join(', ')}`;
      } else if (pattern.includes('_SIMILAIRES_')) {
        const parts = pattern.split('_SIMILAIRES_');
        const similarCount = parts[0].split('_')[1];
        const rest = parts[1].split('_');
        const differentCount = rest[0];
        const similarDetails = rest[1];
        const differentDetails = rest[2];
        return `${similarCount} similaires (${similarDetails}), ${differentCount} différentes (${differentDetails.split('-').join(', ')})`;
      } else if (pattern.includes('_DIFFERENTES_')) {
        const parts = pattern.split('_DIFFERENTES_');
        const count = parts[0].split('_')[1];
        const units = parts[1];
        return `${count} unités différentes: ${units.split('-').join(', ')}`;
      }
      return pattern;
    }
    
    return pattern;
  };

  const exportData = () => {
    const csvContent = [
      ['Pattern', 'Fréquence', 'Probabilité', 'Dizaines', 'Somme', 'Dernière occurrence'],
      ...getFilteredData().map(item => {
        const example = item.examples[0];
        const dizaines = (example && example.numbers && example.numbers.length > 0) 
          ? new Set(example.numbers.map(num => Math.floor((num - 1) / 10))).size 
          : 0;
        const somme = (example && example.numbers && example.numbers.length > 0) 
          ? example.numbers.reduce((sum, num) => sum + num, 0) 
          : 0;
        return [
          getPatternLabel(item.pattern),
          item.count,
          item.percentage.toFixed(2),
          dizaines,
          somme,
          example?.date || 'N/A'
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analyse-patterns-loto-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Données exportées avec succès');
  };

  const filteredData = useMemo(() => getFilteredData(), [filter, patternData]);
  const chartData = useMemo(() => 
    (Array.isArray(filteredData) ? filteredData : []).slice(0, 15).map(item => ({
      pattern: getPatternLabel(item.pattern).substring(0, 20) + '...',
      count: item.count,
      percentage: item.percentage
    })), [filteredData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">Analyse des patterns en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Analyse des patterns - Kdo Loto Gagnant
        </h1>
        <p className="text-gray-600">
          Découvrez les motifs récurrents dans les tirages du Loto
        </p>
      </motion.div>

      {/* Filtres */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filtres:</span>
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="input-field w-auto"
          >
            <option value="all">Tous les patterns ({Array.isArray(patternData) ? patternData.length : 0})</option>
            <option value="consecutifs">Numéros consécutifs ({Array.isArray(patternData) ? patternData.filter(item => item.pattern === 'CONSECUTIF' || item.pattern?.includes('consécutifs')).length : 0})</option>
            <option value="parite">Parité (pairs/impairs) ({Array.isArray(patternData) ? patternData.filter(item => item.pattern?.includes('P-') || item.pattern?.includes('pair')).length : 0})</option>
            <option value="dizaines">Répartition par dizaines ({Array.isArray(patternData) ? patternData.filter(item => item.pattern?.includes('DIZ') || item.pattern?.includes('dizaine')).length : 0})</option>
            <option value="somme">Somme des numéros ({Array.isArray(patternData) ? patternData.filter(item => item.pattern?.includes('SOMME') || item.pattern?.includes('somme')).length : 0})</option>
            <option value="unites">Chiffres des unités ({Array.isArray(patternData) ? patternData.filter(item => item.pattern?.includes('UNIT') || item.pattern?.includes('unité')).length : 0})</option>
          </select>
          
          <div className="text-sm text-gray-600">
            {filter !== 'all' && (
              <span>
                {filteredData.length} pattern(s) trouvé(s) sur {Array.isArray(patternData) ? patternData.length : 0}
              </span>
            )}
          </div>

          <button
            onClick={exportData}
            className="btn-secondary flex items-center gap-2 ml-auto"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </motion.div>

      {/* Graphique */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          Fréquence des patterns
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="pattern" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip 
              formatter={(value: any, name: string) => [
                name === 'count' ? `${value} fois` : `${value.toFixed(1)}%`,
                name === 'count' ? 'Fréquence' : 'Pourcentage'
              ]}
            />
            <Bar dataKey="count" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Tableau détaillé */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary-600" />
          Analyse détaillée des patterns
          {filter !== 'all' && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({filteredData.length} résultat{filteredData.length > 1 ? 's' : ''})
            </span>
          )}
        </h3>
        <div className="overflow-x-auto">
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun pattern trouvé avec ce filtre</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Pattern</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Fréquence</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Probabilité</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Dizaines</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Somme</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Dernière occurrence</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                    {getPatternLabel(item.pattern)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {item.count} fois
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {item.percentage.toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {(() => {
                      const example = item.examples[0];
                      if (!example || !example.numbers || example.numbers.length === 0) return 'N/A';
                      const dizaines = new Set(example.numbers.map(num => Math.floor((num - 1) / 10)));
                      return `${dizaines.size} dizaines`;
                    })()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {(() => {
                      const example = item.examples[0];
                      if (!example || !example.numbers || example.numbers.length === 0) return 'N/A';
                      const somme = example.numbers.reduce((sum, num) => sum + num, 0);
                      return `${somme}`;
                    })()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {item.examples[0]?.date ? new Date(item.examples[0].date).toLocaleDateString('fr-FR') : 'N/A'}
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
