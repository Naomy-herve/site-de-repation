import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';
import supabase from '@/lib/supabase';
import type { Product, ProductCategory } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import Spinner from '@/components/Spinner';

const categoryLabels: Record<string, string> = {
  pieces: 'Pièces détachées',
  outils: 'Outils',
  kits: 'Kits de réparation',
};

export default function StorePage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<ProductCategory | ''>(searchParams.get('cat') as ProductCategory | '' || '');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    (async () => {
      setLoading(true);
      let q = supabase.from('products').select('*');
      if (selectedCat) q = q.eq('category', selectedCat);
      if (query) q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      if (sortBy === 'rating') q = q.order('rating', { ascending: false });
      else if (sortBy === 'price_asc') q = q.order('price', { ascending: true });
      else if (sortBy === 'price_desc') q = q.order('price', { ascending: false });
      const { data } = await q;
      setProducts(data as Product[] || []);
      setLoading(false);
    })();
  }, [query, selectedCat, sortBy]);

  const categories: (ProductCategory | '')[] = ['', 'pieces', 'outils', 'kits'];

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-display text-3xl font-bold text-slate-900">Boutique</h1>
          <p className="mt-2 text-slate-500">Pièces détachées, outils et kits pour toutes vos réparations</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary-400 focus:bg-white transition-all"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-primary-400"
            >
              <option value="rating">Mieux notés</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((c) => (
            <button
              key={c || 'all'}
              onClick={() => setSelectedCat(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCat === c ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300'}`}
            >
              {c ? categoryLabels[c] : 'Tous les produits'}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner label="Chargement des produits..." />
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-slate-900 text-lg">Aucun produit trouvé</h3>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">{products.length} produit{products.length > 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
