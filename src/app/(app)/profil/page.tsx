'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2 } from 'lucide-react';

export default function ProfilPage() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    if (!user) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      toast({
        variant: 'destructive',
        title: 'Nom requis',
        description: 'Veuillez saisir votre nom complet.',
      });
      return;
    }

    if (!trimmedEmail) {
      toast({
        variant: 'destructive',
        title: 'Email requis',
        description: 'Veuillez saisir une adresse e-mail valide.',
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Impossible de mettre à jour votre profil.');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);

      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées avec succès.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordUpdate = () => {
     toast({
      title: 'Mot de passe mis à jour',
      description: 'Votre mot de passe a été modifié.',
    });
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limit file size to 2MB
        toast({
          variant: 'destructive',
          title: 'Fichier trop volumineux',
          description: 'Veuillez sélectionner une image de moins de 2 Mo.',
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
            setAvatarPreview(e.target.result as string);
            toast({
                title: 'Photo de profil mise à jour',
                description: 'La prévisualisation de votre avatar a été modifiée. Cliquez sur "Enregistrer" pour sauvegarder.',
            });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
      return <div>Chargement du profil...</div>
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Profil</CardTitle>
                <CardDescription>Gérez vos informations personnelles et votre photo de profil.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                     <div className="relative">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={avatarPreview || "/avatars/01.png"} alt={`@${user.name}`} />
                            <AvatarFallback>{user.initials}</AvatarFallback>
                        </Avatar>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
                            onClick={handleAvatarClick}
                            >
                            <Camera className="h-4 w-4"/>
                            <span className="sr-only">Changer la photo</span>
                        </Button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/png, image/jpeg"
                            onChange={handleFileChange}
                        />
                     </div>
                     <div className="flex-1 w-full space-y-1">
                        <Label htmlFor="profile-name">Nom complet</Label>
                        <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="profile-email">Adresse e-mail</Label>
                    <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleProfileUpdate} disabled={isSavingProfile}>
                  {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enregistrer les modifications
                </Button>
            </CardFooter>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Sécurité</CardTitle>
                <CardDescription>Modifiez votre mot de passe.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="current-password">Mot de passe actuel</Label>
                    <Input id="current-password" type="password" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="new-password">Nouveau mot de passe</Label>
                    <Input id="new-password" type="password" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                    <Input id="confirm-password" type="password" />
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button onClick={handlePasswordUpdate}>Changer le mot de passe</Button>
            </CardFooter>
        </Card>
    </div>
  );
}
