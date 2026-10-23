import { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import supabase from '@/lib/supabase';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .upsert({ email: email.trim() }, { onConflict: 'email' });
      if (error) throw error;
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 to-primary-900 overflow-hidden p-8 sm:p-12">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'url(https://images.pexels.com/photos/7048039/pexels-photo-7048039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940)',
          backgroundSize: 'cover',
        }} />
        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex w-10 h-10 rounded-xl bg-primary-500/20 items-center justify-center mb-4">
              <Mail className="w-5 h-5 text-primary-300" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">Restez informé</h2>
            <p className="mt-3 text-primary-100 text-sm leading-relaxed max-w-md">
              Recevez nos nouveaux tutoriels, actualités sur le droit à la réparation et offres exclusives sur la boutique. Désabonnement possible à tout moment.
            </p>
          </div>

          <div>
            {status === 'success' ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex items-center gap-3 animate-scale-in">
                <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
                <div>
                  <p className="font-semibold text-white text-sm">Inscription confirmée !</p>
                  <p className="text-primary-200 text-xs mt-0.5">Vous recevrez bientôt nos actualités.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.fr"
                    className="w-full rounded-full border-0 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-800 shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-400/30"
                  />
                </div>
                <button type="submit" disabled={status === 'loading'} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent-500 px-6 py-3.5 text-sm font-semibold text-white hover:bg-accent-600 disabled:opacity-50 transition-colors">
                  {status === 'loading' ? 'Inscription...' : "S'inscrire"}
                  {status !== 'loading' && <ArrowRight className="w-4 h-4" />}
                </button>
                {status === 'error' && (
                  <p className="text-xs text-red-300 text-center">Une erreur est survenue. Veuillez réessayer.</p>
                )}
                <p className="text-xs text-primary-300 text-center">
                  En vous inscrivant, vous acceptez de recevoir nos emails. Désabonnement en un clic.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
