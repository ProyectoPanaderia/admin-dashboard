'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Cliente } from './cliente';

interface ClienteType {
  id: number;
  nombre: string;
  ciudadNombre: string;
}

export function ClientesTable({ clientes }: { clientes: ClienteType[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Ciudad</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {clientes.map((cliente) => (
          <Cliente key={cliente.id} cliente={cliente} />
        ))}
      </TableBody>
    </Table>
  );
}