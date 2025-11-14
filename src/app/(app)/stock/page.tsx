'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Search, ShieldAlert, Tag, Warehouse, Loader2, Info, Pencil } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Produit, Categorie, Emplacement } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Image from 'next/image';
import { ProductForm } from '@/components/products/product-form';

const getStatus = (quantity: number) => {
    if (quantity === 0) return { text: 'En rupture', color: 'bg-red-500', progress: 0, className: 'text-red-600' };
    if (quantity <= 2) return { text: 'Faible', color: 'bg-yellow-500', progress: (quantity / 10) * 100, className: 'text-yellow-600' };
    return { text: 'En stock', color: 'bg-green-500', progress: Math.min(100, (quantity / 10) * 100), className: 'text-green-600' };
};

const ProductCard = ({ produit }: { produit: Produit }) => {
    const status = getStatus(produit.quantite);
    return (
        <Card>
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="font-bold">{produit.modele.nom}</div>
                        <div className="text-sm text-muted-foreground">{produit.marque.nom}</div>
                    </div>
                     <Badge variant="outline" className="flex items-center justify-center gap-2 text-xs">
                        <span className={`h-2 w-2 rounded-full ${status.color}`} />
                        {status.text}
                    </Badge>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-2"><Tag className="w-4 h-4" /> Catégorie</span>
                        <Badge variant="secondary">{produit.modele.categorie.nom}</Badge>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-2"><Warehouse className="w-4 h-4" /> Emplacement</span>
                        <span>{produit.emplacement?.nom || 'N/A'}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><Package className="w-4 h-4" /> Quantité</span>
                        <span className={`font-bold text-lg ${status.className}`}>{produit.quantite}</span>
                    </div>
                </div>
                 <Progress value={status.progress} aria-label={`${status.progress}% en stock`} />
            </CardContent>
        </Card>
    )
}

export default function StockStatusPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [emplacements, setEmplacements] = useState<Emplacement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Produit | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const { user } = useAuth();


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [produitsRes, categoriesRes, emplacementsRes] = await Promise.all([
          fetch('/api/produits'),
          fetch('/api/settings/categories'),
          fetch('/api/settings/emplacements'),
        ]);

        const produitsData = await produitsRes.json();
        const categoriesData = await categoriesRes.json();
        const emplacementsData = await emplacementsRes.json();
        
        setProduits(produitsData);
        setCategories(categoriesData);
        setEmplacements(emplacementsData);

      } catch (error) {
        console.error("Failed to fetch stock data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProduits = useMemo(() => {
    return produits.filter(produit => {
      const searchMatch = searchTerm.trim() === '' ||
        produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produit.modele.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produit.marque.nom.toLowerCase().includes(searchTerm.toLowerCase());

      const categoryMatch = categoryFilter === 'all' || produit.modele.categorieId === categoryFilter;
      
      const locationMatch = locationFilter === 'all' || produit.emplacementId === locationFilter;

      return searchMatch && categoryMatch && locationMatch;
    });
  }, [produits, searchTerm, categoryFilter, locationFilter]);

  const canEdit = !!user && ['admin', 'commercial'].includes(user.role);

  const handleOpenDetail = async (produit: Produit) => {
    setDetailProduct(produit);
    setIsEditing(false);
    setDetailOpen(true);

    try {
      setDetailLoading(true);
      const res = await fetch(`/api/produits/${produit.id}`);
      if (!res.ok) {
        throw new Error('Impossible de charger les détails du produit.');
      }
      const freshProduit = await res.json();
      setDetailProduct(freshProduit);
    } catch (error) {
      console.error('Failed to load product detail', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateProduit = (updated: Produit) => {
    setProduits((prev: Produit[]) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setDetailProduct(updated);
  };
  
  if (!user || !['admin', 'marketing', 'technician'].includes(user.role)) {
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
  
  if (loading) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">État Actuel du Stock</CardTitle>
        <CardDescription>Consultez, recherchez et filtrez les produits de votre inventaire.</CardDescription>
        <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un produit..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto md:flex-1">
             <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                    <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.nom}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                    <SelectValue placeholder="Filtrer par emplacement" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tous les emplacements</SelectItem>
                    {emplacements.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.nom}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Responsive view: list of cards for mobile */}
        <div className="md:hidden space-y-4">
             {filteredProduits.length > 0 ? (
                filteredProduits.map((produit) => (
                    <div key={produit.id} className="space-y-3">
                      <ProductCard produit={produit} />
                      <Button variant="outline" className="w-full" onClick={() => handleOpenDetail(produit)}>
                        <Info className="h-4 w-4 mr-2" /> Voir les détails
                      </Button>
                    </div>
                ))
            ) : (
                <div className="text-center py-10 text-muted-foreground">
                    Aucun produit ne correspond à votre recherche.
                </div>
            )}
        </div>
      
        {/* Default view: table for larger screens */}
        <div className="hidden md:block">
          <ScrollArea className="w-full whitespace-nowrap">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Emplacement</TableHead>
                  <TableHead className="text-center">Quantité</TableHead>
                  <TableHead className="w-[200px]">Niveau de stock</TableHead>
                  <TableHead className="text-center">État</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProduits.length > 0 ? (
                  filteredProduits.map((produit) => {
                    const status = getStatus(produit.quantite);
                    return (
                      <TableRow key={produit.id} className="cursor-default">
                        <TableCell>
                          <div className="font-medium">{produit.modele.nom}</div>
                          <div className="text-sm text-muted-foreground">{produit.marque.nom}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{produit.modele.categorie.nom}</Badge>
                        </TableCell>
                        <TableCell>{produit.emplacement?.nom || 'N/A'}</TableCell>
                        <TableCell className="text-center font-bold">{produit.quantite}</TableCell>
                        <TableCell>
                           <Progress value={status.progress} aria-label={`${status.progress}% en stock`} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="flex items-center justify-center gap-2">
                             <span className={`h-2 w-2 rounded-full ${status.color}`} />
                             {status.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDetail(produit)}>
                            <Info className="h-4 w-4 mr-1" /> Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Aucun produit ne correspond à votre recherche.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </CardContent>
      <ProductDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        produit={detailProduct}
        canEdit={canEdit}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        onUpdated={handleUpdateProduit}
        loading={detailLoading}
      />
    </Card>
  );
}

function ProductDetailSheet({
  open,
  onOpenChange,
  produit,
  canEdit,
  isEditing,
  setIsEditing,
  onUpdated,
  loading,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  produit: Produit | null;
  canEdit: boolean;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  onUpdated: (produit: Produit) => void;
  loading: boolean;
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [produit?.id]);

  if (!produit) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Détails du produit</SheetTitle>
            <SheetDescription>Sélectionnez un produit pour afficher ses détails.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  const galleryImages = produit.images ?? [];
  const coverImage = galleryImages[activeImageIndex] ?? galleryImages[0];

  return (
    <Sheet open={open} onOpenChange={(value) => {
      if (!value) {
        setIsEditing(false);
      }
      onOpenChange(value);
    }}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-headline flex items-center gap-2">
            <Package className="h-5 w-5" /> {produit.nom}
          </SheetTitle>
          <SheetDescription>
            {produit.marque.nom} • {produit.modele.nom}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !isEditing ? (
          <div className="space-y-6 mt-6">
            <div className="rounded-lg border overflow-hidden bg-muted/40">
              {coverImage ? (
                <div className="w-full h-72 flex items-center justify-center bg-background">
                  <Image
                    src={coverImage.data ? `data:${coverImage.mime};base64,${coverImage.data}` : '/placeholder.png'}
                    alt={coverImage.filename}
                    width={640}
                    height={360}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-60 flex items-center justify-center bg-muted">Aucune image</div>
              )}
              {galleryImages.length > 1 && (
                <ScrollArea className="w-full">
                  <div className="flex gap-2 p-4">
                    {galleryImages.map((image, index) => {
                      const isActive = index === activeImageIndex;
                      return (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() => setActiveImageIndex(index)}
                          className={`relative rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                            isActive ? 'ring-2 ring-primary' : 'ring-1 ring-border'
                          }`}
                        >
                          <div className="h-20 w-20 flex items-center justify-center bg-background rounded-md">
                            <Image
                              src={image.data ? `data:${image.mime};base64,${image.data}` : '/placeholder.png'}
                              alt={image.filename}
                              width={80}
                              height={80}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <DetailField label="Catégorie" value={produit.modele.categorie.nom} />
              <DetailField label="Marque" value={produit.marque.nom} />
              <DetailField label="Modèle" value={produit.modele.nom} />
              <DetailField label="Emplacement" value={produit.emplacement?.nom || 'N/A'} />
              <DetailField label="Quantité" value={String(produit.quantite)} />
              <DetailField label="SKU" value={produit.sku || '—'} />
              <DetailField label="GTIN" value={produit.gtin || '—'} />
              <DetailField label="Poids" value={produit.poids ? `${produit.poids} kg` : '—'} />
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {produit.description || 'Aucune description fournie.'}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Prix</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <PriceCard label="Prix d'achat" value={produit.prixAchat} />
                <PriceCard label="Coûts logistiques" value={produit.coutLogistique} />
                <PriceCard label="Prix de vente" value={produit.prixVente} />
              </div>
            </div>

            {canEdit && (
              <div className="flex justify-end">
                <Button onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-2" /> Modifier
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4">
            <ProductForm
              mode="edit"
              initialProduct={produit}
              onSuccess={(updated) => {
                onUpdated(updated);
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function PriceCard({ label, value }: { label: string; value: number | null }) {
  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value ? `${value.toLocaleString()} CFA` : '—'}</p>
      </CardContent>
    </Card>
  );
}
