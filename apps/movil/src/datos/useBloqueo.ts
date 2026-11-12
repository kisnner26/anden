import { createContext, useContext } from 'react';

import type { EstadoBiometria } from './biometria';

export interface ValorBloqueo {
  /** el bloqueo con Face ID está encendido */
  activo: boolean;
  biometria: EstadoBiometria;
  bloqueado: boolean;
  /** todavía se está leyendo si el bloqueo está encendido */
  cargando: boolean;
  /** pide Face ID y, si la persona se identifica, enciende el bloqueo */
  activar: () => Promise<boolean>;
  /** pide Face ID y, si la persona se identifica, apaga el bloqueo */
  desactivar: () => Promise<boolean>;
  /** pide Face ID y, si la persona se identifica, abre la app */
  desbloquear: () => Promise<boolean>;
}

export const ContextoBloqueo = createContext<ValorBloqueo>({
  activar: async () => false,
  activo: false,
  biometria: { disponible: false, tipo: 'ninguna' },
  bloqueado: false,
  cargando: false,
  desactivar: async () => false,
  desbloquear: async () => true,
});

export function useBloqueo(): ValorBloqueo {
  return useContext(ContextoBloqueo);
}
