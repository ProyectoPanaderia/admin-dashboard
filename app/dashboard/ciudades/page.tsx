import { CiudadesTable } from './ciudades-table';
import { NuevaCiudadButton } from './nueva-ciudad-button';
import { ExportarButton } from '../productos/exportar-button';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default async function CiudadesPage() {
  const res = await fetch(`${API_BASE_URL}/ciudades`, { cache: 'no-store' });

  if (!res.ok) {
    console.error('Error al obtener las ciudades:', res.status, res.statusText);
    return <p className="p-4 text-red-500">Error al obtener las ciudades</p>;
  }

  const data = await res.json();
  const ciudades = Array.isArray(data) ? data : data.data;

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-semibold">Ciudades</h1>

        <div className="ml-auto flex items-center gap-2">
          <ExportarButton productos={ciudades} />
          <NuevaCiudadButton />
        </div>
      </div>

      <CiudadesTable ciudades={ciudades} />
    </div>
  );
}