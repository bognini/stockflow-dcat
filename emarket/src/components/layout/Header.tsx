'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, ShoppingCart, Menu, X, User } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'Tous les produits', href: '/produits' },
    { name: 'Promotions', href: '/promotions' },
    { name: 'Nouveautés', href: '/nouveautes' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-primary text-white text-sm py-2">
        <div className="container mx-auto px-4 text-center">
          🚚 Livraison gratuite à Abidjan pour les commandes de plus de 50 000 FCFA
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-primary">eMarket</span>
            <span className="text-sm text-gray-500 ml-1">DCAT</span>
          </Link>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/compte"
              className="hidden md:flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="text-sm">Compte</span>
            </Link>

            <Link
              href="/panier"
              className="relative flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-t border-gray-200">
        <div className="container mx-auto px-4">
          <ul className="hidden md:flex items-center gap-8 py-3">
            {categories.map((category) => (
              <li key={category.name}>
                <Link
                  href={category.href}
                  className="text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <ul className="py-2">
            {categories.map((category) => (
              <li key={category.name}>
                <Link
                  href={category.href}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li className="border-t border-gray-200 mt-2 pt-2">
              <Link
                href="/compte"
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mon compte
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
