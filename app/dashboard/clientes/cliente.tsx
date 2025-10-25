'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import { MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ClienteType {
  id: number;
  nombre: string;
  ciudadNombre: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function Cliente({ cliente }: { cliente: ClienteType }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`¿Eliminar el cliente "${cliente.nombre}"?`)) return;

    const res = await fetch(`${API_BASE_URL}/clientes/${cliente.id}`, { method: 'DELETE' });

    if (res.ok) {
      router.refresh();
    } else {
      alert('Error al eliminar el cliente');
    }
  }

  return (
    <TableRow>
      <TableCell>{cliente.id}</TableCell>
      <TableCell>{cliente.nombre}</TableCell>
      <TableCell>{cliente.ciudadNombre}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/clientes/${cliente.id}/editar`)}>
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