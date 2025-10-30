'use client';

import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';

interface Producto {
  id: number;
  nombre: string;
  peso: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function Product({ product }: { product: Producto }) {
  const router = useRouter();

  async function handleDelete() {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar el producto "${product.nombre}"?`
    );
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_BASE_URL}/productos/${product.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('✅ Producto eliminado correctamente');
        router.refresh();
      } else {
        const msg = await res.text();
        console.error('Error al eliminar producto:', msg);
        alert('⚠️ No se pudo eliminar el producto');
      }
    } catch (err) {
      console.error('Error al conectar con el backend:', err);
      alert('❌ Error de conexión con el servidor');
    }
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{product.id}</TableCell>
      <TableCell>{product.nombre}</TableCell>
      <TableCell>{product.peso}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/dashboard/productos/${product.id}/editar`)
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