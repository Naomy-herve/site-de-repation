import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import supabase from '@/lib/supabase';
import type { Tutorial, Category, Difficulty } from '@/lib/types';
import { sanitizeSearch } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import Reveal from '@/components/Reveal';
import TutorialCard from '@/components/TutorialCard';
import Spinner from '@/components/Spinner';

export default function TutorialsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('cat') || '');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'views');
  const [showFilters, setShowFilters] = useState(false);

  // Débounce : la requête Supabase part 350 ms après la dernière frappe
  const debouncedQuery = useDebouncedValue(query, 350);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('categories').select('*').order('display_order');
      setCategories(data as Category[] || []);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const safeQuery = sanitizeSearch(debouncedQuery);
      let q = supabase.from('tutorials').select('*, category:categories(*), device:devices(*)').eq('published', true);
      if (safeQuery) q = q.or(`title.ilike.%${safeQuery}%,summary.ilike.%${safeQuery}%`);
      if (selectedCat) q = q.eq('category_id', selectedCat);
      if (difficulty) q = q.eq('difficulty', difficulty);
      if (sortBy === 'views') q = q.order('views', { ascending: false });
      else if (sortBy === 'recent') q = q.order('created_at', { ascending: false });
      else if (sortBy === 'time') q = q.order('time_minutes', { ascending: true });
      const { data } = await q.limit(24);
      setTutorials(data as Tutorial[] || []);
      setLoading(false);
    })();
  }, [debouncedQuery, selectedCat, difficulty, sortBy]);

  const updateSearch = (val: string) => {
    setQuery(val);
    const params = new URLSearchParams(searchParams);
    if (val) params.set('q', val); else params.delete('q');
    setSearchParams(params);
  };

  const difficulties: (Difficulty | '')[] = ['', 'Facile', 'Modérée', 'Difficile', 'Très difficile'];

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-primary-600 mb-2">
            {'// '}63 548 TUTORIELS GRATUITS
          </p>
          <h1 className="font-display text-3xl font-bold text-slate-900">Tutoriels de réparation</h1>
          <p className="mt-2 text-slate-500">Explorez plus de 63 000 guides de réparation gratuits</p>
          <div className="mt-6 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => updateSearch(e.target.value)}
              placeholder="Rechercher un tutoriel..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary-400 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-64 shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-slate-200 mb-4"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <SlidersHorizontal className="w-4 h-4" /> Filtres
              </span>
              <Filter className="w-4 h-4 text-slate-400" />
            </button>

            <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80">
                <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Catégorie</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCat('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCat ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    Toutes les catégories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCat(c.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCat === c.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80">
                <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Difficulté</h3>
                <div className="space-y-1">
                  {difficulties.map((d) => (
                    <button
                      key={d || 'all'}
                      onClick={() => setDifficulty(d)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${difficulty === d ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {d || 'Toutes les difficultés'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                {loading ? 'Chargement...' : `${tutorials.length} tutoriel${tutorials.length > 1 ? 's' : ''} trouvé${tutorials.length > 1 ? 's' : ''}`}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-primary-400"
              >
                <option value="views">Plus populaires</option>
                <option value="recent">Plus récents</option>
                <option value="time">Plus rapides</option>
              </select>
            </div>

            {loading ? (
              <Spinner label="Chargement des tutoriels..." />
            ) : tutorials.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-display font-semibold text-slate-900 text-lg">Aucun tutoriel trouvé</h3>
                <p className="mt-2 text-sm text-slate-500">Essayez de modifier vos critères de recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {tutorials.map((t, i) => (
                  <Reveal key={t.id} delay={Math.min(i * 60, 480)}>
                    <TutorialCard tutorial={t} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
