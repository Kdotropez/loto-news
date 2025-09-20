'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  CheckCircle, 
  Clock, 
  Trophy, 
  DollarSign, 
  Calendar,
  Eye,
  Trash2,
  Search,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { savedGridsManager, SavedGameSession, GameResult } from '../lib/saved-grids-manager';

export default function SavedGridsManager() {
  const [sessions, setSessions] = useState<SavedGameSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SavedGameSession | null>(null);
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [checkData, setCheckData] = useState({
    winningNumbers: '',
    winningComplementary: '',
    tirageDate: ''
  });
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalCost: 0,
    totalGains: 0,
    netResult: 0,
    winRate: 0
  });

  // Charger les sessions au montage
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const allSessions = savedGridsManager.getAllSessions();
    setSessions(allSessions);
    
    const globalStats = savedGridsManager.getStats();
    setStats(globalStats);
  };

  const handleCheckSession = (session: SavedGameSession) => {
    setSelectedSession(session);
    setCheckData({
      winningNumbers: '',
      winningComplementary: '',
      tirageDate: session.gameDate
    });
    setShowCheckModal(true);
  };

  const executeCheck = () => {
    if (!selectedSession) return;

    const numbersArray = checkData.winningNumbers
      .split(/[,\s]+/)
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n >= 1 && n <= 49);

    const complementary = parseInt(checkData.winningComplementary);

    if (numbersArray.length !== 5) {
      alert('Veuillez saisir exactement 5 numéros gagnants !');
      return;
    }

    if (isNaN(complementary) || complementary < 1 || complementary > 10) {
      alert('Le numéro complémentaire doit être entre 1 et 10 !');
      return;
    }

    try {
      const result = savedGridsManager.checkSessionWithTirage(
        selectedSession.id,
        numbersArray,
        complementary,
        checkData.tirageDate
      );

      alert(`🎯 Contrôle terminé !\n\nGains: ${result.totalGains.toFixed(2)}€\nRésultat net: ${result.netResult.toFixed(2)}€\n\nGrilles gagnantes: ${result.gridResults.filter(g => g.rank > 0).length}/${result.gridResults.length}`);

      setShowCheckModal(false);
      loadSessions(); // Recharger pour mettre à jour
    } catch (error) {
      console.error('Erreur lors du contrôle:', error);
      alert('❌ Erreur lors du contrôle. Veuillez vérifier les données.');
    }
  };

  const deleteSession = (sessionId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      savedGridsManager.deleteSession(sessionId);
      loadSessions();
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

  const getStatusIcon = (status: SavedGameSession['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'won': return <Trophy className="w-5 h-5 text-green-500" />;
      case 'lost': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'checked': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: SavedGameSession['status']) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'won': return 'Gagnant';
      case 'lost': return 'Perdant';
      case 'checked': return 'Contrôlé';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white"
      >
        <div className="flex items-center gap-3 mb-4">
          <History className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">💾 Gestionnaire de Grilles</h1>
            <p className="text-purple-200">Sauvegardez, contrôlez et suivez vos sessions de jeu</p>
          </div>
        </div>
      </motion.div>

      {/* Statistiques globales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Statistiques Globales</h2>
        <div className="grid md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-blue-600 font-semibold">Sessions</div>
            <div className="text-2xl font-bold text-blue-800">{stats.totalSessions}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-red-600 font-semibold">Coût Total</div>
            <div className="text-2xl font-bold text-red-800">{stats.totalCost.toFixed(2)}€</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-green-600 font-semibold">Gains Total</div>
            <div className="text-2xl font-bold text-green-800">{stats.totalGains.toFixed(2)}€</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${stats.netResult >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className={`font-semibold ${stats.netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Résultat Net
            </div>
            <div className={`text-2xl font-bold ${stats.netResult >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              {stats.netResult >= 0 ? '+' : ''}{stats.netResult.toFixed(2)}€
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-purple-600 font-semibold">Taux de Gain</div>
            <div className="text-2xl font-bold text-purple-800">{stats.winRate.toFixed(1)}%</div>
          </div>
        </div>
      </motion.div>

      {/* Liste des sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">🎲 Vos Sessions Sauvegardées</h2>
        
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Aucune session sauvegardée</p>
            <p className="text-sm">Générez et sauvegardez des grilles pour les voir ici</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(session.status)}
                      <h3 className="text-lg font-semibold text-gray-800">{session.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        session.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        session.status === 'won' ? 'bg-green-100 text-green-800' :
                        session.status === 'lost' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {getStatusText(session.status)}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {formatDate(session.gameDate)}
                      </div>
                      <div>
                        <Eye className="w-4 h-4 inline mr-1" />
                        {session.grids.length} grilles
                      </div>
                      <div>
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        {session.totalCost.toFixed(2)}€
                      </div>
                      <div>
                        <TrendingUp className="w-4 h-4 inline mr-1" />
                        {session.selectedNumbers.length} numéros
                      </div>
                    </div>

                    {session.results && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Résultat: {session.results.gridResults.filter(g => g.rank > 0).length} grilles gagnantes
                          </span>
                          <span className={`font-bold ${session.results.netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {session.results.netResult >= 0 ? '+' : ''}{session.results.netResult.toFixed(2)}€
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {session.status === 'pending' && (
                      <button
                        onClick={() => handleCheckSession(session)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        🔍 Contrôler
                      </button>
                    )}
                    <button
                      onClick={() => deleteSession(session.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal de contrôle */}
      {showCheckModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <Search className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Contrôler la Session</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">{selectedSession.name}</h4>
                <div className="text-sm text-blue-700">
                  • {selectedSession.grids.length} grilles à contrôler
                  • Date prévue: {formatDate(selectedSession.gameDate)}
                </div>
              </div>

              {/* Numéros gagnants */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Numéros gagnants (5 numéros)
                </label>
                <input
                  type="text"
                  value={checkData.winningNumbers}
                  onChange={(e) => setCheckData({...checkData, winningNumbers: e.target.value})}
                  placeholder="Ex: 1, 15, 23, 34, 42"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Numéro complémentaire */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Numéro complémentaire
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={checkData.winningComplementary}
                  onChange={(e) => setCheckData({...checkData, winningComplementary: e.target.value})}
                  placeholder="1-10"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date du tirage */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date du tirage
                </label>
                <input
                  type="date"
                  value={checkData.tirageDate}
                  onChange={(e) => setCheckData({...checkData, tirageDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCheckModal(false)}
                className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={executeCheck}
                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
              >
                🔍 Contrôler
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
