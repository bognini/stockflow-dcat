'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Boxes, FolderKanban, Home, Package, Settings, Users, Waypoints, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/common/Header';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import React, { PropsWithChildren } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: Home, roles: ['admin', 'marketing', 'technician'] },
  { href: '/stock', label: 'État du Stock', icon: Package, roles: ['admin', 'marketing', 'technician'] },
  { href: '/mouvements', label: 'Mouvements', icon: Waypoints, roles: ['admin', 'marketing'] },
  { href: '/produits', label: 'Produits', icon: Boxes, roles: ['admin', 'technician'] },
  { href: '/partenaires', label: 'Partenaires', icon: Users, roles: ['admin', 'marketing'] },
  { href: '/projets', label: 'Projets', icon: FolderKanban, roles: ['admin', 'marketing'] },
  { href: '/facturation', label: 'Facturation', icon: CreditCard, roles: ['admin'] },
  { href: '/parametres', label: 'Paramètres', icon: Settings, roles: ['admin'] },
];

// A simple utility to get the page title from the path
const getTitleFromPath = (path: string) => {
  if (path === '/dashboard') return 'Tableau de bord';
  const item = navItems.find((item) => path.startsWith(item.href));
  if (item) return item.label;
  if (path.startsWith('/profil')) return 'Profil Utilisateur';
  return 'StockFlow DCAT';
};

const getRoleText = (role: string) => {
    let roleName = '';
    switch (role) {
        case 'admin':
            roleName = 'Administrateur';
            break;
        case 'marketing':
            roleName = 'Marketing';
            break;
        case 'technician':
            roleName = 'Technicien';
            break;
        default:
            roleName = role.charAt(0).toUpperCase() + role.slice(1);
    }
    
    if (['A', 'E', 'I', 'O', 'U', 'Y'].includes(roleName[0].toUpperCase())) {
        return `en tant qu'${roleName}`;
    }
    return `en tant que ${roleName}`;
}

type AppShellContentProps = PropsWithChildren<{
  user: { role?: string };
  pathname: string;
  pageTitle: string;
}>;

function AppShellContent({ user, pathname, pageTitle, children }: AppShellContentProps) {
  const { setOpenMobile } = useSidebar();

  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-4 flex justify-center">
          <Link href="/dashboard" className="text-lg font-bold text-sidebar-foreground">
            StockFlow DCAT
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) =>
              !item.roles || (user.role && item.roles.includes(user.role)) ? (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                    onClick={() => setOpenMobile(false)}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null
            )}
          </SidebarMenu>
        </SidebarContent>
        {user.role && (
          <SidebarFooter className="p-4">
            <div className="text-xs text-sidebar-foreground/50">
              Connecté {getRoleText(user.role)}
            </div>
          </SidebarFooter>
        )}
      </Sidebar>
      <SidebarInset className="bg-background">
        <Header title={pageTitle} />
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </>
  );
}

export function AppLayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const pageTitle = getTitleFromPath(pathname);

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Chargement...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Redirection vers la connexion…</span>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppShellContent user={user} pathname={pathname} pageTitle={pageTitle}>
        {children}
      </AppShellContent>
    </SidebarProvider>
  );
}
