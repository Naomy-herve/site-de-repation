import { useEffect } from 'react';

const SITE_NAME = 'FlamOfreparation';

/**
 * Met à jour le titre de l'onglet (SEO + accessibilité + historique).
 * Sans ceci, toutes les pages partagent le même <title>.
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Tutoriels de réparation gratuits`;
    return () => {
      document.title = `${SITE_NAME} — Tutoriels de réparation gratuits`;
    };
  }, [title]);
}
