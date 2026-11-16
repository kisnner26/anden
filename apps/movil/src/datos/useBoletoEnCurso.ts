import { useMemo } from 'react';

import type { BoletoGuardado } from './reserva';
import { useBoletos } from './useBoletos';
import { useSalidas } from './useSalidas';
import { useViajesEnVivo } from './useTransmision';
import { boletoEnCurso } from './viajeEnCurso';

/** el boleto del viaje que la persona está haciendo ahora, o nulo; se actualiza solo cuando el chofer inicia el viaje */
export function useBoletoEnCurso(): BoletoGuardado | null {
  const { boletos } = useBoletos();
  const { salidas } = useSalidas();
  const enVivo = useViajesEnVivo();
  return useMemo(
    () => boletoEnCurso(boletos, salidas, enVivo),
    [boletos, enVivo, salidas],
  );
}
