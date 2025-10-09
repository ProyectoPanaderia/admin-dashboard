// Simula las llamadas al backend
// para obtener, filtrar y eliminar productos.

export interface Producto {
  id: number;
  nombre: string;
  peso: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

export async function getProducts(
  search: string = "",
  offset: number = 0
): Promise<{
  products: Producto[];
  newOffset: number | null;
  totalProducts: number;
}> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/productos?search=${search}&offset=${offset}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Error al obtener productos");
    const data = await res.json();

    return {
      products: data || [],
      newOffset: null, // si querés implementar paginación, después ajustamos
      totalProducts: data.length || 0,
    };
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return { products: [], newOffset: null, totalProducts: 0 };
  }
}

export async function deleteProductById(id: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/productos/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Error al eliminar producto");
    return true;
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return false;
  }
}

export type SelectProduct = {
  id: number;
  nombre: string;
  peso: number;
};