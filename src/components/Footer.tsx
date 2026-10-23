import { Link } from 'react-router-dom';
import { Wrench, Mail, Twitter, Youtube, Instagram, Facebook } from 'lucide-react';

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
      { to: '/blog/droit-reparation-2026', label: 'Droit à la réparation' },
      { to: '/guide-creation', label: 'Créer un tutoriel' },
      { to: '/aide', label: 'Aide & FAQ' },
    ],
  };

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
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
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Icon className="w-4 h-4 text-slate-400" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-white text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="text-sm text-slate-400 hover:text-primary-400 transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2026 FlamOfreparation. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/conditions" className="text-xs text-slate-500 hover:text-primary-400 transition-colors">Conditions d'utilisation</Link>
            <Link to="/confidentialite" className="text-xs text-slate-500 hover:text-primary-400 transition-colors">Confidentialité</Link>
            <a href="mailto:contact@flameofreparation.com" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary-400 transition-colors">
              <Mail className="w-3.5 h-3.5" />
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
