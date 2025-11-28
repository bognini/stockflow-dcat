import { HelpCircle, ChevronDown } from 'lucide-react';

export const metadata = {
  title: 'FAQ - DCAT E-Market',
  description: 'Questions fréquemment posées sur nos produits et services.',
};

const faqs = [
  {
    question: 'Comment passer une commande ?',
    answer: 'Parcourez notre catalogue, ajoutez les produits souhaités à votre panier, puis remplissez le formulaire de demande de devis. Notre équipe commerciale vous contactera rapidement avec une offre personnalisée.',
  },
  {
    question: 'Quels sont les modes de paiement acceptés ?',
    answer: 'Nous acceptons les paiements par virement bancaire, Mobile Money (Orange Money, MTN Money, Wave), et espèces à la livraison pour certaines commandes. Les détails de paiement vous seront communiqués lors de la confirmation de votre devis.',
  },
  {
    question: 'Proposez-vous des garanties sur vos produits ?',
    answer: 'Oui, tous nos produits bénéficient d\'une garantie constructeur. La durée varie selon le type de produit (généralement de 1 à 3 ans). Les conditions de garantie sont précisées sur chaque fiche produit.',
  },
  {
    question: 'Livrez-vous dans toute la Côte d\'Ivoire ?',
    answer: 'Oui, nous livrons dans toute la Côte d\'Ivoire. Les délais et frais de livraison varient selon votre localisation. La livraison est gratuite à Abidjan pour les commandes supérieures à un certain montant.',
  },
  {
    question: 'Puis-je retourner un produit ?',
    answer: 'Oui, vous disposez de 7 jours après réception pour retourner un produit non utilisé dans son emballage d\'origine. Consultez notre politique de retours pour plus de détails.',
  },
  {
    question: 'Proposez-vous des services d\'installation ?',
    answer: 'Oui, notre équipe technique peut assurer l\'installation et la mise en service de vos équipements audiovisuels, informatiques, domotiques et solaires. Ce service est disponible sur devis.',
  },
  {
    question: 'Comment suivre ma commande ?',
    answer: 'Après validation de votre commande, vous recevrez un email de confirmation avec un numéro de suivi. Vous pouvez également nous contacter directement pour connaître l\'état de votre commande.',
  },
  {
    question: 'Proposez-vous des produits sur mesure ?',
    answer: 'Oui, nous sommes spécialisés dans les solutions sur mesure. Contactez-nous avec votre projet et notre équipe technique vous proposera une solution adaptée à vos besoins.',
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <HelpCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Foire Aux Questions</h1>
        <p className="text-xl text-gray-600">
          Trouvez rapidement les réponses à vos questions
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="bg-white rounded-xl shadow-sm group"
          >
            <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
              <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
              <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-6 pb-6 pt-0">
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">
          Vous n&apos;avez pas trouvé la réponse à votre question ?
        </p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Contactez-nous
        </a>
      </div>
    </div>
  );
}
