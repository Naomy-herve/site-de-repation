import { useState, useEffect } from 'react';
import { Cookie, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('flam_cookie_consent');
    if (!consent) {
      setTimeout(() => setVisible(true), 1500);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('flam_cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('flam_cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] animate-slide-up">
      <div className="mx-auto max-w-3xl m-4 p-5 rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-slate-900 text-sm">Nous respectons votre vie privée</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Nous utilisons uniquement des cookies strictement nécessaires au fonctionnement du site. Aucun cookie marketing ou publicitaire n'est déposé sans votre consentement. Consultez notre{' '}
              <Link to="/confidentialite" className="text-primary-600 hover:underline">politique de confidentialité</Link>.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button onClick={handleAccept} className="btn-primary py-2 px-4 text-xs">
                <Check className="w-3.5 h-3.5" /> Accepter
              </button>
              <button onClick={handleDecline} className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors">
                Refuser
              </button>
            </div>
          </div>
          <button onClick={handleDecline} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
