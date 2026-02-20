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
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { DevolucionRow } from './devolucion'; 

// Acá deberías importar tu tipo Devolucion desde tu carpeta types
export function DevolucionesTable({ devoluciones }: { devoluciones: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Devoluciones</CardTitle>
        <CardDescription>Mercadería devuelta por los clientes.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">#ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Reparto</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead className="text-right">Total a Favor</TableHead>
              <TableHead className="w-[100px]"></TableHead> 
            </TableRow>
          </TableHeader>
          <TableBody>
            {devoluciones.length > 0 ? (
              devoluciones.map((d) => (
                <DevolucionRow key={d.id} devolucion={d} />
              ))
            ) : (
              <TableRow>
                <TableHead colSpan={7} className="text-center py-10 text-muted-foreground">
                  No se encontraron devoluciones registradas.
                </TableHead>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}