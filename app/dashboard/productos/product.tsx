import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';

interface Producto {
  id: number;
  nombre: string;
  peso: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function Product({ product }: { product: Producto }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`¿Eliminar el producto "${product.nombre}"?`)) return;

    const res = await fetch(`${API_BASE_URL}/productos/${product.id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      router.refresh(); // Vuelve a cargar los datos desde el servidor
    } else {
      alert('Error al eliminar el producto');
    }
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{product.id}</TableCell>
      <TableCell>{product.nombre}</TableCell>
      <TableCell>{product.peso} g</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/productos/${product.id}/editar`)}
            >
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}