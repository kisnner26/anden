import { useCallback } from 'react';

import { useModoUso } from '@/tema/useModoUso';

import { ejecutarSensacion, type Sensacion } from './sensaciones';

/**
 * para dar una sensación desde una pantalla: la vibración siempre, y el sonido solo en el modo completo,
 * igual que las animaciones
 */
export function useSensaciones(): (sensacion: Sensacion) => void {
  const { ajustes } = useModoUso();
  const silencio = ajustes.reducirMovimiento;
  return useCallback(
    (sensacion) => ejecutarSensacion(sensacion, !silencio),
    [silencio],
  );
}
