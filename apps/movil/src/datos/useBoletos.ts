import type { Resultado } from '@anden/dominio';
import { createContext, useContext } from 'react';

import type { BoletoGuardado, ErrorReserva, PasajeroReserva } from './reserva';

export interface ValorBoletos {
  /** suma un boleto que llegó de otra persona; si ya estaba no hace nada */
  agregar: (guardado: BoletoGuardado) => Promise<void>;
  boletos: BoletoGuardado[];
  /** saca de este teléfono un boleto que se pasó a otra persona */
  quitar: (boletoId: string) => Promise<void>;
  cancelar: (boletoId: string) => Promise<void>;
  validar: (boletoId: string) => Promise<void>;
  cargando: boolean;
  /** reserva con pago en efectivo; si sale bien, los boletos quedan guardados en el teléfono */
  reservar: (
    viajeId: string,
    pasajeros: readonly PasajeroReserva[],
  ) => Promise<Resultado<BoletoGuardado[], ErrorReserva>>;
}

export const ContextoBoletos = createContext<ValorBoletos>({
  agregar: async () => undefined,
  boletos: [],
  quitar: async () => undefined,
  cancelar: async () => undefined,
  validar: async () => undefined,
  cargando: false,
  reservar: async () => ({ error: 'viaje-inexistente', ok: false }),
});

export function useBoletos(): ValorBoletos {
  return useContext(ContextoBoletos);
}
