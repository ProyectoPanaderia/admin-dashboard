'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

export default function EditarClientePage() {
  const router = useRouter();
  const { id } = useParams();
  const [nombre, setNombre] = useState('');
  const [ciudadId, setCiudadId] = useState<number | null>(null);
  const [ciudades, setCiudades] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/clientes/${id}`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/ciudades`).then((r) => r.json()),
    ])
      .then(([clienteData, ciudadesData]) => {
        const cliente = clienteData.data || clienteData;
        setNombre(cliente.nombre);
        setCiudadId(cliente.ciudadId);
        setCiudades(Array.isArray(ciudadesData) ? ciudadesData : ciudadesData.data);
      })
      .catch(() => alert('Error al cargar datos'));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/clientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, ciudadId }),
    });

    if (res.ok) {
      router.push('/dashboard/clientes');
      router.refresh();
    } else {
      alert('Error al actualizar el cliente');
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-8 bg-muted/10">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle>Editar cliente</CardTitle>
          <CardDescription>Modificá los datos del cliente.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>

            <div>
              <Label>Ciudad</Label>
              <Select value={String(ciudadId ?? '')} onValueChange={(val) => setCiudadId(Number(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {ciudades.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <CardFooter className="flex justify-end gap-2 p-0 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard/clientes')}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}