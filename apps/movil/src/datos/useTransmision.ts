import { useMemo, useSyncExternalStore } from 'react';

import {
  sinSenal,
  TRANSMISION,
  type PosicionBus,
} from '@/servicios/transmision';

import { useAhora } from './useSalidas';

function suscribir(oyente: () => void): () => void {
  return TRANSMISION.suscribir(oyente);
}

function instantanea() {
  return TRANSMISION.instantanea();
}

/** los viajes que alguien está compartiendo ahora */
export function useViajesEnVivo(): readonly string[] {
  return useSyncExternalStore(suscribir, instantanea, instantanea).activos;
}

export interface Transmision {
  activa: boolean;
  posicion: PosicionBus | null;
  /** hay transmisión pero hace rato que no llega una posición */
  sinSenal: boolean;
}

/**
 * si un viaje se está compartiendo, su última posición y si se perdió la señal. Todo se calcula a
 * partir de la instantánea que devuelve el store, no de lecturas sueltas: así el compilador de React
 * (que ignora las dependencias que el cálculo no usa) sí vuelve a calcular cuando algo cambia
 */
export function useTransmision(viajeId: string): Transmision {
  const foto = useSyncExternalStore(suscribir, instantanea, instantanea);
  const ahora = useAhora(15_000);
  return useMemo(() => {
    const activa = foto.activos.includes(viajeId);
    const posicion = foto.posiciones.get(viajeId) ?? null;
    return {
      activa,
      posicion,
      sinSenal: activa && sinSenal(posicion, ahora),
    };
  }, [ahora, foto, viajeId]);
}
