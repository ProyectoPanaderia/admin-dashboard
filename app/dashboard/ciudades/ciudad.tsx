'use client';

import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';

interface CiudadType {
  id: number;
  nombre: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function Ciudad({ ciudad }: { ciudad: CiudadType }) {
  const router = useRouter();

  async function handleDelete() {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar la ciudad "${ciudad.nombre}"?`
    );
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_BASE_URL}/ciudades/${ciudad.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('✅ Ciudad eliminada correctamente');
        router.refresh();
      } else {
        const msg = await res.text();
        console.error('Error al eliminar ciudad:', msg);
        alert('⚠️ No se pudo eliminar la ciudad');
      }
    } catch (error) {
      console.error('Error al conectar con backend:', error);
      alert('❌ Error de conexión con el servidor');
    }
  }

  return (
    <TableRow>
      <TableCell>{ciudad.id}</TableCell>
      <TableCell>{ciudad.nombre}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/dashboard/ciudades/${ciudad.id}/editar`)
            }
          >
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}