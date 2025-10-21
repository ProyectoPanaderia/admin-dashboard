'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function EditarProductoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [nombre, setNombre] = useState('');
  const [peso, setPeso] = useState('');

  useEffect(() => {
    if (!id) return;

    fetch(`${API_BASE_URL}/productos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const producto = data.data;
        setNombre(producto.nombre);
        setPeso(producto.peso.toString());
      })
      .catch((err) => console.error('Error al obtener producto:', err));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch(`${API_BASE_URL}/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, peso: parseInt(peso, 10) }),
    });

    if (res.ok) {
      router.push('/dashboard/productos');
      router.refresh();
    } else {
      alert('Error al actualizar el producto');
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-8 bg-muted/10">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle>Editar producto</CardTitle>
          <CardDescription>Actualizá los datos del producto seleccionado.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="peso">Peso (g)</Label>
              <Input
                id="peso"
                type="number"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                required
              />
            </div>
            <CardFooter className="flex justify-end gap-2 p-0 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard/productos')}>
                Cancelar
              </Button>
              <Button type="submit">Guardar cambios</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}