import { createContext, useContext } from 'react';

import type { PasajeroReserva } from './reserva';

export interface BorradorReserva {
  pasajeros: PasajeroReserva[];
  viajeId: string;
}

export interface ValorReserva {
  borrador: BorradorReserva | null;
  establecerBorrador: (viajeId: string, pasajeros: PasajeroReserva[]) => void;
  limpiar: () => void;
}

/** los pasajeros que se van escribiendo entre elegir asiento y pagar */
export const ContextoReserva = createContext<ValorReserva>({
  borrador: null,
  establecerBorrador: () => undefined,
  limpiar: () => undefined,
});

export function useReserva(): ValorReserva {
  return useContext(ContextoReserva);
}
