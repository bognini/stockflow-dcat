import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FolderKanban } from 'lucide-react';

export default function ProjetsPage() {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-10 min-h-[400px]">
      <CardHeader>
         <div className="mx-auto bg-primary/10 p-4 rounded-full">
            <FolderKanban className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="mt-6 font-headline">Gestion des Projets</CardTitle>
        <CardDescription className="mt-2 max-w-md">
          La fonctionnalité de gestion de projets arrive prochainement. Vous pourrez lier des projets à des clients, assigner des équipements et suivre l'avancement.
        </CardDescription>
      </CardHeader>
      <CardContent>
      </CardContent>
    </Card>
  );
}
