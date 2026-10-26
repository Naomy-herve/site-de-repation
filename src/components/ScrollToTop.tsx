import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Remonte la page en haut à chaque changement de route.
 * Sans ceci, naviguer vers une nouvelle page conserve la position
 * de scroll précédente — très gênant pour l'utilisateur.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
}
