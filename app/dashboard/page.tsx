'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, FileText, TrendingUp, DollarSign, ShoppingCart, Trash2, PackagePlus } from 'lucide-react';

const API = 'http://localhost:4000/api';

interface Remito {
  id: number;
  fecha: string;
  total: number;
  cliente?: { id: number; nombre: string };
  reparto?: { id: number; nombre: string };
}

interface Cliente {
  id: number;
  nombre: string;
}

interface Reparto {
  id: number;
  nombre: string;
}

interface Existencia {
  id: number;
  cantidad: number;
  producto: {
    id: number;
    nombre: string;
    peso: number;
  };
}

interface LineaForm {
  existenciaId: string;
  productoId: number | null;
  cantidad: string;
  precioUnitario: number;
  subtotal: number;
}

function getFirstDayOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatMonto(total: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(total);
}

export default function DashboardPage() {
  const [remitos, setRemitos] = useState<Remito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [tempDesde, setTempDesde] = useState('');
  const [tempHasta, setTempHasta] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [repartos, setRepartos] = useState<Reparto[]>([]);
  const [existencias, setExistencias] = useState<Existencia[]>([]);
  const [form, setForm] = useState({
    clienteId: '',
    repartoId: '',
    fecha: '',
    tipoPrecio: 'reventa',
  });
  const [lineas, setLineas] = useState<LineaForm[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  async function fetchRemitos(desde: string, hasta: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${API}/remitos?fechaDesde=${desde}&fechaHasta=${hasta}&pageSize=100`
      );
      const json = await res.json();
      setRemitos(json.data || []);
    } catch {
      setError('No se pudieron cargar los remitos. Verificá que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchFormData() {
    try {
      const [cRes, rRes] = await Promise.all([
        fetch(`${API}/clientes?pageSize=100`),
        fetch(`${API}/repartos?pageSize=100`),
      ]);
      const cJson = await cRes.json();
      const rJson = await rRes.json();
      setClientes(cJson.data || []);
      setRepartos(rJson.data || []);
    } catch {
      // silencioso
    }
  }

  async function fetchExistencias(repartoId: string) {
    try {
      const res = await fetch(`${API}/existencias?repartoId=${repartoId}&pageSize=100`);
      const json = await res.json();
      setExistencias(json.data || []);
    } catch {
      setExistencias([]);
    }
  }

  async function fetchPrecioVigente(productoId: number, fecha: string, tipoPrecio: string): Promise<number> {
    try {
      const res = await fetch(
        `${API}/precio-productos/vigente/${productoId}?fecha=${fecha}&nombre=${tipoPrecio}`
      );
      if (!res.ok) return 0;
      const json = await res.json();
      return json.data?.valor || 0;
    } catch {
      return 0;
    }
  }

  useEffect(() => {
    const desde = getFirstDayOfMonth();
    const hasta = getToday();
    setFechaDesde(desde);
    setFechaHasta(hasta);
    setTempDesde(desde);
    setTempHasta(hasta);
    setForm((f) => ({ ...f, fecha: hasta }));
    fetchRemitos(desde, hasta);
  }, []);

  function aplicarFiltro() {
    setFechaDesde(tempDesde);
    setFechaHasta(tempHasta);
    setFilterOpen(false);
    fetchRemitos(tempDesde, tempHasta);
  }

  function abrirCrear() {
    const hoy = getToday();
    setForm({ clienteId: '', repartoId: '', fecha: hoy, tipoPrecio: 'reventa' });
    setLineas([]);
    setExistencias([]);
    setSaveError('');
    fetchFormData();
    setCreateOpen(true);
  }

  function agregarLinea() {
    setLineas([
      ...lineas,
      { existenciaId: '', productoId: null, cantidad: '', precioUnitario: 0, subtotal: 0 },
    ]);
  }

  function eliminarLinea(index: number) {
    setLineas(lineas.filter((_, i) => i !== index));
  }

  async function actualizarLinea(index: number, field: keyof LineaForm, value: any) {
    const nuevasLineas = [...lineas];
    nuevasLineas[index] = { ...nuevasLineas[index], [field]: value };

    // Si cambió la existencia, buscar el precio vigente
    if (field === 'existenciaId') {
      const existencia = existencias.find((e) => e.id === Number(value));
      if (existencia) {
        nuevasLineas[index].productoId = existencia.producto.id;
        const precio = await fetchPrecioVigente(
          existencia.producto.id,
          form.fecha,
          form.tipoPrecio
        );
        nuevasLineas[index].precioUnitario = precio;

        // Recalcular subtotal si ya hay cantidad
        const cantidad = Number(nuevasLineas[index].cantidad) || 0;
        nuevasLineas[index].subtotal = precio * cantidad;
      }
    }

    // Si cambió la cantidad, recalcular subtotal
    if (field === 'cantidad') {
      const cantidad = Number(value) || 0;
      const precio = nuevasLineas[index].precioUnitario;
      nuevasLineas[index].subtotal = precio * cantidad;
    }

    setLineas(nuevasLineas);
  }

  async function handleTipoPrecioChange(tipoPrecio: string) {
    setForm({ ...form, tipoPrecio });

    // Recalcular precios de todas las líneas existentes
    const nuevasLineas = await Promise.all(
      lineas.map(async (linea) => {
        if (!linea.productoId) return linea;

        const precio = await fetchPrecioVigente(linea.productoId, form.fecha, tipoPrecio);
        const cantidad = Number(linea.cantidad) || 0;
        return {
          ...linea,
          precioUnitario: precio,
          subtotal: precio * cantidad,
        };
      })
    );

    setLineas(nuevasLineas);
  }

  function handleRepartoChange(repartoId: string) {
    setForm({ ...form, repartoId });
    setLineas([]);
    setExistencias([]);
    if (repartoId) {
      fetchExistencias(repartoId);
    }
  }

  async function crearRemito() {
    if (!form.repartoId) {
      setSaveError('El reparto es obligatorio.');
      return;
    }
    if (lineas.length === 0) {
      setSaveError('Debe agregar al menos una línea de producto.');
      return;
    }
    for (const linea of lineas) {
      if (!linea.existenciaId || !linea.cantidad || Number(linea.cantidad) <= 0) {
        setSaveError('Todas las líneas deben tener producto y cantidad válida.');
        return;
      }
      if (linea.precioUnitario <= 0) {
        setSaveError('No se encontró precio vigente para uno o más productos.');
        return;
      }
    }

    const total = lineas.reduce((sum, l) => sum + l.subtotal, 0);

    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        clienteId: form.clienteId && form.clienteId !== 'none' ? Number(form.clienteId) : null,
        repartoId: Number(form.repartoId),
        total,
        fecha: form.fecha,
        lineas: lineas.map((l) => ({
          existenciaId: Number(l.existenciaId),
          cantidad: Number(l.cantidad),
          subtotal: l.subtotal,
        })),
      };

      const res = await fetch(`${API}/remitos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al crear remito');
      }

      setCreateOpen(false);
      fetchRemitos(fechaDesde, fechaHasta);
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const totalVentas = remitos.reduce((sum, r) => sum + r.total, 0);
  const cantidadRemitos = remitos.length;

  const mesLabel = fechaDesde
    ? new Date(fechaDesde + 'T12:00:00').toLocaleDateString('es-AR', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  const totalRemito = lineas.reduce((sum, l) => sum + l.subtotal, 0);

  return (
    <section className="flex flex-col gap-6 p-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ventas del mes</h1>
          <p className="text-sm text-gray-500 capitalize mt-0.5">{mesLabel}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              setTempDesde(fechaDesde);
              setTempHasta(fechaHasta);
              setFilterOpen(true);
            }}
          >
            <Search className="h-4 w-4" />
            Buscar por fecha
          </Button>
          <Button className="flex items-center gap-2" onClick={abrirCrear}>
            <Plus className="h-4 w-4" />
            Nuevo remito
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-4 flex items-center gap-4 shadow-sm">
          <div className="bg-blue-100 text-blue-600 rounded-lg p-2">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Remitos emitidos</p>
            <p className="text-2xl font-bold text-gray-800">{cantidadRemitos}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-4 shadow-sm">
          <div className="bg-green-100 text-green-600 rounded-lg p-2">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total vendido</p>
            <p className="text-2xl font-bold text-gray-800">{formatMonto(totalVentas)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-400" />
            Lista de remitos
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {fechaDesde} al {fechaHasta}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">Cargando...</div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 text-red-500 text-sm px-4 text-center">
            {error}
          </div>
        ) : remitos.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            No hay remitos en el período seleccionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Fecha</th>
                  <th className="px-6 py-3 text-left">Cliente</th>
                  <th className="px-6 py-3 text-left">Reparto</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {remitos.map((remito) => (
                  <tr key={remito.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-400 font-mono">#{remito.id}</td>
                    <td className="px-6 py-4 text-gray-700">{formatFecha(remito.fecha)}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {remito.cliente?.nombre ?? (
                        <span className="text-gray-400 italic">Sin cliente</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {remito.reparto?.nombre ?? <span className="text-gray-400 italic">—</span>}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-800">
                      {formatMonto(remito.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-gray-50">
                  <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-600">
                    Total del período
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-gray-800">
                    {formatMonto(totalVentas)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Filtro de fechas */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buscar por fecha</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Desde</Label>
              <Input type="date" value={tempDesde} onChange={(e) => setTempDesde(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Hasta</Label>
              <Input type="date" value={tempHasta} onChange={(e) => setTempHasta(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFilterOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={aplicarFiltro}>Buscar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Crear remito */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo remito</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                Reparto <span className="text-red-500">*</span>
              </Label>
              <Select value={form.repartoId} onValueChange={handleRepartoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná un reparto" />
                </SelectTrigger>
                <SelectContent>
                  {repartos.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Cliente (opcional)</Label>
              <Select
                value={form.clienteId}
                onValueChange={(v) => setForm({ ...form, clienteId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin cliente asignado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin cliente</SelectItem>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>
                Tipo de precio <span className="text-red-500">*</span>
              </Label>
              <Select value={form.tipoPrecio} onValueChange={handleTipoPrecioChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reventa">Reventa</SelectItem>
                  <SelectItem value="consumidor final">Consumidor Final</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Los precios se calcularán según el tipo seleccionado
              </p>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">Líneas de productos</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={agregarLinea}
                  disabled={!form.repartoId}
                  className="flex items-center gap-1"
                >
                  <PackagePlus className="h-4 w-4" />
                  Agregar línea
                </Button>
              </div>

              {!form.repartoId && (
                <p className="text-sm text-gray-500 italic">
                  Seleccioná un reparto para agregar productos
                </p>
              )}

              {lineas.length === 0 && form.repartoId && (
                <p className="text-sm text-gray-500 italic">
                  No hay líneas agregadas. Presioná "Agregar línea" para comenzar.
                </p>
              )}

              {lineas.map((linea, index) => {
                const existencia = existencias.find((e) => e.id === Number(linea.existenciaId));
                return (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-end">
                    <div className="col-span-5">
                      <Label className="text-xs">Producto</Label>
                      <Select
                        value={linea.existenciaId}
                        onValueChange={(v) => actualizarLinea(index, 'existenciaId', v)}
                      >
                        <SelectTrigger className="text-sm h-9">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {existencias.map((e) => (
                            <SelectItem key={e.id} value={String(e.id)}>
                              {e.producto.nombre} (Stock: {e.cantidad})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Cant.</Label>
                      <Input
                        type="number"
                        min={1}
                        max={existencia?.cantidad || 999}
                        value={linea.cantidad}
                        onChange={(e) => actualizarLinea(index, 'cantidad', e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Precio U.</Label>
                      <Input
                        type="text"
                        value={formatMonto(linea.precioUnitario)}
                        readOnly
                        className="text-sm h-9 bg-gray-50"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Subtotal</Label>
                      <Input
                        type="text"
                        value={formatMonto(linea.subtotal)}
                        readOnly
                        className="text-sm h-9 bg-gray-50"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => eliminarLinea(index)}
                        className="h-9 w-9"
                      >
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
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={crearRemito} disabled={saving}>
              {saving ? 'Guardando...' : 'Crear remito'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}