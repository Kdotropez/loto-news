'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ManualTirageInputProps {
  onTirageAdded?: () => void;
}

export default function ManualTirageInput({ onTirageAdded }: ManualTirageInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    numero1: '',
    numero2: '',
    numero3: '',
    numero4: '',
    numero5: '',
    complementary: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validation de la date
    if (!formData.date) {
      newErrors.date = 'La date est obligatoire';
    } else {
      const date = new Date(formData.date);
      if (isNaN(date.getTime())) {
        newErrors.date = 'Format de date invalide';
      }
    }

    // Validation des numéros
    const numbers = [formData.numero1, formData.numero2, formData.numero3, formData.numero4, formData.numero5];
    numbers.forEach((num, index) => {
      const numValue = parseInt(num);
      if (!num || isNaN(numValue) || numValue < 1 || numValue > 49) {
        newErrors[`numero${index + 1}`] = 'Numéro entre 1 et 49';
      }
    });

    // Vérifier les doublons
    const uniqueNumbers = new Set(numbers.map(n => parseInt(n)).filter(n => !isNaN(n)));
    if (uniqueNumbers.size !== 5) {
      newErrors.duplicates = 'Les numéros doivent être différents';
    }

    // Validation du complémentaire
    const complementary = parseInt(formData.complementary);
    if (!formData.complementary || isNaN(complementary) || complementary < 1 || complementary > 10) {
      newErrors.complementary = 'Complémentaire entre 1 et 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/add-tirage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formData.date,
          numbers: [
            parseInt(formData.numero1),
            parseInt(formData.numero2),
            parseInt(formData.numero3),
            parseInt(formData.numero4),
            parseInt(formData.numero5)
          ],
          complementary: parseInt(formData.complementary)
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`🎯 Tirage du ${formData.date} ajouté avec succès !`);
        resetForm();
        setIsOpen(false);
        onTirageAdded?.();
      } else {
        toast.error(result.message || 'Erreur lors de l\'ajout du tirage');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      numero1: '',
      numero2: '',
      numero3: '',
      numero4: '',
      numero5: '',
      complementary: ''
    });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <>
      {/* Bouton pour ouvrir le modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md"
      >
        <Plus className="w-4 h-4" />
        <span>Saisir un tirage</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Saisie manuelle d'un tirage</h2>
                  <p className="text-sm text-gray-600">Ajoutez un nouveau tirage à la base de données</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date du tirage *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Sélectionnez la date"
                />
                {errors.date && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.date}
                  </div>
                )}
              </div>

              {/* Numéros */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Numéros gagnants (5 numéros entre 1 et 49) *
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num}>
                      <input
                        type="number"
                        min="1"
                        max="49"
                        value={formData[`numero${num}` as keyof typeof formData]}
                        onChange={(e) => handleInputChange(`numero${num}`, e.target.value)}
                        className={`w-full px-3 py-3 text-center border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-bold ${
                          errors[`numero${num}`] || errors.duplicates ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder={num.toString()}
                      />
                    </div>
                  ))}
                </div>
                {errors.duplicates && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.duplicates}
                  </div>
                )}
              </div>

              {/* Complémentaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro complémentaire (entre 1 et 10) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.complementary}
                  onChange={(e) => handleInputChange('complementary', e.target.value)}
                  className={`w-full px-4 py-3 text-center border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-bold ${
                    errors.complementary ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Complémentaire"
                />
                {errors.complementary && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.complementary}
                  </div>
                )}
              </div>

              {/* Aperçu */}
              {formData.date && formData.numero1 && formData.numero2 && formData.numero3 && formData.numero4 && formData.numero5 && formData.complementary && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Aperçu du tirage :</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-700 font-medium">{formData.date}</span>
                    <span className="text-blue-600">•</span>
                    <div className="flex gap-1">
                      {[formData.numero1, formData.numero2, formData.numero3, formData.numero4, formData.numero5]
                        .map((num, index) => (
                          <div key={index} className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {num}
                          </div>
                        ))}
                    </div>
                    <span className="text-blue-600">+</span>
                    <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {formData.complementary}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Ajouter le tirage
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}

