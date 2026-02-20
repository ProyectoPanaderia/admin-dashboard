import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { ImprimirRemitoButton } from './imprimir-button';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface LineaRemito {
  id: number;
  cantidad: number;
  subtotal: number;
  producto?: {
    id: number;
    nombre: string;
  };
}

interface RemitoDetalle {
  id: number;
  fecha: string;
  total: number;
  cliente?: { id: number; nombre: string };
  reparto?: { id: number; nombre: string };
  lineasRemito?: LineaRemito[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getRemitoDetalle(id: string): Promise<RemitoDetalle | null> {
  try {
    const res = await fetch(`${API}/remitos/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json;
  } catch {
    return null;
  }
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

export default async function RemitoDetallePage(props: PageProps) {
  const params = await props.params;
  const remito = await getRemitoDetalle(params.id);

  if (!remito) {
    notFound();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Detalle de Remito #{remito.id}</h1>
        </div>
        <ImprimirRemitoButton remito={remito} />
      </div>

      {/* Información del Remito */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Datos del Cliente */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Datos del Cliente
          </h2>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">Nombre:</p>
              <p className="font-medium">
                {remito.cliente?.nombre || (
                  <span className="text-gray-400 italic">Sin cliente</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reparto:</p>
              <p className="font-medium">{remito.reparto?.nombre || '-'}</p>
            </div>
          </div>
        </div>

        {/* Información del Remito */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Información del Remito
          </h2>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">Fecha:</p>
              <p className="font-medium">{formatFecha(remito.fecha)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Productos Vendidos */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Productos Vendidos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Descripción
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  Precio Unitario
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {remito.lineasRemito && remito.lineasRemito.length > 0 ? (
                remito.lineasRemito.map((linea) => (
                  <tr key={linea.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {linea.producto?.nombre || 'Producto sin nombre'}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700 font-medium">
                      {linea.cantidad}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">
                      {formatMonto(linea.subtotal / linea.cantidad)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {formatMonto(linea.subtotal)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    No hay productos en este remito
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Total */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex justify-end items-center gap-4">
            <span className="text-lg font-semibold text-gray-700">Total:</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatMonto(remito.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}