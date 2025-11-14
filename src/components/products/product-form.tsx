'use client';

import * as React from 'react';
import Image from 'next/image';
import { Loader2, UploadCloud, X } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ACCEPTED_PHOTO_ACCEPT,
  ACCEPTED_PHOTO_EXTENSIONS_LABEL,
  MAX_PRODUCT_IMAGE_SIZE_BYTES,
  MAX_PRODUCT_IMAGES,
  isAcceptedPhotoType,
} from '@/lib/image-constraints';
import type { Categorie, Emplacement, Marque, Modele, Produit } from '@/lib/types';

type ProductFormMode = 'create' | 'edit';

type ProductFormOptions = {
  marques: Marque[];
  categories: Categorie[];
  modeles: Modele[];
  emplacements: Emplacement[];
};

type SelectedImage = {
  id?: string;
  filename: string;
  mime: string;
  base64: string;
  preview: string;
  objectUrl?: string;
};

type ProductFormProps = {
  mode: ProductFormMode;
  initialProduct?: Produit | null;
  onSuccess?: (produit: Produit) => void;
  onCancel?: () => void;
  title?: string;
};

type FormValues = {
  nom: string;
  description: string;
  sku: string;
  gtin: string;
  poids: string;
  couleur: string;
  prixAchat: string;
  coutLogistique: string;
  prixVente: string;
  emplacementId: string;
};

const emptyFormValues: FormValues = {
  nom: '',
  description: '',
  sku: '',
  gtin: '',
  poids: '',
  couleur: '',
  prixAchat: '',
  coutLogistique: '',
  prixVente: '',
  emplacementId: '',
};

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const base64 = result.split(',')[1];
        resolve(base64 ?? '');
      } else {
        reject(new Error('Impossible de lire le fichier.'));
      }
    };
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier.'));
    reader.readAsDataURL(file);
  });
}

function buildFormValues(product?: Produit | null): FormValues {
  if (!product) return emptyFormValues;
  return {
    nom: product.nom,
    description: product.description ?? '',
    sku: product.sku ?? '',
    gtin: product.gtin ?? '',
    poids: product.poids ? String(product.poids) : '',
    couleur: product.couleur ?? '',
    prixAchat: product.prixAchat ? String(product.prixAchat) : '',
    coutLogistique: product.coutLogistique ? String(product.coutLogistique) : '',
    prixVente: product.prixVente ? String(product.prixVente) : '',
    emplacementId: product.emplacementId ?? '',
  };
}

function buildSelectedImages(product?: Produit | null): SelectedImage[] {
  if (!product) return [];
  return [...(product.images ?? [])]
    .sort((a, b) => a.order - b.order)
    .map((image) => ({
      id: image.id,
      filename: image.filename,
      mime: image.mime,
      base64: image.data ?? '',
      preview: image.data ? `data:${image.mime};base64,${image.data}` : '',
    }));
}

function revokeObjectUrls(images: SelectedImage[]) {
  images.forEach((img) => {
    if (img.objectUrl) {
      URL.revokeObjectURL(img.objectUrl);
    }
  });
}

export function ProductForm({ mode, initialProduct, onSuccess, onCancel, title }: ProductFormProps) {
  const { toast } = useToast();
  const [options, setOptions] = React.useState<ProductFormOptions | null>(null);
  const [loadingOptions, setLoadingOptions] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formValues, setFormValues] = React.useState<FormValues>(() => buildFormValues(initialProduct));
  const [selectedModeleId, setSelectedModeleId] = React.useState<string>(initialProduct?.modeleId ?? '');
  const [selectedImages, setSelectedImages] = React.useState<SelectedImage[]>(() => buildSelectedImages(initialProduct));

  React.useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const res = await fetch('/api/produits/form-data');
        const data = await res.json();
        setOptions(data);
      } catch (error) {
        console.error('Failed to fetch product form data', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger les données du formulaire.',
        });
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [toast]);

  React.useEffect(() => {
    setFormValues(buildFormValues(initialProduct));
    setSelectedModeleId(initialProduct?.modeleId ?? '');
    setSelectedImages((prev) => {
      revokeObjectUrls(prev);
      return buildSelectedImages(initialProduct);
    });
  }, [initialProduct]);

  React.useEffect(() => () => revokeObjectUrls(selectedImages), [selectedImages]);

  const selectedModele = React.useMemo(
    () => options?.modeles.find((modele) => modele.id === selectedModeleId) ?? null,
    [options, selectedModeleId]
  );

  const parseNumber = (value: string) => {
    if (value.trim() === '') return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const handleFieldChange = (field: keyof FormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    const allowed = files.filter((file) => file.type && isAcceptedPhotoType(file.type));
    if (allowed.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Format invalide',
        description: `Formats acceptés : ${ACCEPTED_PHOTO_EXTENSIONS_LABEL}.`,
      });
      return;
    }

    const oversize = allowed.filter((file) => file.size > MAX_PRODUCT_IMAGE_SIZE_BYTES);
    if (oversize.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Fichier trop volumineux',
        description: 'Chaque photo doit faire moins de 10 Mo.',
      });
    }

    const eligible = allowed.filter((file) => file.size <= MAX_PRODUCT_IMAGE_SIZE_BYTES);
    if (eligible.length === 0) {
      return;
    }

    const remainingSlots = MAX_PRODUCT_IMAGES - selectedImages.length;
    if (remainingSlots <= 0) {
      toast({
        variant: 'destructive',
        title: 'Limite atteinte',
        description: `Vous pouvez ajouter jusqu’à ${MAX_PRODUCT_IMAGES} images au total.`,
      });
      return;
    }

    if (eligible.length > remainingSlots) {
      toast({
        variant: 'destructive',
        title: 'Limite atteinte',
        description: `Vous pouvez ajouter jusqu’à ${MAX_PRODUCT_IMAGES} images au total.`,
      });
    }

    try {
      const filesToAdd = await Promise.all(
        eligible.slice(0, remainingSlots).map(async (file) => {
          const base64 = await fileToBase64(file);
          const objectUrl = URL.createObjectURL(file);
          return {
            filename: file.name,
            mime: file.type || 'image/jpeg',
            base64,
            preview: objectUrl,
            objectUrl,
          } satisfies SelectedImage;
        })
      );

      setSelectedImages((prev) => [...prev, ...filesToAdd]);
    } catch (error) {
      console.error('Failed to process selected images', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors du traitement des images.',
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed?.objectUrl) {
        URL.revokeObjectURL(removed.objectUrl);
      }
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedModeleId) {
      toast({
        variant: 'destructive',
        title: 'Modèle requis',
        description: 'Veuillez sélectionner un modèle.',
      });
      return;
    }

    if (!formValues.nom.trim()) {
      toast({
        variant: 'destructive',
        title: 'Nom requis',
        description: 'Veuillez saisir un nom pour le produit.',
      });
      return;
    }

    if (selectedImages.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Images requises',
        description: 'Veuillez ajouter au moins une image (maximum 6).',
      });
      return;
    }

    const modele = options?.modeles.find((m) => m.id === selectedModeleId);
    if (!modele) {
      toast({
        variant: 'destructive',
        title: 'Modèle introuvable',
        description: 'Le modèle sélectionné est introuvable.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const imagesPayload = selectedImages.map((image, index) => ({
        filename: image.filename,
        mime: image.mime,
        data: image.base64,
        order: index,
      }));

      const payload = {
        nom: formValues.nom.trim(),
        description: formValues.description.trim() || undefined,
        sku: formValues.sku.trim() || undefined,
        gtin: formValues.gtin.trim() || undefined,
        poids: parseNumber(formValues.poids),
        couleur: formValues.couleur.trim() || undefined,
        prixAchat: parseNumber(formValues.prixAchat),
        coutLogistique: parseNumber(formValues.coutLogistique),
        prixVente: parseNumber(formValues.prixVente),
        quantite: mode === 'edit' ? initialProduct?.quantite ?? 0 : 0,
        modeleId: selectedModeleId,
        marqueId: modele.marqueId,
        categorieId: modele.categorieId,
        emplacementId: formValues.emplacementId || undefined,
        images: imagesPayload,
        serialNumbers: mode === 'edit' ? initialProduct?.serialNumbers ?? [] : undefined,
      };

      const endpoint = mode === 'edit' && initialProduct ? `/api/produits/${initialProduct.id}` : '/api/produits';
      const method = mode === 'edit' ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Une erreur est survenue.');
      }

      const savedProduit: Produit = await response.json();

      toast({
        title: mode === 'edit' ? 'Produit mis à jour' : 'Produit enregistré !',
        description:
          mode === 'edit'
            ? 'Les informations du produit ont été mises à jour avec succès.'
            : 'Le nouveau produit a été ajouté à votre inventaire.',
      });

      setFormValues(buildFormValues(savedProduit));
      setSelectedModeleId(savedProduit.modeleId);
      setSelectedImages((prev) => {
        revokeObjectUrls(prev);
        return buildSelectedImages(savedProduit);
      });

      if (mode === 'create') {
        setFormValues(emptyFormValues);
        setSelectedModeleId('');
        setSelectedImages((prev) => {
          revokeObjectUrls(prev);
          return [];
        });
      }

      onSuccess?.(savedProduit);
    } catch (error) {
      console.error('Failed to submit product form', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingOptions || !options) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const formContent = (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom du produit</Label>
          <Input
            id="nom"
            placeholder="ex: Microphone SM7B, Caméra A7S III..."
            value={formValues.nom}
            onChange={(event) => handleFieldChange('nom', event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="modeleId">Modèle</Label>
          <Select
            value={selectedModeleId || undefined}
            onValueChange={(value) => setSelectedModeleId(value)}
            required
          >
            <SelectTrigger id="modeleId">
              <SelectValue placeholder="Sélectionner un modèle" />
            </SelectTrigger>
            <SelectContent>
              {options.modeles.map((modele) => (
                <SelectItem key={modele.id} value={modele.id}>
                  {modele.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Catégorie</Label>
          <Input value={selectedModele ? selectedModele.categorie.nom : ''} readOnly placeholder="Choisir un modèle" />
        </div>
        <div className="space-y-2">
          <Label>Marque</Label>
          <Input value={selectedModele ? selectedModele.marque.nom : ''} readOnly placeholder="Choisir un modèle" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Description détaillée du produit"
          value={formValues.description}
          onChange={(event) => handleFieldChange('description', event.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" value={formValues.sku} onChange={(event) => handleFieldChange('sku', event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gtin">Codes-barres GTIN</Label>
          <Input id="gtin" value={formValues.gtin} onChange={(event) => handleFieldChange('gtin', event.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="poids">Poids (en Kg)</Label>
          <Input
            id="poids"
            type="number"
            step="0.01"
            value={formValues.poids}
            onChange={(event) => handleFieldChange('poids', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="couleur">Couleur</Label>
          <Input id="couleur" value={formValues.couleur} onChange={(event) => handleFieldChange('couleur', event.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="emplacementId">Emplacement</Label>
        <Select value={formValues.emplacementId || undefined} onValueChange={(value) => handleFieldChange('emplacementId', value)}>
          <SelectTrigger id="emplacementId">
            <SelectValue placeholder="Sélectionner un emplacement" />
          </SelectTrigger>
          <SelectContent>
            {options.emplacements.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Prix</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-lg border p-4">
          <div className="space-y-2">
            <Label htmlFor="prixAchat" className="text-xs text-muted-foreground">
              Prix d'achat
            </Label>
            <Input
              id="prixAchat"
              type="number"
              value={formValues.prixAchat}
              onChange={(event) => handleFieldChange('prixAchat', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coutLogistique" className="text-xs text-muted-foreground">
              Coûts logistiques
            </Label>
            <Input
              id="coutLogistique"
              type="number"
              value={formValues.coutLogistique}
              onChange={(event) => handleFieldChange('coutLogistique', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prixVente" className="text-xs text-muted-foreground">
              Prix de vente
            </Label>
            <Input
              id="prixVente"
              type="number"
              value={formValues.prixVente}
              onChange={(event) => handleFieldChange('prixVente', event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="product-images">Images du produit (1 à 6)</Label>
        <div className="flex flex-col items-center justify-center w-full gap-2">
          <label
            htmlFor="product-images"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-muted/50 transition ${
              isSubmitting || selectedImages.length >= MAX_PRODUCT_IMAGES
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer hover:bg-muted'
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
              </p>
              <p className="text-xs text-muted-foreground">{ACCEPTED_PHOTO_EXTENSIONS_LABEL} • max 10 Mo</p>
              <p className="text-xs text-muted-foreground">
                {selectedImages.length}/{MAX_PRODUCT_IMAGES} photo{selectedImages.length > 1 ? 's' : ''} sélectionnée{selectedImages.length > 1 ? 's' : ''}
              </p>
            </div>
          </label>
          <input
            id="product-images"
            type="file"
            accept={ACCEPTED_PHOTO_ACCEPT}
            multiple
            className="hidden"
            onChange={handleImageSelection}
            disabled={isSubmitting || selectedImages.length >= MAX_PRODUCT_IMAGES}
          />
          <p className="text-xs text-muted-foreground text-center w-full">
            Formats photo uniquement • Jusqu'à {MAX_PRODUCT_IMAGES} images
          </p>
        </div>
        {selectedImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {selectedImages.map((image, index) => (
              <div key={`${image.preview}-${index}`} className="relative group">
                <Image
                  src={image.preview || `data:${image.mime};base64,${image.base64}`}
                  alt={image.filename}
                  width={160}
                  height={160}
                  className="h-24 w-full rounded-md object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'edit' ? 'Enregistrer les modifications' : 'Créer le produit'}
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle className="font-headline">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-6">
          {formContent}
        </form>
      </CardContent>
    </Card>
  );
}
