'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface LineaRemito {
  id: number;
  cantidad: number;
  subtotal: number;
  producto?: {
    id: number;
    nombre: string;
  };
}

interface RemitoDetalle {
  id: number;
  fecha: string;
  total: number;
  cliente?: { id: number; nombre: string };
  reparto?: { id: number; nombre: string };
  lineasRemito?: LineaRemito[];
}

interface Props {
  remito: RemitoDetalle;
}

export function ImprimirRemitoButton({ remito }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button onClick={handlePrint} className="flex items-center gap-2">
      <Printer className="h-4 w-4" />
      Imprimir
    </Button>
  );
}