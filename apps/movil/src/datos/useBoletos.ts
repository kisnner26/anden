import type { Resultado } from '@anden/dominio';
import { createContext, useContext } from 'react';

import type { BoletoGuardado, ErrorReserva, PasajeroReserva } from './reserva';

export interface ValorBoletos {
  boletos: BoletoGuardado[];
  cancelar: (boletoId: string) => Promise<void>;
  cargando: boolean;
  /** reserva con pago en efectivo; si sale bien, los boletos quedan guardados en el teléfono */
  reservar: (
    viajeId: string,
    pasajeros: readonly PasajeroReserva[],
  ) => Promise<Resultado<BoletoGuardado[], ErrorReserva>>;
}

export const ContextoBoletos = createContext<ValorBoletos>({
  boletos: [],
  cancelar: async () => undefined,
  cargando: false,
  reservar: async () => ({ error: 'viaje-inexistente', ok: false }),
});

export function useBoletos(): ValorBoletos {
  return useContext(ContextoBoletos);
}
