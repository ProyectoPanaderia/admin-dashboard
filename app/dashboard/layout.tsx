import Link from 'next/link';
import { Home, LineChart, Package, PanelLeft, Users2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Analytics } from '@vercel/analytics/react';
import { VercelLogo } from '@/components/icons';
import Providers from './providers';
import { NavItem } from './nav-item';
import DashboardBreadcrumb from '@/components/DashboardBreadcumb';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DialogTitle } from '@radix-ui/react-dialog';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <main className="flex min-h-screen w-full flex-col bg-muted/40">
        <DesktopNav />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <MobileNav />
            <DashboardBreadcrumb />
          </header>

          <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 md:gap-4 bg-muted/40">
            {children}
          </main>
        </div>
        <Analytics />
      </main>
    </Providers>
  );
}

function DesktopNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="group flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold"
        >
          <VercelLogo className="h-3 w-3 transition-all group-hover:scale-110" />
          <span className="sr-only">Inicio</span>
        </Link>

        <NavItem href="/dashboard" label="Inicio">
          <Home className="h-5 w-5" />
        </NavItem>

        <NavItem href="/dashboard/productos" label="Productos">
          <Package className="h-5 w-5" />
        </NavItem>

        <NavItem href="/dashboard/clientes" label="Clientes">
          <Users2 className="h-5 w-5" />
        </NavItem>

        <NavItem href="/dashboard/ciudades" label="Ciudades">
          <Building2 className="h-5 w-5" />
        </NavItem>

        <NavItem href="/dashboard/repartos" label="Repartos">
          <LineChart className="h-5 w-5" />
        </NavItem>

        <NavItem href="/dashboard/existencias" label="Existencias">
          <LineChart className="h-5 w-5" />
        </NavItem>

        <NavItem href="/dashboard/pedidos" label="Pedidos">
          <LineChart className="h-5 w-5" />
        </NavItem>
      </nav>
    </aside>
  );
}

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="sm:max-w-xs">
        <VisuallyHidden>
          <DialogTitle>Menú de navegación</DialogTitle>
        </VisuallyHidden>

        <nav className="grid gap-6 text-lg font-medium mt-4">
          <SheetClose asChild>
            <Link href="/dashboard" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Home className="h-5 w-5" />
              Inicio
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link href="/dashboard/productos" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Package className="h-5 w-5" />
              Productos
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link href="/dashboard/clientes" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Users2 className="h-5 w-5" />
              Clientes
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link href="/dashboard/ciudades" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Building2 className="h-5 w-5" />
              Ciudades
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link
              href="/dashboard/repartos"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
              <LineChart className="h-5 w-5" />
              Repartos
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link
              href="/dashboard/existencias"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
              <LineChart className="h-5 w-5" />
              Existencias
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link
              href="/dashboard/pedidos"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
              <LineChart className="h-5 w-5" />
              Pedidos
            </Link>
          </SheetClose>
          
        </nav>
      </SheetContent>
    </Sheet>
  );
}