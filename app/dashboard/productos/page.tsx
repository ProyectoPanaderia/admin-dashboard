import { ProductsTable } from './products-table';
import { NuevoProductoButton } from './nuevo-producto-button';
import { ExportarButton } from './exportar-button';

// URL del backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default async function ProductsPage() {
  // llamada al backend
  const res = await fetch(`${API_BASE_URL}/productos`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('Error al obtener productos:', res.status, res.statusText);
    const errorText = await res.text();
    console.error('Respuesta del servidor:', errorText);
    return <p className="p-4 text-red-500">Error al obtener los productos</p>;
  }

  // formato del backend { data: [...], meta: {...} }
  const data = await res.json();
  const productos = data?.data ?? [];

  // renderizado
  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-semibold">Productos</h1>

        <div className="ml-auto flex items-center gap-2">
          <ExportarButton productos={productos} />
          <NuevoProductoButton />
        </div>
      </div>

      <ProductsTable products={productos} />
    </div>
  );
}