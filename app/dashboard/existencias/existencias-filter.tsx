'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react'; // Agregué Filter para decorar si querés

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function ExistenciasFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [productos, setProductos] = useState<{id: number, nombre: string}[]>([]);
  const [repartos, setRepartos] = useState<{id: number, nombre: string}[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/productos`).then(r => r.json()),
      fetch(`${API_BASE_URL}/repartos`).then(r => r.json())
    ]).then(([prodData, repData]) => {
      setProductos(prodData.data || []);
      setRepartos(repData.data || []);
    });
  }, []);

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
    router.replace('/dashboard/existencias');
  }

  // Chequeamos si hay algún filtro activo para mostrar el botón X
  const hayFiltros = searchParams.get('productoId') || 
                     searchParams.get('repartoId') || 
                     searchParams.get('fechaVencimiento') ||
                     searchParams.get('fechaElaboracion');

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
        >
          <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {repartos.map(r => (
              <SelectItem key={r.id} value={r.id.toString()}>{r.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* NUEVO: Filtro Elaboración */}
      <div className="w-[150px]">
        <label className="text-sm font-medium mb-1 block">F. Elaboración</label>
        <Input 
          type="date" 
          value={searchParams.get('fechaElaboracion') || ''}
          onChange={(e) => handleFilterChange('fechaElaboracion', e.target.value)}
        />
      </div>

      {/* Filtro Vencimiento */}
      <div className="w-[150px]">
        <label className="text-sm font-medium mb-1 block">F. Vencimiento</label>
        <Input 
          type="date" 
          value={searchParams.get('fechaVencimiento') || ''}
          onChange={(e) => handleFilterChange('fechaVencimiento', e.target.value)}
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