'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ciudad } from './ciudad';

interface CiudadType {
  id: number;
  nombre: string;
}

export function CiudadesTable({ ciudades }: { ciudades: CiudadType[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {ciudades.map((ciudad) => (
          <Ciudad key={ciudad.id} ciudad={ciudad} />
        ))}
      </TableBody>
    </Table>
  );
}