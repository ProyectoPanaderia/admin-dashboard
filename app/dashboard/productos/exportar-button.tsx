'use client';

import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Producto {
  id: number;
  nombre: string;
  peso: number;
}

export function ExportarButton({ productos }: { productos: Producto[] }) {
  function exportarExcel() {
    if (!productos || productos.length === 0) {
      alert('No hay productos para exportar.');
      return;
    }

    // Creamos una hoja de cálculo con los productos
    const wsData = [
      ['ID', 'Nombre', 'Peso (g)'], // encabezados
      ...productos.map((p) => [p.id, p.nombre, p.peso]),
    ];

    // Generamos la hoja y el libro de trabajo
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');

    // Ancho de columnas
    ws['!cols'] = [
      { wch: 6 },  // ID
      { wch: 25 }, // Nombre
      { wch: 10 }, // Peso
    ];

    // Convertimos a blob (binario)
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Guardamos el archivo
    const blob = new Blob([wbout], {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    saveAs(blob, 'productos.xlsx');
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-8 gap-1"
      onClick={exportarExcel}
    >
      <FileDown className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
        Exportar Excel
      </span>
    </Button>
  );
}