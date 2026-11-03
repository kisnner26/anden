import { useCallback, useMemo, useState, type ReactNode } from 'react';

import type { PasajeroReserva } from './reserva';
import { ContextoReserva, type BorradorReserva } from './useReserva';

/** comparte con las pantallas del flujo la reserva que está en curso */
export function ProveedorReserva({ children }: { children: ReactNode }) {
  const [borrador, establecerBorradorInterno] =
    useState<BorradorReserva | null>(null);

  const establecerBorrador = useCallback(
    (viajeId: string, pasajeros: PasajeroReserva[]) =>
      establecerBorradorInterno({ pasajeros, viajeId }),
    [],
  );
  const limpiar = useCallback(() => establecerBorradorInterno(null), []);

  const valor = useMemo(
    () => ({ borrador, establecerBorrador, limpiar }),
    [borrador, establecerBorrador, limpiar],
  );

  return (
    <ContextoReserva.Provider value={valor}>
      {children}
    </ContextoReserva.Provider>
  );
}
