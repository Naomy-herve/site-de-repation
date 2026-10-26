import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Recycle, ArrowRight } from 'lucide-react';

const POPULAR_TAGS = ['iPhone 12', 'PS5', 'Switch', 'MacBook', 'Lave-linge'];

/**
 * Hero de la page d'accueil — style inspiré des expériences créatives
 * primées (funtech-style) : grande typo, badge terminal, grain,
 * révélations en cascade. Composant autonome (données par props).
 */
export default function HeroSection() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/tutoriels?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <section className="relative bg-slate-950 overflow-hidden">
      {/* Grain subtil (motif noise en CSS pur, léger) */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        }}
        aria-hidden="true"
      />
      {/* Image de fond + voiles dégradés */}
      <div className="absolute inset-0 opacity-15" style={{
        backgroundImage: 'url(https://images.pexels.com/photos/39885412/pexels-photo-39885412.jpeg?auto=compress&cs=tinysrgb&h=650&w=940)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-950" />

      {/* Halo lumineux */}
      <div className="absolute -top-32 -right-32 w-[32rem] h-[32rem] rounded-full bg-primary-500/15 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
        <div className="max-w-3xl">
          {/* Badge terminal — clin d'œil boot screen */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-950/60 px-4 py-1.5 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span className="font-mono text-xs text-primary-300 tracking-wider uppercase">
              FlamOfreparation OS — en ligne
            </span>
          </div>

          {/* Titre géant */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight animate-slide-up">
            Réparez
            <span className="text-primary-400"> tout</span>,
            <br />
            apprenez
            <span className="relative inline-block">
              ensemble
              <span className="absolute -bottom-1 left-0 w-full h-1.5 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full" aria-hidden="true" />
            </span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-xl animate-fade-in" style={{ animationDelay: '0.15s' }}>
            La plus grande plateforme francophone de réparation. Des milliers de tutoriels gratuits, une communauté passionnée, une boutique de pièces et d'outils.
          </p>

          {/* Recherche */}
          <form onSubmit={handleSubmit} className="mt-10 relative max-w-xl animate-fade-in" style={{ animationDelay: '0.25s' }} role="search">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher : iPhone, PS5, lave-linge..."
              aria-label="Rechercher un tutoriel"
              className="w-full rounded-full border-0 bg-white/10 backdrop-blur-md border border-white/20 py-4 pl-12 pr-28 text-sm text-white placeholder:text-slate-400 shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary-400/30 focus:border-primary-400/50"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2.5 px-5 text-sm">
              Rechercher <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Tags populaires */}
          <div className="mt-6 flex flex-wrap gap-2 animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <span className="text-sm text-slate-500 self-center font-mono">POPULAIRE:</span>
            {POPULAR_TAGS.map((tag) => (
              <Link
                key={tag}
                to={`/tutoriels?q=${encodeURIComponent(tag)}`}
                className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm text-slate-300 hover:border-primary-400/50 hover:text-primary-300 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
