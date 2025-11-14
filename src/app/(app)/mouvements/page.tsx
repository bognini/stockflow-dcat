'use client';

import React, { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, format, parseISO } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, Calendar as CalendarIcon, User, Package, MapPin, ShieldAlert, UploadCloud, ChevronsRight, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/hooks/use-auth';
import { Produit, MouvementStock, Utilisateur, Partenaire, Fournisseur } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const base64String = result.split(',')[1] || '';
        resolve(base64String);
      } else {
        reject(new Error('Impossible de lire le fichier.'));
      }
    };
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier.'));
    reader.readAsDataURL(file);
  });
}

type MouvementFormData = {
  produits: Produit[],
  utilisateurs: Utilisateur[],
  partenaires: Partenaire[],
  fournisseurs: Fournisseur[]
}

const MouvementCard = ({ mouvement }: { mouvement: MouvementStock }) => {
    const isEntree = mouvement.type === 'ENTREE';

    return (
        <Card>
            <CardContent className="p-4 space-y-3">
                 <div className="flex justify-between items-start">
                    <div>
                        <div className="font-bold">{mouvement.produit.modele.nom}</div>
                        <div className="text-sm text-muted-foreground">
                            {format(parseISO(mouvement.date as unknown as string), 'dd/MM/yyyy HH:mm')}
                        </div>
                    </div>
                     <Badge
                        variant={isEntree ? 'secondary' : 'outline'}
                        className={`border-0 text-xs ${isEntree ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}
                      >
                        {isEntree ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                        {isEntree ? 'Entrée' : 'Sortie'}
                      </Badge>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2"><Package className="w-4 h-4"/> Quantité</span>
                    <span className={`font-bold text-lg ${isEntree ? 'text-emerald-600' : 'text-rose-600'}`}>
                         {isEntree ? '+' : '-'}{mouvement.quantite}
                    </span>
                </div>

                <div className="space-y-2 text-sm">
                    {mouvement.destination && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4" /> Destination</span>
                            <span className="text-right">{mouvement.destination}</span>
                        </div>
                    )}
                    {mouvement.projet && (
                         <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-2"><ChevronsRight className="w-4 h-4" /> Projet</span>
                            <span>{mouvement.projet.nom}</span>
                        </div>
                    )}
                    {mouvement.demandeur && (
                         <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> Demandeur</span>
                            <span>{mouvement.demandeur.nom}</span>
                        </div>
                    )}
                    {mouvement.utilisateur && (
                         <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> Opérateur</span>
                            <span>{mouvement.utilisateur.nom}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function HistoriqueTab({ mouvements, utilisateurs }: { mouvements: MouvementStock[], utilisateurs: Utilisateur[] }) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [typeFilter, setTypeFilter] = React.useState<'tous' | 'ENTREE' | 'SORTIE'>('tous');

  const filteredMouvements = React.useMemo(() => {
    return mouvements.filter(mouvement => {
      const mouvementDate = parseISO(mouvement.date as unknown as string);
      const dateMatch = date?.from && date?.to ? (mouvementDate >= date.from && mouvementDate <= date.to) : true;
      const typeMatch = typeFilter === 'tous' || mouvement.type === typeFilter;
      return dateMatch && typeMatch;
    });
  }, [mouvements, date, typeFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Historique des Mouvements</CardTitle>
        <CardDescription>
          Suivi de toutes les entrées et sorties de stock.
        </CardDescription>
        <div className="flex flex-col md:flex-row gap-4 pt-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full md:w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, 'dd/MM/yyyy')} - {format(date.to, 'dd/MM/yyyy')}
                      </>
                    ) : (
                      format(date.from, 'dd/MM/yyyy')
                    )
                  ) : (
                    <span>Choisir une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
             <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="tous">Tous les mouvements</SelectItem>
                    <SelectItem value="ENTREE">Entrées uniquement</SelectItem>
                    <SelectItem value="SORTIE">Sorties uniquement</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
         {/* Responsive view: list of cards for mobile */}
        <div className="md:hidden space-y-4">
             {filteredMouvements.length > 0 ? (
                filteredMouvements.map((mouvement) => (
                    <MouvementCard key={mouvement.id} mouvement={mouvement} />
                ))
            ) : (
                <div className="text-center py-10 text-muted-foreground">
                    Aucun mouvement trouvé pour la période ou le filtre sélectionné.
                </div>
            )}
        </div>

        {/* Default view: table for larger screens */}
        <div className="hidden md:block">
          <ScrollArea className="w-full whitespace-nowrap">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Quantité</TableHead>
                  <TableHead>Destination/Projet</TableHead>
                  <TableHead>Demandeur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMouvements.map((mouvement) => {
                  return (
                    <TableRow key={mouvement.id}>
                      <TableCell>
                        {format(parseISO(mouvement.date as unknown as string), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {mouvement.produit.modele.nom}
                      </TableCell>
                      <TableCell>{mouvement.utilisateur.nom}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={mouvement.type === 'ENTREE' ? 'secondary' : 'outline'}
                          className={`border-0 ${
                            mouvement.type === 'ENTREE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {mouvement.type === 'ENTREE' ? (
                            <ArrowUp className="mr-1 h-3 w-3" />
                          ) : (
                            <ArrowDown className="mr-1 h-3 w-3" />
                          )}
                          {mouvement.type === 'ENTREE' ? 'Entrée' : 'Sortie'}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-center font-semibold ${
                          mouvement.type === 'ENTREE'
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {mouvement.type === 'ENTREE' ? '+' : '-'}
                        {mouvement.quantite}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{mouvement.destination}</div>
                        <div className="text-sm text-muted-foreground">
                          {mouvement.projet?.nom}
                        </div>
                      </TableCell>
                      <TableCell>{mouvement.demandeur?.nom}</TableCell>
                    </TableRow>
                  );
                })}
                 {filteredMouvements.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                            Aucun mouvement trouvé pour la période ou le filtre sélectionné.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

function FileUploadZone({
  id,
  onFileSelected,
  fileName,
}: {
  id: string;
  onFileSelected: (file: File | null) => void;
  fileName?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center w-full gap-2">
      <label
        htmlFor={id}
        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
          <p className="mb-2 text-sm text-muted-foreground">
            <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
          </p>
          <p className="text-xs text-muted-foreground">PDF, PNG, JPG (MAX. 10MB)</p>
        </div>
        <input
          id={id}
          type="file"
          className="hidden"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0] ?? null;
            onFileSelected(file);
          }}
        />
      </label>
      {fileName && (
        <p className="text-xs text-muted-foreground truncate w-full text-center">{fileName}</p>
      )}
    </div>
  );
}

function EntreeStockTab({ user, formData, onMouvementAdded }: { user: any; formData: MouvementFormData; onMouvementAdded: () => void; }) {
  const { toast } = useToast();
  const [selectedProduit, setSelectedProduit] = React.useState('');
  const [quantite, setQuantite] = React.useState('');
  const [fournisseur, setFournisseur] = React.useState('');
  const [serialNumbers, setSerialNumbers] = React.useState('');
  const [supportingFile, setSupportingFile] = React.useState<File | null>(null);
  const [supportingFileName, setSupportingFileName] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const resetForm = () => {
    setSelectedProduit('');
    setQuantite('');
    setFournisseur('');
    setSerialNumbers('');
    setSupportingFile(null);
    setSupportingFileName('');
  };

  const handleEnregistrer = async () => {
    if (!selectedProduit || !quantite || !fournisseur) {
      toast({
        variant: 'destructive',
        title: 'Champs manquants',
        description: 'Veuillez sélectionner un produit, une quantité et un fournisseur.',
      });
      return;
    }

    const produit = formData.produits.find(p => p.id === selectedProduit);
    if (!produit) return;

    const quantiteValue = parseInt(quantite, 10);
    if (Number.isNaN(quantiteValue) || quantiteValue <= 0) {
      toast({
        variant: 'destructive',
        title: 'Quantité invalide',
        description: 'Veuillez saisir une quantité supérieure à zéro.',
      });
      return;
    }

    if (supportingFile && supportingFile.size > MAX_FILE_SIZE) {
      toast({
        variant: 'destructive',
        title: 'Fichier trop volumineux',
        description: 'La taille maximale autorisée est de 10 Mo.',
      });
      return;
    }

    const serialNumbersArray = serialNumbers
      .split(',')
      .map((sn) => sn.trim())
      .filter((sn) => sn.length > 0);

    setIsSubmitting(true);
    try {
      let justificatif: { filename: string; mime: string; data: string } | undefined;
      if (supportingFile) {
        const base64 = await fileToBase64(supportingFile);
        justificatif = {
          filename: supportingFile.name,
          mime: supportingFile.type || 'application/octet-stream',
          data: base64,
        };
      }

      const payload: Record<string, unknown> = {
        produitId: selectedProduit,
        quantite: quantiteValue,
        fournisseurId: fournisseur,
        type: 'ENTREE',
        utilisateurId: user.id,
      };

      if (serialNumbersArray.length > 0) {
        payload.serialNumbers = serialNumbersArray;
      }

      if (justificatif) {
        payload.justificatif = justificatif;
      }

      const response = await fetch('/api/mouvements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement de l\'entrée');
      }

      toast({
        title: 'Entrée enregistrée',
        description: `${quantite}x "${produit.modele.nom}" ont été ajoutés au stock.`,
      });

      onMouvementAdded();
      resetForm();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Nouvelle Entrée de Stock</CardTitle>
        <CardDescription>
          Enregistrez un nouvel arrivage de matériel.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="product-select-entree">Produit</Label>
          <Select value={selectedProduit} onValueChange={setSelectedProduit}>
            <SelectTrigger id="product-select-entree">
              <SelectValue placeholder="Sélectionner un produit" />
            </SelectTrigger>
            <SelectContent>
              {formData.produits.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.marque.nom} {p.modele.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity-entree">Quantité</Label>
            <Input id="quantity-entree" type="number" placeholder="ex: 5" value={quantite} onChange={e => setQuantite(e.target.value)} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="fournisseur-entree">Fournisseur</Label>
            <Select value={fournisseur} onValueChange={setFournisseur}>
              <SelectTrigger id="fournisseur-entree">
                <SelectValue placeholder="Sélectionner un fournisseur" />
              </SelectTrigger>
              <SelectContent>
                {formData.fournisseurs.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
         <div className="space-y-2">
          <Label htmlFor="serial-numbers-entree">Numéros de série (Optionnel)</Label>
          <Input id="serial-numbers-entree" placeholder="SN001, SN002, ..." value={serialNumbers} onChange={e => setSerialNumbers(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Justificatif (Facture, Bon de livraison) (Optionnel)</Label>
          <FileUploadZone
            id="justificatif-entree"
            fileName={supportingFileName}
            onFileSelected={(file) => {
              if (file && file.size > MAX_FILE_SIZE) {
                toast({
                  variant: 'destructive',
                  title: 'Fichier trop volumineux',
                  description: 'La taille maximale autorisée est de 10 Mo.',
                });
                return;
              }
              setSupportingFile(file);
              setSupportingFileName(file?.name ?? '');
            }}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleEnregistrer} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer l'entrée
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SortieStockTab({ user, formData, onMouvementAdded }: { user: any; formData: MouvementFormData, onMouvementAdded: () => void; }) {
  const { toast } = useToast();
  const [destinationType, setDestinationType] = React.useState('partenaire');
  
  const [selectedProduit, setSelectedProduit] = React.useState('');
  const [quantite, setQuantite] = React.useState('');
  const [demandeur, setDemandeur] = React.useState('');
  const [destinationPartenaire, setDestinationPartenaire] = React.useState('');
  const [particulierNom, setParticulierNom] = React.useState('');
  const [particulierContact, setParticulierContact] = React.useState('');
  const [selectedSerials, setSelectedSerials] = React.useState<string[]>([]);
  const [supportingFile, setSupportingFile] = React.useState<File | null>(null);
  const [supportingFileName, setSupportingFileName] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const resetForm = () => {
    setSelectedProduit('');
    setQuantite('');
    setDemandeur('');
    setDestinationPartenaire('');
    setParticulierNom('');
    setParticulierContact('');
    setDestinationType('partenaire');
    setSelectedSerials([]);
    setSupportingFile(null);
    setSupportingFileName('');
  };

  const produitSelectionne = React.useMemo(() => formData.produits.find((p) => p.id === selectedProduit) ?? null, [formData.produits, selectedProduit]);

  React.useEffect(() => {
    setSelectedSerials([]);
  }, [selectedProduit]);

  const handleEnregistrer = async () => {
    const produit = produitSelectionne;

    if (!selectedProduit || !quantite || !demandeur || !produit) {
      toast({ variant: 'destructive', title: 'Champs manquants', description: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }
    
    if (destinationType === 'partenaire' && !destinationPartenaire) {
       toast({ variant: 'destructive', title: 'Champs manquants', description: 'Veuillez sélectionner un partenaire.' });
       return;
    }

    if (destinationType === 'particulier' && !particulierNom) {
       toast({ variant: 'destructive', title: 'Champs manquants', description: 'Veuillez indiquer le nom du particulier.' });
       return;
    }

    const quantiteDemandee = parseInt(quantite, 10);
    if (Number.isNaN(quantiteDemandee) || quantiteDemandee <= 0) {
      toast({ variant: 'destructive', title: 'Quantité invalide', description: 'Veuillez saisir une quantité supérieure à zéro.' });
      return;
    }

    if (quantiteDemandee > produit.quantite) {
      toast({ variant: 'destructive', title: 'Stock insuffisant', description: `Il ne reste que ${produit.quantite} unité(s) pour ce produit.` });
      return;
    }

    if (selectedSerials.length > quantiteDemandee) {
      toast({ variant: 'destructive', title: 'Numéros de série invalides', description: 'Vous avez sélectionné plus de numéros de série que la quantité demandée.' });
      return;
    }

    if (supportingFile && supportingFile.size > MAX_FILE_SIZE) {
      toast({
        variant: 'destructive',
        title: 'Fichier trop volumineux',
        description: 'La taille maximale autorisée est de 10 Mo.',
      });
      return;
    }

    const destination = destinationType === 'partenaire' 
      ? formData.partenaires.find(p => p.id === destinationPartenaire)?.nom 
      : particulierNom;

    setIsSubmitting(true);
    try {
        let justificatif: { filename: string; mime: string; data: string } | undefined;
        if (supportingFile) {
          const base64 = await fileToBase64(supportingFile);
          justificatif = {
            filename: supportingFile.name,
            mime: supportingFile.type || 'application/octet-stream',
            data: base64,
          };
        }

        const payload: Record<string, unknown> = {
          produitId: selectedProduit,
          quantite: quantiteDemandee,
          type: 'SORTIE',
          utilisateurId: user.id,
          demandeurId: demandeur,
          destination,
        };

        if (selectedSerials.length > 0) {
          payload.serialNumbers = selectedSerials;
        }

        if (justificatif) {
          payload.justificatif = justificatif;
        }

        const response = await fetch('/api/mouvements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de l\'enregistrement de la sortie');
        }

        toast({
            title: 'Sortie enregistrée',
            description: `${quantiteDemandee}x "${produit.modele.nom}" ont été retirés du stock.`,
        });

        onMouvementAdded();
        resetForm();

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Erreur',
            description: error.message,
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Nouvelle Sortie de Stock</CardTitle>
        <CardDescription>
          Enregistrez un retrait de matériel pour un projet ou une vente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="product-select-sortie">Produit</Label>
          <Select value={selectedProduit} onValueChange={setSelectedProduit}>
            <SelectTrigger id="product-select-sortie">
              <SelectValue placeholder="Sélectionner un produit" />
            </SelectTrigger>
            <SelectContent>
              {formData.produits.map((p) => (
                <SelectItem key={p.id} value={p.id} disabled={p.quantite === 0}>
                  {p.marque.nom} {p.modele.nom} (En stock: {p.quantite})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity-sortie">Quantité</Label>
            <Input id="quantity-sortie" type="number" placeholder="ex: 1" value={quantite} onChange={e => setQuantite(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serial-numbers-sortie">Numéros de série (Optionnel)</Label>
            {produitSelectionne?.serialNumbers?.length ? (
              <ScrollArea className="max-h-32 border rounded-md p-2">
                <div className="space-y-2">
                  {produitSelectionne.serialNumbers.map((sn) => {
                    const checked = selectedSerials.includes(sn);
                    return (
                      <label key={sn} className="flex items-center space-x-2 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => {
                            setSelectedSerials((prev) => {
                              if (value) {
                                if (prev.includes(sn)) return prev;
                                return [...prev, sn];
                              }
                              return prev.filter((item) => item !== sn);
                            });
                          }}
                        />
                        <span>{sn}</span>
                      </label>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun numéro de série enregistré pour ce produit.</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="demandeur-sortie">Demandeur</Label>
          <Select value={demandeur} onValueChange={setDemandeur}>
            <SelectTrigger id="demandeur-sortie">
              <SelectValue placeholder="Sélectionner un utilisateur" />
            </SelectTrigger>
            <SelectContent>
              {formData.utilisateurs.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.nom} ({u.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-3">
          <Label>Destination</Label>
          <RadioGroup 
            value={destinationType}
            onValueChange={setDestinationType}
            className="flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="partenaire" id="r-partenaire" />
              <Label htmlFor="r-partenaire" className="font-normal">Partenaire</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="particulier" id="r-particulier" />
              <Label htmlFor="r-particulier" className="font-normal">Particulier / Autre</Label>
            </div>
          </RadioGroup>
          
          {destinationType === 'partenaire' && (
            <Select value={destinationPartenaire} onValueChange={setDestinationPartenaire}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un partenaire" />
              </SelectTrigger>
              <SelectContent>
                {formData.partenaires.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {destinationType === 'particulier' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-muted/20">
               <div className="space-y-2">
                <Label htmlFor="particulier-name">Nom du particulier</Label>
                <Input id="particulier-name" placeholder="ex: John Doe" value={particulierNom} onChange={e => setParticulierNom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="particulier-contact">Contact (Optionnel)</Label>
                <Input id="particulier-contact" placeholder="ex: 0708091011" value={particulierContact} onChange={e => setParticulierContact(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Justificatif (Facture, Bon de sortie) (Optionnel)</Label>
          <FileUploadZone
            id="justificatif-sortie"
            fileName={supportingFileName}
            onFileSelected={(file) => {
              if (file && file.size > MAX_FILE_SIZE) {
                toast({
                  variant: 'destructive',
                  title: 'Fichier trop volumineux',
                  description: 'La taille maximale autorisée est de 10 Mo.',
                });
                return;
              }
              setSupportingFile(file);
              setSupportingFileName(file?.name ?? '');
            }}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleEnregistrer} disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer la sortie
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MovementsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [mouvements, setMouvements] = useState<MouvementStock[]>([]);
    const [formData, setFormData] = useState<MouvementFormData | null>(null);

    const fetchData = async () => {
      try {
        setLoading(true);
        const [mouvementsRes, formDataRes] = await Promise.all([
          fetch('/api/mouvements'),
          fetch('/api/mouvements/form-data')
        ]);
        const mouvementsData = await mouvementsRes.json();
        const formData = await formDataRes.json();

        setMouvements(mouvementsData);
        setFormData(formData);
      } catch (error) {
        console.error("Failed to fetch movement data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    useEffect(() => {
        if (user && ['admin', 'marketing'].includes(user.role)) {
            fetchData();
        }
    }, [user]);

    if (!user || !['admin', 'marketing'].includes(user.role)) {
        return (
            <Card className="flex flex-col items-center justify-center text-center p-10 min-h-[400px]">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 p-4 rounded-full">
                        <ShieldAlert className="h-12 w-12 text-destructive" />
                    </div>
                    <CardTitle className="mt-6 font-headline text-destructive">Accès Restreint</CardTitle>
                    <CardDescription className="mt-2 max-w-md">
                        Vous n'avez pas les autorisations nécessaires pour accéder à cette page. Veuillez contacter un administrateur.
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }
    
    if (loading || !formData) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
    }

  return (
    <Tabs defaultValue="entree" className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <TabsList className="grid w-full grid-cols-3 md:inline-flex md:w-auto">
          <TabsTrigger value="entree">Entrée de stock</TabsTrigger>
          <TabsTrigger value="sortie">Sortie de stock</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <TabsContent value="entree" className="mt-4">
        <EntreeStockTab user={user} formData={formData} onMouvementAdded={fetchData} />
      </TabsContent>
      <TabsContent value="sortie" className="mt-4">
        <SortieStockTab user={user} formData={formData} onMouvementAdded={fetchData} />
      </TabsContent>
      <TabsContent value="historique" className="mt-4">
        <HistoriqueTab mouvements={mouvements} utilisateurs={formData.utilisateurs} />
      </TabsContent>
    </Tabs>
  );
}
