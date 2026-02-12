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
import { Existencia } from './existencia';

interface ExistenciaType {
  id: number;
  fechaE: string;
  fechaV: string;
  cantidad: number;
  productoId: number;
  repartoId: number;
  Producto?: { nombre: string; peso?: number };
  Reparto?: { nombre: string };
}

export function ExistenciasTable({ existencias }: { existencias: ExistenciaType[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos disponibles</CardTitle>
        <CardDescription>
          Gestioná el stock físico, vencimientos y lotes por reparto.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Reparto</TableHead>
              <TableHead>Fecha Elaboración</TableHead>
              <TableHead>Fecha Vencimiento</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {existencias.length > 0 ? (
              existencias.map((existencia) => (
                <Existencia key={existencia.id} existencia={existencia} />
              ))
            ) : (
              <TableRow>
                <TableHead
                  colSpan={6}
                  className="text-center text-gray-500 py-4"
                >
                  No hay existencias registradas.
                </TableHead>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}