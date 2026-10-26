import { useEffect, useState } from 'react';

/**
 * Retarde la mise à jour d'une valeur jusqu'à ce que l'utilisateur
 * ait arrêté de taper pendant `delay` ms.
 * Utilisé pour les recherches : évite un appel Supabase à chaque frappe.
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
