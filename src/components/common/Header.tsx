import { UserNav } from '@/components/common/UserNav';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface HeaderProps {
    title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="flex-1 text-2xl font-headline font-semibold">{title}</h1>
      <div className="flex items-center gap-4">
        {/* Future search bar can go here */}
      </div>
      <UserNav />
    </header>
  );
}
