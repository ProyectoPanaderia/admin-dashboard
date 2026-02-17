'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ArrowLeft, Printer } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function VerPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [pedido, setPedido] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPedido() {
      try {
        const res = await fetch(`${API_BASE_URL}/pedidos/${id}`);
        const json = await res.json();
        setPedido(json.data || json);
      } catch (error) {
        console.error("Error al cargar pedido:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPedido();
  }, [id]);

  // Formateadores
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-AR', { timeZone: 'UTC' });
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(amount) || 0);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando detalles del pedido...</div>;
  if (!pedido) return <div className="p-8 text-center text-red-500">No se encontró el pedido.</div>;

  return (
    <div className="flex justify-center min-h-screen p-6 bg-muted/10">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Encabezado y Botones */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver
            </Button>
            <h1 className="text-2xl font-bold">Detalle de Pedido #{pedido.id}</h1>
          </div>
          
          {/* Botón de imprimir (visual por ahora, ideal para el futuro) */}
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarjeta Cliente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-muted-foreground">Datos del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Nombre:</strong> {pedido.Cliente?.nombre} {pedido.Cliente?.apellido}</p>
              <p><strong>Dirección:</strong> {pedido.Cliente?.direccion || 'No registrada'}</p>
              <p><strong>Reparto:</strong> {pedido.Reparto?.nombre || '-'}</p>
            </CardContent>
          </Card>

          {/* Tarjeta Estado */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-muted-foreground">Información del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Emisión:</strong> {formatDate(pedido.fechaEmision)}</p>
              <p><strong>Entrega:</strong> {formatDate(pedido.fechaEntrega)}</p>
              <p>
                <strong>Estado:</strong> 
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 border">
                  {pedido.estado}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tarjeta Productos (Solo lectura) */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Solicitados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio Unitario</TableHead>
                  <TableHead className="text-right font-bold">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedido.lineas && pedido.lineas.length > 0 ? (
                  pedido.lineas.map((linea: any) => (
                    <TableRow key={linea.id}>
                      <TableCell>{linea.descripcion}</TableCell>
                      <TableCell className="text-right">{linea.cantidad}</TableCell>
                      <TableCell className="text-right">{formatMoney(linea.precioUnitario)}</TableCell>
                      <TableCell className="text-right font-medium">{formatMoney(linea.subtotal)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      Este pedido no tiene productos registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex justify-end mt-6 border-t pt-4">
              <div className="text-2xl font-bold">
                Total: {formatMoney(pedido.total)}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}