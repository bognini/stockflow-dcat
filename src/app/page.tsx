'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

function LoginForm({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loggedInUser = await login(usernameOrEmail, password);
    
    if (loggedInUser) {
        onLoginSuccess(loggedInUser);
        router.push('/dashboard');
    } else {
         toast({
            variant: 'destructive',
            title: 'Échec de la connexion',
            description: 'Veuillez vérifier votre identifiant et votre mot de passe.',
        });
    }
    setIsLoading(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Connexion</CardTitle>
        <CardDescription>Entrez vos identifiants pour accéder à votre tableau de bord.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-2">
            <Label htmlFor="username">Nom d'utilisateur ou e-mail</Label>
            <Input
              id="username"
              type="text"
              placeholder="Votre nom d'utilisateur ou e-mail"
              required
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="Votre mot de passe"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
             <div className="text-right text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary/90">
                  Mot de passe oublié?
                </a>
              </div>
          </div>
          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function InitialLoginForm({ onFirstLoginSuccess }: { onFirstLoginSuccess: () => void }) {
  const { toast } = useToast();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (username === 'admin' && password === 'admin') {
      onFirstLoginSuccess();
    } else {
      toast({
        variant: 'destructive',
        title: 'Échec de la connexion',
        description: 'Veuillez utiliser les identifiants par défaut "admin" et "admin".',
      });
    }
    setIsLoading(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Première Connexion</CardTitle>
        <CardDescription>Veuillez utiliser les identifiants par défaut pour commencer la configuration.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-2">
            <Label htmlFor="default-username">Nom d'utilisateur</Label>
            <Input
              id="default-username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default-password">Mot de passe</Label>
            <Input
              id="default-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continuer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

const PasswordRequirement = ({ label, met }: { label: string; met: boolean }) => (
    <div className={`flex items-center text-sm ${met ? 'text-green-600' : 'text-muted-foreground'}`}>
        {met ? <CheckCircle className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
        {label}
    </div>
);


function AdminSetupForm({ onSetupComplete }: { onSetupComplete: (newUser: any) => void }) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordChecks = useMemo(() => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      match: password !== '' && password === confirmPassword,
    };
    return {
        ...checks,
        allMet: Object.values(checks).every(Boolean)
    }
  }, [password, confirmPassword]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordChecks.allMet) {
      toast({
        variant: 'destructive',
        title: 'Mot de passe non sécurisé',
        description: 'Veuillez vous assurer que tous les critères de mot de passe sont respectés.',
      });
      return;
    }
    
    setIsLoading(true);

    try {
        const response = await fetch('/api/auth/setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nom: name,
                username,
                email,
                password,
            }),
        });

        const newUser = await response.json();
        
        if (!response.ok) {
            throw new Error(newUser.error || 'Failed to setup admin account');
        }

        onSetupComplete(newUser);

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Erreur de configuration',
            description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Configuration de l'Administrateur</CardTitle>
        <CardDescription>Veuillez créer votre compte administrateur principal sécurisé.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSetup}>
          <div className="space-y-2">
            <Label htmlFor="setup-name">Nom complet</Label>
            <Input id="setup-name" placeholder="ex: Jean Dupont" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="setup-username">Nom d'utilisateur</Label>
                <Input id="setup-username" placeholder="ex: jdupont" required value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="setup-email">Adresse e-mail</Label>
                <Input id="setup-email" type="email" placeholder="ex: j.dupont@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="setup-password">Nouveau mot de passe</Label>
            <Input id="setup-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="setup-confirm-password">Confirmer le mot de passe</Label>
            <Input id="setup-confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          
          <Card className="bg-muted/50 p-4 space-y-2">
            <PasswordRequirement label="Au moins 8 caractères" met={passwordChecks.length} />
            <PasswordRequirement label="Une lettre minuscule (a-z)" met={passwordChecks.lowercase} />
            <PasswordRequirement label="Une lettre majuscule (A-Z)" met={passwordChecks.uppercase} />
            <PasswordRequirement label="Un chiffre (0-9)" met={passwordChecks.number} />
            <PasswordRequirement label="Un caractère spécial (!@#...)" met={passwordChecks.special} />
            <PasswordRequirement label="Les mots de passe correspondent" met={passwordChecks.match} />
          </Card>

          <Button type="submit" className="w-full" disabled={!passwordChecks.allMet || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer le compte et se connecter
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


export default function LoginPage() {
  const { toast } = useToast();
  const { setUser } = useAuth();
  const [loginStep, setLoginStep] = useState<'loading' | 'initial' | 'setup' | 'login'>('loading');

  useEffect(() => {
    // This code runs only on the client, after hydration
    const checkAdminUser = async () => {
        try {
            const res = await fetch('/api/auth/check-admin');
            const { adminExists } = await res.json();
            setLoginStep(adminExists ? 'login' : 'initial');
        } catch (error) {
            console.error("Failed to check admin user", error);
            // Fallback to initial setup if API call fails
            setLoginStep('initial');
        }
    };

    checkAdminUser();

    const sessionUser = localStorage.getItem('sessionUser');
    if (sessionUser) {
        setUser(JSON.parse(sessionUser));
    }
  }, [setUser]);


  const handleLoginSuccess = (loggedInUser: any) => {
    setUser(loggedInUser);
    localStorage.setItem('sessionUser', JSON.stringify(loggedInUser));
  };
  
  const handleSetupComplete = (newUser: any) => {
    toast({
      title: 'Administrateur configuré !',
      description: 'Vous pouvez maintenant vous connecter avec vos nouveaux identifiants.',
    });
    setLoginStep('login');
  }

  const renderContent = () => {
    switch (loginStep) {
        case 'initial':
            return <InitialLoginForm onFirstLoginSuccess={() => setLoginStep('setup')} />;
        case 'setup':
            return <AdminSetupForm onSetupComplete={handleSetupComplete} />;
        case 'login':
            return <LoginForm onLoginSuccess={handleLoginSuccess} />;
        case 'loading':
        default:
             return <div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto"/></div>
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md space-y-8 p-4">
        <div className="text-center space-y-3">
            <div className="flex justify-center">
                <Image
                  src="/dcat-logo.svg"
                  alt="DCAT logo"
                  width={72}
                  height={72}
                  priority
                  className="drop-shadow-sm"
                />
            </div>
            <h1 className="mt-6 text-3xl font-headline font-bold tracking-tight text-foreground">
                StockFlow DCAT
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
                APPLICATION DE GESTION DE STOCK – DCAT
            </p>
        </div>
        
        {renderContent()}
        
      </div>
    </div>
  );
}
