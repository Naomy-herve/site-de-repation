export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + ' M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.0', '') + ' K';
  return n.toString();
}

export function formatPrice(n: number): string {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

export function formatDate(s: string): string {
  return new Date(s).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function timeLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

export function difficultyColor(d: string): string {
  switch (d) {
    case 'Facile': return 'bg-green-100 text-green-700';
    case 'Modérée': return 'bg-amber-100 text-amber-700';
    case 'Difficile': return 'bg-orange-100 text-orange-700';
    case 'Très difficile': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}
