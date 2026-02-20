'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ArrowLeft, Printer } from 'lucide-react';
import { useSession } from 'next-auth/react'; 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function VerDevolucionPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession(); 
  const { id } = use(params);
  const router = useRouter();
  const [devolucion, setDevolucion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDevolucion() {
      if (!session?.user?.token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/devoluciones/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.user.token}`
          }
        });

        if (!res.ok) throw new Error('No se pudo obtener la devolución');

        const json = await res.json();
        setDevolucion(json.data || json);
      } catch (error) {
        console.error("Error al cargar devolución:", error);
        setError('No se pudo cargar la información de la devolución.');
      } finally {
        setLoading(false);
      }
    }
    
    if (session?.user?.token) fetchDevolucion();
  }, [id, session?.user?.token]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-AR', { timeZone: 'UTC' });
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(amount) || 0);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando detalles de la devolución...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!devolucion) return <div className="p-8 text-center text-red-500">No se encontró la devolución.</div>;

  return (
    <div className="flex justify-center min-h-screen p-6 bg-muted/10">
      <div className="w-full max-w-4xl space-y-6">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver
            </Button>
            <h1 className="text-2xl font-bold">Detalle de Devolución #{devolucion.id}</h1>
          </div>
          
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-muted-foreground">Datos del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Nombre:</strong> {devolucion.Cliente?.nombre} {devolucion.Cliente?.apellido}</p>
              <p><strong>Dirección:</strong> {devolucion.Cliente?.direccion || 'No registrada'}</p>
              <p><strong>Reparto:</strong> {devolucion.Reparto?.nombre || '-'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-muted-foreground">Información de Devolución</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Fecha:</strong> {formatDate(devolucion.fecha)}</p>
              <p>
                <strong>Motivo:</strong> 
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 border">
                  {devolucion.razon}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Productos Devueltos</CardTitle>
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
                {devolucion.lineas && devolucion.lineas.length > 0 ? (
                  devolucion.lineas.map((linea: any) => (
                    <TableRow key={linea.id}>
                      <TableCell>{linea.descripcion}</TableCell>
                      <TableCell className="text-right">{linea.cantidad}</TableCell>
                      <TableCell className="text-right">{formatMoney(linea.precioUnitario)}</TableCell>
                      <TableCell className="text-right font-medium text-red-600">-{formatMoney(linea.subtotal)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      Esta devolución no tiene productos registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex justify-end mt-6 border-t pt-4">
              <div className="text-2xl font-bold text-red-600">
                Total a Favor: -{formatMoney(devolucion.total)}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}