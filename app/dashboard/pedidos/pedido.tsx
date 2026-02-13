'use client';

import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Pedido as PedidoType } from '@/types/pedido'; // Asumiendo que ya creaste el type

interface Props {
  pedido: PedidoType;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function Pedido({ pedido }: Props) {
  const router = useRouter();

  // Formateadores
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    // Forzamos UTC para evitar que reste un día por zona horaria
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { timeZone: 'UTC' });
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  // Badge de estado
  const getEstadoBadge = (estado: string) => {
    const styles: Record<string, string> = {
      'Pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Completado': 'bg-green-100 text-green-800 border-green-200',
      'Cancelado': 'bg-red-100 text-red-800 border-red-200',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[estado] || 'bg-gray-100 text-gray-800'}`}>
        {estado}
      </span>
    );
  };

  // Lógica de eliminado
  async function handleDelete() {
    if (!confirm(`¿Seguro que deseas eliminar el pedido #${pedido.id}? Se borrarán sus líneas.`)) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/pedidos/${pedido.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        alert('No se pudo eliminar el pedido.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    }
  }

  return (
    <TableRow>
      <TableCell className="font-medium">#{pedido.id}</TableCell>
      
      {/* Cliente */}
      <TableCell>
        {pedido.Cliente 
          ? `${pedido.Cliente.nombre}` 
          : <span className="text-muted-foreground italic">Sin cliente</span>}
      </TableCell>
      
      {/* Reparto */}
      <TableCell>{pedido.Reparto?.nombre || '-'}</TableCell>
      
      {/* Fechas */}
      <TableCell>{formatDate(pedido.fechaEmision)}</TableCell>
      <TableCell>{formatDate(pedido.fechaEntrega)}</TableCell>
      
      {/* Estado */}
      <TableCell>{getEstadoBadge(pedido.estado)}</TableCell>
      
      {/* Total */}
      <TableCell className="text-right font-bold tabular-nums">
        {formatMoney(pedido.total)}
      </TableCell>
      
      {/* Acciones */}
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {/* Ver Detalle (Placeholder) */}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
            <Eye className="h-4 w-4" />
          </Button>
          
          {/* Editar */}
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => router.push(`/dashboard/pedidos/${pedido.id}/editar`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          {/* Eliminar */}
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}