export interface LineaPedido {
  id?: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  descripcion: string;
}

export interface Pedido {
  id: number;
  fechaEmision: string;
  fechaEntrega: string;
  repartoId: number;
  clienteId: number;
  total: number;
  estado: string;
  // Relaciones
  Cliente?: { id: number; nombre: string };
  Reparto?: { id: number; nombre: string };
  lineas?: LineaPedido[];
}