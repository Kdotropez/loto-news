# Optimisateur de Grilles Professionnel

## 🎯 Vue d'ensemble

L'Optimisateur de Grilles Professionnel est un système avancé qui génère mathématiquement des grilles de Loto optimisées pour garantir un nombre minimum de numéros corrects.

## 🏗️ Architecture

```
lib/grid-optimizer/
├── types.ts                    # Types et interfaces TypeScript
├── validators.ts               # Validateurs et tests exhaustifs
├── optimizer-manager.ts        # Gestionnaire principal
├── algorithms/
│   ├── base-algorithm.ts       # Classe de base pour tous les algorithmes
│   ├── greedy-algorithm.ts     # Algorithme glouton (implémenté)
│   └── exact-cover.ts          # Couverture exacte (à venir)
├── __tests__/
│   └── *.test.ts              # Tests unitaires complets
└── README.md                   # Cette documentation
```

## 🧮 Algorithmes Implémentés

### 1. Algorithme Glouton (Greedy Heuristic)

**Théorie Mathématique:**
- Basé sur le Set Cover Problem (NP-complet)
- Approximation avec ratio ln(n) de l'optimal
- Complexité: O(n × m × k)

**Fonctionnement:**
1. Génère toutes les grilles candidates C(n,5)
2. À chaque étape, sélectionne la grille qui couvre le plus de tirages non couverts
3. Continue jusqu'à couverture complète ou limites atteintes

**Garanties:**
- ✅ Solution garantie en temps polynomial
- ✅ Approximation prouvée mathématiquement
- ✅ Tests exhaustifs de validation

## 📊 Validation et Tests

### Tests Exhaustifs
Chaque algorithme est validé par des tests exhaustifs qui :
- Génèrent TOUTES les combinaisons possibles de 5 numéros
- Testent chaque combinaison avec tous les complémentaires
- Vérifient que les grilles garantissent le rang demandé
- Calculent le taux de succès exact (doit être 100% pour une vraie garantie)

### Métriques de Performance
- **Temps de calcul** : Mesuré en millisecondes
- **Mémoire utilisée** : Tracking de l'utilisation mémoire
- **Complexité** : Description algorithmique
- **Couverture** : Pourcentage exact de cas couverts

## 🔬 Preuves Mathématiques

### Coefficient Binomial
```
C(n,k) = n! / (k!(n-k)!)
```

### Borne Inférieure (Singleton Bound)
```
Nombre minimum de grilles ≥ C(n,5) / max_couverture_par_grille
```

### Approximation Gloutonne
```
Solution_gloutonne ≤ ln(|U|) × Solution_optimale
```
où |U| est le nombre d'éléments à couvrir.

## 🚀 Utilisation

### Interface Simplifiée
```typescript
import { optimizeLotoGrids } from '@/lib/grid-optimizer/optimizer-manager';

const result = await optimizeLotoGrids(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Numéros sélectionnés
  [1, 2], // Complémentaires
  {
    guaranteeRank: 3,     // Garantir au moins 3 numéros
    maxBudget: 50,        // Budget maximum 50€
    maxGrids: 25,         // Maximum 25 grilles
    strategy: 'greedy_heuristic'
  }
);
```

### Interface Avancée
```typescript
import { GridOptimizerManager } from '@/lib/grid-optimizer/optimizer-manager';

const optimizer = new GridOptimizerManager();

const result = await optimizer.optimizeGrids(
  {
    main: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    complementary: [1, 2]
  },
  {
    minGuaranteedNumbers: 3,
    maxBudget: 50,
    maxGrids: 25,
    includeComplementary: true
  },
  'greedy_heuristic',
  {
    timeout: 30000,       // 30 secondes
    maxMemory: 512        // 512 MB
  }
);
```

## 📈 Résultats

### Structure du Résultat
```typescript
interface OptimizationResult {
  grids: LotoGrid[];              // Grilles optimisées
  totalCost: number;              // Coût total
  guarantee: GuaranteeProof;      // Preuve mathématique
  metadata: OptimizationMetadata; // Métadonnées de performance
}
```

### Interprétation des Garanties
- **100% de couverture** = Garantie mathématique absolue
- **95-99% de couverture** = Très haute probabilité, quelques cas d'échec
- **< 95% de couverture** = Approximation, nombreux cas non couverts

## 🧪 Tests et Validation

### Lancer les Tests
```bash
npm test grid-optimizer
```

### Tests Inclus
- ✅ Validation des entrées
- ✅ Génération des combinaisons
- ✅ Algorithmes d'optimisation
- ✅ Tests exhaustifs de garanties
- ✅ Tests de performance
- ✅ Cas limites et gestion d'erreurs

## 🔍 Exemples Concrets

### Cas Simple (5 numéros)
```
Entrée: [1, 2, 3, 4, 5]
Sortie: 1 grille [1, 2, 3, 4, 5]
Garantie: 100% (trivial)
Coût: 2.20€
```

### Cas Réaliste (10 numéros)
```
Entrée: [7, 12, 18, 24, 31, 38, 41, 43, 46, 48]
Sortie: 8-15 grilles optimisées
Garantie: 100% pour rang 3
Coût: 17.60€ - 33.00€
Combinaisons testées: 252
```

### Cas Complexe (15 numéros)
```
Entrée: 15 numéros sélectionnés
Sortie: 25-50 grilles selon budget
Garantie: Variable selon contraintes
Coût: Jusqu'à budget maximum
Combinaisons testées: 3,003
```

## ⚠️ Limitations et Considérations

### Limites Techniques
- **Mémoire** : Croissance exponentielle avec le nombre de numéros
- **Temps** : Calculs intensifs pour > 15 numéros
- **Précision** : Approximations pour très grandes sélections

### Limites Réglementaires
- **FDJ** : Maximum 20 numéros principaux
- **Budget** : Contraintes utilisateur respectées
- **Grilles multiples** : Maximum 10 numéros par grille multiple

## 🔮 Algorithmes Futurs

### En Développement
1. **Exact Cover Algorithm** - Solution optimale garantie
2. **Genetic Algorithm** - Optimisation évolutionnaire
3. **Branch and Bound** - Exploration systématique
4. **Linear Programming** - Programmation linéaire

### Améliorations Prévues
- Parallélisation des calculs
- Cache intelligent des résultats
- Interface de comparaison d'algorithmes
- Optimisation mémoire avancée

## 📚 Références Scientifiques

1. **Johnson, D. S. (1974)** - "Approximation algorithms for combinatorial problems"
2. **Chvátal, V. (1979)** - "A greedy heuristic for the set-cover problem"  
3. **Karp, R. M. (1972)** - "Reducibility among combinatorial problems"
4. **Schrijver, A. (2003)** - "Combinatorial Optimization"

## 🤝 Contribution

Pour contribuer à ce projet :
1. Respecter l'architecture modulaire
2. Ajouter des tests pour chaque nouvelle fonctionnalité
3. Documenter les preuves mathématiques
4. Valider exhaustivement les algorithmes

## 📞 Support

Pour toute question technique ou mathématique, consulter :
- Les tests unitaires pour des exemples d'usage
- Les commentaires dans le code pour les détails d'implémentation
- Cette documentation pour la théorie sous-jacente



