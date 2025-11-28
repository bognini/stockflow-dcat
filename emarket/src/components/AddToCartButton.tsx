'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Check } from 'lucide-react';

type AddToCartButtonProps = {
  product: {
    id: string;
    name: string;
    price: number;
    promoPrice: number | null;
    imageUrl: string | null;
    maxQuantity: number;
  };
  disabled?: boolean;
  className?: string;
};

export default function AddToCartButton({ product, disabled, className }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      promoPrice: product.promoPrice,
      imageUrl: product.imageUrl,
      maxQuantity: product.maxQuantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || added}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      {added ? (
        <>
          <Check className="h-5 w-5" />
          Ajouté !
        </>
      ) : (
        <>
          <ShoppingCart className="h-5 w-5" />
          Ajouter au panier
        </>
      )}
    </button>
  );
}
