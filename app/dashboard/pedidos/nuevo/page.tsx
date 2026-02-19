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

export default function NuevoPedidoPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  // --- Datos Maestros ---
  const [clientes, setClientes] = useState<{id: number, nombre: string}[]>([]);
  const [repartos, setRepartos] = useState<{id: number, nombre: string}[]>([]);
  const [productos, setProductos] = useState<{id: number, nombre: string}[]>([]);

  // --- Estado Cabecera ---
  // ¡El orden acá es clave! Primero definimos los estados...
  const [clienteId, setClienteId] = useState('');
  const [repartoId, setRepartoId] = useState('');
  const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().split('T')[0]);
  const [fechaEntrega, setFechaEntrega] = useState(''); 

  // --- Estado Detalle (Líneas) ---
  const [lineas, setLineas] = useState<LineaForm[]>([]);

  // --- Total Calculado ---
  const totalEstimado = lineas.reduce((acc, curr) => acc + curr.subtotal, 0);

  // Cargar recursos al inicio
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

        const listaClientes = Array.isArray(dCli) ? dCli : (dCli.data || []);
        const listaRepartos = Array.isArray(dRep) ? dRep : (dRep.data || []);
        const listaProductos = Array.isArray(dProd) ? dProd : (dProd.data || []);
        
        setClientes(listaClientes);
        setRepartos(listaRepartos);
        setProductos(listaProductos);

      } catch (error) {
        console.error("Error cargando recursos", error);
      }
    }
    loadResources();
  }, [session?.user?.token]);

  // -- Buscar Precio en el Backend
  async function fetchPrecioVigente(productoId: number, fecha: string, tipoPrecio: string = 'reventa'): Promise<number> {
    if (!session?.user?.token) return 0;
    try {
      const res = await fetch(
        `${API_BASE_URL}/precio-productos/vigente/${productoId}?fecha=${fecha}&nombre=${tipoPrecio}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.user.token}`
          }
        }
      );
      if (!res.ok) return 0;
      const json = await res.json();
      return json.data?.valor || 0; 
    } catch {
      return 0;
    }
  }

  // --- Manejo de Líneas ---
  const agregarLinea = () => {
    setLineas([
      ...lineas,
      { 
        tempId: Date.now(),
        productoId: '', 
        descripcion: '', 
        cantidad: 1, 
        precioUnitario: 0, 
        subtotal: 0 
      }
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
        nuevoPrecio = await fetchPrecioVigente(prod.id, fechaEmision, 'reventa'); 
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

  // --- Submit ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lineas.length === 0) {
      alert('Debes agregar al menos un producto al pedido.');
      return;
    }

    setLoading(true);

    // ... y recién acá, dentro del submit y usando los estados definidos, creamos las fechas seguras:
    const fechaEmisionSegura = `${fechaEmision}T12:00:00.000Z`;
    const fechaEntregaSegura = fechaEntrega ? `${fechaEntrega}T12:00:00.000Z` : null;

    // Payload completo
    const payload = {
      clienteId: Number(clienteId),
      repartoId: Number(repartoId),
      fechaEmision: fechaEmisionSegura,
      fechaEntrega: fechaEntregaSegura,
      estado: 'Pendiente',
      total: totalEstimado, // ¡Importante para que cuadre en la BD!
      lineas: lineas.map(l => ({
        productoId: Number(l.productoId),
        cantidad: Number(l.cantidad),
        precioUnitario: Number(l.precioUnitario),
        subtotal: Number(l.subtotal), // ¡Importante para el repositorio de líneas!
        descripcion: l.descripcion, 
      }))
    };

    try {
      const res = await fetch(`${API_BASE_URL}/pedidos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}` 
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/dashboard/pedidos');
        router.refresh();
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.errors?.[0] || 'No se pudo crear el pedido'}`);
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
          <CardHeader>
            <CardTitle>Nuevo Pedido</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId} required>
                <SelectTrigger><SelectValue placeholder="Seleccionar Cliente" /></SelectTrigger>
                <SelectContent>
                  {clientes.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reparto</Label>
              <Select value={repartoId} onValueChange={setRepartoId} required>
                <SelectTrigger><SelectValue placeholder="Seleccionar Reparto" /></SelectTrigger>
                <SelectContent>
                  {repartos.map(r => (
                    <SelectItem key={r.id} value={r.id.toString()}>{r.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha Emisión</Label>
              <Input type="date" value={fechaEmision} onChange={e => setFechaEmision(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Fecha Entrega</Label>
              <Input type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} required />
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Productos</CardTitle>
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
                      Agrega productos al pedido
                    </TableHead>
                  </TableRow>
                )}
                {lineas.map((linea) => (
                  <TableRow key={linea.tempId}>
                    <TableCell>
                      <Select 
                        value={linea.productoId} 
                        onValueChange={(val) => actualizarLinea(linea.tempId, 'productoId', val)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {productos.map(p => (
                            <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <Input 
                        type="number" 
                        className="h-8 w-24"
                        value={linea.precioUnitario} 
                        onChange={(e) => actualizarLinea(linea.tempId, 'precioUnitario', e.target.value)}                      />
                    </TableCell>

                    <TableCell>
                      <Input 
                        type="number" 
                        className="h-8 w-20"
                        min="1"
                        value={linea.cantidad} 
                        onChange={(e) => actualizarLinea(linea.tempId, 'cantidad', e.target.value)}                      />
                    </TableCell>

                    <TableCell className="text-right font-medium">
                      ${linea.subtotal.toFixed(2)}
                    </TableCell>

                    <TableCell>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500"
                        onClick={() => eliminarLinea(linea.tempId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-end border-t p-4 bg-muted/5">
             <div className="text-xl font-bold">
               Total: ${totalEstimado.toFixed(2)}
             </div>
          </CardFooter>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="w-40">
            {loading ? 'Creando...' : 'Guardar Pedido'}
          </Button>
        </div>

      </form>
    </div>
  );
}