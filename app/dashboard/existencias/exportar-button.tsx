'use client';

import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ExistenciaType {
  id: number;
  cantidad: number;
  fechaE: string; 
  fechaV: string;
  // Agregamos ambas opciones para evitar que no las encuentre
  producto?: { nombre: string; peso?: number }; 
  Producto?: { nombre: string; peso?: number }; 
  reparto?: { nombre: string }; 
  Reparto?: { nombre: string }; 
}

export function ExportarExistenciasButton({ existencias }: { existencias: ExistenciaType[] }) {
  
  function exportarExcel() {
    if (!existencias || existencias.length === 0) {
      alert('No hay datos para exportar con los filtros actuales.');
      return;
    }

    // Mapeamos los datos para que queden lindos en el Excel
    const dataFilas = existencias.map((item) => {
      // Priorizamos minúscula, luego mayúscula, sino 'Sin nombre'
      const nombreProducto = item.producto?.nombre || item.Producto?.nombre || 'Sin nombre';
      const nombreReparto = item.reparto?.nombre || item.Reparto?.nombre || 'Sin asignar';

      return {
        'ID Lote': item.id,
        'Producto': nombreProducto,
        'Reparto': nombreReparto,
        'Cantidad': item.cantidad,
        // Usamos UTC para evitar que el Excel reste 1 día por la zona horaria de Argentina
        'F. Elaboración': item.fechaE ? new Date(item.fechaE).toLocaleDateString('es-AR', { timeZone: 'UTC' }) : '-',
        'F. Vencimiento': item.fechaV ? new Date(item.fechaV).toLocaleDateString('es-AR', { timeZone: 'UTC' }) : '-',
      };
    });

    // Generamos hoja de cálculo
    const ws = XLSX.utils.json_to_sheet(dataFilas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Existencias');

    // Ajustamos ancho de columnas
    ws['!cols'] = [
      { wch: 8 },  // ID
      { wch: 30 }, // Producto
      { wch: 20 }, // Reparto
      { wch: 10 }, // Cantidad
      { wch: 15 }, // Fecha E
      { wch: 15 }, // Fecha V
    ];

    // Escribir y descargar
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    
    saveAs(blob, `Reporte_Stock_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-8 gap-1 ml-2"
      onClick={exportarExcel}
    >
      <FileDown className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
        Exportar
      </span>
    </Button>
  );
}