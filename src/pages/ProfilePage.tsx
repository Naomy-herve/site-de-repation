import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench, BookOpen, Users, Award, LogOut, User as UserIcon, Edit3, ThumbsUp, AlertTriangle } from 'lucide-react';
import supabase from '@/lib/supabase';
import type { Tutorial, CommunitySolution } from '@/lib/types';
import { formatDate, formatNumber } from '@/lib/format';
import Spinner from '@/components/Spinner';

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  reputation: number;
  created_at: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState('');
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [solutions, setSolutions] = useState<CommunitySolution[]>([]);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/join?mode=login');
        return;
      }

      let prof = null as Profile | null;
      const { data: existing, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      if (profErr) {
        setProfileError('Impossible de charger votre profil : ' + profErr.message);
        setLoading(false);
        return;
      }
      prof = existing as Profile | null;

      // Profil manquant (ex. signup dont l'insert a échoué) : on tente de
      // le créer automatiquement depuis l'email, au lieu de renvoyer vers
      // /join — ce qui créait une boucle /join <-> /profil (JoinPage
      // redirige aussi vers /profil si une session existe).
      if (!prof) {
        const emailPrefix = (session.user.email || 'reparateur').split('@')[0].replace(/[^a-z0-9_-]/gi, '') || 'reparateur';
        const { data: created, error: createErr } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            username: `${emailPrefix}_${session.user.id.slice(0, 6)}`,
            display_name: emailPrefix,
          })
          .select()
          .maybeSingle();
        if (createErr) {
          setProfileError('Votre profil n\'a pas pu être créé : ' + createErr.message);
          setLoading(false);
          return;
        }
        prof = created as Profile | null;
      }

      setProfile(prof);
      setDisplayName(prof?.display_name || prof?.username || '');
      setBio(prof?.bio || '');

      const [tutRes, solRes] = await Promise.all([
        supabase.from('tutorials').select('*, category:categories(*), device:devices(*)').eq('author_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('community_solutions').select('*, device:devices(*)').eq('author_id', session.user.id).order('created_at', { ascending: false }),
      ]);
      setTutorials(tutRes.data as Tutorial[] || []);
      setSolutions(solRes.data as CommunitySolution[] || []);
      setLoading(false);
    })();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSave = async () => {
    if (!profile) return;
    await supabase.from('profiles').update({ display_name: displayName, bio }).eq('id', profile.id);
    setProfile({ ...profile, display_name: displayName, bio });
    setEditing(false);
  };

  if (loading) return <div className="pt-16"><Spinner label="Chargement du profil..." /></div>;

  if (profileError) {
    return (
      <div className="pt-16 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="font-display text-xl font-bold text-slate-900">Profil indisponible</h1>
          <p className="mt-2 text-sm text-slate-500">{profileError}</p>
          <button onClick={handleLogout} className="mt-5 btn-primary">
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const stats = [
    { icon: BookOpen, label: 'Tutoriels', value: tutorials.length },
    { icon: ThumbsUp, label: 'Solutions', value: solutions.length },
    { icon: Award, label: 'Réputation', value: profile.reputation },
  ];

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">{profile.display_name || profile.username}</h1>
                <p className="text-primary-200 text-sm">@{profile.username}</p>
                <p className="text-primary-300 text-xs mt-1">Membre depuis {formatDate(profile.created_at)}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3">
            {editing ? (
              <>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nom affiché" className="rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm text-white placeholder:text-primary-300 focus:outline-none focus:ring-2 focus:ring-white/30" />
                <button onClick={handleSave} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 transition-colors">Enregistrer</button>
                <button onClick={() => setEditing(false)} className="rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors">Annuler</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors">
                <Edit3 className="w-4 h-4" /> Modifier le profil
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/80 text-center">
                <Icon className="w-6 h-6 text-primary-500 mx-auto mb-2" />
                <div className="font-display text-2xl font-bold text-slate-900">{s.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            );
          })}
        </div>

        {editing && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 mb-8">
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Parlez de vos compétences en réparation..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:border-primary-400 focus:bg-white transition-all" />
          </div>
        )}

        {!editing && profile.bio && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 mb-8">
            <p className="text-sm text-slate-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* My tutorials */}
        <h2 className="font-display text-xl font-bold text-slate-900 mb-4">Mes tutoriels</h2>
        {tutorials.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center mb-8">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Vous n'avez pas encore publié de tutoriel.</p>
            <Link to="/guide-creation" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700">
              Créer un tutoriel
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {tutorials.map((t) => (
              <Link key={t.id} to={`/tutoriel/${t.slug}`} className="card group flex gap-3 p-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  {t.image_url && <img src={t.image_url} alt={t.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-slate-900 text-sm group-hover:text-primary-600 transition-colors line-clamp-2">{t.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{formatNumber(t.views)} vues</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* My solutions */}
        <h2 className="font-display text-xl font-bold text-slate-900 mb-4">Mes solutions communautaires</h2>
        {solutions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Vous n'avez pas encore partagé de solution.</p>
            <Link to="/communaute" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700">
              Voir les solutions de la communauté
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {solutions.map((s) => (
              <div key={s.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <ThumbsUp className="w-5 h-5 text-primary-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-slate-900 text-sm">{s.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.content}</p>
                    <p className="text-xs text-slate-400 mt-1">{s.upvotes} votes utiles</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
