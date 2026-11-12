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

function version(): number {
  return TRANSMISION.version();
}

/** los viajes que alguien está compartiendo ahora */
export function useViajesEnVivo(): readonly string[] {
  const actual = useSyncExternalStore(suscribir, version, version);
  return useMemo(() => TRANSMISION.activos(), [actual]);
}

export interface Transmision {
  activa: boolean;
  posicion: PosicionBus | null;
  /** hay transmisión pero hace rato que no llega una posición */
  sinSenal: boolean;
}

/** si un viaje se está compartiendo, su última posición y si se perdió la señal */
export function useTransmision(viajeId: string): Transmision {
  const actual = useSyncExternalStore(suscribir, version, version);
  const ahora = useAhora(15_000);
  return useMemo(() => {
    const activa = TRANSMISION.activos().includes(viajeId);
    const posicion = TRANSMISION.ultima(viajeId);
    return {
      activa,
      posicion,
      sinSenal: activa && sinSenal(posicion, ahora),
    };
  }, [actual, ahora, viajeId]);
}
