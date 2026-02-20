'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface LineaForm {
  tempId: number; 
  productoId: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export default function NuevaDevolucionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const userRole = session?.user?.rol;
  const userRepartoId = session?.user?.repartoId;

  const [clientes, setClientes] = useState<{id: number, nombre: string}[]>([]);
  const [repartos, setRepartos] = useState<{id: number, nombre: string}[]>([]);
  const [productos, setProductos] = useState<{id: number, nombre: string}[]>([]);

  // Estado Cabecera Devolución
  const [clienteId, setClienteId] = useState('');
  const [repartoId, setRepartoId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [razon, setRazon] = useState('Sobrante'); // Valor por defecto

  const [lineas, setLineas] = useState<LineaForm[]>([]);

  const totalEstimado = lineas.reduce((acc, curr) => acc + curr.subtotal, 0);

  useEffect(() => {
    if (userRole === 'REPARTIDOR' && userRepartoId) {
      setRepartoId(String(userRepartoId));
    }
  }, [userRole, userRepartoId]);

  useEffect(() => {
    async function loadResources() {
      if (!session?.user?.token) return;
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`
        };
        
        const [resCli, resRep, resProd] = await Promise.all([
          fetch(`${API_BASE_URL}/clientes`, { headers }),
          fetch(`${API_BASE_URL}/repartos`, { headers }),
          fetch(`${API_BASE_URL}/productos`, { headers })
        ]);
        const dCli = await resCli.json();
        const dRep = await resRep.json();
        const dProd = await resProd.json();

        setClientes(Array.isArray(dCli) ? dCli : (dCli.data || []));
        setRepartos(Array.isArray(dRep) ? dRep : (dRep.data || []));
        setProductos(Array.isArray(dProd) ? dProd : (dProd.data || []));

      } catch (error) {
        console.error("Error cargando recursos", error);
      }
    }
    loadResources();
  }, [session?.user?.token]);

  async function fetchPrecioVigente(productoId: number, fechaConsulta: string): Promise<number> {
    if (!session?.user?.token) return 0;
    try {
      const res = await fetch(
        `${API_BASE_URL}/precio-productos/vigente/${productoId}?fecha=${fechaConsulta}&nombre=reventa`,
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
    setLineas([...lineas, { tempId: Date.now(), productoId: '', descripcion: '', cantidad: 1, precioUnitario: 0, subtotal: 0 }]);
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
    
    setLineas(prevLineas => {
      return prevLineas.map(linea => {
        if (linea.tempId !== tempId) return linea;

        const valFinal = (field === 'cantidad' || field === 'precioUnitario') ? Number(value) : value;
        const updatedLinea = { ...linea, [field]: valFinal };

        if (field === 'productoId') {
          const prod = productos.find(p => p.id.toString() === value);
          if (prod) {
            updatedLinea.descripcion = nombreProd;
            updatedLinea.precioUnitario = nuevoPrecio;
          }
        }
        updatedLinea.subtotal = updatedLinea.cantidad * updatedLinea.precioUnitario;
        return updatedLinea;
      });
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lineas.length === 0) {
      alert('Debes agregar al menos un producto devuelto.');
      return;
    }
    if (!razon.trim()) {
      alert('Debes ingresar el motivo de la devolución.');
      return;
    }

    setLoading(true);

    const payload = {
      clienteId: Number(clienteId),
      repartoId: Number(repartoId),
      fecha: `${fecha}T12:00:00.000Z`, // Forzamos formato seguro
      razon,
      total: totalEstimado, 
      lineas: lineas.map(l => ({
        productoId: Number(l.productoId),
        cantidad: Number(l.cantidad),
        precioUnitario: Number(l.precioUnitario),
        subtotal: Number(l.subtotal), 
        descripcion: l.descripcion, 
      }))
    };

    try {
      const res = await fetch(`${API_BASE_URL}/devoluciones`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}` 
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/dashboard/devoluciones');
        router.refresh();
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.errors?.[0] || 'No se pudo cargar la devolución'}`);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center min-h-screen p-6 bg-muted/10">
      <form onSubmit={handleSubmit} className="w-full max-w-4xl space-y-6">
        <Card>
          <CardHeader><CardTitle>Cargar Devolución</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId} required>
                <SelectTrigger><SelectValue placeholder="Seleccionar Cliente" /></SelectTrigger>
                <SelectContent>
                  {clientes.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reparto</Label>
              <Select 
                value={repartoId} 
                onValueChange={setRepartoId} 
                required
                disabled={userRole === 'REPARTIDOR'}
              >
                <SelectTrigger><SelectValue placeholder="Seleccionar Reparto" /></SelectTrigger>
                <SelectContent>
                  {repartos.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
              {userRole === 'REPARTIDOR' && <p className="text-xs text-muted-foreground">Reparto asignado automáticamente.</p>}
            </div>

            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Motivo de Devolución</Label>
              <Input 
                type="text" 
                placeholder="Ej. Sobrante, Roto, etc." 
                value={razon} 
                onChange={e => setRazon(e.target.value)} 
                required 
              />
            </div>

          </CardContent>
        </Card>

        {/* --- TARJETA LÍNEAS (Productos) --- */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Productos Devueltos</CardTitle>
            <Button type="button" size="sm" onClick={agregarLinea} variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Agregar Producto
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Producto</TableHead>
                  <TableHead className="w-[100px]">Precio Unitario</TableHead>
                  <TableHead className="w-[100px]">Cantidad</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineas.length === 0 && (
                  <TableRow>
                    <TableHead colSpan={5} className="text-center py-4 text-muted-foreground">
                      Agrega productos a la devolución
                    </TableHead>
                  </TableRow>
                )}
                {lineas.map((linea) => (
                  <TableRow key={linea.tempId}>
                    <TableCell>
                      <Select value={linea.productoId} onValueChange={(val) => actualizarLinea(linea.tempId, 'productoId', val)}>
                        <SelectTrigger className="h-8"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                        <SelectContent>
                          {productos.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        className="h-8 w-24 bg-muted cursor-not-allowed text-muted-foreground font-medium" 
                        value={linea.precioUnitario} 
                        readOnly 
                        disabled
                      />
                    </TableCell>
                    <TableCell>
                      <Input type="number" className="h-8 w-20" min="1" value={linea.cantidad} onChange={(e) => actualizarLinea(linea.tempId, 'cantidad', e.target.value)} />
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
          <Button type="submit" disabled={loading} className="w-40">
            {loading ? 'Cargando...' : 'Guardar Devolución'}
          </Button>
        </div>
      </form>
    </div>
  );
}