import { Link } from 'react-router-dom';
import { Wrench, Mail, Twitter, Youtube, Instagram, Facebook, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const links = {
    Communauté: [
      { to: '/tutoriels', label: 'Tutoriels' },
      { to: '/appareils', label: 'Appareils' },
      { to: '/communaute', label: 'Solutions communautaires' },
      { to: '/join', label: 'Créer un compte' },
    ],
    Boutique: [
      { to: '/boutique', label: 'Tous les produits' },
      { to: '/boutique?cat=pieces', label: 'Pièces détachées' },
      { to: '/boutique?cat=outils', label: 'Outils' },
      { to: '/boutique?cat=kits', label: 'Kits de réparation' },
    ],
    'À propos': [
      { to: '/blog', label: 'Blog & actualités' },
      { to: '/guide-creation', label: 'Créer un tutoriel' },
      { to: '/conditions', label: 'Conditions d\'utilisation' },
      { to: '/confidentialite', label: 'Confidentialité' },
    ],
  };

  return (
    <footer className="relative bg-slate-950 text-slate-300 overflow-hidden">
      {/* Grain subtil */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-lg text-white">
                Flam<span className="text-primary-400">O</span>freparation
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              La plateforme collaborative francophone de réparation. Réparons ensemble, pour un monde plus durable.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Twitter, Youtube, Instagram, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Réseau social (bientôt disponible)"
                  className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-primary-500 mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="group inline-flex items-center gap-1 text-sm text-slate-400 hover:text-primary-400 transition-colors">
                      {item.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Barre terminal du bas */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-slate-500">
            <span className="text-primary-500">© 2026</span> FlamOfreparation — Tous droits réservés.
          </p>
          <p className="font-mono text-xs text-slate-600 hidden sm:block">
            MADE WITH <span className="text-accent-400">WRENCHES</span> IN FRANCE
          </p>
          <div className="flex items-center gap-6">
            <Link to="/conditions" className="text-xs text-slate-500 hover:text-primary-400 transition-colors">Conditions d'utilisation</Link>
            <Link to="/confidentialite" className="text-xs text-slate-500 hover:text-primary-400 transition-colors">Conditions d'utilisation</Link>
            <a href="mailto:contact@flameofreparation.com" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary-400 transition-colors">
              <Mail className="w-3.5 h-3.5" />
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
