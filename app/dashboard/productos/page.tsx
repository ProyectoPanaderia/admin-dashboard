// app/dashboard/productos/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductsTable } from './products-table';

// URL del backend (podés mover esto a process.env.NEXT_PUBLIC_API_URL)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { q?: string; offset?: string };
}) {
  const search = searchParams?.q ?? '';
  const offset = searchParams?.offset ?? '0';

  //Llamada a la API
  const res = await fetch(`${API_BASE_URL}/productos?search=${search}&offset=${offset}`, {
    cache: 'no-store', // evita cachear datos
  });

  if (!res.ok) {
    console.error('Error al obtener productos');
    return <p className="p-4 text-red-500">Error al obtener los productos</p>;
  }

  const data = await res.json();

  // { productos: [...], total: number, offset: number }
  const productos = data.productos ?? [];
  const totalProductos = data.total ?? 0;
  const newOffset = data.offset ?? 0;

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Exportar
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Nuevo producto
            </span>
          </Button>
        </div>
      </div>

      <TabsContent value="all">
        <ProductsTable
          products={productos}
          offset={newOffset}
          totalProducts={totalProductos}
        />
      </TabsContent>
    </Tabs>
  );
}
