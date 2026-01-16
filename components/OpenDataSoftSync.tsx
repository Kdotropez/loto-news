'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { openDataSoftSync } from '@/lib/opendatasoft-sync';
import { 
  RefreshCw, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Download,
  Eye,
  Wifi,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface APIStats {
  totalTirages: number;
  dateRange: { from: string; to: string };
  lastUpdate: string;
}

export default function OpenDataSoftSync() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [apiStats, setApiStats] = useState<APIStats | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    checkConnectivity();
    loadAPIStats();
    loadLastSyncDate();
  }, []);

  const checkConnectivity = async () => {
    try {
      const response = await fetch('/api/opendatasoft-sync?action=test');
      const result = await response.json();
      setIsConnected(result.success);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const loadAPIStats = async () => {
    try {
      const response = await fetch('/api/opendatasoft-sync?action=stats');
      const result = await response.json();
      
      if (result.success) {
        setApiStats(result.stats);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const loadLastSyncDate = () => {
    const saved = localStorage.getItem('last_opendatasoft_sync');
    if (saved) {
      setLastSync(saved);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    toast.loading('Synchronisation locale en cours...');
    try {
      const result = await openDataSoftSync.syncWithLocalDatabase();
      if (result.success) {
        toast.success(`✅ ${result.newTirages} nouveaux tirages (local)`);
        setLastSync(new Date().toISOString());
        localStorage.setItem('last_opendatasoft_sync', new Date().toISOString());
        await loadAPIStats();
      } else {
        toast.error(`❌ Erreur: ${result.error || 'synchronisation locale'}`);
      }
    } catch (error) {
      toast.error('❌ Erreur de synchronisation locale');
      console.error('Erreur sync (local):', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const loadPreview = async () => {
    try {
      const response = await fetch('/api/opendatasoft-sync?action=preview&limit=10');
      const result = await response.json();
      
      if (result.success) {
        setPreview(result.preview);
        setShowPreview(true);
      } else {
        toast.error('Erreur chargement aperçu');
      }
    } catch (error) {
      toast.error('Erreur chargement aperçu');
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white"
      >
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">🔄 Synchronisation OpenDataSoft</h1>
            <p className="text-blue-200">Mise à jour automatique depuis l'API officielle</p>
          </div>
        </div>
      </motion.div>

      {/* Statut de connectivité */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">📡 Statut de l'API</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${isConnected ? 'bg-green-50' : isConnected === false ? 'bg-red-50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              {isConnected ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : isConnected === false ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <Wifi className="w-5 h-5 text-gray-500" />
              )}
              <span className="font-semibold">Connectivité</span>
            </div>
            <div className={`text-sm ${isConnected ? 'text-green-700' : isConnected === false ? 'text-red-700' : 'text-gray-700'}`}>
              {isConnected ? 'API accessible' : isConnected === false ? 'API inaccessible' : 'Vérification...'}
            </div>
          </div>

          {apiStats && (
            <>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">Tirages Disponibles</span>
                </div>
                <div className="text-2xl font-bold text-blue-800">{apiStats.totalTirages.toLocaleString()}</div>
                <div className="text-xs text-blue-600">
                  {apiStats.dateRange.from} → {apiStats.dateRange.to}
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <span className="font-semibold">Dernière Mise à Jour</span>
                </div>
                <div className="text-sm font-bold text-purple-800">
                  {formatDate(apiStats.lastUpdate)}
                </div>
                <div className="text-xs text-purple-600">
                  API OpenDataSoft
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Actions de synchronisation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ Actions de Synchronisation</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={loadPreview}
            className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-blue-800">Aperçu des Données</span>
            </div>
            <p className="text-sm text-blue-700">
              Voir les derniers tirages disponibles sans les importer
            </p>
          </button>

          <button
            onClick={handleSync}
            disabled={isSyncing || !isConnected}
            className={`p-4 rounded-lg transition-colors text-left ${
              isSyncing || !isConnected
                ? 'bg-gray-100 border border-gray-200 cursor-not-allowed'
                : 'bg-green-50 hover:bg-green-100 border border-green-200'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw className={`w-6 h-6 ${isSyncing ? 'animate-spin text-gray-500' : 'text-green-600'}`} />
              <span className={`font-semibold ${isSyncing ? 'text-gray-600' : 'text-green-800'}`}>
                {isSyncing ? 'Synchronisation...' : 'Synchroniser Maintenant'}
              </span>
            </div>
            <p className={`text-sm ${isSyncing ? 'text-gray-500' : 'text-green-700'}`}>
              Importer les nouveaux tirages dans votre base de données
            </p>
          </button>
        </div>

        {lastSync && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Dernière synchronisation: {formatDate(lastSync)}</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Aperçu des données */}
      {showPreview && preview.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">👀 Aperçu des Derniers Tirages</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            {preview.slice(0, 10).map((tirage, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold text-gray-600">
                    {formatDate(tirage.date)}
                  </div>
                  <div className="flex gap-1">
                    {[tirage.numero1, tirage.numero2, tirage.numero3, tirage.numero4, tirage.numero5].map((num, i) => (
                      <div key={i} className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                        {num}
                      </div>
                    ))}
                    <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-bold">
                      {tirage.complementaire}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  #{tirage.annee_numero}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors disabled:bg-gray-400"
            >
              {isSyncing ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Synchronisation...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Importer ces Tirages
                </div>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
