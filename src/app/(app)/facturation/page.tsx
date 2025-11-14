import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export default function FacturationPage() {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-10 min-h-[400px]">
      <CardHeader>
        <div className="mx-auto bg-primary/10 p-4 rounded-full">
            <CreditCard className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="mt-6 font-headline">Facturation</CardTitle>
        <CardDescription className="mt-2 max-w-md">
          Cette section est en cours de développement. Bientôt, vous pourrez gérer vos abonnements et consulter votre historique de facturation.
        </CardDescription>
      </CardHeader>
      <CardContent>
      </CardContent>
    </Card>
  );
}
