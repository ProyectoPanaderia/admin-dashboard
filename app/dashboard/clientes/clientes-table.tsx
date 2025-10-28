'use client';

import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Cliente } from './cliente';

interface ClienteType {
  id: number;
  nombre: string;
  ciudadNombre: string;
}

export function ClientesTable({ clientes }: { clientes: ClienteType[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de clientes</CardTitle>
        <CardDescription>
          Gestioná los clientes registrados en la panadería.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {clientes.length > 0 ? (
              clientes.map((cliente) => (
                <Cliente key={cliente.id} cliente={cliente} />
              ))
            ) : (
              <TableRow>
                <TableHead
                  colSpan={4}
                  className="text-center text-gray-500 py-4"
                >
                  No hay clientes registrados.
                </TableHead>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}