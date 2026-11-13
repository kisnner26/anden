/** una celda de CSV: con comillas si lleva coma, salto de línea o comillas */
function celda(valor: unknown): string {
  const texto = valor === null || valor === undefined ? '' : String(valor);
  return /[",\n;]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

const BOM = String.fromCharCode(0xfeff);

/** el texto de un CSV con su encabezado; Excel lo abre bien con el BOM del principio */
export function aCsv(
  encabezados: readonly string[],
  filas: readonly (readonly unknown[])[],
): string {
  return (
    BOM +
    [encabezados, ...filas].map((fila) => fila.map(celda).join(',')).join('\n')
  );
}

/** baja un CSV como archivo desde el navegador */
export function descargarCsv(nombre: string, csv: string): void {
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(
    new Blob([csv], { type: 'text/csv;charset=utf-8' }),
  );
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}
