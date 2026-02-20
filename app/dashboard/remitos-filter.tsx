'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function RemitosFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const userRole = session?.user?.rol;
  const userRepartoId = session?.user?.repartoId;

  const [clientes, setClientes] = useState<{id: number, nombre: string}[]>([]);
  const [repartos, setRepartos] = useState<{id: number, nombre: string}[]>([]);

  // 1. EFECTO DE SEGURIDAD: Forzar el reparto en la URL si es repartidor
  useEffect(() => {
    if (userRole === 'REPARTIDOR' && userRepartoId) {
      const currentReparto = searchParams.get('repartoId');
      if (currentReparto !== String(userRepartoId)) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('repartoId', String(userRepartoId));
        router.replace(`/dashboard?${params.toString()}`);
      }
    }
  }, [userRole, userRepartoId, searchParams, router]);

  useEffect(() => {
    if (!session?.user?.token) return;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.user.token}`
    };

    Promise.all([
      fetch(`${API_BASE_URL}/clientes?pageSize=100`, { headers }).then(r => r.json()),
      fetch(`${API_BASE_URL}/repartos?pageSize=100`, { headers }).then(r => r.json())
    ])
    .then(([cliData, repData]) => {
      const listaClientes = Array.isArray(cliData) ? cliData : (cliData.data || []);
      const listaRepartos = Array.isArray(repData) ? repData : (repData.data || []);
      
      setClientes(listaClientes);
      setRepartos(listaRepartos);
    })
    .catch(error => {
      console.error("Error cargando filtros:", error);
    });
  }, [session?.user?.token]);

  function handleFilterChange(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/dashboard?${params.toString()}`);
  }

  function limpiarFiltros() {
    // Si es repartidor, al limpiar mantenemos su repartoId
    if (userRole === 'REPARTIDOR' && userRepartoId) {
      router.replace(`/dashboard?repartoId=${userRepartoId}`);
    } else {
      router.replace('/dashboard');
    }
  }

  const hayFiltros = searchParams.get('clienteId') || 
                     (userRole !== 'REPARTIDOR' && searchParams.get('repartoId')) || // Si es repartidor, el reparto no cuenta como "filtro manual"
                     searchParams.get('fechaDesde') ||
                     searchParams.get('fechaHasta');

  return (
    <div className="flex flex-wrap gap-3 items-end">
      
      {/* Filtro Cliente */}
      <div className="w-[180px]">
        <label className="text-xs font-medium mb-1 block text-gray-600">Cliente</label>
        <Select 
          value={searchParams.get('clienteId') || ''} 
          onValueChange={(val) => handleFilterChange('clienteId', val)}
        >
          <SelectTrigger className="h-9"><SelectValue placeholder="Todos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {clientes.map(c => (
              <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro Reparto */}
      <div className="w-[180px]">
        <label className="text-xs font-medium mb-1 block text-gray-600">Reparto</label>
        <Select 
          value={searchParams.get('repartoId') || ''} 
          onValueChange={(val) => handleFilterChange('repartoId', val)}
          disabled={userRole === 'REPARTIDOR'} // <-- BLOQUEO
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder={userRole === 'REPARTIDOR' ? "Cargando..." : "Todos"} />
          </SelectTrigger>
          <SelectContent>
            {userRole !== 'REPARTIDOR' && <SelectItem value="all">Todos</SelectItem>}
            {repartos.map(r => (
              <SelectItem key={r.id} value={r.id.toString()}>{r.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro Fecha Desde */}
      <div className="w-[140px]">
        <label className="text-xs font-medium mb-1 block text-gray-600">Fecha Desde</label>
        <Input 
          type="date" 
          className="h-9"
          value={searchParams.get('fechaDesde') || ''}
          onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
        />
      </div>

      {/* Filtro Fecha Hasta */}
      <div className="w-[140px]">
        <label className="text-xs font-medium mb-1 block text-gray-600">Fecha Hasta</label>
        <Input 
          type="date" 
          className="h-9"
          value={searchParams.get('fechaHasta') || ''}
          onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
        />
      </div>

      {/* Botón Limpiar */}
      {hayFiltros && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={limpiarFiltros} 
          className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}