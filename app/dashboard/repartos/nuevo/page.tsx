'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function NuevoRepartoPage() {
  const [nombre, setNombre] = useState('');
  const [tercerizado, setTercerizado] = useState('N');
  const [estado, setEstado] = useState('A');
  const router = useRouter();
  const { data: session } = useSession();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch(`${API_BASE_URL}/repartos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
                  Authorization: `Bearer ${session?.user.token}`
               },
      body: JSON.stringify({ nombre, tercerizado, estado }),
    });

    if (res.ok) {
      router.push('/dashboard/repartos');
      router.refresh();
    } else {
      const errorData = await res.json().catch(() => ({}));
      alert('Error al crear el reparto: ' + (errorData.error || 'No autorizado'));    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-8 bg-muted/10">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle>Nuevo reparto</CardTitle>
          <CardDescription>
            Completá los datos para registrar un nuevo reparto.
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