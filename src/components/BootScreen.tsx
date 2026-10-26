import { useState, useEffect } from 'react';
import { Wrench } from 'lucide-react';

const SESSION_KEY = 'flam_boot_played';

/**
 * Écran de démarrage « terminal » — clin d'œil aux expériences
 * boot-sequence des sites primés (funtech-style), adapté à
 * FlamOfreparation. Rapide (~2,2 s), une seule fois par session,
 * cliquable pour passer, désactivé si prefers-reduced-motion.
 */
const BOOT_LINES = [
  'FLAMOFREPARATION OS — v26.10 · TTY1',
  '> chargement des tutoriels ........... 63 548 OK',
  '> catalogue boutique .................. OK',
  '> communauté ..................... 249 323 MEMBRES',
  '> assistant FixBot .................... EN LIGNE',
];

export default function BootScreen() {
  const [visible, setVisible] = useState(false);
  const [lineCount, setLineCount] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Une seule fois par session de navigation
    if (sessionStorage.getItem(SESSION_KEY) === 'true') return;
    // Accessibilité : pas d'animation pour les utilisateurs sensibles
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      return;
    }
    sessionStorage.setItem(SESSION_KEY, 'true');
    setVisible(true);

    const timers: number[] = [];
    BOOT_LINES.forEach((_, i) => {
      timers.push(window.setTimeout(() => setLineCount(i + 1), 150 + i * 320));
    });
    timers.push(window.setTimeout(() => setFading(true), 150 + BOOT_LINES.length * 320 + 500));
    timers.push(window.setTimeout(() => setVisible(false), 150 + BOOT_LINES.length * 320 + 500 + 450));
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  if (!visible) return null;

  return (
    <div
      onClick={() => setVisible(false)}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 font-mono select-none cursor-pointer transition-opacity duration-450 ${fading ? 'opacity-0' : 'opacity-100'}`}
      role="presentation"
    >
      <div className="w-9 h-9 rounded-xl bg-primary-600/20 border border-primary-500/40 flex items-center justify-center mb-8">
        <Wrench className="w-5 h-5 text-primary-400" strokeWidth={2.5} />
      </div>

      <div className="px-6 max-w-md w-full text-[13px] leading-6 sm:text-sm">
        {BOOT_LINES.slice(0, lineCount).map((line, i) => (
          <p
            key={i}
            className={i === 0 ? 'text-primary-400 font-bold tracking-wide' : 'text-emerald-400/90'}
          >
            {line}
          </p>
        ))}

        {/* Curseur clignotant + barre de progression */}
        <p className="mt-3 text-primary-300">
          READY
          <span className="inline-block w-2 h-4 ml-1 bg-primary-400 align-middle animate-cursor-blink" />
        </p>
        <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden" aria-hidden="true">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-emerald-400 transition-all duration-300 ease-out"
            style={{ width: `${(lineCount / BOOT_LINES.length) * 100}%` }}
          />
        </div>
      </div>

      <p className="absolute bottom-8 text-xs text-slate-600 tracking-widest uppercase animate-pulse">
        Cliquer pour entrer
      </p>
    </div>
  );
}
