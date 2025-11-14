import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function PartenairesPage() {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-10 min-h-[400px]">
      <CardHeader>
        <div className="mx-auto bg-primary/10 p-4 rounded-full">
            <Users className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="mt-6 font-headline">Gestion des Partenaires</CardTitle>
        <CardDescription className="mt-2 max-w-md">
          Cette section est en cours de développement. Bientôt, vous pourrez gérer votre liste de partenaires, consulter leurs informations et suivre les projets associés.
        </CardDescription>
      </CardHeader>
      <CardContent>
      </CardContent>
    </Card>
  );
}
