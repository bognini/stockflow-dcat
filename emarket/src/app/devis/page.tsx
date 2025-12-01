'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/types';
import { ArrowLeft, Send, CheckCircle, ShoppingBag, Smartphone, CreditCard, Building2, Truck } from 'lucide-react';

const paymentLabels: Record<string, { name: string; icon: typeof Smartphone; color: string }> = {
  cod: { name: 'Paiement à la livraison', icon: Truck, color: 'text-emerald-600' },
  orange: { name: 'Orange Money', icon: Smartphone, color: 'text-orange-500' },
  mtn: { name: 'MTN MoMo', icon: Smartphone, color: 'text-yellow-500' },
  wave: { name: 'Wave', icon: Smartphone, color: 'text-blue-400' },
  card: { name: 'Carte bancaire', icon: CreditCard, color: 'text-gray-600' },
  virement: { name: 'Virement bancaire', icon: Building2, color: 'text-green-600' },
};

type FormData = {
  nom: string;
  email: string;
  telephone: string;
  entreprise: string;
  message: string;
};

function DevisContent() {
  const searchParams = useSearchParams();
  const paymentMethod = searchParams.get('payment') || '';
  const { items, subtotal, itemCount, clearCart } = useCart();
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    email: '',
    telephone: '',
    entreprise: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nom.trim() || !formData.telephone.trim()) {
      setError('Veuillez remplir les champs obligatoires.');
      return;
    }

    if (items.length === 0) {
      setError('Votre panier est vide.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          paymentMethod: paymentMethod || 'non spécifié',
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.promoPrice ?? item.price,
            quantity: item.quantity,
          })),
          subtotal,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de la demande');
      }

      setIsSubmitted(true);
      clearCart();
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Votre panier est vide</h1>
          <p className="text-gray-600 mb-6">
            Ajoutez des produits à votre panier avant de demander un devis
          </p>
          <Link
            href="/produits"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Voir les produits
          </Link>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Demande envoyée !</h1>
          <p className="text-gray-600 mb-6">
            Merci pour votre demande de devis. Notre équipe vous contactera dans les plus brefs délais.
          </p>
          <Link
            href="/produits"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Continuer vos achats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/panier"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au panier
      </Link>

      <h1 className="text-3xl font-bold mb-8">Demande de devis</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+225 XX XX XX XX XX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label htmlFor="entreprise" className="block text-sm font-medium text-gray-700 mb-1">
                  Entreprise
                </label>
                <input
                  type="text"
                  id="entreprise"
                  name="entreprise"
                  value={formData.entreprise}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom de votre entreprise"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message (optionnel)
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Précisions sur votre demande, délais souhaités..."
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                'Envoi en cours...'
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Envoyer la demande de devis
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Votre commande</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatPrice((item.promoPrice ?? item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total ({itemCount} article{itemCount > 1 ? 's' : ''})</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Hors frais de livraison
              </p>
            </div>

            {/* Payment method display */}
            {paymentMethod && paymentLabels[paymentMethod] && (
              <div className="border-t mt-4 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Mode de paiement</h3>
                <div className="flex items-center gap-2">
                  {(() => {
                    const PaymentIcon = paymentLabels[paymentMethod].icon;
                    return <PaymentIcon className={`h-5 w-5 ${paymentLabels[paymentMethod].color}`} />;
                  })()}
                  <span className="font-medium">{paymentLabels[paymentMethod].name}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DevisPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">Chargement...</div>
      </div>
    }>
      <DevisContent />
    </Suspense>
  );
}
