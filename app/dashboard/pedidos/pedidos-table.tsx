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
import { Pedido } from './pedido'; // Importamos el componente fila
import { Pedido as PedidoType } from '@/types/pedido';

export function PedidosTable({ pedidos }: { pedidos: PedidoType[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Pedidos</CardTitle>
        <CardDescription>Gestión de pedidos.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">#ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Reparto</TableHead>
              <TableHead>Emisión</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.length > 0 ? (
              pedidos.map((p) => (
                <Pedido key={p.id} pedido={p} />
              ))
            ) : (
              <TableRow>
                <TableHead colSpan={8} className="text-center py-10 text-muted-foreground">
                  No se encontraron pedidos registrados.
                </TableHead>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}