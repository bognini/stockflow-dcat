'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ProductForm } from '@/components/products/product-form';

export default function CreateProductPage() {
  const { user } = useAuth();

  if (!user || !['admin', 'technician'].includes(user.role)) {
    return (
        <Card className="flex flex-col items-center justify-center text-center p-10 min-h-[400px]">
            <CardHeader>
                <div className="mx-auto bg-destructive/10 p-4 rounded-full">
                    <ShieldAlert className="h-12 w-12 text-destructive" />
                </div>
                <CardTitle className="mt-6 font-headline text-destructive">Accès Restreint</CardTitle>
                <CardDescription className="mt-2 max-w-md">
                    Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
                </CardDescription>
            </CardHeader>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Créer une nouvelle référence produit</CardTitle>
        <CardDescription>
          Remplissez les informations ci-dessous pour ajouter un nouveau produit à votre inventaire.
        </CardDescription>
      </CardHeader>
      <div className="py-4">
        <ProductForm mode="create" title={undefined} />
      </div>
    </Card>
  );
}
