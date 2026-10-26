import { useState, useEffect } from 'react';

/**
 * Barre de progression de lecture fixée en haut de l'écran (sous la
 * navbar). Indique visuellement l'avancement dans la page — élément
 * HUD typique des expériences web créatives primées.
 * Scroll passif + requestAnimationFrame : aucun impact perf.
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(100, (scrollTop / height) * 100) : 0);
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 pointer-events-none" aria-hidden="true">
      <div
        className="h-full bg-gradient-to-r from-primary-500 via-primary-400 to-accent-400 transition-[width] duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
