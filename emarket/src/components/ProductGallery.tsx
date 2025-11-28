'use client';

import { useState } from 'react';
import type { ProduitImage } from '@prisma/client';

type ProductGalleryProps = {
  images: ProduitImage[];
  productName: string;
};

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">Aucune image disponible</span>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/images/${selectedImage.id}`}
          alt={`${productName} - Image ${selectedIndex + 1}`}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                index === selectedIndex ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/images/${image.id}`}
                alt={`${productName} - Miniature ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
