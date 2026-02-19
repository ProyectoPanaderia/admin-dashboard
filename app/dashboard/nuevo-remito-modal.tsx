'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, PackagePlus } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Interfaces necesarias
interface Cliente { id: number; nombre: string; }
interface Reparto { id: number; nombre: string; }
interface Existencia {
  id: number; cantidad: number;
  producto: { id: number; nombre: string; peso?: number; };
  Producto?: { id: number; nombre: string; peso?: number; };
}
interface LineaForm {
  existenciaId: string; productoId: number | null;
  cantidad: string; precioUnitario: number; subtotal: number;
}

interface NuevoRemitoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void; // Para avisarle al page.tsx que recargue la tabla
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function formatMonto(total: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(total);
}

export function NuevoRemitoModal({ open, onOpenChange, onSuccess }: NuevoRemitoModalProps) {
  const { data: session } = useSession();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [repartos, setRepartos] = useState<Reparto[]>([]);
  const [existencias, setExistencias] = useState<Existencia[]>([]);
  
  const [form, setForm] = useState({ clienteId: '', repartoId: '', fecha: getToday(), tipoPrecio: 'reventa' });
  const [lineas, setLineas] = useState<LineaForm[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.user?.token}`
  });

  // Resetear el formulario cada vez que se abre el modal
  useEffect(() => {
    if (open) {
      setForm({ clienteId: '', repartoId: '', fecha: getToday(), tipoPrecio: 'reventa' });
      setLineas([]);
      setExistencias([]);
      setSaveError('');
      fetchFormData();
    }
  }, [open]);

  async function fetchFormData() {
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
    } catch { /* silencioso */ }
  }

  async function fetchExistencias(repartoId: string) {
    if (!session?.user?.token) return;
    try {
      const res = await fetch(`${API}/existencias?repartoId=${repartoId}&pageSize=100`, { headers: getAuthHeaders() });
      const json = await res.json();
      setExistencias(Array.isArray(json) ? json : (json.data || []));
    } catch { setExistencias([]); }
  }

  async function fetchPrecioVigente(productoId: number, fecha: string, tipoPrecio: string): Promise<number> {
    if (!session?.user?.token) return 0;
    try {
      const res = await fetch(`${API}/precio-productos/vigente/${productoId}?fecha=${fecha}&nombre=${tipoPrecio}`, { headers: getAuthHeaders() });
      if (!res.ok) return 0;
      const json = await res.json();
      return json.data?.valor || 0;
    } catch { return 0; }
  }

  function handleRepartoChange(repartoId: string) {
    setForm({ ...form, repartoId });
    setLineas([]);
    setExistencias([]);
    if (repartoId) fetchExistencias(repartoId);
  }

  async function handleTipoPrecioChange(tipoPrecio: string) {
    setForm({ ...form, tipoPrecio });
    const nuevasLineas = await Promise.all(
      lineas.map(async (linea) => {
        if (!linea.productoId) return linea;
        const precio = await fetchPrecioVigente(linea.productoId, form.fecha, tipoPrecio);
        const cantidad = Number(linea.cantidad) || 0;
        return { ...linea, precioUnitario: precio, subtotal: precio * cantidad };
      })
    );
    setLineas(nuevasLineas);
  }

  function agregarLinea() {
    setLineas([...lineas, { existenciaId: '', productoId: null, cantidad: '', precioUnitario: 0, subtotal: 0 }]);
  }

  function eliminarLinea(index: number) {
    setLineas(lineas.filter((_, i) => i !== index));
  }

  async function actualizarLinea(index: number, field: keyof LineaForm, value: any) {
    const nuevasLineas = [...lineas];
    nuevasLineas[index] = { ...nuevasLineas[index], [field]: value };

    if (field === 'existenciaId') {
      const existencia = existencias.find((e) => e.id === Number(value));
      if (existencia) {
        const prodId = existencia.producto?.id || existencia.Producto?.id;
        if (prodId) {
          nuevasLineas[index].productoId = prodId;
          const precio = await fetchPrecioVigente(prodId, form.fecha, form.tipoPrecio);
          nuevasLineas[index].precioUnitario = precio;
          const cantidad = Number(nuevasLineas[index].cantidad) || 0;
          nuevasLineas[index].subtotal = precio * cantidad;
        }
      }
    }

    if (field === 'cantidad') {
      const cantidad = Number(value) || 0;
      nuevasLineas[index].subtotal = nuevasLineas[index].precioUnitario * cantidad;
    }

    setLineas(nuevasLineas);
  }

  async function crearRemito() {
    if (!form.repartoId) { setSaveError('El reparto es obligatorio.'); return; }
    if (lineas.length === 0) { setSaveError('Debe agregar al menos una línea de producto.'); return; }
    
    for (const linea of lineas) {
      if (!linea.existenciaId || !linea.cantidad || Number(linea.cantidad) <= 0) {
        setSaveError('Todas las líneas deben tener producto y cantidad válida.'); return;
      }
      if (linea.precioUnitario <= 0) {
        setSaveError('No se encontró precio vigente para uno o más productos.'); return;
      }
    }

    const total = lineas.reduce((sum, l) => sum + l.subtotal, 0);
    setSaving(true);
    setSaveError('');
    
    try {
      const payload = {
        clienteId: form.clienteId && form.clienteId !== 'none' ? Number(form.clienteId) : null,
        repartoId: Number(form.repartoId),
        total, fecha: form.fecha,
        lineas: lineas.map((l) => ({ existenciaId: Number(l.existenciaId), cantidad: Number(l.cantidad), subtotal: l.subtotal }))
      };

      const res = await fetch(`${API}/remitos`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error((await res.json()).message || 'Error al crear remito');

      onOpenChange(false);
      onSuccess(); // Recarga la tabla en la página principal
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const totalRemito = lineas.reduce((sum, l) => sum + l.subtotal, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo remito</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          
          <div className="grid gap-2">
            <Label>Fecha</Label>
            <Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
          </div>

          <div className="grid gap-2">
            <Label>Reparto <span className="text-red-500">*</span></Label>
            <Select value={form.repartoId} onValueChange={handleRepartoChange}>
              <SelectTrigger><SelectValue placeholder="Seleccioná un reparto" /></SelectTrigger>
              <SelectContent>
                {repartos.map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Cliente (opcional)</Label>
            <Select value={form.clienteId} onValueChange={(v) => setForm({ ...form, clienteId: v })}>
              <SelectTrigger><SelectValue placeholder="Sin cliente asignado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin cliente</SelectItem>
                {clientes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Tipo de precio <span className="text-red-500">*</span></Label>
            <Select value={form.tipoPrecio} onValueChange={handleTipoPrecioChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="reventa">Reventa</SelectItem>
                <SelectItem value="consumidor final">Consumidor Final</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Los precios se calcularán según el tipo seleccionado</p>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Líneas de productos</Label>
              <Button type="button" size="sm" variant="outline" onClick={agregarLinea} disabled={!form.repartoId} className="flex items-center gap-1">
                <PackagePlus className="h-4 w-4" /> Agregar línea
              </Button>
            </div>

            {!form.repartoId && <p className="text-sm text-gray-500 italic">Seleccioná un reparto para agregar productos</p>}
            {lineas.length === 0 && form.repartoId && <p className="text-sm text-gray-500 italic">No hay líneas agregadas.</p>}

            {lineas.map((linea, index) => {
              const existencia = existencias.find((e) => e.id === Number(linea.existenciaId));
              return (
                <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-end">
                  <div className="col-span-5">
                    <Label className="text-xs">Producto</Label>
                    <Select value={linea.existenciaId} onValueChange={(v) => actualizarLinea(index, 'existenciaId', v)}>
                      <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {existencias.map((e) => {
                           const nombreProd = e.producto?.nombre || e.Producto?.nombre || 'Producto';
                           return (
                             <SelectItem key={e.id} value={String(e.id)}>{nombreProd} (Stock: {e.cantidad})</SelectItem>
                           )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Cant.</Label>
                    <Input type="number" min={1} max={existencia?.cantidad || 999} value={linea.cantidad} onChange={(e) => actualizarLinea(index, 'cantidad', e.target.value)} className="text-sm h-9" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Precio U.</Label>
                    <Input type="text" value={formatMonto(linea.precioUnitario)} readOnly className="text-sm h-9 bg-gray-50" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Subtotal</Label>
                    <Input type="text" value={formatMonto(linea.subtotal)} readOnly className="text-sm h-9 bg-gray-50" />
                  </div>
                  <div className="col-span-1">
                    <Button type="button" size="icon" variant="ghost" onClick={() => eliminarLinea(index)} className="h-9 w-9">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {lineas.length > 0 && (
              <div className="flex justify-end mt-4 pt-3 border-t">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total del remito</p>
                  <p className="text-2xl font-bold text-gray-800">{formatMonto(totalRemito)}</p>
                </div>
              </div>
            )}
          </div>
          {saveError && <p className="text-sm text-red-500">{saveError}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={crearRemito} disabled={saving}>{saving ? 'Guardando...' : 'Crear remito'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}