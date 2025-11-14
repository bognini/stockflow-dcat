'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowDown, ArrowUp, DollarSign, Package, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DashboardStats } from '@/lib/types';
import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  entrees: { label: 'Entrées', color: 'hsl(var(--chart-1))' },
  sorties: { label: 'Sorties', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;


export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
       <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardHeader className="pb-2"><Skeleton className="h-4 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-3 w-1/4 mt-1" /></CardContent></Card>
          <Card><CardHeader className="pb-2"><Skeleton className="h-4 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-3 w-1/4 mt-1" /></CardContent></Card>
          <Card><CardHeader className="pb-2"><Skeleton className="h-4 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-3 w-1/4 mt-1" /></CardContent></Card>
          <Card><CardHeader className="pb-2"><Skeleton className="h-4 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-3 w-1/4 mt-1" /></CardContent></Card>
        </div>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          <Card className="lg:col-span-4"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-[300px] w-full" /></CardContent></Card>
          <Card className="lg:col-span-3"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-[300px] w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale du stock</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.valeurStock.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles en stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
            <p className="text-xs text-muted-foreground">Total des unités uniques</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrées (30j)</CardTitle>
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.entrees30j}</div>
            <p className="text-xs text-muted-foreground">Total des articles ajoutés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sorties (30j)</CardTitle>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sorties30j}</div>
            <p className="text-xs text-muted-foreground">Total des articles retirés</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Mouvements de stock</CardTitle>
            <CardDescription>Entrées et sorties au cours des 6 derniers mois.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.mouvementsParMois} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                      <Tooltip 
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />} 
                      />
                      <Bar dataKey="entrees" fill="var(--color-entrees)" radius={4} />
                      <Bar dataKey="sorties" fill="var(--color-sorties)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Activité Récente</CardTitle>
            <CardDescription>Les derniers mouvements de stock enregistrés.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-center">Type</TableHead>
                    <TableHead className="text-right">Quantité</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.mouvementsRecents.map((mouvement) => (
                    <TableRow key={mouvement.id}>
                      <TableCell className="font-medium">{mouvement.produit.modele.nom}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={mouvement.type === 'ENTREE' ? 'default' : 'secondary'} className={mouvement.type === 'ENTREE' ? 'bg-green-500/20 text-green-700 border-green-500/30' : 'bg-red-500/20 text-red-700 border-red-500/30'}>
                          {mouvement.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${mouvement.type === 'ENTREE' ? 'text-green-600' : 'text-red-600'}`}>
                        {mouvement.type === 'ENTREE' ? '+' : '-'}{mouvement.quantite}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
