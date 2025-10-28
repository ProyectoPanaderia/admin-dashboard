'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

export default function EditarCiudadPage() {
  const router = useRouter();
  const { id } = useParams();
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/ciudades/${id}`)
      .then((res) => res.json())
      .then((data) => setNombre(data.data?.nombre || data.nombre))
      .catch(() => alert('Error al cargar ciudad'));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/ciudades/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre }),
    });

    if (res.ok) {
      router.push('/dashboard/ciudades');
      router.refresh();
    } else {
      alert('Error al actualizar la ciudad');
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-8 bg-muted/10">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle>Editar ciudad</CardTitle>
          <CardDescription>Modificá el nombre de la ciudad.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>

            <CardFooter className="flex justify-end gap-2 p-0 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard/ciudades')}>
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