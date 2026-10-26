import { Wrench } from 'lucide-react';

const WORDS = ['Réparez', 'Apprenez', 'Partagez', 'Réutilisez', 'Économisez'];

/**
 * Bandeau défilant infini — élément de style signature des sites
 * créatifs primés. Léger (CSS pur, aucune librairie), le texte
 * défile en boucle au-dessus du footer.
 */
function MarqueeRow({ hidden }: { hidden?: boolean }) {
  return (
    <div
      aria-hidden={hidden || undefined}
      className="flex items-center shrink-0 animate-marquee"
    >
      {/* Répété pour garantir la continuité de la boucle */}
      {[...Array(3)].map((_, rep) =>
        WORDS.map((word) => (
          <span key={`${rep}-${word}`} className="flex items-center">
            <span className="font-display text-sm font-bold uppercase tracking-[0.3em] text-primary-300">
              {word}
            </span>
            <Wrench className="w-3.5 h-3.5 mx-8 text-primary-600" aria-hidden="true" />
          </span>
        ))
      )}
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="overflow-hidden border-y border-primary-900/60 bg-primary-950 py-3.5 select-none">
      <div className="flex w-max whitespace-nowrap">
        <MarqueeRow />
        <MarqueeRow hidden />
      </div>
    </div>
  );
}
