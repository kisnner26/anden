import type { BoletoGuardado } from './reserva';
import type { Salida } from './salidas';

/** el recordatorio local llega 30 minutos antes de la salida */
export const MINUTOS_RECORDATORIO = 30;
/** desde cuánto antes de la salida aparece el aviso "tu bus sale pronto" */
export const MINUTOS_AVISO_PRONTO = 60;

const MS_MINUTO = 60_000;

export type TipoAviso = 'anden' | 'atraso' | 'cancelado' | 'pronto';

/** un aviso sobre un boleto; el texto lo arma la pantalla con estos datos */
export interface Aviso {
  anden: number;
  boletoId: string;
  destino: string;
  /** atraso en minutos o minutos que faltan para salir, según el tipo */
  minutos: number;
  id: string;
  tipo: TipoAviso;
}

/** cuándo se programa el recordatorio de un boleto: 30 minutos antes de la salida real */
export function momentoRecordatorio(
  salida: Date,
  minutosAtraso: number = 0,
): Date {
  return new Date(
    salida.getTime() + (minutosAtraso - MINUTOS_RECORDATORIO) * MS_MINUTO,
  );
}

/**
 * los avisos de los boletos vigentes: salida pronta, atraso, cambio de andén y viaje cancelado;
 * el id es estable para que lo leído se recuerde entre aperturas
 */
export function avisosDeBoletos(
  boletos: readonly BoletoGuardado[],
  salidas: readonly Salida[],
  ahora: Date,
): Aviso[] {
  const avisos: Aviso[] = [];
  // un aviso por viaje: varios asientos del mismo viaje no lo repiten
  const viajesAvisados = new Set<string>();

  for (const { boleto, resumen } of boletos) {
    if (boleto.estado !== 'vigente') continue;
    if (viajesAvisados.has(boleto.viajeId)) continue;
    const salida = salidas.find((s) => s.viajeId === boleto.viajeId);
    if (!salida) continue;
    viajesAvisados.add(boleto.viajeId);

    const base = {
      anden: salida.anden,
      boletoId: boleto.id,
      destino: resumen.destino,
    };
    if (salida.estado === 'cancelado') {
      avisos.push({
        ...base,
        id: `${boleto.viajeId}:cancelado`,
        minutos: 0,
        tipo: 'cancelado',
      });
      continue;
    }

    const salidaReal =
      salida.salida.getTime() + salida.minutosAtraso * MS_MINUTO;
    const minutosParaSalir = Math.round(
      (salidaReal - ahora.getTime()) / MS_MINUTO,
    );
    if (minutosParaSalir < 0) continue;

    if (salida.estado === 'atrasado') {
      avisos.push({
        ...base,
        id: `${boleto.viajeId}:atraso`,
        minutos: salida.minutosAtraso,
        tipo: 'atraso',
      });
    }
    if (salida.anden !== resumen.anden) {
      avisos.push({
        ...base,
        id: `${boleto.viajeId}:anden`,
        minutos: minutosParaSalir,
        tipo: 'anden',
      });
    }
    if (minutosParaSalir <= MINUTOS_AVISO_PRONTO) {
      avisos.push({
        ...base,
        id: `${boleto.viajeId}:pronto`,
        minutos: minutosParaSalir,
        tipo: 'pronto',
      });
    }
  }
  return avisos;
}
