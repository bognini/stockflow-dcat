'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';

type Category = {
  id: string;
  nom: string;
  _count: { produits: number };
};

type Marque = {
  id: string;
  nom: string;
  _count: { produits: number };
};

type ProductFiltersProps = {
  categories: Category[];
  marques: Marque[];
  selectedCategorieId?: string;
  selectedMarqueId?: string;
};

export default function ProductFilters({
  categories,
  marques,
  selectedCategorieId,
  selectedMarqueId,
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="lg:w-64 flex-shrink-0">
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full flex items-center justify-between bg-white rounded-lg shadow-sm p-4 mb-4"
      >
        <span className="flex items-center gap-2 font-semibold">
          <Filter className="h-5 w-5" />
          Filtres
        </span>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {/* Filters content */}
      <div className={`bg-white rounded-lg shadow-sm p-4 sticky top-24 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        <h2 className="font-semibold mb-4 hidden lg:block">Filtres</h2>

        {/* Categories */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Catégories</h3>
          <ul className="space-y-1">
            <li>
              <a
                href="/produits"
                className={`block py-1 text-sm ${!selectedCategorieId ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Toutes les catégories
              </a>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <a
                  href={`/produits?categorie=${cat.id}`}
                  className={`block py-1 text-sm ${selectedCategorieId === cat.id ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {cat.nom} ({cat._count.produits})
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Marques */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Marques</h3>
          <ul className="space-y-1">
            {marques.map((marque) => (
              <li key={marque.id}>
                <a
                  href={`/produits?marque=${marque.id}${selectedCategorieId ? `&categorie=${selectedCategorieId}` : ''}`}
                  className={`block py-1 text-sm ${selectedMarqueId === marque.id ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {marque.nom} ({marque._count.produits})
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
