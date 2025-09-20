'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, Filter, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface Tirage {
  id: number;
  date: string;
  numero_tirage: number;
  boule_1: number;
  boule_2: number;
  boule_3: number;
  boule_4: number;
  boule_5: number;
  numero_chance: number;
}

interface TiragesListProps {
  title?: string;
  showControls?: boolean;
}

export default function TiragesList({ title = "Tirages", showControls = true }: TiragesListProps) {
  const [tirages, setTirages] = useState<Tirage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const [displayCount, setDisplayCount] = useState(20);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });

  useEffect(() => {
    loadTirages();
  }, [sortOrder, displayCount, dateRange]);

  const loadTirages = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', displayCount.toString());
      params.append('sort', sortOrder);
      
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      
      const response = await fetch(`/api/tirages?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setTirages(Array.isArray(result.data) ? result.data : []);
      } else {
        toast.error('Erreur lors du chargement des tirages');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const exportTirages = () => {
    const csvContent = [
      ['Date', 'Numéro', 'Boule 1', 'Boule 2', 'Boule 3', 'Boule 4', 'Boule 5', 'Numéro Chance'],
      ...tirages.map(tirage => [
        tirage.date,
        tirage.numero_tirage,
        tirage.boule_1,
        tirage.boule_2,
        tirage.boule_3,
        tirage.boule_4,
        tirage.boule_5,
        tirage.numero_chance
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tirages-loto-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Tirages exportés avec succès');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">Chargement des tirages...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-loto-green" />
          {title} ({tirages.length})
        </h3>
        
        {showControls && (
          <div className="flex items-center gap-3">
            <select
              value={displayCount}
              onChange={(e) => setDisplayCount(parseInt(e.target.value))}
              className="input-field w-auto text-sm"
            >
              <option value={10}>10 tirages</option>
              <option value={20}>20 tirages</option>
              <option value={50}>50 tirages</option>
              <option value={100}>100 tirages</option>
            </select>
            
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'recent' | 'oldest')}
              className="input-field w-auto text-sm"
            >
              <option value="recent">Plus récents</option>
              <option value="oldest">Plus anciens</option>
            </select>

            <button
              onClick={exportTirages}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        )}
      </div>

      {/* Filtres par date */}
      {showControls && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700">Filtres par date</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="input-field w-auto text-sm"
                placeholder="Date de début"
              />
            </div>
            <span className="text-gray-500">à</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="input-field w-auto text-sm"
              placeholder="Date de fin"
            />
            <button
              onClick={() => setDateRange({ start: '', end: '' })}
              className="btn-secondary text-sm"
            >
              Effacer
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Numéro</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Boules</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Chance</th>
            </tr>
          </thead>
          <tbody>
            {tirages.map((tirage, index) => (
              <tr key={tirage.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(tirage.date).toLocaleDateString('fr-FR')}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  #{tirage.numero_tirage || index + 1}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    {[tirage.boule_1, tirage.boule_2, tirage.boule_3, tirage.boule_4, tirage.boule_5].map((boule, i) => (
                      <div
                        key={i}
                        className="numero-boule numero-equilibre"
                      >
                        {boule}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="numero-boule numero-chance w-8 h-8 text-sm">
                    {tirage.numero_chance}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tirages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucun tirage trouvé pour les critères sélectionnés
        </div>
      )}
    </motion.div>
  );
}

