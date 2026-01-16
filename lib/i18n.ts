type Locale = 'fr' | 'en';

const messages: Record<Locale, Record<string, string>> = {
  fr: {
    // KPI
    'kpi.next_draw': 'Prochain tirage',
    'kpi.total_draws': 'Total tirages',
    'kpi.last_update': 'Dernière mise à jour',
    'kpi.draws_per_month': 'Tirages/mois (≈)',
    'kpi.space_main': 'Espace des grilles',
    'kpi.space_second': 'Second tirage',

    // FrequencyTrends
    'freq.loading': 'Chargement des fréquences…',
    'freq.error': 'Erreur chargement',
    'freq.title_main': 'Fréquences 1–49',
    'freq.title_chance': 'Numéro Chance 1–10',
    'freq.period': 'Période',
    'freq.draws': 'Tirages',
    'freq.expected': 'Attendu moyen ≈ {value}',
    'freq.legend': 'Barres = fréquence, ligne pointillée = attendu',
    'freq.top_hot': 'Top 10 chauds',
    'freq.top_cold': 'Top 10 froids',

    // Recency
    'rec.loading': 'Calcul des récences…',
    'rec.title': 'Récence & Séries',
    'rec.hint': 'Absence = tirages depuis la dernière apparition',
    'rec.big_absence': 'Plus grands retards (absence en tête de période)',
    'rec.last': 'Dernière',
    'rec.never': 'Jamais',
    'rec.absence': 'Absence',
    'rec.presences': 'Présences consécutives (au début de période)',
    'rec.max_abs': 'Max absence',
    'rec.presence': 'Présence',

    // Cooccurrence
    'cooc.loading': 'Calcul cooccurrence…',
    'cooc.title': 'Cooccurrence des paires (Top)',
    'cooc.distinct': 'Paires distinctes',
    'cooc.page_prev': 'Page précédente',
    'cooc.page_next': 'Page suivante',
    'cooc.page': 'Page {page}/{total}',
    'cooc.col.rank': '#',
    'cooc.col.pair': 'Paire',
    'cooc.col.count': 'Occurrences',

    // Patterns
    'pat.loading': 'Calcul des patterns…',
    'pat.title': 'Patterns',
    'pat.subtitle': 'Parité, somme, espacement, répartition par déciles (période: {period})',
    'pat.hint': 'Mesures descriptives factuelles',
    'pat.parity': 'Parité',
    'pat.ratio': 'ratio',
    'pat.sums': 'Sommes',
    'pat.avg': 'Moyenne',
    'pat.last': 'Dernière',
    'pat.spacing': 'Espacement médian',
    'pat.recent_bias': 'Biais récent (20 derniers)',
    'pat.dominant_zone': 'Zone dominante',
    'pat.deciles': 'Répartition par déciles',
    'pat.zone1': '1-16',
    'pat.zone2': '17-32',
    'pat.zone3': '33-49',

    // EV
    'ev.title': "Espérance de gain (EV)",
    'ev.subtitle': 'Calcul basé sur les rangs officiels (données réelles)',
    'ev.hint': 'Ce module est descriptif, pas prédictif',
    'ev.ev_per_grid': 'EV par grille (euros)',
    'ev.win_prob': 'Probabilité cumulée de gain',
    'ev.break_even': "Seuil d'équilibre (≈)",
    'ev.for_bet': 'Pour mise ≈ {value} €',
    'ev.disclaimer': "Rappel: l'EV est une moyenne théorique à long terme. Le Loto est aléatoire; ces chiffres ne constituent pas un conseil d'investissement ni une garantie de résultat.",

    // Common
    'common.period': 'Période',
    'common.draws': 'Tirages'
  },
  en: {}
};

let currentLocale: Locale = 'fr';

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string, params?: Record<string, string | number>): string {
  const dict = messages[currentLocale] || {};
  let template = dict[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return template;
}




