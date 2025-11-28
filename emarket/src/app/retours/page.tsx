import { RotateCcw, Shield, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Retours et Remboursements - DCAT E-Market',
  description: 'Politique de retours et remboursements de DCAT E-Market.',
};

export default function RetoursPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <RotateCcw className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Retours et Remboursements</h1>
        <p className="text-xl text-gray-600">
          Votre satisfaction est notre priorité
        </p>
      </div>

      {/* Key Points */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 mb-2">7 jours</h3>
          <p className="text-gray-600 text-sm">Pour retourner un produit après réception</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 mb-2">Garantie constructeur</h3>
          <p className="text-gray-600 text-sm">Tous nos produits sont garantis</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <RotateCcw className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 mb-2">Échange ou remboursement</h3>
          <p className="text-gray-600 text-sm">Selon votre préférence</p>
        </div>
      </div>

      {/* Return Policy */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Conditions de retour</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Produits éligibles au retour
            </h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-7">
              <li>Produit non utilisé et dans son emballage d&apos;origine</li>
              <li>Tous les accessoires et documentations inclus</li>
              <li>Retour demandé dans les 7 jours suivant la réception</li>
              <li>Preuve d&apos;achat (facture ou bon de commande)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Produits non éligibles
            </h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-7">
              <li>Produits personnalisés ou sur mesure</li>
              <li>Logiciels et licences activés</li>
              <li>Produits endommagés par le client</li>
              <li>Produits sans emballage d&apos;origine</li>
              <li>Consommables (câbles ouverts, piles, etc.)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Process */}
      <div className="bg-gray-50 rounded-xl p-8 mb-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Comment effectuer un retour ?</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Contactez notre service client</h3>
              <p className="text-gray-600">Envoyez un email à <a href="mailto:sales@dcat.ci" className="text-blue-600 hover:underline">sales@dcat.ci</a> avec votre numéro de commande et le motif du retour.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Recevez l&apos;autorisation de retour</h3>
              <p className="text-gray-600">Nous vous enverrons un numéro d&apos;autorisation de retour et les instructions.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Expédiez le produit</h3>
              <p className="text-gray-600">Emballez soigneusement le produit et envoyez-le à l&apos;adresse indiquée.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Traitement du retour</h3>
              <p className="text-gray-600">Après vérification, nous procédons à l&apos;échange ou au remboursement sous 5-7 jours ouvrés.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Info */}
      <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Remboursements</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-gray-600">
              Les remboursements sont effectués via le même mode de paiement utilisé lors de l&apos;achat.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-gray-600">
              Les frais de livraison initiaux ne sont pas remboursés, sauf en cas d&apos;erreur de notre part.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-gray-600">
              Les frais de retour sont à la charge du client, sauf si le produit est défectueux ou non conforme.
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            <strong>Besoin d&apos;aide ?</strong> Contactez notre service client à{' '}
            <a href="mailto:sales@dcat.ci" className="underline">sales@dcat.ci</a> ou visitez notre{' '}
            <a href="/contact" className="underline">page de contact</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
