'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function NuevaExistenciaPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const userRole = session?.user?.rol;
  const userRepartoId = session?.user?.repartoId;

  // Estados para listas desplegables
  const [productos, setProductos] = useState<{id: number, nombre: string}[]>([]);
  const [repartos, setRepartos] = useState<{id: number, nombre: string}[]>([]);

  // Estados del formulario
  const [productoId, setProductoId] = useState('');
  const [repartoId, setRepartoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  // Fechas por defecto: Elaboración hoy, Vencimiento mañana (puedes ajustar lógica)
  const [fechaE, setFechaE] = useState(new Date().toISOString().split('T')[0]);
  const [fechaV, setFechaV] = useState('');

  useEffect(() => {
    if (userRole === 'REPARTIDOR' && userRepartoId) {
      setRepartoId(String(userRepartoId));
    }
  }, [userRole, userRepartoId]);

  useEffect(() => {
    async function loadResources() {
      if (!session?.user?.token) return;
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`
        };

        const [resProd, resRep] = await Promise.all([
          fetch(`${API_BASE_URL}/productos`, { headers }),
          fetch(`${API_BASE_URL}/repartos`, { headers })
        ]);

        const dProd = await resProd.json();
        const dRep = await resRep.json();

        const listaProductos = Array.isArray(dProd) ? dProd : (dProd.data || []);
        const listaRepartos = Array.isArray(dRep) ? dRep : (dRep.data || []);

        setProductos(listaProductos);
        setRepartos(listaRepartos);

      } catch (error) {
        console.error("Error cargando recursos", error);
      }
    }
    loadResources();
  }, [session?.user?.token]);

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  // 1. Determinamos el ID de reparto de forma segura
  // Si es repartidor, lo sacamos directo de la sesión. 
  // Si no, lo sacamos del select (estado).
  const idParaEnviar = userRole === 'REPARTIDOR' ? userRepartoId : repartoId;

  // 2. Validación extra antes de enviar
  if (!idParaEnviar) {
    alert('Error: No se pudo determinar el reparto. Por favor, reintente.');
    return;
  }

  setLoading(true);

  const payload = {
    productoId: Number(productoId),
    repartoId: Number(idParaEnviar), // Nos aseguramos que sea número
    cantidad: Number(cantidad),
    fechaE,
    fechaV
  };

  try {
    const res = await fetch(`${API_BASE_URL}/existencias`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user?.token}`
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push('/dashboard/existencias');
      router.refresh();
    } else {
      const errData = await res.json();
      alert(`Error: ${errData.message || 'No se pudo crear el lote'}`);
    }
  } catch (error) {
    console.error(error);
    alert('Error de conexión');
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="flex justify-center items-center min-h-screen p-8 bg-muted/10">
      <Card className="w-full max-w-lg shadow-md">
        <CardHeader>
          <CardTitle>Nueva Existencia</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Producto</Label>
                <Select value={productoId} onValueChange={setProductoId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {productos.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reparto</Label>
                <Select 
                  value={repartoId} 
                  onValueChange={setRepartoId} 
                  required
                  disabled={userRole === 'REPARTIDOR'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {repartos.map(r => (
                      <SelectItem key={r.id} value={r.id.toString()}>{r.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {userRole === 'REPARTIDOR' && (
                  <p className="text-xs text-muted-foreground">Reparto asignado automáticamente.</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cantidad</Label>
              <Input 
                type="number" 
                value={cantidad} 
                onChange={e => setCantidad(e.target.value)} 
                placeholder="Unidades físicas"
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha Elaboración</Label>
                <Input 
                  type="date" 
                  value={fechaE} 
                  onChange={e => setFechaE(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha Vencimiento</Label>
                <Input 
                  type="date" 
                  value={fechaV} 
                  onChange={e => setFechaV(e.target.value)} 
                  required 
                />
              </div>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-2 bg-muted/5 p-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Stock'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}