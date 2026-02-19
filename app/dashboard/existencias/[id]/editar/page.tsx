'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function EditarExistenciaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  
  // Listas
  const [productos, setProductos] = useState<{id: number, nombre: string}[]>([]);
  const [repartos, setRepartos] = useState<{id: number, nombre: string}[]>([]);

  // Form
  const [productoId, setProductoId] = useState('');
  const [repartoId, setRepartoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [fechaE, setFechaE] = useState('');
  const [fechaV, setFechaV] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!session?.user?.token) return;

      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`
        };
        
        const [resProd, resRep, resEx] = await Promise.all([
          fetch(`${API_BASE_URL}/productos`, { headers }),
          fetch(`${API_BASE_URL}/repartos`, { headers }),
          fetch(`${API_BASE_URL}/existencias/${id}`, { headers })
        ]);

        const dProd = await resProd.json();
        const dRep = await resRep.json();
        const dEx = await resEx.json();
        const existencia = dEx.data || dEx;

        const listaProductos = Array.isArray(dProd) ? dProd : (dProd.data || []);
        const listaRepartos = Array.isArray(dRep) ? dRep : (dRep.data || []);

        setProductos(listaProductos);
        setRepartos(listaRepartos);

        // Poblar formulario
        setProductoId(existencia.productoId?.toString() || '');
        setRepartoId(existencia.repartoId?.toString() || '');
        setCantidad(existencia.cantidad?.toString() || '');
        
        // Verificamos si existe antes de cortar el string. 
        // Si es null o undefined, ponemos string vacío para el input.
        const rawFechaE = existencia.fechaE;
        const rawFechaV = existencia.fechaV;

        setFechaE(rawFechaE ? String(rawFechaE).split('T')[0] : '');
        setFechaV(rawFechaV ? String(rawFechaV).split('T')[0] : '');

      } catch (error) {
        console.error("Error cargando datos", error);
        alert('No se pudo cargar la información');
      } finally {
        setLoading(false);
      }
    }

    if (id && session?.user?.token) {
      loadData()
    };
  }, [id, session?.user?.token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const payload = {
      productoId: Number(productoId),
      repartoId: Number(repartoId),
      cantidad: Number(cantidad),
      fechaE: fechaE || null, 
      fechaV: fechaV || null,
    };

    console.log("Enviando payload:", payload); // Para debugear

    try {
      const res = await fetch(`${API_BASE_URL}/existencias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json',
                   'Authorization': `Bearer ${session?.user?.token}`
         },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/dashboard/existencias');
        router.refresh();
      } else {
        const errorData = await res.json();
        console.error("Error backend:", errorData);
        alert(`Error al actualizar: ${errorData.message || 'Datos inválidos'}`);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    }
  }

  if (loading) return <div className="p-8 text-center">Cargando lote...</div>;

  return (
    <div className="flex justify-center items-center min-h-screen p-8 bg-muted/10">
      <Card className="w-full max-w-lg shadow-md">
        <CardHeader>
          <CardTitle>Editar Existencia #{id}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Producto</Label>
                <Select value={productoId} onValueChange={setProductoId} disabled>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {productos.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">El producto no se puede cambiar en edición.</p>
              </div>

              <div className="space-y-2">
                <Label>Reparto</Label>
                <Select value={repartoId} onValueChange={setRepartoId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {repartos.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cantidad</Label>
              <Input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha Elaboración</Label>
                <Input type="date" value={fechaE} onChange={e => setFechaE(e.target.value)} 
                required/>
              </div>
              <div className="space-y-2">
                <Label>Fecha Vencimiento</Label>
                <Input type="date" value={fechaV} onChange={e => setFechaV(e.target.value)} 
                required/>
              </div>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-2 bg-muted/5 p-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit">Actualizar</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}