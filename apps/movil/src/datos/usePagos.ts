import { createContext, useContext } from 'react';

import {
  estadoDePago,
  type EstadoPago,
  type RegistroPagos,
} from '@/servicios/pagos';

export interface ValorPagos {
  estadoDe: (boletoId: string) => EstadoPago;
  marcarPagado: (boletoId: string, choferId: string) => Promise<void>;
  registro: RegistroPagos;
  revertir: (boletoId: string) => Promise<void>;
}

export const ContextoPagos = createContext<ValorPagos>({
  estadoDe: (boletoId) => estadoDePago({}, boletoId),
  marcarPagado: async () => undefined,
  registro: {},
  revertir: async () => undefined,
});

export function usePagos(): ValorPagos {
  return useContext(ContextoPagos);
}
