'use client';

import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function EditarRepartoPage() {
  const router = useRouter();
  const { id } = useParams();

  const [nombre, setNombre] = useState('');
  const [tercerizado, setTercerizado] = useState('N');
  const [estado, setEstado] = useState('A');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReparto() {
      try {
        const res = await fetch(`${API_BASE_URL}/repartos/${id}`);
        if (!res.ok) throw new Error('Error al obtener reparto');

        const data = await res.json();
        const r = data.data || data;

        setNombre(r.nombre ?? '');
        setTercerizado(r.tercerizado ?? 'N');
        setEstado(r.estado ?? 'A');
      } catch (error) {
        console.error('⚠️ Error al cargar reparto:', error);
        alert('Error al cargar los datos del reparto');
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchReparto();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = { nombre, tercerizado, estado };
    console.log('Enviando PUT /repartos', payload);

    try {
      const res = await fetch(`${API_BASE_URL}/repartos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/dashboard/repartos');
        router.refresh();
      } else {
        const text = await res.text();
        console.error('Error backend:', text);
        alert('Error al actualizar el reparto');
      }
    } catch (error) {
      console.error('Error al conectar con backend:', error);
      alert('No se pudo conectar al servidor');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-muted-foreground">
        Cargando reparto...
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-8 bg-muted/10">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle>Editar reparto</CardTitle>
          <CardDescription>
            Modificá los datos del reparto y guardá los cambios.
          </CardDescription>
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
              <Label htmlFor="tercerizado">Tercerizado</Label>
              <Select value={tercerizado} onValueChange={setTercerizado}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S">Sí</SelectItem>
                  <SelectItem value="N">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="estado">Estado</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Activo</SelectItem>
                  <SelectItem value="I">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <CardFooter className="flex justify-end gap-2 p-0 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/repartos')}
              >
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