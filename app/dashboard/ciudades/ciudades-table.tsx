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
import { Ciudad } from './ciudad';

interface CiudadType {
  id: number;
  nombre: string;
}

export function CiudadesTable({ ciudades }: { ciudades: CiudadType[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de ciudades</CardTitle>
        <CardDescription>
          Gestioná las ciudades disponibles para asignar a los clientes.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {ciudades.length > 0 ? (
              ciudades.map((ciudad) => (
                <Ciudad key={ciudad.id} ciudad={ciudad} />
              ))
            ) : (
              <TableRow>
                <TableHead
                  colSpan={3}
                  className="text-center text-gray-500 py-4"
                >
                  No hay ciudades registradas.
                </TableHead>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}