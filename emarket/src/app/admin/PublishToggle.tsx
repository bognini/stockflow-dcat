'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PublishToggleProps = {
  productId: string;
  initialValue: boolean;
};

export default function PublishToggle({ productId, initialValue }: PublishToggleProps) {
  const [isPublished, setIsPublished] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/toggle-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, isPublished: !isPublished }),
      });

      if (response.ok) {
        setIsPublished(!isPublished);
      }
    } catch (error) {
      console.error('Failed to toggle publish:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-2 rounded-lg transition-colors ${
        isPublished
          ? 'bg-green-100 text-green-600 hover:bg-green-200'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isPublished ? 'Publié - Cliquer pour masquer' : 'Masqué - Cliquer pour publier'}
    >
      {isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </button>
  );
}
