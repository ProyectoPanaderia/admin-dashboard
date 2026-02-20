'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Trash2, Plus, Save, ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface LineaForm {
  id?: number;
  tempId: number;
  productoId: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  esNueva: boolean;
}

export default function EditarDevolucionPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
  const { id } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const userRole = session?.user?.rol;

  const [clientes, setClientes] = useState<{id: number, nombre: string, apellido: string}[]>([]);
  const [repartos, setRepartos] = useState<{id: number, nombre: string}[]>([]);
  const [productos, setProductos] = useState<{id: number, nombre: string, precio?: number}[]>([]);

  // Estado Cabecera
  const [clienteId, setClienteId] = useState('');
  const [repartoId, setRepartoId] = useState('');
  const [fecha, setFecha] = useState('');
  const [razon, setRazon] = useState('');

  // Estado Detalle
  const [lineas, setLineas] = useState<LineaForm[]>([]);
  const [lineasOriginalesIds, setLineasOriginalesIds] = useState<number[]>([]);

  const totalEstimado = lineas.reduce((acc, curr) => acc + curr.subtotal, 0);

  useEffect(() => {
    async function loadData() {
      if (!session?.user?.token) return;

      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`
        };

        const [resCli, resRep, resProd, resDev] = await Promise.all([
          fetch(`${API_BASE_URL}/clientes`, { headers }),
          fetch(`${API_BASE_URL}/repartos`, { headers }),
          fetch(`${API_BASE_URL}/productos`, { headers }),
          fetch(`${API_BASE_URL}/devoluciones/${id}`, { headers })
        ]);

        const dCli = await resCli.json();
        const dRep = await resRep.json();
        const dProd = await resProd.json();
        const dDevWrap = await resDev.json();

        const devolucion = dDevWrap.data || dDevWrap;

        setClientes(dCli.data || []);
        setRepartos(Array.isArray(dRep) ? dRep : (dRep.data || []));
        setProductos(dProd.data || []);

        setClienteId(devolucion.clienteId?.toString() || '');
        setRepartoId(devolucion.repartoId?.toString() || '');
        setRazon(devolucion.razon || '');
        
        if (devolucion.fecha) setFecha(devolucion.fecha.split('T')[0]);

        if (devolucion.lineas && Array.isArray(devolucion.lineas)) {
          const lineasMapeadas: LineaForm[] = devolucion.lineas.map((l: any) => ({
            id: l.id,
            tempId: l.id, 
            productoId: l.productoId?.toString() || '',
            descripcion: l.descripcion,
            cantidad: Number(l.cantidad),
            precioUnitario: Number(l.precioUnitario),
            subtotal: Number(l.subtotal),
            esNueva: false
          }));
          setLineas(lineasMapeadas);
          setLineasOriginalesIds(lineasMapeadas.map(l => l.id!));
        }

      } catch (error) {
        console.error("Error cargando datos", error);
        alert('No se pudo cargar la devolución');
      } finally {
        setLoading(false);
      }
    }
    
    if (session?.user?.token) loadData();
  }, [id, session?.user?.token]);

  async function fetchPrecioVigente(productoId: number, fechaConsulta: string): Promise<number> {
    if (!session?.user?.token) return 0;
    const dateToUse = fechaConsulta || new Date().toISOString().split('T')[0];
    try {
      const res = await fetch(
        `${API_BASE_URL}/precio-productos/vigente/${productoId}?fecha=${dateToUse}&nombre=reventa`,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.user.token}` } }
      );
      if (!res.ok) return 0;
      const json = await res.json();
      return json.data?.valor || 0; 
    } catch {
      return 0;
    }
  }

  const agregarLinea = () => {
    setLineas([
      ...lineas,
      { tempId: Date.now(), productoId: '', descripcion: '', cantidad: 1, precioUnitario: 0, subtotal: 0, esNueva: true }
    ]);
  };

  const eliminarLinea = (tempId: number) => {
    setLineas(lineas.filter(l => l.tempId !== tempId));
  };

  const actualizarLinea = async (tempId: number, field: keyof LineaForm, value: any) => {
    let nuevoPrecio = 0;
    let nombreProd = '';

    if (field === 'productoId') {
      const prod = productos.find(p => p.id.toString() === value);
      if (prod) {
        nombreProd = prod.nombre;
        nuevoPrecio = await fetchPrecioVigente(prod.id, fecha); 
      }
    }

    setLineas(prevLineas => prevLineas.map(linea => {
      if (linea.tempId !== tempId) return linea;
      
      const updatedLinea = { ...linea };

      if (field === 'productoId') {
        updatedLinea.productoId = value;
        updatedLinea.descripcion = nombreProd;
        updatedLinea.precioUnitario = nuevoPrecio;
      } else if (field === 'cantidad') {
        updatedLinea.cantidad = parseInt(value, 10) || 0;
      }

      updatedLinea.subtotal = Number(updatedLinea.cantidad) * Number(updatedLinea.precioUnitario);
      return updatedLinea;
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!razon.trim()) {
      alert('Debes ingresar el motivo de la devolución.');
      return;
    }

    setSaving(true);

    try {
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user?.token}`
      };

      const payloadCabecera = {
        clienteId: Number(clienteId),
        repartoId: Number(repartoId),
        fecha,
        razon,
        total: totalEstimado 
      };
      
      const resHead = await fetch(`${API_BASE_URL}/devoluciones/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payloadCabecera),
      });
      if (!resHead.ok) throw new Error('Error actualizando cabecera');

      // Borramos las que ya no están
      const idsActuales = lineas.filter(l => !l.esNueva).map(l => l.id);
      const idsParaBorrar = lineasOriginalesIds.filter(oldId => !idsActuales.includes(oldId));

      for (const idBorrar of idsParaBorrar) {
        await fetch(`${API_BASE_URL}/lineas-devolucion/${idBorrar}`, { method: 'DELETE', headers });
      }

      // Creamos o editamos
      for (const linea of lineas) {
        if (!linea.productoId) continue;

        const payloadLinea = {
            devolucionId: Number(id),
            productoId: Number(linea.productoId),
            cantidad: Number(linea.cantidad),
            precioUnitario: Number(linea.precioUnitario),
            descripcion: linea.descripcion
        };

        if (linea.esNueva) {
          await fetch(`${API_BASE_URL}/lineas-devolucion`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payloadLinea)
          });
        } else {
          await fetch(`${API_BASE_URL}/lineas-devolucion/${linea.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(payloadLinea)
          });
        }
      }

      router.push('/dashboard/devoluciones');
      router.refresh();

    } catch (error) {
      console.error(error);
      alert('Ocurrió un error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Cargando devolución...</div>;

  return (
    <div className="flex justify-center min-h-screen p-6 bg-muted/10">
      <form onSubmit={handleSubmit} className="w-full max-w-4xl space-y-6">
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Editar Devolución #{id}</h1>
          <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
          </Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Datos Generales</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {clientes.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nombre} {c.apellido}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reparto</Label>
              <Select 
                value={repartoId} 
                onValueChange={setRepartoId}
                disabled={userRole === 'REPARTIDOR'}
              >
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {repartos.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
                <Label>Fecha</Label>
                <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label>Motivo</Label>
                <Input type="text" value={razon} onChange={e => setRazon(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Productos Devueltos</CardTitle>
            <Button type="button" size="sm" onClick={agregarLinea} variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Agregar
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="w-[100px]">Precio Unitario</TableHead>
                  <TableHead className="w-[100px]">Cantidad</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineas.map((linea) => (
                  <TableRow key={linea.tempId}>
                    <TableCell>
                      <Select 
                        value={linea.productoId} 
                        onValueChange={(val) => actualizarLinea(linea.tempId, 'productoId', val)}
                      >
                        <SelectTrigger className="h-8"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                        <SelectContent>
                          {productos.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                        <Input 
                            type="number" 
                            className="h-8 w-24 bg-muted cursor-not-allowed font-medium text-muted-foreground"
                            value={linea.precioUnitario} 
                            readOnly
                            disabled
                        />
                    </TableCell>
                    <TableCell>
                        <Input 
                            type="number" className="h-8 w-20" min="1"
                            value={linea.cantidad} 
                            onChange={(e) => actualizarLinea(linea.tempId, 'cantidad', e.target.value)}                        
                        />
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">-${linea.subtotal.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => eliminarLinea(linea.tempId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-end border-t p-4 bg-muted/5">
             <div className="text-xl font-bold text-red-600">Total a Favor: -${totalEstimado.toFixed(2)}</div>
          </CardFooter>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving} className="w-40">
            {saving ? 'Guardando...' : <><Save className="h-4 w-4 mr-2" /> Guardar</>}
          </Button>
        </div>
      </form>
    </div>
  );
}