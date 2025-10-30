'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function NuevoClientePage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [ciudadId, setCiudadId] = useState<number | null>(null);
  const [ciudades, setCiudades] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/ciudades`)
      .then((res) => res.json())
      .then((data) => setCiudades(Array.isArray(data) ? data : data.data))
      .catch(() => alert('Error al cargar ciudades'));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, ciudadId }),
    });

    if (res.ok) {
      router.push('/dashboard/clientes');
      router.refresh();
    } else {
      alert('Error al crear el cliente');
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-8 bg-muted/10">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle>Nuevo cliente</CardTitle>
          <CardDescription>Completá los datos para registrar un nuevo cliente.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>

            <div>
              <Label>Ciudad</Label>
              <Select onValueChange={(val) => setCiudadId(Number(val))}>
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