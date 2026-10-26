import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingBag, ChevronRight, CheckCircle2, Truck, Shield, ArrowLeft, Minus, Plus } from 'lucide-react';
import supabase from '@/lib/supabase';
import type { Product, ProductCategory } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/lib/cart';
import ProductCard from '@/components/ProductCard';
import Spinner from '@/components/Spinner';

const categoryLabels: Record<ProductCategory, string> = {
  pieces: 'Pièces détachées',
  outils: 'Outils',
  kits: 'Kits de réparation',
};

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    (async () => {
      if (!slug) return;
      setLoading(true);
      setQty(1);
      setAdded(false);
      const { data: prod } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle();
      setProduct(prod as Product | null);
      if (prod) {
        const { data: rel } = await supabase
          .from('products')
          .select('*')
          .eq('category', prod.category)
          .neq('id', prod.id)
          .order('rating', { ascending: false })
          .limit(4);
        setRelated(rel as Product[] || []);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="pt-16"><Spinner /></div>;

  if (!product) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-slate-900">Produit introuvable</h1>
          <Link to="/boutique" className="mt-4 inline-flex items-center gap-2 text-primary-600">
            <ArrowLeft className="w-4 h-4" /> Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link to="/" className="hover:text-primary-600">Accueil</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/boutique" className="hover:text-primary-600">Boutique</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700 truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
            <div className="aspect-square overflow-hidden bg-slate-100">
              {product.image_url && (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" fetchPriority="high" />
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <span className="badge bg-primary-50 text-primary-700">{categoryLabels[product.category]}</span>
            <h1 className="mt-3 font-display text-3xl font-bold text-slate-900 leading-tight">{product.name}</h1>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1" aria-label={`Note ${product.rating.toFixed(1)} sur 5`}>
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} aria-hidden="true" />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-700">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-slate-400">({product.reviews_count} avis)</span>
            </div>
            <p className="mt-5 text-2xl font-bold text-primary-700">{formatPrice(product.price)}</p>

            {product.description && <p className="mt-4 text-slate-600 leading-relaxed">{product.description}</p>}

            <div className="mt-6 flex items-center gap-3">
              {product.stock > 0 ? (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> En stock ({product.stock} unités)
                </span>
              ) : (
                <span className="text-sm text-red-500 font-medium">Rupture de stock</span>
              )}
            </div>

            {/* Quantity + Add to cart */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-full border border-slate-200 bg-white">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-3 text-slate-400 hover:text-primary-600 transition-colors"
                  aria-label="Diminuer la quantité"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 text-sm font-semibold text-slate-700 min-w-[2rem] text-center" aria-live="polite">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="p-3 text-slate-400 hover:text-primary-600 transition-colors"
                  aria-label="Augmenter la quantité"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  addToCart(product, qty);
                  setAdded(true);
                  setTimeout(() => setAdded(false), 1500);
                }}
                disabled={product.stock === 0}
                className="flex-1 btn-primary py-3 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" /> {added ? 'Ajouté ✓' : 'Ajouter au panier'}
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: 'Livraison 48h' },
                { icon: Shield, label: 'Paiement sécurisé' },
                { icon: CheckCircle2, label: 'Retour 30 jours' },
              ].map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={i} className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Icon className="w-5 h-5 text-primary-500" aria-hidden="true" />
                    <span className="text-xs font-medium text-slate-600">{b.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-6">Produits similaires</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
