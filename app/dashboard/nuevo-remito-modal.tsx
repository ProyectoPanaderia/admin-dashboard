'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, PackagePlus, ShoppingCart } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// --- Interfaces ---
interface Cliente { id: number; nombre: string; }
interface Reparto { id: number; nombre: string; }
interface Existencia {
  id: number; cantidad: number;
  producto: { id: number; nombre: string; peso?: number; };
  Producto?: { id: number; nombre: string; peso?: number; };
}

// Interfaz actualizada: ahora usamos productoId como string
interface LineaForm {
  productoId: string;
  cantidad: string; 
  precioUnitario: number; 
  subtotal: number;
}

interface NuevoRemitoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// --- Helpers ---
function getToday() { return new Date().toISOString().split('T')[0]; }
function formatMonto(total: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(total);
}
function formatFechaVisual(fecha: string) {
  if (!fecha) return '-';
  const [anio, mes, dia] = fecha.split('T')[0].split('-');
  return `${dia}/${mes}/${anio}`;
}

export function NuevoRemitoModal({ open, onOpenChange, onSuccess }: NuevoRemitoModalProps) {
  const { data: session } = useSession();

  // Estados de datos
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [repartos, setRepartos] = useState<Reparto[]>([]);
  const [existencias, setExistencias] = useState<Existencia[]>([]);
  
  // Estados de formulario
  const [form, setForm] = useState({ clienteId: '', repartoId: '', fecha: getToday(), tipoPrecio: 'reventa' });
  const [lineas, setLineas] = useState<LineaForm[]>([]);
  const [avisoPedido, setAvisoPedido] = useState<{ fecha: string } | null>(null);
  
  const [pedidoIdUsado, setPedidoIdUsado] = useState<number | null>(null);

  // Estados de UI
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.user?.token}`
  });

  // --- AGRUPACIÓN DE PRODUCTOS (FIFO Visual) ---
  // Suma los stocks de los lotes del mismo producto para mostrar un solo ítem en el Select
  const listaProductos = useMemo(() => {
    const agrupados = existencias.reduce((acc, existencia) => {
      const prodId = existencia.producto?.id || existencia.Producto?.id;
      const prodNombre = existencia.producto?.nombre || existencia.Producto?.nombre || 'Producto';
      
      if (prodId) {
        if (!acc[prodId]) {
          acc[prodId] = { productoId: prodId, nombre: prodNombre, stockTotal: 0 };
        }
        acc[prodId].stockTotal += existencia.cantidad;
      }
      return acc;
    }, {} as Record<number, { productoId: number, nombre: string, stockTotal: number }>);
    
    return Object.values(agrupados);
  }, [existencias]);


  useEffect(() => {
    if (open) {
      setForm({ clienteId: '', repartoId: '', fecha: getToday(), tipoPrecio: 'reventa' });
      setLineas([]);
      setExistencias([]);
      setSaveError('');
      setAvisoPedido(null);
      fetchInitialData();
    }
  }, [open]);

  async function fetchInitialData() {
    if (!session?.user?.token) return;
    try {
      const [cRes, rRes] = await Promise.all([
        fetch(`${API}/clientes?pageSize=100`, { headers: getAuthHeaders() }),
        fetch(`${API}/repartos?pageSize=100`, { headers: getAuthHeaders() }),
      ]);
      const cJson = await cRes.json();
      const rJson = await rRes.json();
      setClientes(Array.isArray(cJson) ? cJson : (cJson.data || []));
      setRepartos(Array.isArray(rJson) ? rJson : (rJson.data || []));
    } catch { /* error silencioso */ }
  }

  async function fetchExistencias(repartoId: string) {
    try {
      const res = await fetch(`${API}/existencias?repartoId=${repartoId}&pageSize=100`, { headers: getAuthHeaders() });
      const json = await res.json();
      setExistencias(Array.isArray(json) ? json : (json.data || []));
    } catch { setExistencias([]); }
  }

  async function fetchPrecioVigente(productoId: number, fecha: string, tipoPrecio: string): Promise<number> {
    try {
      const res = await fetch(`${API}/precio-productos/vigente/${productoId}?fecha=${fecha}&nombre=${tipoPrecio}`, { headers: getAuthHeaders() });
      if (!res.ok) return 0;
      const json = await res.json();
      return json.data?.valor || 0;
    } catch { return 0; }
  }

  // --- LÓGICA DE PRECARGA ---
  async function fetchUltimoPedido(clienteId: string) {
    if (!clienteId || clienteId === 'none') {
      setAvisoPedido(null);
      setPedidoIdUsado(null);
      return;
    }
    try {
      const res = await fetch(`${API}/pedidos/ultimo/${clienteId}`, { headers: getAuthHeaders() });
      if (!res.ok) {
        setAvisoPedido(null);
        setPedidoIdUsado(null);
        return;
      }
      const data = await res.json();
      const pedido = data.data || data;

      if (pedido && pedido.lineas) {
        setAvisoPedido({ fecha: formatFechaVisual(pedido.fechaEmision) });
        setPedidoIdUsado(pedido.id);
        
        const nuevasLineas: LineaForm[] = [];
        for (const l of pedido.lineas) {
          // Ya no buscamos "existenciaId", sino si hay stock agrupado de este producto
          const tieneStock = existencias.some(e => (e.producto?.id || e.Producto?.id) === l.productoId && e.cantidad > 0);
          
          if (tieneStock) {
            const precio = await fetchPrecioVigente(l.productoId, form.fecha, form.tipoPrecio);
            nuevasLineas.push({
              productoId: String(l.productoId), // Guardamos como string
              cantidad: String(l.cantidad),
              precioUnitario: precio,
              subtotal: precio * Number(l.cantidad)
            });
          }
        }
        setLineas(nuevasLineas);
      }
    } catch (err) {
      console.error("Error cargando pedido:", err);
    }
  }

  const handleRepartoChange = (id: string) => {
    setForm(prev => ({ ...prev, repartoId: id }));
    fetchExistencias(id);
    setLineas([]); // Reseteamos lineas porque cambió el camión
  };

  const handleClienteChange = (id: string) => {
    setForm(prev => ({ ...prev, clienteId: id }));
    if (form.repartoId) fetchUltimoPedido(id);
  };

  const handleTipoPrecioChange = async (tipoPrecio: string) => {
    setForm({ ...form, tipoPrecio });
    const nuevasLineas = await Promise.all(
      lineas.map(async (linea) => {
        if (!linea.productoId) return linea;
        const precio = await fetchPrecioVigente(Number(linea.productoId), form.fecha, tipoPrecio);
        const cantidad = Number(linea.cantidad) || 0;
        return { ...linea, precioUnitario: precio, subtotal: precio * cantidad };
      })
    );
    setLineas(nuevasLineas);
  };

  // --- MANEJO DE LÍNEAS ---
  function agregarLinea() {
    setLineas([...lineas, { productoId: '', cantidad: '', precioUnitario: 0, subtotal: 0 }]);
  }

  function eliminarLinea(index: number) {
    setLineas(lineas.filter((_, i) => i !== index));
  }

  async function actualizarLinea(index: number, field: keyof LineaForm, value: string) {
    const nuevasLineas = [...lineas];
    
    if (field === 'productoId') {
      nuevasLineas[index].productoId = value;
      const prodId = Number(value);
      if (prodId) {
        const precio = await fetchPrecioVigente(prodId, form.fecha, form.tipoPrecio);
        nuevasLineas[index].precioUnitario = precio;
        const cantidad = Number(nuevasLineas[index].cantidad) || 0;
        nuevasLineas[index].subtotal = precio * cantidad;
      }
    } else if (field === 'cantidad') {
      nuevasLineas[index].cantidad = value;
      const cantidad = Number(value) || 0;
      nuevasLineas[index].subtotal = nuevasLineas[index].precioUnitario * cantidad;
    }

    setLineas(nuevasLineas);
  }

  async function crearRemito() {
    if (!form.repartoId) { setSaveError('El reparto es obligatorio.'); return; }
    if (lineas.length === 0) { setSaveError('Debe agregar al menos una línea.'); return; }

    // Agrupamos lo que el usuario está pidiendo para sumar cantidades de productos repetidos
    const cantidadesSolicitadas: Record<string, number> = {};

    for (const linea of lineas) {
      if (!linea.productoId) {
        setSaveError('Todas las líneas deben tener un producto seleccionado.');
        return;
      }
      if (!linea.cantidad || Number(linea.cantidad) <= 0) {
        setSaveError('La cantidad debe ser mayor a 0 en todas las líneas.');
        return;
      }

      cantidadesSolicitadas[linea.productoId] = (cantidadesSolicitadas[linea.productoId] || 0) + Number(linea.cantidad);
      
      const infoProd = listaProductos.find(p => String(p.productoId) === String(linea.productoId));
      const stockDisponible = infoProd ? infoProd.stockTotal : 0;

      if (cantidadesSolicitadas[linea.productoId] > stockDisponible) {
        setSaveError(`Stock insuficiente para ${infoProd?.nombre}. Pediste ${cantidadesSolicitadas[linea.productoId]} y quedan ${stockDisponible}.`);
        return; // Cortamos la ejecución acá, no hace el fetch
      }
    }

    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        clienteId: form.clienteId && form.clienteId !== 'none' ? Number(form.clienteId) : null,
        repartoId: Number(form.repartoId),
        pedidoOrigenId: pedidoIdUsado,
        total: lineas.reduce((sum, l) => sum + l.subtotal, 0),
        fecha: form.fecha,
        // Al backend mandamos productoId y precioUnitario
        lineas: lineas.map(l => ({ 
            productoId: Number(l.productoId), 
            cantidad: Number(l.cantidad), 
            precioUnitario: l.precioUnitario,
            subtotal: l.subtotal 
        }))
      };

      const res = await fetch(`${API}/remitos`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error((await res.json()).message || 'Error al crear remito');

      onOpenChange(false);
      onSuccess();
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nuevo remito</DialogTitle></DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Reparto <span className="text-red-500">*</span></Label>
              <Select value={form.repartoId} onValueChange={handleRepartoChange}>
                <SelectTrigger><SelectValue placeholder="Seleccioná" /></SelectTrigger>
                <SelectContent>
                  {repartos.map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Cliente (opcional)</Label>
            <Select value={form.clienteId} onValueChange={handleClienteChange} disabled={!form.repartoId}>
              <SelectTrigger><SelectValue placeholder={form.repartoId ? "Seleccioná un cliente" : "Primero elegí un reparto"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin cliente</SelectItem>
                {clientes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {avisoPedido && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
              <ShoppingCart className="h-4 w-4" />
              <span>Se cargaron productos del pedido del día <strong>{avisoPedido.fecha}</strong></span>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Tipo de precio</Label>
            <Select value={form.tipoPrecio} onValueChange={handleTipoPrecioChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="reventa">Reventa</SelectItem>
                <SelectItem value="consumidor final">Consumidor Final</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Líneas de productos</Label>
              <Button type="button" size="sm" variant="outline" onClick={agregarLinea} disabled={!form.repartoId}>
                <PackagePlus className="h-4 w-4 mr-1" /> Agregar
              </Button>
            </div>

            {lineas.map((linea, index) => {
              // Validar contra el stock unificado
              const infoProd = listaProductos.find(p => String(p.productoId) === linea.productoId);
              const stockMaximo = infoProd ? infoProd.stockTotal : 999;

              return (
                <div key={index} className="grid grid-cols-12 gap-2 mb-3 items-end bg-gray-50 p-2 rounded-md">
                  <div className="col-span-5">
                    <Select value={linea.productoId} onValueChange={(v) => actualizarLinea(index, 'productoId', v)}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Producto" /></SelectTrigger>
                      <SelectContent>
                        {listaProductos.map((prod) => (
                          <SelectItem key={prod.productoId} value={String(prod.productoId)}>
                            {prod.nombre} (Stock: {prod.stockTotal})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input 
                      type="number" 
                      min={1} 
                      max={stockMaximo}
                      placeholder="Cant." 
                      value={linea.cantidad} 
                      onChange={(e) => actualizarLinea(index, 'cantidad', e.target.value)} 
                      className="h-9" 
                    />
                  </div>
                  <div className="col-span-4 text-right pr-2">
                    <p className="text-xs text-gray-500">{formatMonto(linea.precioUnitario)} c/u</p>
                    <p className="font-medium">{formatMonto(linea.subtotal)}</p>
                  </div>
                  <div className="col-span-1">
                    <Button type="button" size="icon" variant="ghost" onClick={() => eliminarLinea(index)} className="h-9 w-9 text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {saveError && <p className="text-sm text-red-500 mb-2 px-4">{saveError}</p>}

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left w-full sm:w-auto">
                <p className="text-sm text-gray-500">Total Remito</p>
                <p className="text-xl font-bold">{formatMonto(lineas.reduce((sum, l) => sum + l.subtotal, 0))}</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
                <Button onClick={crearRemito} disabled={saving} className="flex-1">
                    {saving ? 'Guardando...' : 'Crear remito'}
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}