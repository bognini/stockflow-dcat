import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">eMarket DCAT</h3>
            <p className="text-sm leading-relaxed">
              Votre boutique en ligne de confiance en Côte d&apos;Ivoire. 
              Produits de qualité, prix compétitifs et livraison rapide.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liens rapides</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/produits" className="hover:text-white transition-colors">
                  Tous les produits
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="hover:text-white transition-colors">
                  Promotions
                </Link>
              </li>
              <li>
                <Link href="/nouveautes" className="hover:text-white transition-colors">
                  Nouveautés
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="hover:text-white transition-colors">
                  À propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Service client</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Nous contacter
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/livraison" className="hover:text-white transition-colors">
                  Livraison
                </Link>
              </li>
              <li>
                <Link href="/retours" className="hover:text-white transition-colors">
                  Retours & Remboursements
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>Abidjan, Côte d&apos;Ivoire</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span>+225 XX XX XX XX XX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>contact@emarket.dcat.ci</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} eMarket DCAT. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
