# 🎰 Kdo Loto Gagnant

Une application web moderne pour analyser les tirages du Loto National français et optimiser vos chances de gain grâce à l'analyse statistique avancée.

**© 2025 Nicolas Lefevre - Tous droits réservés**  
*Utilisation interdite sans accord écrit de l'auteur*

## ✨ Fonctionnalités

### 📊 Analyses statistiques
- **Analyse des fréquences** : Découvrez quels numéros sortent le plus souvent
- **Analyse des patterns** : Identifiez les motifs récurrents dans les tirages
- **Analyse des tendances** : Suivez l'évolution des numéros dans le temps
- **Statistiques complètes** : Vue d'ensemble de toutes les données

### 🎯 Générateur de combinaisons optimisées
- **Algorithmes intelligents** : Combinaisons basées sur l'analyse statistique
- **Système de scoring** : Évaluation des chances de chaque combinaison
- **Sauvegarde des favoris** : Gardez vos meilleures combinaisons
- **Export des données** : Téléchargez vos analyses en CSV

### 🔧 Fonctionnalités avancées
- **Import automatique** : Récupération des données historiques FDJ
- **Interface moderne** : Design responsive et intuitif
- **Notifications** : Alertes pour les nouveaux tirages
- **Sauvegarde locale** : Base de données SQLite intégrée

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation des dépendances
```bash
npm install
```

### Configuration de la base de données
```bash
npm run db:setup
```

### Import des données historiques
```bash
npm run db:import
```

### Lancement de l'application
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📱 Utilisation

### 1. Import des données
- Au premier lancement, cliquez sur "Importer les données" pour récupérer l'historique des tirages
- Les données sont automatiquement mises à jour

### 2. Tableau de bord
- Vue d'ensemble des statistiques principales
- Derniers tirages et numéros les plus fréquents
- Graphiques interactifs

### 3. Analyses détaillées
- **Fréquences** : Analysez la fréquence de sortie de chaque numéro
- **Patterns** : Découvrez les motifs récurrents (consécutifs, parité, etc.)
- **Tendances** : Suivez l'évolution des numéros dans le temps
- **Statistiques** : Vue complète de toutes les données

### 4. Générateur de combinaisons
- Générez des combinaisons optimisées basées sur l'analyse
- Sauvegardez vos combinaisons favorites
- Exportez les résultats en CSV

## 🏗️ Architecture technique

### Frontend
- **Next.js 14** avec App Router
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le styling
- **Framer Motion** pour les animations
- **Recharts** pour les graphiques
- **React Hot Toast** pour les notifications

### Backend
- **API Routes Next.js** pour les endpoints
- **SQLite** avec better-sqlite3 pour la base de données
- **Système de collecte de données** pour FDJ

### Base de données
- **Table tirages** : Stockage de tous les tirages historiques
- **Table combinaisons_favorites** : Sauvegarde des combinaisons
- **Table analyses_sauvegardees** : Historique des analyses

## 📊 Types d'analyses

### Analyse de fréquence
- Fréquence de sortie de chaque numéro
- Pourcentage de présence
- Dernière sortie et écart actuel
- Tendance (hausse/baisse/stable)

### Analyse des patterns
- **Numéros consécutifs** : Détection des suites
- **Parité** : Répartition pairs/impairs
- **Dizaines** : Répartition par tranches de 10
- **Somme** : Analyse de la somme des numéros

### Analyse des tendances
- **Numéros chauds** : En hausse récente
- **Numéros froids** : En baisse récente
- **Numéros équilibrés** : Fréquence stable
- **Évolution temporelle** : Comparaison des périodes

### Générateur de combinaisons
- **Stratégie équilibrée** : Mélange de numéros chauds, froids et équilibrés
- **Système de scoring** : Évaluation basée sur plusieurs critères
- **Diversité** : Répartition sur différentes dizaines
- **Probabilité théorique** : Calcul des chances de gain

## 🔧 Scripts disponibles

```bash
# Développement
npm run dev          # Lance le serveur de développement
npm run build        # Construit l'application pour la production
npm run start        # Lance l'application en production
npm run lint         # Vérifie le code avec ESLint

# Base de données
npm run db:setup     # Initialise la base de données
npm run db:import    # Importe les données historiques
```

## 📁 Structure du projet

```
loto-analyzer/
├── app/                    # App Router Next.js
│   ├── api/               # Routes API
│   ├── globals.css        # Styles globaux
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── components/            # Composants React
│   ├── Header.tsx
│   ├── Dashboard.tsx
│   ├── FrequencyAnalysis.tsx
│   ├── PatternAnalysis.tsx
│   ├── CombinationGenerator.tsx
│   ├── TrendAnalysis.tsx
│   ├── Statistics.tsx
│   └── LoadingSpinner.tsx
├── lib/                   # Logique métier
│   ├── database.ts        # Gestion de la base de données
│   ├── data-collector.ts  # Collecte des données FDJ
│   └── analysis-engine.ts # Moteur d'analyse
├── scripts/               # Scripts utilitaires
│   ├── setup-database.js
│   └── import-data.js
├── data/                  # Base de données SQLite
└── public/                # Fichiers statiques
```

## 🎨 Design et UX

### Palette de couleurs
- **Primary** : Bleu (#0ea5e9)
- **Loto Red** : Rouge (#e11d48) pour les numéros chauds
- **Loto Blue** : Bleu (#1e40af) pour les numéros froids
- **Loto Green** : Vert (#059669) pour les numéros équilibrés
- **Loto Yellow** : Jaune (#d97706) pour le numéro chance

### Composants
- **Cartes** : Design moderne avec ombres et bordures arrondies
- **Boutons** : États hover et focus avec transitions
- **Numéros** : Boules colorées selon leur statut
- **Graphiques** : Visualisations interactives avec Recharts
- **Animations** : Transitions fluides avec Framer Motion

## 🔒 Sécurité et performance

### Sécurité
- Validation des données côté serveur
- Protection contre les injections SQL
- Gestion des erreurs appropriée

### Performance
- Base de données SQLite optimisée
- Requêtes préparées pour éviter les injections
- Lazy loading des composants
- Optimisation des images et assets

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement si nécessaire
3. Déployez automatiquement

### Autres plateformes
L'application peut être déployée sur toute plateforme supportant Node.js :
- Netlify
- Railway
- Heroku
- AWS
- Google Cloud

## 📈 Améliorations futures

- [ ] Intégration API FDJ officielle
- [ ] Notifications push pour nouveaux tirages
- [ ] Mode sombre
- [ ] Application mobile (React Native)
- [ ] Analyses prédictives avec IA
- [ ] Comparaison avec d'autres jeux de loterie
- [ ] Système de paris virtuels
- [ ] Export PDF des analyses

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

**© 2025 Nicolas Lefevre - Tous droits réservés**

Ce logiciel est la propriété exclusive de Nicolas Lefevre. Toute utilisation, reproduction, distribution ou modification de ce logiciel est strictement interdite sans l'accord écrit préalable de l'auteur.

Pour toute demande d'utilisation, veuillez contacter l'auteur.

## ⚠️ Avertissement

Cette application est destinée à des fins éducatives et de divertissement. Le Loto est un jeu de hasard et aucune méthode ne peut garantir un gain. Jouez de manière responsable.

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation
- Contactez l'équipe de développement

---

**Kdo Loto Gagnant** - Optimisez vos chances au Loto National français ! 🎰✨

---
*© 2025 Nicolas Lefevre - Tous droits réservés*
