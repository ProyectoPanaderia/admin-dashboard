import { ExistenciasTable } from './existencias-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PackagePlus } from 'lucide-react';
import { ExistenciasFilter } from './existencias-filter';
import { ExportarExistenciasButton } from './exportar-button';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// definimos el tipo como una promesa
type SearchParamsProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ExistenciasPage(props: SearchParamsProps) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams();

  if (searchParams.productoId) {
    params.append('productoId', String(searchParams.productoId));
  }
  if (searchParams.repartoId) {
    params.append('repartoId', String(searchParams.repartoId));
  }
  
  if (searchParams.fechaE) {
    params.append('fechaE', String(searchParams.fechaE));
  }
  if (searchParams.fechaV) {
    params.append('fechaV', String(searchParams.fechaV));
  }

  // Fetch al backend
  const res = await fetch(`${API_BASE_URL}/existencias?${params.toString()}`, { 
    cache: 'no-store' 
  });
  
  const data = await res.json();
  const existencias = data?.data ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-semibold">Stock repartos</h1>
        <div className="ml-auto flex items-center">
          <Link href="/dashboard/existencias/nuevo">
            <Button size="sm" className="h-8 gap-1">
              <PackagePlus className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Nueva Existencia
              </span>
            </Button>
          </Link>

          <ExportarExistenciasButton existencias={existencias} />
        
        </div>
      </div>

      <ExistenciasFilter />

      <ExistenciasTable existencias={existencias} />
    </div>
  );
}