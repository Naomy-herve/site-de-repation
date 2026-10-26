import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Wrench, Mail, Lock, User, ArrowRight, CheckCircle2, Users, BookOpen, Award } from 'lucide-react';
import supabase from '@/lib/supabase';

export default function JoinPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'signup' | 'login'>(
    searchParams.get('mode') === 'login' ? 'login' : 'signup'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/profil');
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères.');
          setLoading(false);
          return;
        }
        // Le username est passé en métadonnées : le trigger SQL
        // on_auth_user_created le récupère via raw_user_meta_data->>'username'
        // pour créer la ligne profiles automatiquement.
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } },
        });
        if (signUpError) throw signUpError;

        if (data.user) {
          // Filet de sécurité : si le trigger SQL n'est pas encore installé,
          // on crée le profil côté client. upsert + onConflict id : pas
          // d'erreur de doublon si le trigger a déjà créé la ligne.
          const { error: profErr } = await supabase.from('profiles').upsert({
            id: data.user.id,
            username,
            display_name: username,
          }, { onConflict: 'id', ignoreDuplicates: true });
          if (profErr) {
            // Le compte auth existe mais le profil n'a pas été créé
            // (RLS, username dupliqué, etc.). On signale l'erreur et on
            // nettoie la session pour éviter un état incohérent.
            console.error('Création du profil échouée :', profErr.message);
            await supabase.auth.signOut();
            throw new Error(
              'Compte créé, mais la création du profil a échoué (' + profErr.message + '). Réessayez ou contactez le support.'
            );
          }
        }
        setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        setMode('login');
        setPassword('');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        navigate('/profil');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue';
      if (msg.includes('already')) setError('Un compte existe déjà avec cet email.');
      else if (msg.includes('credentials')) setError('Email ou mot de passe incorrect.');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: BookOpen, text: 'Accès à 63 548 tutoriels gratuits' },
    { icon: Users, text: 'Partagez vos solutions avec la communauté' },
    { icon: Award, text: 'Gagnez en réputation à chaque contribution' },
  ];

  return (
    <div className="pt-16 min-h-screen bg-slate-50 flex items-center justify-center py-12">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-white">
          {/* Left: benefits */}
          <div className="bg-gradient-to-br from-primary-700 to-primary-900 p-8 sm:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'url(https://images.pexels.com/photos/6963695/pexels-photo-6963695.jpeg?auto=compress&cs=tinysrgb&h=650&w=940)',
              backgroundSize: 'cover',
            }} />
            <div className="relative">
              <Link to="/" className="flex items-center gap-2.5 mb-8">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-display font-bold text-lg">Flam<span className="text-primary-300">O</span>freparation</span>
              </Link>
              <h2 className="font-display text-3xl font-bold leading-tight">Rejoignez 500 000+ réparateurs</h2>
              <p className="mt-4 text-primary-100 leading-relaxed">
                Créez un compte gratuit pour publier des tutoriels, partager des solutions et accéder à votre tableau de bord.
              </p>
              <div className="mt-8 space-y-4">
                {benefits.map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary-300" />
                      </div>
                      <span className="text-sm text-primary-100">{b.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="p-8 sm:p-12">
            <div className="flex rounded-full bg-slate-100 p-1 mb-8">
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${mode === 'signup' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'}`}
              >
                Créer un compte
              </button>
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${mode === 'login' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'}`}
              >
                Se connecter
              </button>
            </div>

            <h2 className="font-display text-2xl font-bold text-slate-900">
              {mode === 'signup' ? 'Créer votre compte' : 'Connexion'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === 'signup' ? "C'est gratuit et ça prend 30 secondes." : 'Bon retour parmi nous !'}
            </p>

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nom d'utilisateur</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="reparateur_pro"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary-400 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.fr"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary-400 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? '6 caractères minimum' : '••••••••'}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 disabled:opacity-50">
                {loading ? 'Chargement...' : mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              En créant un compte, vous acceptez nos{' '}
              <Link to="/conditions" className="text-primary-600 hover:underline">Conditions d'utilisation</Link>
              {' '}et notre{' '}
              <Link to="/confidentialite" className="text-primary-600 hover:underline">Politique de confidentialité</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
