'use client';

import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Remito {
  id: number;
  fecha: string;
  total: number;
  cliente?: { id: number; nombre: string };
  reparto?: { id: number; nombre: string };
}

interface Props {
  remito: Remito;
}

export function Remito({ remito }: Props) {
  const router = useRouter();

  const formatFecha = (fecha: string) => {
    if (!fecha) return '-';
    const fechaLimpia = String(fecha).split('T')[0];
    const [anio, mes, dia] = fechaLimpia.split('-');
    return `${dia}/${mes}/${anio}`;
  };

  const formatMonto = (total: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(total);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-2 text-gray-400 font-mono text-sm">#{remito.id}</td>
      <td className="px-4 py-2 text-gray-700 text-sm">{formatFecha(remito.fecha)}</td>
      <td className="px-4 py-2 text-gray-700 text-sm">
        {remito.cliente?.nombre ?? <span className="text-gray-400 italic">Sin cliente</span>}
      </td>
      <td className="px-4 py-2 text-gray-700 text-sm">
        {remito.reparto?.nombre ?? <span className="text-gray-400 italic">—</span>}
      </td>
      <td className="px-4 py-2 text-right font-semibold text-gray-800 text-sm">
        {formatMonto(remito.total)}
      </td>
      <td className="px-4 py-2 text-right">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          onClick={() => router.push(`/dashboard/remitos/${remito.id}`)}
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </td>
    </tr>
  );
}