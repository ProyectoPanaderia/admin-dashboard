'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Plus, FileText, DollarSign, ShoppingCart } from 'lucide-react';
import { NuevoRemitoModal } from './nuevo-remito-modal';
import { RemitosFilter } from './remitos-filter';
import { Remito } from './remito';

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
    <section className="flex flex-col gap-4 p-4">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ventas del mes</h1>
          <p className="text-sm text-gray-500 capitalize">{mesLabel}</p>
        </div>
        <Button className="flex items-center gap-2 h-9" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nuevo remito
        </Button>
      </div>

      {/* Filtros */}
      <RemitosFilter />

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg border p-3 flex items-center gap-3 shadow-sm">
          <div className="bg-blue-100 text-blue-600 rounded-lg p-2">
            <ShoppingCart className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Remitos emitidos</p>
            <p className="text-xl font-bold text-gray-800">{cantidadRemitos}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-3 flex items-center gap-3 shadow-sm">
          <div className="bg-green-100 text-green-600 rounded-lg p-2">
            <DollarSign className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total vendido</p>
            <p className="text-xl font-bold text-gray-800">{formatMonto(totalVentas)}</p>
          </div>
        </div>
      </div>

      {/* Tabla de Remitos */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            Lista de remitos
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {fechaDesde} al {fechaHasta}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400 text-sm">Cargando...</div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-red-500 text-sm px-4 text-center">{error}</div>
        ) : remitos.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
            No hay remitos en el período seleccionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600 text-xs uppercase">
                  <th className="px-4 py-2 text-left font-medium">ID</th>
                  <th className="px-4 py-2 text-left font-medium">Fecha</th>
                  <th className="px-4 py-2 text-left font-medium">Cliente</th>
                  <th className="px-4 py-2 text-left font-medium">Reparto</th>
                  <th className="px-4 py-2 text-right font-medium">Total</th>
                  <th className="px-4 py-2 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {remitos.map((remito) => (
                  <Remito key={remito.id} remito={remito} />
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-gray-50">
                  <td colSpan={4} className="px-4 py-2 text-sm font-semibold text-gray-700">
                    Total del período
                  </td>
                  <td colSpan={2} className="px-4 py-2 text-right font-bold text-gray-800">
                    {formatMonto(totalVentas)}
                  </td>
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