'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/types';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Smartphone, CreditCard, Building2 } from 'lucide-react';
import { useState } from 'react';

const paymentMethods = [
  { id: 'orange', name: 'Orange Money', icon: Smartphone, color: 'text-orange-500' },
  { id: 'mtn', name: 'MTN MoMo', icon: Smartphone, color: 'text-yellow-500' },
  { id: 'wave', name: 'Wave', icon: Smartphone, color: 'text-blue-400' },
  { id: 'card', name: 'Carte bancaire', icon: CreditCard, color: 'text-gray-600' },
  { id: 'virement', name: 'Virement bancaire', icon: Building2, color: 'text-green-600' },
];

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, itemCount } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<string>('');

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Votre panier est vide</h1>
          <p className="text-gray-600 mb-6">
            Découvrez nos produits et ajoutez-les à votre panier
          </p>
          <Link
            href="/produits"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Voir les produits
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Votre panier</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Vider le panier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const displayPrice = item.promoPrice ?? item.price;
            const hasPromo = item.promoPrice !== null && item.promoPrice < item.price;

            return (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm p-4 flex gap-4"
              >
                {/* Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/produit/${item.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                  >
                    {item.name}
                  </Link>

                  {/* Price */}
                  <div className="mt-1">
                    {hasPromo ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-600">
                          {formatPrice(displayPrice)}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-gray-900">
                        {formatPrice(displayPrice)}
                      </span>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.maxQuantity}
                        className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Line total */}
                <div className="text-right">
                  <span className="font-bold text-gray-900">
                    {formatPrice(displayPrice * item.quantity)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Récapitulatif</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Sous-total ({itemCount} article{itemCount > 1 ? 's' : ''})
                </span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison</span>
                <span className="text-gray-500">À calculer</span>
              </div>
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Hors frais de livraison
              </p>
            </div>

            {/* Payment method selection */}
            <div className="border-t mt-4 pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Mode de paiement</h3>
              <div className="space-y-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPayment === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="sr-only"
                      />
                      <Icon className={`h-5 w-5 ${method.color}`} />
                      <span className="text-sm font-medium">{method.name}</span>
                      {selectedPayment === method.id && (
                        <span className="ml-auto text-blue-600">✓</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            <Link
              href={`/devis${selectedPayment ? `?payment=${selectedPayment}` : ''}`}
              className={`mt-6 w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                selectedPayment
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={(e) => {
                if (!selectedPayment) {
                  e.preventDefault();
                  alert('Veuillez sélectionner un mode de paiement');
                }
              }}
            >
              Demander un devis
              <ArrowRight className="h-5 w-5" />
            </Link>

            <p className="text-xs text-gray-500 text-center mt-4">
              Un conseiller vous contactera pour finaliser votre commande
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
