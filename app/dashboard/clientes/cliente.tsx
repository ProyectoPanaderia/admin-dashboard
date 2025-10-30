'use client';

import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';

interface ClienteType {
  id: number;
  nombre: string;
  ciudadNombre: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function Cliente({ cliente }: { cliente: ClienteType }) {
  const router = useRouter();

  async function handleDelete() {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar el cliente "${cliente.nombre}"?`
    );
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_BASE_URL}/clientes/${cliente.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('✅ Cliente eliminado correctamente');
        router.refresh();
      } else {
        const msg = await res.text();
        console.error('Error al eliminar cliente:', msg);
        alert('⚠️ No se pudo eliminar el cliente');
      }
    } catch (error) {
      console.error('Error al conectar con backend:', error);
      alert('❌ Error de conexión con el servidor');
    }
  }

  return (
    <TableRow>
      <TableCell>{cliente.id}</TableCell>
      <TableCell>{cliente.nombre}</TableCell>
      <TableCell>{cliente.ciudadNombre}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/dashboard/clientes/${cliente.id}/editar`)
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