import type { ViewStyle } from 'react-native';

import type { Colores } from './colores';

export type ModoRelieve = 'claro' | 'oscuro';

interface CapaRelieve {
  desenfoque: number;
  desplazamientoX: number;
  desplazamientoY: number;
  opacidad: number;
}

/** el relieve se logra con dos sombras: la luz arriba a la izquierda y la sombra abajo a la derecha */
export const relieve: Record<
  ModoRelieve,
  { luz: CapaRelieve; sombra: CapaRelieve }
> = {
  claro: {
    luz: {
      desenfoque: 18,
      desplazamientoX: -7,
      desplazamientoY: -7,
      opacidad: 0.9,
    },
    sombra: {
      desenfoque: 24,
      desplazamientoX: 9,
      desplazamientoY: 12,
      opacidad: 0.2,
    },
  },
  oscuro: {
    luz: {
      desenfoque: 18,
      desplazamientoX: -7,
      desplazamientoY: -7,
      opacidad: 0.04,
    },
    sombra: {
      desenfoque: 24,
      desplazamientoX: 9,
      desplazamientoY: 12,
      opacidad: 0.5,
    },
  },
};

function estiloCapa(capa: CapaRelieve, color: string): ViewStyle {
  return {
    elevation: Math.max(capa.desplazamientoY, 0) / 2,
    shadowColor: color,
    shadowOffset: { height: capa.desplazamientoY, width: capa.desplazamientoX },
    shadowOpacity: capa.opacidad,
    shadowRadius: capa.desenfoque / 2,
  };
}

/** estilos de sombra para las dos capas de un bloque con relieve */
export function estilosRelieve(modo: ModoRelieve, colores: Colores) {
  const { luz, sombra } = relieve[modo];
  return {
    luz: estiloCapa(luz, colores.luzRelieve),
    sombra: estiloCapa(sombra, colores.sombraRelieve),
  };
}
