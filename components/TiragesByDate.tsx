'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, Filter, ChevronDown, ChevronRight } from 'lucide-react';
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

interface TiragesByDate {
  date: string;
  tirages: Tirage[];
  count: number;
}

export default function TiragesByDate() {
  const [tiragesByDate, setTiragesByDate] = useState<TiragesByDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('');

  useEffect(() => {
    loadTiragesByDate();
  }, [sortOrder, filterYear, filterMonth]);

  const loadTiragesByDate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tirages');
      const result = await response.json();
      
      if (result.success) {
        const grouped = groupTiragesByDate(result.data);
        setTiragesByDate(grouped);
      } else {
        toast.error('Erreur lors du chargement des tirages');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const groupTiragesByDate = (tirages: Tirage[]): TiragesByDate[] => {
    const grouped = new Map<string, Tirage[]>();
    
    tirages.forEach(tirage => {
      const date = tirage.date;
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(tirage);
    });

    const result: TiragesByDate[] = Array.from(grouped.entries()).map(([date, tirages]) => ({
      date,
      tirages: tirages.sort((a, b) => a.numero_tirage - b.numero_tirage),
      count: tirages.length
    }));

    // Appliquer les filtres
    let filtered = result;
    
    if (filterYear) {
      filtered = filtered.filter(item => item.date.startsWith(filterYear));
    }
    
    if (filterMonth) {
      filtered = filtered.filter(item => item.date.startsWith(filterMonth));
    }

    // Trier par date
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
    });
  };

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const expandAll = () => {
    const allDates = new Set(tiragesByDate.map(item => item.date));
    setExpandedDates(allDates);
  };

  const collapseAll = () => {
    setExpandedDates(new Set());
  };

  const exportAllTirages = () => {
    const allTirages = tiragesByDate.flatMap(item => item.tirages);
    const csvContent = [
      ['Date', 'Numéro Tirage', 'Boule 1', 'Boule 2', 'Boule 3', 'Boule 4', 'Boule 5', 'Numéro Chance'],
      ...allTirages.map(tirage => [
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
    a.download = `tirages-par-date-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Tous les tirages exportés avec succès');
  };

  const getAvailableYears = () => {
    const years = new Set(tiragesByDate.map(item => item.date.substring(0, 4)));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  };

  const getAvailableMonths = () => {
    const months = new Set(tiragesByDate.map(item => item.date.substring(0, 7)));
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">Chargement des tirages par date...</p>
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
          Tirages regroupés par date - Kdo Loto Gagnant
        </h1>
        <p className="text-gray-600">
          Historique complet de tous les tirages organisés par date
        </p>
      </motion.div>

      {/* Contrôles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-gray-700">Contrôles:</span>
          </div>
          
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'recent' | 'oldest')}
            className="input-field w-auto"
          >
            <option value="recent">Plus récents en premier</option>
            <option value="oldest">Plus anciens en premier</option>
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">Toutes les années</option>
            {getAvailableYears().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">Tous les mois</option>
            {getAvailableMonths().map(month => (
              <option key={month} value={month}>
                {new Date(month + '-01').toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
              </option>
            ))}
          </select>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={expandAll}
              className="btn-secondary text-sm"
            >
              Tout développer
            </button>
            <button
              onClick={collapseAll}
              className="btn-secondary text-sm"
            >
              Tout réduire
            </button>
            <button
              onClick={exportAllTirages}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter tout
            </button>
          </div>
        </div>
      </motion.div>

      {/* Statistiques */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dates uniques</p>
              <p className="text-2xl font-bold text-gray-900">{tiragesByDate.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total tirages</p>
              <p className="text-2xl font-bold text-gray-900">
                {tiragesByDate.reduce((sum, item) => sum + item.count, 0)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <Filter className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Moyenne par date</p>
              <p className="text-2xl font-bold text-gray-900">
                {tiragesByDate.length > 0 
                  ? (tiragesByDate.reduce((sum, item) => sum + item.count, 0) / tiragesByDate.length).toFixed(1)
                  : '0'
                }
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tableau des tirages par date */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          Tirages par date ({tiragesByDate.length} dates)
        </h3>

        <div className="space-y-4">
          {tiragesByDate.map((dateGroup, index) => {
            const isExpanded = expandedDates.has(dateGroup.date);
            const dateObj = new Date(dateGroup.date);
            const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });
            
            return (
              <motion.div
                key={dateGroup.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* En-tête de date */}
                <div
                  className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleDateExpansion(dateGroup.date)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {dateObj.toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {dateGroup.count} tirage{dateGroup.count > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {dayName}
                    </div>
                  </div>
                </div>

                {/* Détail des tirages */}
                {isExpanded && (
                  <div className="p-4 bg-white">
                    <div className="grid gap-3">
                      {dateGroup.tirages.map((tirage, tirageIndex) => (
                        <div
                          key={tirage.id || tirageIndex}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <span className="font-medium text-gray-700">
                              Tirage #{tirage.numero_tirage}
                            </span>
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
                            <div className="numero-boule numero-chance">
                              {tirage.numero_chance}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {tiragesByDate.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun tirage trouvé pour les critères sélectionnés
          </div>
        )}
      </motion.div>
    </div>
  );
}










