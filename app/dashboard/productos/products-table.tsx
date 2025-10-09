'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Product } from './product';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Producto {
  id: number;
  nombre: string;
  peso: number;
}

//recibe los productos del backend y los lista
export function ProductsTable({
  products,
  offset,
  totalProducts
}: {
  products: Producto[];
  offset: number;
  totalProducts: number;
}) {
  const router = useRouter();
  const productsPerPage = 5;

  function prevPage() {
    const newOffset = Math.max(0, offset - productsPerPage);
    router.push(`/dashboard/productos?offset=${newOffset}`, { scroll: false });
  }

  function nextPage() {
    const newOffset = offset + productsPerPage;
    router.push(`/dashboard/productos?offset=${newOffset}`, { scroll: false });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos</CardTitle>
        <CardDescription>
          Gestioná los productos disponibles en la panadería.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Peso (g)</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <Product key={product.id} product={product} />
              ))
            ) : (
              <TableRow>
                <TableHead colSpan={3} className="text-center text-gray-500 py-4">
                  No hay productos registrados.
                </TableHead>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter>
        <div className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Mostrando{' '}
            <strong>
              {offset + 1}-{Math.min(offset + productsPerPage, totalProducts)}
            </strong>{' '}
            de <strong>{totalProducts}</strong> productos
          </div>

          <div className="flex">
            <Button
              onClick={prevPage}
              variant="ghost"
              size="sm"
              disabled={offset === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <Button
              onClick={nextPage}
              variant="ghost"
              size="sm"
              disabled={offset + productsPerPage >= totalProducts}
            >
              Siguiente
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}