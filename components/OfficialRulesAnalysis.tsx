'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Target,
  Trophy,
  TrendingUp,
  Calculator,
  Award,
  Star,
  Zap,
  BarChart3,
  PieChart,
  Info,
  Lightbulb,
  Shield,
  Clock,
  Hash,
  Plus,
  Minus,
  Equal
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line
} from 'recharts';
import { lotoRulesEngine } from '@/lib/loto-rules-engine';
import toast from 'react-hot-toast';

interface ComplianceAnalysis {
  score: number;
  maxScore: number;
  details: Array<{
    rule: string;
    weight: number;
    passed: boolean;
    impact: string;
  }>;
}

interface WinProbabilityAnalysis {
  totalProbability: number;
  categoryProbabilities: Array<{
    category: string;
    probability: number;
    expectedValue: number;
  }>;
  recommendations: string[];
}

export default function OfficialRulesAnalysis() {
  const [customNumbers, setCustomNumbers] = useState<number[]>([]);
  const [customComplementary, setCustomComplementary] = useState<number>(1);
  const [complianceAnalysis, setComplianceAnalysis] = useState<ComplianceAnalysis | null>(null);
  const [winProbabilityAnalysis, setWinProbabilityAnalysis] = useState<WinProbabilityAnalysis | null>(null);
  const [compliantCombinations, setCompliantCombinations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('rules');

  const rules = lotoRulesEngine.getRules();
  const prizeCategories = lotoRulesEngine.getPrizeCategories();
  const validationRules = lotoRulesEngine.getValidationRules();
  const statisticalRules = lotoRulesEngine.getStatisticalRules();

  useEffect(() => {
    generateCompliantCombinations();
  }, []);

  // Analyse automatique à chaque changement de configuration
  useEffect(() => {
    if (customNumbers.length === 5) {
      // Délai de 500ms pour éviter trop d'analyses pendant la sélection rapide
      const timeoutId = setTimeout(() => {
        analyzeCustomCombination();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      // Réinitialiser les analyses si moins de 5 numéros
      setComplianceAnalysis(null);
      setWinProbabilityAnalysis(null);
    }
  }, [customNumbers, customComplementary]);

  const generateCompliantCombinations = () => {
    const combinations = lotoRulesEngine.generateCompliantCombinations(10);
    setCompliantCombinations(combinations);
  };

  const analyzeCustomCombination = () => {
    if (customNumbers.length !== 5) {
      return; // Pas d'erreur, juste ne pas analyser
    }

    const compliance = lotoRulesEngine.calculateComplianceScore(customNumbers, customComplementary);
    setComplianceAnalysis(compliance);

    const winProbability = lotoRulesEngine.analyzeWinProbability(customNumbers, customComplementary);
    setWinProbabilityAnalysis(winProbability);

    // Toast seulement si c'est un clic manuel
    // toast.success('Analyse terminée !');
  };

  const addNumber = (num: number) => {
    if (customNumbers.length < 5 && !customNumbers.includes(num)) {
      setCustomNumbers([...customNumbers, num].sort((a, b) => a - b));
    }
  };

  const removeNumber = (num: number) => {
    setCustomNumbers(customNumbers.filter(n => n !== num));
  };

  const tabs = [
    { id: 'rules', label: 'Règles officielles', icon: BookOpen },
    { id: 'validation', label: 'Validation', icon: CheckCircle },
    { id: 'statistics', label: 'Règles statistiques', icon: BarChart3 },
    { id: 'prizes', label: 'Catégories de gains', icon: Trophy },
    { id: 'analyzer', label: 'Analyseur de combinaisons', icon: Calculator },
    { id: 'generator', label: 'Générateur conforme', icon: Target }
  ];

  const renderRulesOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <Hash className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold">Numéros</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {rules.numbersToChoose} / {rules.totalNumbers}
          </div>
          <div className="text-sm text-gray-600">
            Numéros à choisir sur {rules.totalNumbers} disponibles
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <Plus className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold">Numéro complémentaire</h3>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {rules.complementaryNumberRange[0]}-{rules.complementaryNumberRange[1]}
          </div>
          <div className="text-sm text-gray-600">
            Plage du numéro complémentaire
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-purple-500" />
            <h3 className="text-lg font-semibold">Fréquence</h3>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {rules.drawDays.length}
          </div>
          <div className="text-sm text-gray-600">
            Tirages par semaine
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Jours de tirage :</h4>
            <div className="flex gap-2">
              {rules.drawDays.map(day => (
                <span key={day} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {day}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Heure de tirage :</h4>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {rules.drawTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderValidationRules = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Règles de validation</h3>
        <div className="space-y-4">
          {validationRules.map((rule, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">{rule.name}</h4>
                <p className="text-sm text-gray-600">{rule.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStatisticalRules = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Règles statistiques</h3>
        <div className="space-y-4">
          {statisticalRules.map((rule, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className={`w-5 h-5 mt-0.5 ${
                rule.impact === 'positive' ? 'text-green-500' :
                rule.impact === 'negative' ? 'text-red-500' :
                'text-yellow-500'
              }`}>
                {rule.impact === 'positive' ? <TrendingUp /> :
                 rule.impact === 'negative' ? <AlertTriangle /> :
                 <Info />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold">{rule.name}</h4>
                  <span className="text-sm text-gray-500">
                    Poids: {(rule.weight * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600">{rule.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrizeCategories = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Catégories de gains</h3>
        <div className="space-y-4">
          {prizeCategories.map((category, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{category.name}</h4>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Rang {index + 1}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{category.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    1 / {Math.round(1 / category.probability).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Chances de gagner</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {category.averagePrize.toLocaleString()} €
                  </div>
                  <div className="text-sm text-gray-600">Gain moyen</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {(category.probability * category.averagePrize).toFixed(2)} €
                  </div>
                  <div className="text-sm text-gray-600">Valeur espérée</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCombinationAnalyzer = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Analyseur de combinaisons</h3>
        
        {/* Sélection des numéros */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Sélectionnez vos numéros :</h4>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Array.from({ length: 49 }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => addNumber(num)}
                disabled={customNumbers.includes(num) || customNumbers.length >= 5}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                  customNumbers.includes(num)
                    ? 'bg-blue-500 text-white'
                    : customNumbers.length >= 5
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          
          {customNumbers.length > 0 && (
            <div className="mb-4">
              <h5 className="font-semibold mb-2">Numéros sélectionnés :</h5>
              <div className="flex gap-2">
                {customNumbers.map(num => (
                  <span
                    key={num}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                  >
                    {num}
                    <button
                      onClick={() => removeNumber(num)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Numéro complémentaire */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Numéro complémentaire :</h4>
          <div className="flex gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => setCustomComplementary(num)}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                  customComplementary === num
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              analyzeCustomCombination();
              toast.success('Analyse manuelle terminée !');
            }}
            disabled={customNumbers.length !== 5}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Analyser maintenant
          </button>
          
          {customNumbers.length === 5 && (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Analyse automatique activée</span>
            </div>
          )}
          
          {customNumbers.length < 5 && customNumbers.length > 0 && (
            <div className="flex items-center gap-2 text-orange-600">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm">Sélectionnez {5 - customNumbers.length} numéro{5 - customNumbers.length > 1 ? 's' : ''} de plus</span>
            </div>
          )}
        </div>
      </div>

      {/* Résultats de l'analyse */}
      {complianceAnalysis && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Score de conformité</h3>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span>Score de conformité</span>
              <span className="font-semibold">
                {complianceAnalysis.score} / {complianceAnalysis.maxScore}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(complianceAnalysis.score / complianceAnalysis.maxScore) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-2">
            {complianceAnalysis.details.map((detail, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  {detail.passed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm">{detail.rule}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {detail.weight} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {winProbabilityAnalysis && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Analyse de probabilité de gain</h3>
          
          <div className="mb-4">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {(winProbabilityAnalysis.totalProbability * 100).toFixed(6)}%
            </div>
            <div className="text-sm text-gray-600">Probabilité totale de gain</div>
          </div>

          <div className="space-y-3">
            {winProbabilityAnalysis.categoryProbabilities.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-semibold text-sm">{category.category}</div>
                  <div className="text-xs text-gray-600">
                    Probabilité: {(category.probability * 100).toFixed(4)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    {category.expectedValue.toFixed(2)} €
                  </div>
                  <div className="text-xs text-gray-600">Valeur espérée</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h4 className="font-semibold mb-2">Recommandations :</h4>
            <div className="space-y-1">
              {winProbabilityAnalysis.recommendations.map((rec, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  {rec}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCompliantGenerator = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Combinaisons conformes aux règles</h3>
          <button
            onClick={generateCompliantCombinations}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Générer de nouvelles combinaisons
          </button>
        </div>
        
        <div className="space-y-4">
          {compliantCombinations.map((combo, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Combinaison {index + 1}</span>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    Score: {combo.score}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Complémentaire: {combo.complementary}
                </div>
              </div>
              
              <div className="flex gap-2 mb-3">
                {combo.numbers.map((num: number) => (
                  <span
                    key={num}
                    className="inline-block w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-center leading-8 text-sm"
                  >
                    {num}
                  </span>
                ))}
                <span className="inline-block w-8 h-8 bg-green-100 text-green-800 rounded-full text-center leading-8 text-sm">
                  {combo.complementary}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {combo.details.details.map((detail: any, i: number) => (
                  <div key={i} className="flex items-center gap-1">
                    {detail.passed ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                    )}
                    <span className="truncate">{detail.rule}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'rules':
        return renderRulesOverview();
      case 'validation':
        return renderValidationRules();
      case 'statistics':
        return renderStatisticalRules();
      case 'prizes':
        return renderPrizeCategories();
      case 'analyzer':
        return renderCombinationAnalyzer();
      case 'generator':
        return renderCompliantGenerator();
      default:
        return renderRulesOverview();
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Analyse des Règles Officielles - Kdo Loto Gagnant
        </h1>
        <p className="text-gray-600">
          Analyse basée sur le règlement officiel de la FDJ
        </p>
      </motion.div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-lg shadow-md p-1">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu des onglets */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}

