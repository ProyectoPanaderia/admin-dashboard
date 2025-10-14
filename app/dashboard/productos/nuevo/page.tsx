'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function NuevoProductoPage() {
  const [nombre, setNombre] = useState('');
  const [peso, setPeso] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch(`${API_BASE_URL}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, peso: parseInt(peso, 10) }),
    });

    if (res.ok) {
      router.push('/dashboard/productos');
      router.refresh();
    } else {
      alert('Error al crear el producto');
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Nuevo producto</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
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
        <Button type="submit">Guardar</Button>
      </form>
    </div>
  );
}