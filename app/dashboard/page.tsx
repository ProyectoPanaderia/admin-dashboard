'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Plus, FileText, DollarSign, ShoppingCart } from 'lucide-react';
import { NuevoRemitoModal } from './nuevo-remito-modal';
import { RemitosFilter } from './remitos-filter';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface Remito {
  id: number;
  fecha: string;
  total: number;
  cliente?: { id: number; nombre: string };
  reparto?: { id: number; nombre: string };
}

function getFirstDayOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function formatFecha(fecha: string) {
  if (!fecha) return '-';
  const fechaLimpia = String(fecha).split('T')[0];
  const [anio, mes, dia] = fechaLimpia.split('-');
  return `${dia}/${mes}/${anio}`;
}

function formatMonto(total: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(total);
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const [remitos, setRemitos] = useState<Remito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const [createOpen, setCreateOpen] = useState(false);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.user?.token}`
  });

  async function fetchRemitos(desde: string, hasta: string) {
    if (!session?.user?.token) return;
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      params.append('fechaDesde', desde);
      params.append('fechaHasta', hasta);
      params.append('pageSize', '100');
      
      // Agregar filtros de la URL
      if (searchParams.get('clienteId')) {
        params.append('clienteId', searchParams.get('clienteId')!);
      }
      if (searchParams.get('repartoId')) {
        params.append('repartoId', searchParams.get('repartoId')!);
      }

      const res = await fetch(`${API}/remitos?${params.toString()}`, { headers: getAuthHeaders() });
      const json = await res.json();
      setRemitos(Array.isArray(json) ? json : (json.data || []));
    } catch {
      setError('No se pudieron cargar los remitos. Verificá que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session?.user?.token) return;
    
    // Usar fechas de los filtros si existen, sino usar el mes actual
    const desde = searchParams.get('fechaDesde') || getFirstDayOfMonth();
    const hasta = searchParams.get('fechaHasta') || getToday();
    
    setFechaDesde(desde);
    setFechaHasta(hasta);
    
    fetchRemitos(desde, hasta);
  }, [session?.user?.token, searchParams]);

  const totalVentas = remitos.reduce((sum, r) => sum + r.total, 0);
  const cantidadRemitos = remitos.length;
  
  let mesLabel = '';
  if (fechaDesde) {
    const fechaLimpia = String(fechaDesde).split('T')[0];
    const [anio, mes] = fechaLimpia.split('-');
    const nombresMeses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    mesLabel = `${nombresMeses[parseInt(mes, 10) - 1]} de ${anio}`;
  }

  return (
    <section className="flex flex-col gap-6 p-2">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ventas del mes</h1>
          <p className="text-sm text-gray-500 capitalize mt-0.5">{mesLabel}</p>
        </div>
        <div className="flex gap-2">
          <Button className="flex items-center gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Nuevo remito
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <RemitosFilter />

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-4 flex items-center gap-4 shadow-sm">
          <div className="bg-blue-100 text-blue-600 rounded-lg p-2"><ShoppingCart className="h-5 w-5" /></div>
          <div><p className="text-xs text-gray-500">Remitos emitidos</p><p className="text-2xl font-bold text-gray-800">{cantidadRemitos}</p></div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-4 shadow-sm">
          <div className="bg-green-100 text-green-600 rounded-lg p-2"><DollarSign className="h-5 w-5" /></div>
          <div><p className="text-xs text-gray-500">Total vendido</p><p className="text-2xl font-bold text-gray-800">{formatMonto(totalVentas)}</p></div>
        </div>
      </div>

      {/* Tabla de Remitos */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><FileText className="h-5 w-5 text-gray-400" /> Lista de remitos</h2>
          <p className="text-sm text-gray-500 mt-0.5">{fechaDesde} al {fechaHasta}</p>
        </div>

        {loading ? <div className="flex items-center justify-center py-16 text-gray-400">Cargando...</div> : 
         error ? <div className="flex items-center justify-center py-16 text-red-500 text-sm px-4 text-center">{error}</div> : 
         remitos.length === 0 ? <div className="flex items-center justify-center py-16 text-gray-400 text-sm">No hay remitos en el período seleccionado.</div> : (
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
                    <td className="px-6 py-4 text-gray-700">{remito.cliente?.nombre ?? <span className="text-gray-400 italic">Sin cliente</span>}</td>
                    <td className="px-6 py-4 text-gray-700">{remito.reparto?.nombre ?? <span className="text-gray-400 italic">—</span>}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-800">{formatMonto(remito.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-gray-50">
                  <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-600">Total del período</td>
                  <td className="px-6 py-3 text-right font-bold text-gray-800">{formatMonto(totalVentas)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Nuevo Remito */}
      <NuevoRemitoModal 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        onSuccess={() => fetchRemitos(fechaDesde, fechaHasta)} 
      />

    </section>
  );
}