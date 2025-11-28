import { Truck, Clock, MapPin, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Livraison - DCAT E-Market',
  description: 'Informations sur nos options de livraison en Côte d\'Ivoire.',
};

export default function LivraisonPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <Truck className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Livraison</h1>
        <p className="text-xl text-gray-600">
          Nous livrons dans toute la Côte d&apos;Ivoire
        </p>
      </div>

      {/* Delivery Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Livraison Standard</h3>
          <p className="text-gray-600 text-sm mb-4">Abidjan et environs</p>
          <p className="text-2xl font-bold text-blue-600">2-3 jours</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Livraison Express</h3>
          <p className="text-gray-600 text-sm mb-4">Abidjan uniquement</p>
          <p className="text-2xl font-bold text-green-600">24-48h</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Livraison Nationale</h3>
          <p className="text-gray-600 text-sm mb-4">Toute la Côte d&apos;Ivoire</p>
          <p className="text-2xl font-bold text-purple-600">5-7 jours</p>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Comment ça marche ?</h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Passez votre commande</h3>
              <p className="text-gray-600">Ajoutez vos produits au panier et soumettez votre demande de devis.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Confirmation et paiement</h3>
              <p className="text-gray-600">Notre équipe vous contacte pour confirmer votre commande et les modalités de paiement.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Préparation</h3>
              <p className="text-gray-600">Votre commande est préparée et emballée avec soin dans nos locaux.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Livraison</h3>
              <p className="text-gray-600">Votre commande est livrée à l&apos;adresse indiquée. Vous êtes informé par SMS/email.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-gray-50 rounded-xl p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tarifs de livraison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Zone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Délai</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Tarif</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4">Abidjan (communes)</td>
                <td className="py-3 px-4">24-48h</td>
                <td className="py-3 px-4 text-right font-semibold">2 000 - 5 000 FCFA</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Banlieue d&apos;Abidjan</td>
                <td className="py-3 px-4">2-3 jours</td>
                <td className="py-3 px-4 text-right font-semibold">5 000 - 10 000 FCFA</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Villes principales (Bouaké, Yamoussoukro...)</td>
                <td className="py-3 px-4">3-5 jours</td>
                <td className="py-3 px-4 text-right font-semibold">10 000 - 20 000 FCFA</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Autres régions</td>
                <td className="py-3 px-4">5-7 jours</td>
                <td className="py-3 px-4 text-right font-semibold">Sur devis</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          * Les tarifs peuvent varier selon le poids et le volume des produits. 
          Livraison gratuite à Abidjan pour les commandes supérieures à 500 000 FCFA.
        </p>
      </div>
    </div>
  );
}
