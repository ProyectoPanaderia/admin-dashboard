'use client';

import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Props {
  reparto: {
    id: number;
    nombre: string;
    tercerizado: string;
    estado: string;
  };
}

export function Reparto({ reparto }: Props) {
  const router = useRouter();

  return (
    <TableRow>
      <TableCell>{reparto.id}</TableCell>
      <TableCell>{reparto.nombre}</TableCell>
      <TableCell>{reparto.tercerizado === 'S' ? 'Sí' : 'No'}</TableCell>
      <TableCell>
        {reparto.estado === 'A' ? 'Activo' : 'Inactivo'}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/dashboard/repartos/${reparto.id}/editar`)}
        >
          Editar
        </Button>
      </TableCell>
    </TableRow>
  );
}