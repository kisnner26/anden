/** los avisos de un toque que el chofer le manda a quienes tienen boleto en su viaje */
export const AVISOS_RAPIDOS = ['diezMinutos', 'trafico', 'lleno'] as const;
export type AvisoRapido = (typeof AVISOS_RAPIDOS)[number];

/** cuánto tiempo puede estar encendido el "buscar pasajeros", en minutos */
export const MINUTOS_DE_BUSQUEDA = [15, 30, 60] as const;

const HORAS_ANTES = 2;
const HORAS_DESPUES = 12;

/**
 * la ventana en que pasajero y chofer pueden llamarse: desde 2 horas antes de la salida hasta 12 después. Es la misma que
 * aplica el servidor, que es quien decide de verdad; aquí solo sirve para mostrar u ocultar el botón
 */
export function enVentanaDeLlamada(salida: Date, ahora: Date): boolean {
  const t = ahora.getTime();
  return (
    t >= salida.getTime() - HORAS_ANTES * 3_600_000 &&
    t <= salida.getTime() + HORAS_DESPUES * 3_600_000
  );
}

/** la frase que acompaña a "buscar pasajeros", armada con los asientos que de verdad quedan */
export function mensajeDeBusqueda(asientosLibres: number): string {
  return asientosLibres === 1
    ? 'Salgo ya, queda 1 asiento'
    : `Salgo ya, quedan ${asientosLibres} asientos`;
}
