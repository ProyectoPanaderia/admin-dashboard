import { RepartosTable } from './repartos-table';
import { NuevoRepartoButton } from './nuevo-reparto-button';
import { auth } from "@/auth";

// URL base del backend
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default async function RepartosPage() {
  const session = await auth();
  console.log("DATOS DE SESIÓN:", session?.user);
  const esAdmin = session?.user?.rol === 'SUPERADMIN' || session?.user?.rol === 'ADMINISTRADOR';
  const repartoId = session?.user?.repartoId;
  
  const url = esAdmin 
    ? `${API_BASE_URL}/repartos` 
    : `${API_BASE_URL}/repartos/${repartoId}`; 
    console.log("URL de consulta:", url);

  // llamada al backend
  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.user?.token}`
    }
  });

  if (!res.ok) {
    console.error('Error al obtener repartos:', res.status);
    return <p className="p-4 text-red-500">No tienes permisos para ver esta sección o la sesión expiró.</p>;
  }

  const data = await res.json();

  let repartos = [];
  if (esAdmin) {
    repartos = data?.data ?? [];
  } else {
    repartos = data ? [data] : [];
  }

  // renderizado
  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-semibold">Repartos</h1>

        {esAdmin && (
          <div className="ml-auto flex items-center gap-2">
            <NuevoRepartoButton />
          </div>
        )}
      </div>

      <RepartosTable repartos={repartos} />
    </div>
  );
}