import { useCallback } from 'react';

import { useModoUso } from '@/tema/useModoUso';

import { reproducirSonido, type NombreSonido } from './sonidos';

/**
 * para reproducir un sonido desde una pantalla: solo suena en el modo completo, igual que las
 * animaciones; los modos sencillo y rápido, y quien pidió reducir el movimiento, quedan en silencio
 */
export function useSonidos(): (nombre: NombreSonido) => void {
  const { ajustes } = useModoUso();
  const silencio = ajustes.reducirMovimiento;
  return useCallback(
    (nombre) => {
      if (!silencio) void reproducirSonido(nombre);
    },
    [silencio],
  );
}
