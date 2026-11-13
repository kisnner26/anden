import { useMemo, useSyncExternalStore } from 'react';

import { TRANSMISION } from '@/servicios/transmision';

import { busesHacia, type BusEnCamino } from './busesEnCamino';
import { useSalidas } from './useSalidas';

function suscribir(oyente: () => void): () => void {
  return TRANSMISION.suscribir(oyente);
}

function instantanea() {
  return TRANSMISION.instantanea();
}

/** los buses que van hacia una ciudad ahora; se recalcula con el reloj y cuando un conductor comparte su ubicación */
export function useBusesEnCamino(ciudad: string): {
  ahora: Date;
  buses: BusEnCamino[];
} {
  const { ahora, salidas } = useSalidas();
  const foto = useSyncExternalStore(suscribir, instantanea, instantanea);
  const buses = useMemo(
    () => busesHacia(ciudad, salidas, ahora, foto.posiciones),
    [ahora, ciudad, foto.posiciones, salidas],
  );
  return { ahora, buses };
}
