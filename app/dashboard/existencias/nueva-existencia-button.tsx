'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function NuevaExistenciaButton() {
  const router = useRouter();

  return (
    <Button 
      size="sm" 
      className="h-8 gap-1" 
      onClick={() => router.push('/dashboard/existencias/nuevo')}
    >
      <PlusCircle className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
        Nueva existencia
      </span>
    </Button>
  );
}