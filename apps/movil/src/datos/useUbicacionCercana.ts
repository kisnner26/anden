import { useCallback, useState } from 'react';
import { terminalMasCercana, type Terminal } from '@anden/dominio';

import { obtenerUbicacionActual } from './ubicacion';

export type EstadoUbicacionCercana =
  | { tipo: 'pendiente' }
  | { tipo: 'esperando' }
  | { tipo: 'denegada' }
  | { tipo: 'desactivada' }
  | { tipo: 'error' }
  | { distanciaKm: number; nombre: string; tipo: 'confirmada' };

/** resuelve una terminal en memoria y descarta inmediatamente las coordenadas. */
export function useUbicacionCercana(
  terminales: Terminal[],
  alSeleccionar: (terminalId: string) => void,
) {
  const [estado, establecerEstado] = useState<EstadoUbicacionCercana>({
    tipo: 'pendiente',
  });

  const resolver = useCallback(async () => {
    establecerEstado({ tipo: 'esperando' });
    const resultado = await obtenerUbicacionActual();
    if (resultado.estado === 'denegado') {
      establecerEstado({ tipo: 'denegada' });
      return;
    }
    if (resultado.estado === 'desactivado') {
      establecerEstado({ tipo: 'desactivada' });
      return;
    }
    if (resultado.estado === 'error') {
      establecerEstado({ tipo: 'error' });
      return;
    }

    const cercana = terminalMasCercana(terminales, resultado.punto);
    if (!cercana) {
      establecerEstado({ tipo: 'error' });
      return;
    }
    alSeleccionar(cercana.terminal.id);
    establecerEstado({
      distanciaKm: cercana.distanciaKm,
      nombre: cercana.terminal.nombre,
      tipo: 'confirmada',
    });
  }, [alSeleccionar, terminales]);

  return { estado, resolver };
}
