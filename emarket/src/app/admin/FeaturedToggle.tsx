'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

type FeaturedToggleProps = {
  productId: string;
  initialValue: boolean;
};

export default function FeaturedToggle({ productId, initialValue }: FeaturedToggleProps) {
  const [isFeatured, setIsFeatured] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/toggle-featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, isFeatured: !isFeatured }),
      });

      if (response.ok) {
        setIsFeatured(!isFeatured);
      }
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-2 rounded-lg transition-colors ${
        isFeatured
          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isFeatured ? 'En vedette - Cliquer pour retirer' : 'Non vedette - Cliquer pour mettre en avant'}
    >
      <Star className={`h-4 w-4 ${isFeatured ? 'fill-current' : ''}`} />
    </button>
  );
}
