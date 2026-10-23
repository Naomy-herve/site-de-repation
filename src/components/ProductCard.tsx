import { Link } from 'react-router-dom';
import { Star, ShoppingBag } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/format';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/boutique/${product.slug}`} className="card group overflow-hidden block">
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-slate-300" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-semibold text-slate-700">{product.rating.toFixed(1)}</span>
        </div>
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute bottom-3 left-3">
            <span className="badge bg-accent-100 text-accent-700">Plus que {product.stock}!</span>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
            <span className="badge bg-white text-slate-700">Rupture de stock</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-slate-900 text-sm leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-primary-700">{formatPrice(product.price)}</span>
          <span className="text-xs text-slate-400">{product.reviews_count} avis</span>
        </div>
      </div>
    </Link>
  );
}
