'use client';

import { AppLayoutProvider } from '@/app/(app)/layout-provider';

export default function AppLayout({ children }: { children: React.ReactNode }) {

  return (
    <AppLayoutProvider>
        {children}
    </AppLayoutProvider>
  );
}
