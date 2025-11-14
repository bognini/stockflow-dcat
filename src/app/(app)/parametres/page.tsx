'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { List, ListItem } from '@/components/ui/list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { Mail, PlusCircle, ShieldAlert, Trash2, Loader2, X } from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Categorie, Marque, Modele, Fournisseur, Emplacement, Partenaire, Projet, Utilisateur, MailConfig } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

type Item = { id: string; nom: string };
type ApiEndpoint = 'categories' | 'marques' | 'modeles' | 'fournisseurs' | 'emplacements' | 'partenaires' | 'projets' | 'utilisateurs';

type ListContentProps<T extends Item> = {
  title: string;
  items: T[];
  endpoint: ApiEndpoint;
  children?: (item: T) => React.ReactNode;
  formContent: React.ReactNode;
  fetchData: () => void;
};

function ListContent<T extends Item>({ title, items, endpoint, children, formContent, fetchData }: ListContentProps<T>) {
  const { toast } = useToast();

  const handleDelete = async (itemId: string, itemName: string) => {
    try {
      const response = await fetch(`/api/settings/${endpoint}/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }
      toast({
        title: 'Élément supprimé',
        description: `L'élément "${itemName}" a été supprimé avec succès.`,
      });
      fetchData(); // Re-fetch all data to ensure consistency
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur de suppression',
        description: error.message,
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">{title}</CardTitle>
        <CardDescription>Ajoutez, modifiez ou supprimez des éléments de cette liste.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {formContent}
        <List>
          {items.map((item) => (
            <ListItem key={item.id}>
              <div className="flex-1 min-w-0 pr-2">
                {children ? children(item) : <span className="truncate">{item.nom}</span>}
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" aria-label="Supprimer">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet élément ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. L'élément "{item.nom}" sera définitivement supprimé.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => handleDelete(item.id, item.nom)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

const SimpleForm = ({ onAdd, placeholder }: { onAdd: (name: string) => void, placeholder: string }) => {
  const [newItemName, setNewItemName] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleAdd = async () => {
    if (newItemName.trim() === '') return;
    setIsSubmitting(true);
    await onAdd(newItemName.trim());
    setNewItemName('');
    setIsSubmitting(false);
  };

  return (
    <div className="flex gap-2">
      <Input 
        placeholder={placeholder} 
        value={newItemName}
        onChange={(e) => setNewItemName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleAdd();
          }
        }}
      />
      <Button variant="outline" size="icon" aria-label="Ajouter" onClick={handleAdd} disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
      </Button>
    </div>
  );
};


function MailServerConfig({ config, onRefresh }: { config: MailConfig | null; onRefresh: () => Promise<void> | void }) {
  const { toast } = useToast();

  const [smtpHost, setSmtpHost] = useState(config?.smtpHost || '');
  const [smtpPort, setSmtpPort] = useState(config?.smtpPort?.toString() || '');
  const [smtpUser, setSmtpUser] = useState(config?.smtpUser || '');
  const [smtpPass, setSmtpPass] = useState('');
  const [notificationEmails, setNotificationEmails] = useState<string[]>(config?.notificationEmails || []);
  const [newEmail, setNewEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (config) {
      setSmtpHost(config.smtpHost || '');
      setSmtpPort(config.smtpPort?.toString() || '');
      setSmtpUser(config.smtpUser || '');
      setNotificationEmails(config.notificationEmails || []);
    }
  }, [config]);

  useEffect(() => {
    setTestRecipient(notificationEmails[0] || '');
  }, [notificationEmails]);

  const handleAddEmail = () => {
    const value = newEmail.trim().toLowerCase();
    if (!value || !value.includes('@')) {
      toast({
        variant: 'destructive',
        title: 'Adresse e-mail invalide',
        description: 'Veuillez entrer une adresse e-mail valide.',
      });
      return;
    }
    if (notificationEmails.includes(value)) {
      toast({
        variant: 'destructive',
        title: 'E-mail déjà ajouté',
        description: 'Cette adresse figure déjà dans la liste.',
      });
      return;
    }
    setNotificationEmails((prev) => [...prev, value]);
    setNewEmail('');
  };

  const handleDeleteEmail = (emailToDelete: string) => {
    setNotificationEmails((prev) => prev.filter((email) => email !== emailToDelete));
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setFormErrors({});
    try {
      const payload: Record<string, unknown> = {
        smtpHost: smtpHost || null,
        smtpPort: smtpPort ? Number(smtpPort) : null,
        smtpUser: smtpUser || null,
        notificationEmails,
      };

      if (smtpPass.trim()) {
        payload.smtpPass = smtpPass.trim();
      }

      const response = await fetch('/api/settings/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 422) {
          const data = await response.json();
          const fieldErrors = data.error?.fieldErrors ?? {};
          setFormErrors({
            smtpHost: fieldErrors.smtpHost?.[0],
            smtpPort: fieldErrors.smtpPort?.[0],
            smtpUser: fieldErrors.smtpUser?.[0],
            smtpPass: fieldErrors.smtpPass?.[0],
            notificationEmails: fieldErrors.notificationEmails?.[0],
          });
          throw new Error('Certains champs sont invalides.');
        }
        throw new Error("Impossible d'enregistrer la configuration");
      }

      toast({
        title: 'Configuration enregistrée',
        description: 'Vos paramètres SMTP ont été sauvegardés.',
      });
      setSmtpPass('');
      if (typeof onRefresh === 'function') {
        await Promise.resolve(onRefresh());
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || "Une erreur est survenue.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    const recipient = testRecipient.trim();
    if (!recipient) {
      toast({
        variant: 'destructive',
        title: 'Destinataire requis',
        description: 'Ajoutez ou sélectionnez une adresse pour envoyer un test.',
      });
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch('/api/settings/mail/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Impossible d'envoyer l'e-mail de test.");
      }

      toast({
        title: 'E-mail de test envoyé',
        description: `Un e-mail de test a été envoyé à ${recipient}.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: "Échec de l'envoi",
        description: error.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const hasConfig = Boolean(config?.smtpHost && config?.smtpPort && config?.smtpUser);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Configuration des alertes par e-mail
        </CardTitle>
        <CardDescription>
          Les notifications critiques (stock bas, mouvements sensibles) utilisent ce serveur SMTP.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="smtp-host">Hôte SMTP</Label>
            <Input
              id="smtp-host"
              placeholder="smtp.example.com"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
            />
            {formErrors.smtpHost && <p className="text-xs text-destructive">{formErrors.smtpHost}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-port">Port</Label>
            <Input
              id="smtp-port"
              type="number"
              placeholder="587"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
            />
            {formErrors.smtpPort && <p className="text-xs text-destructive">{formErrors.smtpPort}</p>}
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="smtp-user">Utilisateur</Label>
            <Input
              id="smtp-user"
              placeholder="notifications@dcat.ci"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
            />
            {formErrors.smtpUser && <p className="text-xs text-destructive">{formErrors.smtpUser}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-pass">Mot de passe</Label>
            <Input
              id="smtp-pass"
              type="password"
              placeholder={hasConfig ? 'Laissez vide pour conserver le mot de passe actuel' : '••••••••'}
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
            />
            {formErrors.smtpPass && <p className="text-xs text-destructive">{formErrors.smtpPass}</p>}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Destinataires des alertes</Label>
              <p className="text-sm text-muted-foreground">Maximum 20 adresses. Ils recevront les alertes critiques.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="alerte@dcat.ci"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddEmail();
                }
              }}
            />
            <Button variant="outline" size="icon" aria-label="Ajouter" onClick={handleAddEmail}>
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          {formErrors.notificationEmails && (
            <p className="text-xs text-destructive">{formErrors.notificationEmails}</p>
          )}
          {notificationEmails.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun destinataire configuré pour le moment.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {notificationEmails.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                >
                  {email}
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleDeleteEmail(email)}>
                    <X className="h-3 w-3" />
                  </Button>
                </span>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Tester l'envoi</p>
              <p className="text-sm text-muted-foreground">
                Un e-mail simple sera envoyé pour vérifier votre configuration SMTP.
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Input
                type="email"
                placeholder="destinataire@dcat.ci"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
              />
              <Button variant="outline" onClick={handleSendTestEmail} disabled={isTesting}>
                {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Envoyer
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-end gap-2">
        <Button onClick={handleSaveConfig} className="w-full sm:w-auto" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer la configuration
        </Button>
      </CardFooter>
    </Card>
  );
}

type SettingsData = {
    categories: Categorie[];
    marques: Marque[];
    modeles: Modele[];
    fournisseurs: Fournisseur[];
    emplacements: Emplacement[];
    partenaires: Partenaire[];
    projets: Projet[];
    utilisateurs: Utilisateur[];
    mailConfig: MailConfig | null;
}

export default function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [data, setData] = useState<SettingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('categories');

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/settings');
        if (!response.ok) throw new Error('Failed to fetch settings data');
        const settingsData = await response.json();
        setData(settingsData);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger les données des paramètres.',
        });
      } finally {
        setLoading(false);
      }
    };
    
    useEffect(() => {
        if (user?.role === 'admin') {
            fetchData();
        }
    }, [user]);

    const handleAddItem = async (endpoint: ApiEndpoint, payload: any, itemName: string) => {
      try {
        const response = await fetch(`/api/settings/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to add ${itemName}`);
        }
        toast({
          title: 'Élément ajouté',
          description: `L'élément "${itemName}" a été ajouté avec succès.`,
        });
        fetchData();
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Erreur d\'ajout',
          description: error.message,
        });
      }
    };
    
    if (!user || user.role !== 'admin') {
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

    if (loading || !data) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
    }

  const { categories, marques, modeles, fournisseurs, emplacements, partenaires, projets, utilisateurs, mailConfig } = data;

  const ModeleForm = ({ onAdd }: { onAdd: (item: any, name: string) => void }) => {
    const [nom, setNom] = React.useState('');
    const [marqueId, setMarqueId] = React.useState('');
    const [categorieId, setCategorieId] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
  
    const handleAdd = async () => {
      if (nom.trim() === '' || marqueId === '' || categorieId === '') {
        toast({ variant: 'destructive', title: 'Champs manquants' });
        return;
      }
      setIsSubmitting(true);
      await onAdd({ nom, marqueId, categorieId }, nom);
      setNom('');
      setMarqueId('');
      setCategorieId('');
      setIsSubmitting(false);
    };
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
        <div className="space-y-1">
          <Label>Nom du modèle</Label>
          <Input placeholder="Nom du nouveau modèle" value={nom} onChange={(e) => setNom(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Marque</Label>
          <Select value={marqueId} onValueChange={setMarqueId}>
            <SelectTrigger><SelectValue placeholder="Choisir une marque" /></SelectTrigger>
            <SelectContent>{marques.map(m => <SelectItem key={m.id} value={m.id}>{m.nom}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Catégorie</Label>
          <Select value={categorieId} onValueChange={setCategorieId}>
            <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
            <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button aria-label="Ajouter" onClick={handleAdd} className="w-full md:w-auto" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />} Ajouter
        </Button>
      </div>
    );
  };
  
  const ProjetForm = ({ onAdd }: { onAdd: (item: any, name: string) => void }) => {
    const [nom, setNom] = React.useState('');
    const [partenaireId, setPartenaireId] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

  
    const handleAdd = async () => {
      if (nom.trim() === '' || partenaireId === '') return;
      setIsSubmitting(true);
      await onAdd({ nom, partenaireId, description: '' }, nom);
      setNom('');
      setPartenaireId('');
      setIsSubmitting(false);
    };
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
        <div className="space-y-1">
          <Label>Nom du projet</Label>
          <Input placeholder="Nom du nouveau projet" value={nom} onChange={(e) => setNom(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Partenaire</Label>
          <Select value={partenaireId} onValueChange={setPartenaireId}>
            <SelectTrigger><SelectValue placeholder="Choisir un partenaire" /></SelectTrigger>
            <SelectContent>{partenaires.map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button aria-label="Ajouter" onClick={handleAdd} className="w-full md:w-auto" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />} Ajouter
        </Button>
      </div>
    );
  };

  const PartenaireForm = ({ onAdd }: { onAdd: (item: any, name: string) => void }) => {
    const [nom, setNom] = React.useState('');
    const [contactNom, setContactNom] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [telephone1, setTelephone1] = React.useState('');
    const [telephone2, setTelephone2] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
  
    const handleAdd = async () => {
      if (nom.trim() === '' || contactNom.trim() === '' || email.trim() === '' || telephone1.trim() === '') return;
      setIsSubmitting(true);
      await onAdd({ nom, contactNom, email, telephone1, telephone2: telephone2 || null }, nom);
      setNom('');
      setContactNom('');
      setEmail('');
      setTelephone1('');
      setTelephone2('');
      setIsSubmitting(false);
    };
  
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
              <Label>Nom de l'entreprise</Label>
              <Input placeholder="Nom de l'entreprise partenaire" value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div className="space-y-1">
              <Label>Nom du contact</Label>
              <Input placeholder="Nom de la personne à contacter" value={contactNom} onChange={(e) => setContactNom(e.target.value)} />
          </div>
        </div>
         <div className="space-y-1">
            <Label>Adresse e-mail</Label>
            <Input placeholder="E-mail du contact" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <Label>Téléphone 1</Label>
                <Input placeholder="Numéro de téléphone principal" value={telephone1} onChange={(e) => setTelephone1(e.target.value)} />
            </div>
            <div className="space-y-1">
                <Label>Téléphone 2 (Optionnel)</Label>
                <Input placeholder="Autre numéro de téléphone" value={telephone2} onChange={(e) => setTelephone2(e.target.value)} />
            </div>
        </div>
        <Button aria-label="Ajouter" onClick={handleAdd} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />} Ajouter le partenaire
        </Button>
      </div>
    );
  };
  
  const UtilisateurForm = ({ onAdd }: { onAdd: (item: any, name: string) => void }) => {
    const [nom, setNom] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [role, setRole] = React.useState<'admin' | 'marketing' | 'technician' | ''>('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
  
    const handleAdd = async () => {
      if (nom.trim() === '' || username.trim() === '' || password.trim() === '' || role === '' || password !== confirmPassword) {
        toast({ variant: 'destructive', title: 'Vérifiez le formulaire' });
        return;
      }
      setIsSubmitting(true);
      await onAdd({ nom, username, email, password, role }, nom);
      setNom('');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('');
      setIsSubmitting(false);
    };
  
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <Label>Nom complet</Label>
                <Input placeholder="Nom et prénom" value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
            <div className="space-y-1">
                <Label>Nom d'utilisateur</Label>
                <Input placeholder="Identifiant de connexion" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
        </div>
        <div className="space-y-1">
            <Label>Adresse e-mail</Label>
            <Input placeholder="E-mail de l'utilisateur" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <Label>Mot de passe</Label>
                <Input placeholder="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-1">
                <Label>Confirmer le mot de passe</Label>
                <Input placeholder="Confirmer le mot de passe" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-1">
              <Label>Rôle</Label>
              <Select value={role} onValueChange={(value) => setRole(value as any)}>
                <SelectTrigger><SelectValue placeholder="Choisir un rôle" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="technician">Technicien</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button aria-label="Ajouter" onClick={handleAdd} className="w-full md:w-auto" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />} Ajouter l'utilisateur
            </Button>
        </div>
        {password && confirmPassword && password !== confirmPassword && (
            <p className="text-sm text-destructive">Les mots de passe ne correspondent pas.</p>
        )}
      </div>
    );
  };

  const UtilisateursTab = () => (
    <>
      <ListContent<Utilisateur>
        title="Gestion des Utilisateurs" 
        items={utilisateurs} 
        endpoint="utilisateurs"
        fetchData={fetchData}
        formContent={<UtilisateurForm onAdd={(payload, name) => handleAddItem('utilisateurs', payload, name)} />}
      >
        {(item) => (
           <div className="flex-1 truncate">
            <span className="font-medium truncate">{item.nom} ({item.username})</span>
            <div className="text-xs text-muted-foreground capitalize">
              Rôle: {item.role}
            </div>
          </div>
        )}
      </ListContent>
      <MailServerConfig config={mailConfig} onRefresh={fetchData}/>
    </>
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <ScrollArea className="w-full whitespace-nowrap border-b">
          <TabsList className="grid w-full grid-cols-none sm:inline-flex sm:w-auto">
            <TabsTrigger value="categories">Catégories</TabsTrigger>
            <TabsTrigger value="marques">Marques</TabsTrigger>
            <TabsTrigger value="modeles">Modèles</TabsTrigger>
            <TabsTrigger value="fournisseurs">Fournisseurs</TabsTrigger>
            <TabsTrigger value="emplacements">Emplacements</TabsTrigger>
            <TabsTrigger value="partenaires">Partenaires</TabsTrigger>
            <TabsTrigger value="projets">Projets</TabsTrigger>
            <TabsTrigger value="utilisateurs">Utilisateurs</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      <TabsContent value="categories" className="mt-4">
        <ListContent 
          title="Catégories de produits" 
          items={categories}
          endpoint="categories"
          fetchData={fetchData}
          formContent={<SimpleForm onAdd={(nom) => handleAddItem('categories', { nom }, nom)} placeholder="Nouvelle catégorie" />}
        />
      </TabsContent>
      <TabsContent value="marques" className="mt-4">
        <ListContent 
          title="Marques" 
          items={marques} 
          endpoint="marques"
          fetchData={fetchData}
          formContent={<SimpleForm onAdd={(nom) => handleAddItem('marques', { nom }, nom)} placeholder="Nouvelle marque" />}
        />
      </TabsContent>
       <TabsContent value="modeles" className="mt-4">
        <ListContent<Modele> 
          title="Modèles" 
          items={modeles}
          endpoint="modeles"
          fetchData={fetchData}
          formContent={<ModeleForm onAdd={(payload, name) => handleAddItem('modeles', payload, name)} />}
        >
          {(item) => (
            <div className="flex-1 truncate">
              <span className="font-medium truncate">{item.nom}</span>
              <div className="text-xs text-muted-foreground truncate">
                {item.marque.nom} / {item.categorie.nom}
              </div>
            </div>
          )}
        </ListContent>
      </TabsContent>
      <TabsContent value="fournisseurs" className="mt-4">
        <ListContent 
          title="Fournisseurs" 
          items={fournisseurs} 
          endpoint="fournisseurs"
          fetchData={fetchData}
          formContent={<SimpleForm onAdd={(nom) => handleAddItem('fournisseurs', { nom }, nom)} placeholder="Nouveau fournisseur" />}
        />
      </TabsContent>
      <TabsContent value="emplacements" className="mt-4">
        <ListContent 
          title="Emplacements" 
          items={emplacements} 
          endpoint="emplacements"
          fetchData={fetchData}
          formContent={<SimpleForm onAdd={(nom) => handleAddItem('emplacements', { nom }, nom)} placeholder="Nouvel emplacement" />}
        />
      </TabsContent>
      <TabsContent value="partenaires" className="mt-4">
        <ListContent<Partenaire> 
          title="Partenaires" 
          items={partenaires}
          endpoint="partenaires"
          fetchData={fetchData}
          formContent={<PartenaireForm onAdd={(payload, name) => handleAddItem('partenaires', payload, name)} />}
          children={(item) => (
            <div className="flex-1 truncate">
              <span className="font-medium truncate">{item.nom} <span className="text-muted-foreground font-normal">({item.contactNom})</span></span>
              <div className="text-xs text-muted-foreground truncate">
                {item.email} - {item.telephone1} {item.telephone2 && `/ ${item.telephone2}`}
              </div>
            </div>
          )}
        />
      </TabsContent>
       <TabsContent value="projets" className="mt-4">
        <ListContent<Projet> 
          title="Projets" 
          items={projets} 
          endpoint="projets"
          fetchData={fetchData}
          formContent={<ProjetForm onAdd={(payload, name) => handleAddItem('projets', payload, name)} />}
        >
          {(item) => (
            <div className="flex-1 truncate">
              <span className="font-medium truncate">{item.nom}</span>
              <div className="text-xs text-muted-foreground">
                Partenaire: {item.partenaire.nom}
              </div>
            </div>
          )}
        </ListContent>
      </TabsContent>
       <TabsContent value="utilisateurs" className="mt-4">
          <UtilisateursTab />
      </TabsContent>
    </Tabs>
  );
}
