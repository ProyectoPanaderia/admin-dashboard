import Link from 'next/link';
import {
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  Settings,
  Users2,
  Building2 // 🏙️ ícono para ciudades
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Analytics } from '@vercel/analytics/react';
import { VercelLogo } from '@/components/icons';
import Providers from './providers';
import { NavItem } from './nav-item';
import { SearchInput } from './search';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

function DashboardBreadcrumb() {
  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Inicio</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="#">Gestión</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Panel</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <main className="flex min-h-screen w-full flex-col bg-muted/40">
        <DesktopNav />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <MobileNav />
            <DashboardBreadcrumb />
            <SearchInput />
          </header>
          <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
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
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 
                     rounded-full bg-primary text-lg font-semibold text-primary-foreground 
                     md:h-8 md:w-8 md:text-base"
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

        {/* 🏙️ Nueva sección de Ciudades */}
        <NavItem href="/dashboard/ciudades" label="Ciudades">
          <Building2 className="h-5 w-5" />
        </NavItem>
      </nav>

      {/* Footer de navegación */}
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/dashboard/configuracion"
              className="flex h-9 w-9 items-center justify-center rounded-lg 
                         text-muted-foreground transition-colors hover:text-foreground 
                         md:h-8 md:w-8"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Configuración</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Configuración</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
}

function MobileNav() {
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
          <h2>Menú de navegación</h2>
        </VisuallyHidden>

        <nav className="grid gap-6 text-lg font-medium">
          {/* Logo */}
          <SheetClose asChild>
            <Link
              href="/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 
                         rounded-full bg-primary text-lg font-semibold text-primary-foreground 
                         md:text-base"
            >
              <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Inicio</span>
            </Link>
          </SheetClose>

          {/* Enlaces */}
          <SheetClose asChild>
            <Link
              href="/dashboard"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-5 w-5" />
              Inicio
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link
              href="/dashboard/productos"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Package className="h-5 w-5" />
              Productos
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link
              href="/dashboard/clientes"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Users2 className="h-5 w-5" />
              Clientes
            </Link>
          </SheetClose>

          {/* 🏙️ Nueva opción de Ciudades */}
          <SheetClose asChild>
            <Link
              href="/dashboard/ciudades"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Building2 className="h-5 w-5" />
              Ciudades
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link
              href="/dashboard/admin"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <LineChart className="h-5 w-5" />
              Administración
            </Link>
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
}