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
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Product } from './product';

interface Producto {
  id: number;
  nombre: string;
  peso: number;
}

// Recibe los productos del backend y los lista
export function ProductsTable({ products }: { products: Producto[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de productos</CardTitle>
        <CardDescription>
          Gestioná los productos disponibles en la panadería.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
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
                <TableHead
                  colSpan={4}
                  className="text-center text-gray-500 py-4"
                >
                  No hay productos registrados.
                </TableHead>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}