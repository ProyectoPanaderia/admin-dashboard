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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Tipos locales
interface LineaForm {
  id?: number;       // ID real de la base de datos (si existe)
  tempId: number;    // ID temporal para React (key)
  productoId: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  esNueva: boolean;  // Para saber si hacemos POST o PATCH
}

export default function EditarPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  // Desempaquetamos params (Next.js 15+)
  const { id } = use(params);
  
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- Datos Maestros ---
  const [clientes, setClientes] = useState<{id: number, nombre: string, apellido: string}[]>([]);
  const [repartos, setRepartos] = useState<{id: number, nombre: string}[]>([]);
  const [productos, setProductos] = useState<{id: number, nombre: string, precio?: number}[]>([]);

  // --- Estado Cabecera ---
  const [clienteId, setClienteId] = useState('');
  const [repartoId, setRepartoId] = useState('');
  const [fechaEmision, setFechaEmision] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [estado, setEstado] = useState('Pendiente');

  // --- Estado Detalle (Líneas) ---
  const [lineas, setLineas] = useState<LineaForm[]>([]);
  
  // Guardamos los IDs originales para saber cuáles borrar
  const [lineasOriginalesIds, setLineasOriginalesIds] = useState<number[]>([]);

  // Total calculado en frontend
  const totalEstimado = lineas.reduce((acc, curr) => acc + curr.subtotal, 0);

  // 1. CARGA INICIAL DE DATOS
  useEffect(() => {
    async function loadData() {
      try {
        const [resCli, resRep, resProd, resPedido] = await Promise.all([
          fetch(`${API_BASE_URL}/clientes`),
          fetch(`${API_BASE_URL}/repartos`),
          fetch(`${API_BASE_URL}/productos`),
          fetch(`${API_BASE_URL}/pedidos/${id}`)
        ]);

        const dCli = await resCli.json();
        const dRep = await resRep.json();
        const dProd = await resProd.json();
        const dPedidoWrap = await resPedido.json();
        const pedido = dPedidoWrap.data || dPedidoWrap; // Ajuste según tu respuesta backend

        setClientes(dCli.data || []);
        setRepartos(dRep.data || []);
        setProductos(dProd.data || []);

        // Poblar Cabecera
        setClienteId(pedido.clienteId?.toString() || '');
        setRepartoId(pedido.repartoId?.toString() || '');
        setEstado(pedido.estado || 'Pendiente');
        
        // Formatear fechas (yyyy-mm-dd)
        if (pedido.fechaEmision) setFechaEmision(pedido.fechaEmision.split('T')[0]);
        if (pedido.fechaEntrega) setFechaEntrega(pedido.fechaEntrega.split('T')[0]);

        // Poblar Líneas
        if (pedido.lineas && Array.isArray(pedido.lineas)) {
          const lineasMapeadas: LineaForm[] = pedido.lineas.map((l: any) => ({
            id: l.id, // ID real
            tempId: l.id, // Usamos el mismo como temp
            productoId: l.productoId.toString(),
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
        alert('No se pudo cargar el pedido');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // --- MANEJO DE LÍNEAS ---

  const agregarLinea = () => {
    setLineas([
      ...lineas,
      { 
        tempId: Date.now(), // ID temporal único
        productoId: '', 
        descripcion: '', 
        cantidad: 1, 
        precioUnitario: 0, 
        subtotal: 0,
        esNueva: true
      }
    ]);
  };

  const eliminarLinea = (tempId: number) => {
    // Solo quitamos de la vista. El borrado real ocurre en handleSubmit
    setLineas(lineas.filter(l => l.tempId !== tempId));
  };

  const actualizarLinea = (tempId: number, field: keyof LineaForm, value: any) => {
    setLineas(prevLineas => prevLineas.map(linea => {
      if (linea.tempId !== tempId) return linea;

      const updatedLinea = { ...linea, [field]: value };

      if (field === 'productoId') {
        const prod = productos.find(p => p.id.toString() === value);
        if (prod) {
          updatedLinea.descripcion = prod.nombre;
          updatedLinea.precioUnitario = 0;
        }
      }
      updatedLinea.subtotal = updatedLinea.cantidad * updatedLinea.precioUnitario;
      return updatedLinea;
    }));
  };

  // --- GUARDADO
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Actualizar Cabecera
      const payloadCabecera = {
        clienteId: Number(clienteId),
        repartoId: Number(repartoId),
        fechaEmision,
        fechaEntrega,
        estado
      };
      
      const resHead = await fetch(`${API_BASE_URL}/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadCabecera),
      });

      if (!resHead.ok) throw new Error('Error actualizando cabecera');

      // 2. Procesar Líneas
      const promesasLineas = [];

      // A) BORRADOS: Estaban en originales pero no en lineas actuales
      const idsActuales = lineas.filter(l => !l.esNueva).map(l => l.id);
      const idsParaBorrar = lineasOriginalesIds.filter(oldId => !idsActuales.includes(oldId));

      for (const idBorrar of idsParaBorrar) {
        promesasLineas.push(
          fetch(`${API_BASE_URL}/lineas-pedido/${idBorrar}`, { method: 'DELETE' })
        );
      }

      // B) CREADOS Y ACTUALIZADOS
      for (const linea of lineas) {
        if (!linea.productoId) continue;

        const payloadLinea = {
            pedidoId: Number(id),
            productoId: Number(linea.productoId),
            cantidad: Number(linea.cantidad),
            precioUnitario: Number(linea.precioUnitario),
            descripcion: linea.descripcion
        };

        if (linea.esNueva) {
          // POST /lineas-pedido
          promesasLineas.push(
            fetch(`${API_BASE_URL}/lineas-pedido`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payloadLinea)
            })
          );
        } else {
          // PATCH /lineas-pedido/:id
          promesasLineas.push(
            fetch(`${API_BASE_URL}/lineas-pedido/${linea.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payloadLinea)
            })
          );
        }
      }

      // Ejecutar todas las promesas de líneas
      await Promise.all(promesasLineas);

      // Éxito
      router.push('/dashboard/pedidos');
      router.refresh();

    } catch (error) {
      console.error(error);
      alert('Ocurrió un error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Cargando pedido...</div>;

  return (
    <div className="flex justify-center min-h-screen p-6 bg-muted/10">
      <form onSubmit={handleSubmit} className="w-full max-w-4xl space-y-6">
        
        {/* Encabezado Visual */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Editar Pedido #{id}</h1>
          <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
          </Button>
        </div>

        {/* --- CABECERA --- */}
        <Card>
          <CardHeader><CardTitle>Datos Generales</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {clientes.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nombre} {c.apellido}</SelectItem>)}
                </SelectContent>
              </Select>
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
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Completado">Completado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
                <Label>Fecha Entrega</Label>
                <Input type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* --- DETALLE --- */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Productos</CardTitle>
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
                            type="number" className="h-8 w-24"
                            value={linea.precioUnitario} 
                            onChange={(e) => actualizarLinea(linea.tempId, 'precioUnitario', e.target.value)}                        />
                    </TableCell>
                    <TableCell>
                        <Input 
                            type="number" className="h-8 w-20" min="1"
                            value={linea.cantidad} 
                            onChange={(e) => actualizarLinea(linea.tempId, 'cantidad', e.target.value)}                        />
                    </TableCell>
                    <TableCell className="text-right font-medium">${linea.subtotal.toFixed(2)}</TableCell>
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
             <div className="text-xl font-bold">Total: ${totalEstimado.toFixed(2)}</div>
          </CardFooter>
        </Card>

        {/* --- BOTONES --- */}
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