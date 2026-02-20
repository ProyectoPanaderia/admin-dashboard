import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { DevolucionesTable } from './devoluciones-table';
import { auth } from '@/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

type SearchParamsProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function DevolucionesPage(props: SearchParamsProps) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams();
  
  const session = await auth();
  const userRole = session?.user?.rol;
  const userRepartoId = session?.user?.repartoId;

  // Filtros normales de URL (por si después agregás un buscador por cliente o fechas)
  if (searchParams.clienteId) params.append('clienteId', String(searchParams.clienteId));
  
  // FILTRO OBLIGATORIO PARA REPARTIDOR
  if (userRole === 'REPARTIDOR' && userRepartoId) {
    params.append('repartoId', String(userRepartoId));
  }

  // Preparamos headers
  const headers: HeadersInit = {};
  if (session?.user?.token) {
    headers['Authorization'] = `Bearer ${session.user.token}`;
  }

  const res = await fetch(`${API_BASE_URL}/devoluciones?${params.toString()}`, { 
    cache: 'no-store',
    headers
  });
  
  const data = await res.json();
  const devoluciones = data?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Devoluciones</h1>
        <Link href="/dashboard/devoluciones/nueva">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Cargar Devolución
          </Button>
        </Link>
      </div>
      
      <DevolucionesTable devoluciones={devoluciones} />
    </div>
  );
}