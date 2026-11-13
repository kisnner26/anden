import { puntoSobreTrazo, type Punto } from './busSimulado';
import { progresoSobreTrazo } from './progresoViaje';
import type { Salida } from './salidas';
import { trazoEntre } from './trazoCorredor';
import type { PosicionBus } from '@/servicios/transmision';

/** un bus que se dirige a una ciudad: dónde va, cuánto falta y de dónde sale el dato */
export interface BusEnCamino {
  /** de dónde sale el dato: la ubicación que comparte el conductor o el cálculo con el horario */
  fuente: 'en-vivo' | 'horario';
  kmRestantes: number;
  kmTotal: number;
  /** cuándo se estima que llega; nunca es una promesa */
  llegada: Date;
  /** minutos que se estima que faltan para llegar */
  minutosRestantes: number;
  /** solo si todavía no sale: minutos para su salida */
  minutosParaSalir: number | null;
  /** de 0 en el origen a 1 en el destino */
  progreso: number;
  salida: Salida;
  /** el camino entre las dos terminales, del origen al destino */
  trazo: Punto[];
  /** dónde está o dónde se calcula que está; en el origen si todavía no sale */
  ubicacion: Punto;
}

/** cuántos minutos antes de su salida se muestra un bus que todavía no parte */
export const MINUTOS_ANTES_DE_SALIR = 90;

const NO_CUENTAN = ['cancelado', 'llego'];
const MS_MINUTO = 60_000;

/**
 * los buses que se dirigen a una ciudad, del más cercano a llegar al más lejano. Si el conductor
 * comparte su ubicación se usa esa; si no, se calcula dónde debería ir con la hora de salida y la
 * duración del trayecto. Los que ya llegaron no aparecen.
 */
export function busesHacia(
  ciudad: string,
  salidas: readonly Salida[],
  ahora: Date,
  posiciones: ReadonlyMap<string, PosicionBus> = new Map(),
): BusEnCamino[] {
  const lista: BusEnCamino[] = [];

  for (const salida of salidas) {
    if (salida.destino !== ciudad || NO_CUENTAN.includes(salida.estado)) {
      continue;
    }
    const camino = trazoEntre(salida.origen, salida.destino);
    if (!camino) continue;

    const salidaReal =
      salida.salida.getTime() + salida.minutosAtraso * MS_MINUTO;
    const minutosParaSalir = Math.ceil(
      (salidaReal - ahora.getTime()) / MS_MINUTO,
    );
    const enVivo = posiciones.get(salida.viajeId);
    const progresoReal = enVivo
      ? progresoSobreTrazo(camino.puntos, enVivo, camino.duracionMin)
      : null;

    let progreso: number;
    let ubicacion: Punto;
    let fuente: BusEnCamino['fuente'];
    let minutosRestantes: number;

    if (progresoReal && enVivo) {
      progreso = progresoReal.fraccion;
      ubicacion = { lat: enVivo.lat, lng: enVivo.lng };
      fuente = 'en-vivo';
      minutosRestantes = progresoReal.minutosRestantes;
    } else {
      const avance =
        (ahora.getTime() - salidaReal) / MS_MINUTO / camino.duracionMin;
      progreso = Math.min(1, Math.max(0, avance));
      ubicacion = puntoSobreTrazo(camino.puntos, progreso);
      fuente = 'horario';
      minutosRestantes = Math.max(
        0,
        Math.ceil(camino.duracionMin * (1 - progreso)) +
          (minutosParaSalir > 0 ? minutosParaSalir : 0),
      );
    }

    if (progreso >= 1) continue;
    if (minutosParaSalir > MINUTOS_ANTES_DE_SALIR) continue;

    lista.push({
      fuente,
      kmRestantes: camino.distanciaKm * (1 - progreso),
      kmTotal: camino.distanciaKm,
      llegada: new Date(ahora.getTime() + minutosRestantes * MS_MINUTO),
      minutosParaSalir:
        minutosParaSalir > 0 && fuente === 'horario' ? minutosParaSalir : null,
      minutosRestantes,
      progreso,
      salida,
      trazo: camino.puntos,
      ubicacion,
    });
  }

  return lista.sort((a, b) => a.llegada.getTime() - b.llegada.getTime());
}
