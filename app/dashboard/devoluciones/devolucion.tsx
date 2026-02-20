'use client';

import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; 

interface Props {
  devolucion: any; // Ideal cambiar por tu DevolucionType
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function DevolucionRow({ devolucion }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.rol;

  // Formateadores
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { timeZone: 'UTC' });
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  // Lógica de eliminado
  async function handleDelete() {
    if (!confirm(`¿Seguro que deseas eliminar la devolución #${devolucion.id}?`)) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/devoluciones/${devolucion.id}`, { 
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${session?.user?.token}`
        }
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('No se pudo eliminar la devolución.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    }
  }

  return (
    <TableRow>
      <TableCell className="font-medium">#{devolucion.id}</TableCell>
      
      <TableCell>{formatDate(devolucion.fecha)}</TableCell>

      <TableCell>
        {devolucion.Cliente 
          ? `${devolucion.Cliente.nombre} ${devolucion.Cliente.apellido || ''}` 
          : <span className="text-muted-foreground italic">Sin cliente</span>}
      </TableCell>
      
      <TableCell>{devolucion.Reparto?.nombre || '-'}</TableCell>
      
      {/* Razón / Motivo */}
      <TableCell>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border">
          {devolucion.razon}
        </span>
      </TableCell>
      
      {/* Total */}
      <TableCell className="text-right font-bold tabular-nums text-red-600">
        -{formatMoney(devolucion.total)}
      </TableCell>
      
      {/* Acciones */}
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => router.push(`/dashboard/devoluciones/${devolucion.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => router.push(`/dashboard/devoluciones/${devolucion.id}/editar`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          {/* Eliminar protegido por rol */}
          {userRole !== 'REPARTIDOR' && ( 
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}