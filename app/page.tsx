/**
 * PAGE PRINCIPALE
 * Version responsive unifiée (Mobile/Tablette/Desktop) via `ResponsiveRouter`.
 *
 * Références :
 * - Ancienne implémentation “legacy” : `app/page-legacy.tsx`
 * - Sélecteur legacy vs responsive : `app/page-with-selector.tsx`
 */

'use client';

import ResponsiveHome from './page-responsive';

export default function Home() {
  return <ResponsiveHome />;
}


