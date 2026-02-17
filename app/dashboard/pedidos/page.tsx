import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { PedidosTable } from './pedidos-table';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

type SearchParamsProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PedidosPage(props: SearchParamsProps) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams();

  if (searchParams.estado) params.append('estado', String(searchParams.estado));

  const res = await fetch(`${API_BASE_URL}/pedidos?${params.toString()}`, { 
    cache: 'no-store' 
  });
  const data = await res.json();
  const pedidos = data?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <Link href="/dashboard/pedidos/nuevo">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Pedido
          </Button>
        </Link>
      </div>
      
      <PedidosTable pedidos={pedidos} />
    </div>
  );
}