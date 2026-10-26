import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ChevronRight, Wrench } from 'lucide-react';
import supabase from '@/lib/supabase';
import type { Device, Category } from '@/lib/types';
import { sanitizeSearch } from '@/lib/format';
import Spinner from '@/components/Spinner';

export default function DevicesPage() {
  const [searchParams] = useSearchParams();
  const catSlug = searchParams.get('cat') || '';
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [tutorialCounts, setTutorialCounts] = useState<Record<string, number>>({});
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('');

  useEffect(() => {
    (async () => {
      const { data: cats } = await supabase.from('categories').select('*').order('display_order');
      setCategories(cats as Category[] || []);
    })();
  }, []);

  useEffect(() => {
    if (catSlug) {
      const cat = categories.find(c => c.slug === catSlug);
      if (cat) setActiveCat(cat.id);
    }
  }, [catSlug, categories]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const safeQuery = sanitizeSearch(query);
      let q = supabase.from('devices').select('*, category:categories(*)');
      if (activeCat) q = q.eq('category_id', activeCat);
      if (safeQuery) q = q.or(`name.ilike.%${safeQuery}%,manufacturer.ilike.%${safeQuery}%`);
      const { data } = await q.order('name');
      const filtered = (data as Device[]) || [];
      setDevices(filtered);

      const counts: Record<string, number> = {};
      if (filtered.length > 0) {
        const { data: tuts } = await supabase.from('tutorials').select('device_id').in('device_id', filtered.map(d => d.id));
        (tuts || []).forEach((t: { device_id: string }) => {
          counts[t.device_id] = (counts[t.device_id] || 0) + 1;
        });
      }
      setTutorialCounts(counts);
      setLoading(false);
    })();
  }, [activeCat, query]);

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-display text-3xl font-bold text-slate-900">Appareils</h1>
          <p className="mt-2 text-slate-500">Trouvez votre appareil et accédez à tous les guides de réparation</p>
          <div className="mt-6 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un appareil ou une marque..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary-400 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCat('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!activeCat ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300'}`}
          >
            Tous
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCat === c.id ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300'}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner label="Chargement des appareils..." />
        ) : devices.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-slate-900 text-lg">Aucun appareil trouvé</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {devices.map((d) => {
              const count = tutorialCounts[d.id] || 0;
              return (
                <Link key={d.id} to={`/tutoriels?cat=${d.category_id}`} className="card group flex items-center gap-4 p-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                    {d.category?.image_url ? (
                      <img src={d.category.image_url} alt={d.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <Wrench className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {d.manufacturer && <span className="text-xs text-slate-400 font-medium">{d.manufacturer}</span>}
                    <h3 className="font-display font-semibold text-slate-900 text-base group-hover:text-primary-600 transition-colors truncate">{d.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{count} tutoriel{count > 1 ? 's' : ''}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
