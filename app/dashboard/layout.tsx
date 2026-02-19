import Link from 'next/link';
import Image from 'next/image';
import { PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Analytics } from '@vercel/analytics/react';
import Providers from './providers';
import { NavItem } from './nav-item';
import DashboardBreadcrumb from '@/components/DashboardBreadcumb';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DialogTitle } from '@radix-ui/react-dialog';
import { LogoutButton } from '@/components/ui/logout-button';
import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const rol = session?.user?.rol;
  const esAdmin = rol === 'SUPERADMIN' || rol === 'ADMINISTRADOR';

  return (
    <Providers>
      <main className="flex min-h-screen w-full flex-col bg-muted/40">
        {/* Pasamos el rol a los componentes de navegación */}
        <DesktopNav esAdmin={esAdmin} />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-16">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <MobileNav esAdmin={esAdmin} />
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

function DesktopNav({ esAdmin }: { esAdmin: boolean }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-16 flex-col border-r bg-background sm:flex h-screen">
      <nav className="flex flex-col items-center gap-4 px-2 py-5 h-full">
        <div className="flex h-9 w-9 items-center justify-center mb-2">
          <Image src="/cuerno.png" alt="Logo" width={32} height={32} className="object-contain" />
        </div>

        <div className="flex flex-col items-center gap-4 flex-1">
          <NavItem href="/dashboard" label="Inicio">
            <Image src="/hogar.png" alt="Inicio" width={20} height={20} className="object-contain" />
          </NavItem>

          {/* RUTAS SOLO PARA ADMIN */}
          {esAdmin && (
            <>
              <NavItem href="/dashboard/productos" label="Productos">
                <Image src="/caja-negra.png" alt="Productos" width={20} height={20} className="object-contain" />
              </NavItem>
              <NavItem href="/dashboard/clientes" label="Clientes">
                <Image src="/personas.png" alt="Clientes" width={20} height={20} className="object-contain" />
              </NavItem>
              <NavItem href="/dashboard/ciudades" label="Ciudades">
                <Image src="/edificio.png" alt="Ciudades" width={20} height={20} className="object-contain" />
              </NavItem>
              <NavItem href="/dashboard/repartos" label="Repartos">
                <Image src="/camion.png" alt="Repartos" width={20} height={20} className="object-contain" />
              </NavItem>
            </>
          )}

          {/* RUTAS PARA TODOS (ADMIN Y REPARTIDOR) */}
          <NavItem href="/dashboard/existencias" label="Existencias">
            <Image src="/existencias.png" alt="Existencias" width={20} height={20} className="object-contain" />
          </NavItem>

          <NavItem href="/dashboard/pedidos" label="Pedidos">
            <Image src="/entrega-de-pedidos.png" alt="Pedidos" width={20} height={20} className="object-contain" />
          </NavItem>
        </div>

        <div className="pb-4">
          <LogoutButton />
        </div>
      </nav>
    </aside>
  );
}

export function MobileNav({ esAdmin }: { esAdmin: boolean }) {
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
        <nav className="grid gap-6 text-lg font-medium mt-4 h-full flex-col">
          <SheetClose asChild>
            <Link href="/dashboard" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Image src="/hogar.png" alt="Inicio" width={20} height={20} className="object-contain" />
              Inicio
            </Link>
          </SheetClose>

          {esAdmin && (
            <>
              <SheetClose asChild>
                <Link href="/dashboard/productos" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                  <Image src="/caja-negra.png" alt="Productos" width={20} height={20} className="object-contain" />
                  Productos
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/dashboard/clientes" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                  <Image src="/personas.png" alt="Clientes" width={20} height={20} className="object-contain" />
                  Clientes
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/dashboard/ciudades" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                  <Image src="/edificio.png" alt="Ciudades" width={20} height={20} className="object-contain" />
                  Ciudades
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/dashboard/repartos" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                  <Image src="/camion.png" alt="Repartos" width={20} height={20} className="object-contain" />
                  Repartos
                </Link>
              </SheetClose>
            </>
          )}

          <SheetClose asChild>
            <Link href="/dashboard/existencias" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Image src="/existencias.png" alt="Existencias" width={20} height={20} className="object-contain" />
              Existencias
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="/dashboard/pedidos" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Image src="/entrega-de-pedidos.png" alt="Pedidos" width={20} height={20} className="object-contain" />
              Pedidos
            </Link>
          </SheetClose>

          <div className="mt-auto border-t pt-4">
             <LogoutButton isMobile />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}