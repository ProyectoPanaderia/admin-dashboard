'use client';

import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';

// Ajustado a tu DTO real
interface ExistenciaType {
  id: number;
  fechaE: string;
  fechaV: string;
  cantidad: number;
  productoId: number;
  repartoId: number;
  // Objetos opcionales por si el backend los manda poblados
  Producto?: { nombre: string; peso?: number };
  Reparto?: { nombre: string };
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function Existencia({ existencia }: { existencia: ExistenciaType }) {
  const router = useRouter();

  // Función para formatear fechas (YYYY-MM-DD o ISO a DD/MM/YYYY)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('es-AR');
  };

  async function handleDelete() {
    // Intentamos obtener un nombre legible para la alerta
    const nombreProducto = existencia.Producto?.nombre || `ID ${existencia.productoId}`;
    
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar el lote de "${nombreProducto}" (Cant: ${existencia.cantidad})?`
    );
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_BASE_URL}/existencias/${existencia.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // alert('✅ Existencia eliminada correctamente'); // Opcional
        router.refresh();
      } else {
        const msg = await res.text();
        console.error('Error al eliminar existencia:', msg);
        alert('⚠️ No se pudo eliminar la existencia');
      }
    } catch (error) {
      console.error('Error al conectar con backend:', error);
      alert('❌ Error de conexión con el servidor');
    }
  }

  return (
    <TableRow>
      {/* Columna Producto: Muestra nombre si existe, sino ID */}
      <TableCell className="font-medium">
        {existencia.Producto?.nombre || `Prod. #${existencia.productoId}`}
      </TableCell>

      {/* Columna Reparto */}
      <TableCell>
        {existencia.Reparto?.nombre || `Rep. #${existencia.repartoId}`}
      </TableCell>

      {/* Fechas mapeadas desde fechaE y fechaV */}
      <TableCell>{formatDate(existencia.fechaE)}</TableCell>
      <TableCell className="text-red-600">
        {formatDate(existencia.fechaV)}
      </TableCell>

      {/* Cantidad */}
      <TableCell className="text-right font-bold">
        {existencia.cantidad}
      </TableCell>

      {/* Acciones */}
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/dashboard/existencias/${existencia.id}/editar`)
            }
          >
            <Pencil className="h-4 w-4 mr-1" />
            <span className="sr-only lg:not-sr-only">Editar</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="sr-only lg:not-sr-only">Eliminar</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}