'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';
import { useSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function ExistenciasFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // --- DATOS DEL USUARIO ---
  const userRole = session?.user?.rol;
  const userRepartoId = session?.user?.repartoId;

  const [productos, setProductos] = useState<{id: number, nombre: string}[]>([]);
  const [repartos, setRepartos] = useState<{id: number, nombre: string}[]>([]);

  // 1. FORZAR REPARTO EN URL SI ES REPARTIDOR
  useEffect(() => {
    if (userRole === 'REPARTIDOR' && userRepartoId) {
      const currentReparto = searchParams.get('repartoId');
      if (currentReparto !== String(userRepartoId)) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('repartoId', String(userRepartoId));
        router.replace(`/dashboard/existencias?${params.toString()}`);
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
      fetch(`${API_BASE_URL}/productos`, { headers }).then(r => r.json()),
      fetch(`${API_BASE_URL}/repartos`, { headers }).then(r => r.json())
    ])
    .then(([prodData, repData]) => {
      const listaProductos = Array.isArray(prodData) ? prodData : (prodData.data || []);
      const listaRepartos = Array.isArray(repData) ? repData : (repData.data || []);
      
      setProductos(listaProductos);
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
    router.replace(`/dashboard/existencias?${params.toString()}`);
  }

  function limpiarFiltros() {
    // 2. LIMPIAR SIN PERDER EL REPARTO SI ES REPARTIDOR
    if (userRole === 'REPARTIDOR' && userRepartoId) {
      router.replace(`/dashboard/existencias?repartoId=${userRepartoId}`);
    } else {
      router.replace('/dashboard/existencias');
    }
  }

  // Chequeamos si hay algún filtro activo (el reparto del repartidor no cuenta como "activo")
  const hayFiltros = searchParams.get('productoId') || 
                     (userRole !== 'REPARTIDOR' && searchParams.get('repartoId')) || 
                     searchParams.get('fechaV') ||
                     searchParams.get('fechaE');

  return (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-lg border shadow-sm items-end">
      
      {/* Filtro Producto */}
      <div className="w-[200px]">
        <label className="text-sm font-medium mb-1 block">Producto</label>
        <Select 
          value={searchParams.get('productoId') || ''} 
          onValueChange={(val) => handleFilterChange('productoId', val)}
        >
          <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {productos.map(p => (
              <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro Reparto */}
      <div className="w-[200px]">
        <label className="text-sm font-medium mb-1 block">Reparto</label>
        <Select 
          value={searchParams.get('repartoId') || ''} 
          onValueChange={(val) => handleFilterChange('repartoId', val)}
          disabled={userRole === 'REPARTIDOR'} // 3. BLOQUEO VISUAL
        >
          <SelectTrigger>
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

      {/* Filtro Elaboración */}
      <div className="w-[150px]">
        <label className="text-sm font-medium mb-1 block">Fecha Elaboración</label>
        <Input 
          type="date" 
          value={searchParams.get('fechaE') || ''}
          onChange={(e) => handleFilterChange('fechaE', e.target.value)}
        />
      </div>

      {/* Filtro Vencimiento */}
      <div className="w-[150px]">
        <label className="text-sm font-medium mb-1 block">Fecha Vencimiento</label>
        <Input 
          type="date" 
          value={searchParams.get('fechaV') || ''}
          onChange={(e) => handleFilterChange('fechaV', e.target.value)}
        />
      </div>

      {/* Botón Limpiar */}
      {hayFiltros && (
        <Button variant="ghost" size="icon" onClick={limpiarFiltros} className="mb-0.5 text-red-500 hover:text-red-700 hover:bg-red-50">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}