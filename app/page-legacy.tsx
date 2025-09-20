/**
 * PAGE LEGACY - VERSION ACTUELLE
 * Copie exacte de la version actuelle pour comparaison
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Download } from 'lucide-react';
import toast from 'react-hot-toast';

import Header from '@/components/Header';
import MobileHeader from '@/components/MobileHeader';
import PhoneBanner from '@/components/PhoneBanner';
import MobileNavigation from '@/components/MobileNavigation';
import MobileOptimizedWrapper from '@/components/MobileOptimizedWrapper';
import LoadingSpinner from '@/components/LoadingSpinner';
import HotColdPeriodSelector from '@/components/HotColdPeriodSelector';
import PeriodSelectionModal from '@/components/PeriodSelectionModal';
import TabletOptimizedWrapper from '@/components/TabletOptimizedWrapper';
import Footer from '@/components/Footer';

// Nouveaux composants de complexité
import ComplexitySelector from '@/components/ComplexitySelector';
import BeginnerInterface from '@/components/BeginnerInterface';
import IntermediateInterface from '@/components/IntermediateInterface';
import ExpertInterface from '@/components/ExpertInterface';
import { complexityManager, ComplexityLevel } from '@/lib/complexity-manager';

export default function LegacyHome() {
  // États principaux
  const [isLoading, setIsLoading] = useState(false);
  const [globalAnalysisPeriod, setGlobalAnalysisPeriod] = useState<'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100'>('last20');
  const [globalRemainingCombinations, setGlobalRemainingCombinations] = useState<number>(19068840);
  const [globalRemainingCombinationsSecondTirage, setGlobalRemainingCombinationsSecondTirage] = useState<number>(1906884);
  const [showPeriodModal, setShowPeriodModal] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [chanceLevel, setChanceLevel] = useState<number>(0);
  const [lastDraw, setLastDraw] = useState<any>(null);
  
  // États pour le système de complexité
  const [complexityLevel, setComplexityLevel] = useState<ComplexityLevel>('beginner');
  const [showComplexitySelector, setShowComplexitySelector] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  
  // États pour la navigation mobile
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // État des données
  const [dataStatus, setDataStatus] = useState<{
    hasData: boolean;
    totalTirages: number;
    lastUpdate: string | null;
    hasCSVFiles: boolean;
    availableFiles: string[];
  }>({
    hasData: false,
    totalTirages: 0,
    lastUpdate: null,
    hasCSVFiles: false,
    availableFiles: []
  });

  // Initialisation de l'application
  useEffect(() => {
    // Vérifier le niveau de complexité
    const savedLevel = complexityManager.getCurrentLevel();
    setComplexityLevel(savedLevel);
    
    // Vérifier si c'est la première visite
    const hasVisited = localStorage.getItem('has_visited');
    if (!hasVisited) {
      setIsFirstVisit(true);
      setShowComplexitySelector(true);
      localStorage.setItem('has_visited', 'true');
    }
    
    // Période d'analyse
    const hasSelectedPeriod = localStorage.getItem('selectedAnalysisPeriod');
    if (!hasSelectedPeriod) {
      setShowPeriodModal(true);
    } else {
      const savedPeriod = hasSelectedPeriod as 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100';
      setGlobalAnalysisPeriod(savedPeriod);
    }
    
    // Détection mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Charger les données
    checkDataStatus();
    fetchLastDraw();
    autoSyncOnStartup();
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Recalculer le niveau de chance périodiquement
  useEffect(() => {
    const updateChanceLevel = () => {
      const newChanceLevel = calculateChanceLevel();
      setChanceLevel(newChanceLevel);
      
      // Les combinaisons sont FIXES selon les règles du Loto
      setGlobalRemainingCombinations(19068840); // C(49,5) × 10
      setGlobalRemainingCombinationsSecondTirage(1906884); // C(49,5)
    };
    
    updateChanceLevel();
    const interval = setInterval(updateChanceLevel, 5000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  // Fonctions utilitaires
  const handlePeriodSelection = (period: 'week' | 'month' | 'year' | 'all' | 'last20' | 'last50' | 'last100') => {
    setGlobalAnalysisPeriod(period);
    localStorage.setItem('selectedAnalysisPeriod', period);
    setShowPeriodModal(false);
    setRefreshKey(prev => prev + 1);
  };

  const calculateChanceLevel = () => {
    try {
      const selectedNumbers = localStorage.getItem('selectedNumbers');
      const strategyNumbers = localStorage.getItem('strategyNumbers');
      const manualNumbers = localStorage.getItem('manualNumbers');
      
      let bestSelection: any = null;
      let maxCount = 0;
      
      [selectedNumbers, strategyNumbers, manualNumbers].forEach(source => {
        if (source) {
          try {
            const data = JSON.parse(source);
            if (data.numbers?.length > maxCount) {
              maxCount = data.numbers.length;
              bestSelection = data;
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      });
      
      if (bestSelection && bestSelection.numbers?.length >= 5) {
        const coverage = Math.round((bestSelection.numbers.length / 49) * 100);
        return Math.min(95, coverage);
      }
    } catch (error) {
      console.error('Erreur calcul couverture:', error);
    }
    
    return 0;
  };

  const autoSyncOnStartup = async () => {
    console.log('🔄 Vérification automatique des mises à jour...');
    
    try {
      const lastAutoSync = localStorage.getItem('last_auto_sync');
      const today = new Date().toDateString();
      
      if (lastAutoSync === today) {
        console.log('✅ Synchronisation automatique déjà effectuée aujourd\'hui');
        return;
      }
      
      const connectivityResponse = await fetch('/api/opendatasoft-sync?action=test');
      const connectivityResult = await connectivityResponse.json();
      
      if (!connectivityResult.success) {
        console.log('⚠️ API OpenDataSoft inaccessible, synchronisation ignorée');
        return;
      }
      
      const syncResponse = await fetch('/api/opendatasoft-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' })
      });
      
      const syncResult = await syncResponse.json();
      
      if (syncResult.success && syncResult.result.newTirages > 0) {
        console.log(`✅ ${syncResult.result.newTirages} nouveaux tirages synchronisés automatiquement`);
        toast.success(`🔄 ${syncResult.result.newTirages} nouveaux tirages importés automatiquement !`, {
          duration: 4000,
          icon: '🎯'
        });
        
        localStorage.setItem('last_auto_sync', today);
        checkDataStatus();
        fetchLastDraw();
      } else if (syncResult.success) {
        console.log('✅ Base de données déjà à jour');
        localStorage.setItem('last_auto_sync', today);
      } else {
        console.log('⚠️ Erreur de synchronisation:', syncResult.error);
      }
      
    } catch (error) {
      console.error('❌ Erreur synchronisation automatique:', error);
    }
  };

  const checkDataStatus = async () => {
    try {
      const response = await fetch('/api/statistics?type=summary');
      const result = await response.json();
      
      if (result.success && result.data) {
        setDataStatus({
          hasData: true,
          totalTirages: result.data.totalTirages || 0,
          lastUpdate: result.data.derniereMiseAJour || null,
          hasCSVFiles: false,
          availableFiles: []
        });
      } else {
        setDataStatus(prev => ({ ...prev, hasData: false }));
      }
    } catch (error) {
      console.error('Erreur vérification données:', error);
      setDataStatus(prev => ({ ...prev, hasData: false }));
    }
  };

  const fetchLastDraw = async () => {
    try {
      const response = await fetch('/api/tirages?limit=1&sort=recent');
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        const draw = result.data[0];
        
        // Compatibilité avec les anciens et nouveaux noms de champs
        const numbers = [
          draw.numero1 || draw.boule_1,
          draw.numero2 || draw.boule_2, 
          draw.numero3 || draw.boule_3,
          draw.numero4 || draw.boule_4,
          draw.numero5 || draw.boule_5
        ].filter(n => n && n > 0); // Filtrer les valeurs nulles/undefined
        
        const complementary = draw.complementaire || draw.numero_chance;
        
        setLastDraw({
          date: draw.date,
          numbers: numbers,
          complementary: complementary,
          joker: draw.joker || undefined
        });
        
        console.log('Debug lastDraw:', { draw, numbers, complementary }); // Debug
      }
    } catch (error) {
      console.error('Erreur récupération dernier tirage:', error);
    }
  };

  const handleImportData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/import-csv', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        toast.success(`✅ ${result.imported} tirages importés avec succès !`);
        await checkDataStatus();
      } else {
        toast.error('❌ Erreur lors de l\'import des données');
      }
    } catch (error) {
      toast.error('❌ Erreur lors de l\'import des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplexityChange = (newLevel: ComplexityLevel) => {
    setComplexityLevel(newLevel);
    setShowComplexitySelector(false);
    localStorage.setItem('complexity_manually_set', 'true');
    console.log(`🎯 Niveau de complexité changé: ${newLevel}`);
  };

  const renderContent = () => {
    // Vérifier d'abord les données
    if (!dataStatus.hasData) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[60vh] text-center"
        >
          <div className="card max-w-md mx-auto">
            <Database className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {dataStatus.hasCSVFiles ? 'Fichiers CSV détectés !' : 'Aucune donnée disponible'}
            </h2>
            <p className="text-gray-600 mb-6">
              {dataStatus.hasCSVFiles 
                ? `Fichiers CSV trouvés: ${dataStatus.availableFiles.join(', ')}. Cliquez pour importer les données réelles du Loto.`
                : 'Pour commencer à analyser le Loto National, vous devez d\'abord importer les données historiques.'
              }
            </p>
            <button
              onClick={handleImportData}
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isLoading 
                ? 'Import en cours...' 
                : dataStatus.hasCSVFiles 
                  ? 'Importer les fichiers CSV' 
                  : 'Importer les données de test'
              }
            </button>
          </div>
        </motion.div>
      );
    }

    // Rendu selon le niveau de complexité
    switch (complexityLevel) {
      case 'beginner':
        return (
          <BeginnerInterface 
            globalAnalysisPeriod={globalAnalysisPeriod}
          />
        );
        
      case 'intermediate':
        return (
          <IntermediateInterface 
            globalAnalysisPeriod={globalAnalysisPeriod}
            onAnalysisPeriodChange={setGlobalAnalysisPeriod}
          />
        );
        
      case 'expert':
        return (
          <ExpertInterface 
            globalAnalysisPeriod={globalAnalysisPeriod}
            onAnalysisPeriodChange={setGlobalAnalysisPeriod}
            onCombinationsChange={setGlobalRemainingCombinations}
          />
        );
        
      default:
        return (
          <BeginnerInterface 
            globalAnalysisPeriod={globalAnalysisPeriod}
          />
        );
    }
  };

  return (
    <TabletOptimizedWrapper>
      <div className="min-h-screen">
        {/* Header Desktop */}
        {!isMobile && (
          <Header 
            remainingCombinations={globalRemainingCombinations}
            remainingCombinationsSecondTirage={globalRemainingCombinationsSecondTirage}
            onDataUpdate={checkDataStatus}
            lastDraw={lastDraw}
            chanceLevel={chanceLevel}
          />
        )}
        
        {/* Bannière Téléphone Dédiée */}
        {isMobile && (
          <PhoneBanner
            onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            remainingCombinations={globalRemainingCombinations}
            lastDraw={lastDraw}
          />
        )}
        
        {/* Bouton de changement de mode */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowComplexitySelector(true)}
            className={`px-4 py-2 rounded-lg shadow-lg font-semibold transition-all ${
              complexityLevel === 'beginner' ? 'bg-green-500 hover:bg-green-600 text-white' :
              complexityLevel === 'intermediate' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
              'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {complexityLevel === 'beginner' && '🌱 Débutant'}
            {complexityLevel === 'intermediate' && '⚖️ Intermédiaire'}
            {complexityLevel === 'expert' && '🎯 Expert'}
          </button>
        </div>
        
        <main className={`container mx-auto px-4 ${isMobile ? 'py-4 pb-24' : 'py-8'}`}>
          {/* Sélecteur de période - Visible selon le mode */}
          {(complexityLevel === 'intermediate' || complexityLevel === 'expert') && (
            <div className="mb-8">
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border-2 border-blue-200 shadow-lg">
                  <HotColdPeriodSelector 
                    period={globalAnalysisPeriod}
                    onPeriodChange={setGlobalAnalysisPeriod}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contenu principal selon le niveau de complexité */}
          {renderContent()}
        </main>

        {!isMobile && <Footer />}
        
        {/* Navigation Mobile */}
        {isMobile && (
          <MobileNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            complexityLevel={complexityLevel}
          />
        )}
      </div>

      {/* Modal de sélection de période */}
      {showPeriodModal && (
        <PeriodSelectionModal
          isOpen={showPeriodModal}
          onClose={() => setShowPeriodModal(false)}
          onPeriodSelect={handlePeriodSelection}
          currentPeriod={globalAnalysisPeriod}
        />
      )}

      {/* Modal de sélection de complexité */}
      {showComplexitySelector && (
        <ComplexitySelector
          showAsModal={true}
          onLevelChange={handleComplexityChange}
          onClose={() => setShowComplexitySelector(false)}
        />
      )}
    </TabletOptimizedWrapper>
  );
}



