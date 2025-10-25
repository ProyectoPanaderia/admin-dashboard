import { ClientesTable } from './clientes-table';
import { NuevoClienteButton } from './nuevo-cliente-button';
import { ExportarButton } from '../productos/exportar-button';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default async function ClientesPage() {
  // Pedimos clientes y ciudades
  const [clientesRes, ciudadesRes] = await Promise.all([
    fetch(`${API_BASE_URL}/clientes`, { cache: 'no-store' }),
    fetch(`${API_BASE_URL}/ciudades`, { cache: 'no-store' }),
  ]);

  if (!clientesRes.ok || !ciudadesRes.ok) {
    console.error('Error al obtener datos del backend');
    return <p className="p-4 text-red-500">Error al cargar los clientes</p>;
  }

  const clientesData = await clientesRes.json();
  const ciudadesData = await ciudadesRes.json();

  const clientes = Array.isArray(clientesData) ? clientesData : clientesData.data;
  const ciudades = Array.isArray(ciudadesData) ? ciudadesData : ciudadesData.data;

  // Convertir ciudad_id → nombre
  const clientesConCiudad = clientes.map((c: any) => ({
    ...c,
    ciudadNombre: ciudades.find((ci: any) => ci.id === c.ciudadId)?.nombre || 'Sin asignar',
  }));

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-semibold">Clientes</h1>

        <div className="ml-auto flex items-center gap-2">
          <ExportarButton productos={clientesConCiudad} />
          <NuevoClienteButton />
        </div>
      </div>

      <ClientesTable clientes={clientesConCiudad} />
    </div>
  );
}