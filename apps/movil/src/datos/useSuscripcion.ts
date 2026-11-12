import { createContext, useContext } from 'react';

import { ESTADO_GRATIS, type EstadoSuscripcion } from '@/servicios/suscripcion';

export interface ValorSuscripcion {
  activar: () => Promise<void>;
  cancelar: () => Promise<void>;
  estado: EstadoSuscripcion;
  plus: boolean;
}

export const ContextoSuscripcion = createContext<ValorSuscripcion>({
  activar: async () => undefined,
  cancelar: async () => undefined,
  estado: ESTADO_GRATIS,
  plus: false,
});

export function useSuscripcion(): ValorSuscripcion {
  return useContext(ContextoSuscripcion);
}
