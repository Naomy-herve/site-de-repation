import { Link } from 'react-router-dom';
import { useCart } from '@/lib/cart';
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight, Minus, Plus, Truck, Shield, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/format';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalCount, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="pt-16 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-slate-300" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Votre panier est vide</h1>
          <p className="mt-2 text-sm text-slate-500">Parcourez la boutique pour trouver les pièces et outils dont vous avez besoin.</p>
          <Link to="/boutique" className="mt-6 inline-flex items-center gap-2 btn-primary">
            Visiter la boutique
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-display text-3xl font-bold text-slate-900">Panier</h1>
          <p className="mt-2 text-slate-500">{totalCount} article{totalCount > 1 ? 's' : ''} dans votre panier</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.product.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-4">
                <Link to={`/boutique/${item.product.slug}`} className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  {item.product.image_url && (
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/boutique/${item.product.slug}`} className="font-display font-semibold text-slate-900 text-sm hover:text-primary-600 transition-colors line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-primary-700 font-bold mt-1">{formatPrice(item.product.price)}</p>
                  {item.product.compatibility && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">Compatible : {item.product.compatibility}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center rounded-full border border-slate-200">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 text-sm font-semibold text-slate-700 min-w-[1.5rem] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Retirer
                  </button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-4">
              <Link to="/boutique" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600">
                <ArrowLeft className="w-4 h-4" /> Continuer mes achats
              </Link>
              <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 transition-colors">
                Vider le panier
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sticky top-24">
              <h2 className="font-display font-semibold text-slate-900 text-base mb-4">Récapitulatif</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Livraison</span>
                  <span className="font-medium text-green-600">{totalPrice >= 50 ? 'Offerte' : formatPrice(4.90)}</span>
                </div>
                {totalPrice < 50 && (
                  <p className="text-xs text-amber-600 pt-1">Plus que {formatPrice(50 - totalPrice)} pour la livraison offerte !</p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-baseline">
                <span className="font-display font-semibold text-slate-900">Total</span>
                <span className="font-display text-2xl font-bold text-primary-700">
                  {formatPrice(totalPrice + (totalPrice >= 50 ? 0 : 4.90))}
                </span>
              </div>
              <button className="w-full btn-primary mt-5 py-3.5">
                <CheckCircle2 className="w-4 h-4" /> Passer commande
              </button>

              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Truck className="w-4 h-4 text-primary-500" /> Livraison en 48h
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Shield className="w-4 h-4 text-primary-500" /> Paiement sécurisé
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-primary-500" /> Retour gratuit sous 30 jours
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
