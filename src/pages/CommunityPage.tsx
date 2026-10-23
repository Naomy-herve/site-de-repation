import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ThumbsUp, Search, ArrowRight } from 'lucide-react';
import supabase from '@/lib/supabase';
import type { CommunitySolution, Device } from '@/lib/types';
import { formatNumber } from '@/lib/format';
import Spinner from '@/components/Spinner';

export default function CommunityPage() {
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<CommunitySolution[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('community_solutions')
        .select('*, device:devices(*)')
        .order('upvotes', { ascending: false })
        .limit(50);
      setSolutions(data as CommunitySolution[] || []);
      setLoading(false);
    })();
  }, []);

  const filtered = solutions.filter(s =>
    !query || s.title.toLowerCase().includes(query.toLowerCase()) || s.content.toLowerCase().includes(query.toLowerCase())
  );

  const totalUpvotes = solutions.reduce((sum, s) => sum + s.upvotes, 0);

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold">Solutions communautaires</h1>
          </div>
          <p className="text-primary-100 max-w-2xl">Des astuces et solutions partagées par la communauté FlamOfreparation. {formatNumber(totalUpvotes)} votes utiles au total.</p>

          <div className="mt-6 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-300" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une solution..."
              className="w-full rounded-full border-0 bg-white/10 backdrop-blur-md py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-primary-200 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <Spinner label="Chargement des solutions..." />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-slate-900 text-lg">Aucune solution trouvée</h3>
            <p className="mt-2 text-sm text-slate-500">Soyez le premier à partager une solution !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((s) => (
              <div key={s.id} className="card p-5 group">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary-600 transition-colors">
                      <ThumbsUp className="w-5 h-5" />
                      <span className="text-sm font-bold text-slate-700">{s.upvotes}</span>
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-slate-900 text-base group-hover:text-primary-600 transition-colors">{s.title}</h3>
                    {s.device && (
                      <Link to={`/tutoriels?cat=${s.device.category_id}`} className="text-xs text-primary-600 hover:underline mt-1 inline-block">
                        {s.device.name}
                      </Link>
                    )}
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-3">{s.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-slate-900 to-primary-900 rounded-3xl p-8 sm:p-12 text-center">
          <Users className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white">Vous avez une solution à partager ?</h2>
          <p className="mt-3 text-slate-400 max-w-lg mx-auto">Aidez des milliers de réparateurs en partageant votre astuce de réparation.</p>
          <Link to="/join" className="mt-6 inline-flex items-center gap-2 btn-accent">
            Rejoindre la communauté
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
