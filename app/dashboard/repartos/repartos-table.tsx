'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from '@/components/ui/table';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Reparto } from './reparto';

interface RepartoType {
  id: number;
  nombre: string;
  tercerizado: string;
  estado: string;
}

export function RepartosTable({ repartos }: { repartos: RepartoType[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de repartos</CardTitle>
        <CardDescription>
          Gestioná los repartos activos o inactivos.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Tercerizado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {repartos.length > 0 ? (
              repartos.map((rep) => (
                <Reparto key={rep.id} reparto={rep} />
              ))
            ) : (
              <TableRow>
                <TableHead
                  colSpan={5}
                  className="text-center text-gray-500 py-4"
                >
                  No hay repartos registrados.
                </TableHead>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}