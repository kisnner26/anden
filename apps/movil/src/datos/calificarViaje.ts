import type { Opinion } from './opiniones';
import type { BoletoGuardado } from './reserva';

/** las etiquetas rápidas según la nota: una buena nota invita a elogiar y una mala a decir qué falló */
export const ETIQUETAS_BUENAS = [
  'Puntual',
  'Buen manejo',
  'Bus limpio',
  'Amable',
] as const;
export const ETIQUETAS_MALAS = [
  'Llegó tarde',
  'Manejo brusco',
  'Bus sucio',
  'Poco amable',
] as const;

export function etiquetasRapidas(estrellas: number): readonly string[] {
  if (estrellas === 0) return [];
  return estrellas >= 4 ? ETIQUETAS_BUENAS : ETIQUETAS_MALAS;
}

/** el comentario que se guarda: las etiquetas elegidas y, si la persona escribió algo, su frase */
export function comentarioDeCalificacion(
  etiquetas: readonly string[],
  propio: string,
): string {
  const partes = [...etiquetas];
  const frase = propio.trim();
  if (frase !== '') partes.push(frase);
  return partes.join(' · ');
}

/** hasta cuándo después de la salida se le pide la opinión a la persona */
export const VENTANA_CALIFICAR_MS = 48 * 60 * 60 * 1000;

/**
 * el boleto de un viaje ya hecho al que todavía no se le dejó opinión: usado o con la hora de salida
 * pasada, no cancelado; el más reciente primero. nulo si no hay ninguno
 */
export function boletoPorCalificar(
  boletos: readonly BoletoGuardado[],
  opiniones: readonly Opinion[],
  ahora: Date,
  /** los viajes que ya llegaron a su destino; sin esto solo cuentan los boletos que el conductor marcó a bordo */
  viajesLlegados: ReadonlySet<string> = new Set(),
): BoletoGuardado | null {
  const calificados = new Set(opiniones.map((opinion) => opinion.boletoId));
  const pendientes = boletos
    .filter(({ boleto, resumen }) => {
      if (boleto.estado === 'cancelado' || calificados.has(boleto.id)) {
        return false;
      }
      const salio = new Date(resumen.salida).getTime();
      // un viaje de hace más de dos días ya no se pide: no se acumulan encabezados viejos
      if (ahora.getTime() - salio > VENTANA_CALIFICAR_MS) return false;
      // solo se califica un viaje que de verdad se hizo: abordó o el viaje llegó
      return (
        boleto.estado === 'usado' ||
        (salio < ahora.getTime() && viajesLlegados.has(boleto.viajeId))
      );
    })
    .sort(
      (a, b) =>
        new Date(b.resumen.salida).getTime() -
        new Date(a.resumen.salida).getTime(),
    );
  return pendientes[0] ?? null;
}

/** la palabra que acompaña a las estrellas elegidas */
export function palabraDeNota(estrellas: number): string {
  return (
    ['', 'Muy mal', 'Mal', 'Regular', 'Bien', 'Excelente'][estrellas] ?? ''
  );
}
