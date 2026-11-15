import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { ventanasEncendidas } from '@/datos/ventanasDelBus';
import { conAlfa } from '@/tema/alfa';
import { useTema } from '@/tema/useTema';

export interface PropiedadesSiluetaDeBus {
  ancho?: number;
  /** de 0 a 1: qué parte del bus ya está vendida */
  proporcion: number;
}

const VENTANAS = 8;

/** un bus de lado cuyas ventanas se van encendiendo a medida que se llena: se ve de un vistazo cuánto le falta para salir */
export function SiluetaDeBus({
  ancho = 56,
  proporcion,
}: PropiedadesSiluetaDeBus) {
  const { colores } = useTema();
  const encendidas = ventanasEncendidas(proporcion, VENTANAS);
  const alto = (ancho * 26) / 64;

  return (
    <Svg
      accessibilityElementsHidden
      height={alto}
      importantForAccessibility="no-hide-descendants"
      testID="silueta-de-bus"
      viewBox="0 0 64 26"
      width={ancho}
    >
      <Path
        d="M3 20V9a4 4 0 0 1 4-4h49a5 5 0 0 1 5 5v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"
        fill="none"
        stroke={conAlfa(colores.tinta, 0.55)}
        strokeWidth={1.6}
      />
      {Array.from({ length: VENTANAS }, (_, i) => (
        <Rect
          fill={i < encendidas ? colores.ambar : 'none'}
          height={6}
          key={i}
          rx={1.2}
          stroke={i < encendidas ? colores.ambar : conAlfa(colores.tinta, 0.3)}
          strokeWidth={1}
          width={4.6}
          x={6.5 + i * 6.1}
          y={9}
        />
      ))}
      <Circle
        cx={15}
        cy={21}
        fill={colores.fondo}
        r={3}
        stroke={conAlfa(colores.tinta, 0.55)}
        strokeWidth={1.6}
      />
      <Circle
        cx={49}
        cy={21}
        fill={colores.fondo}
        r={3}
        stroke={conAlfa(colores.tinta, 0.55)}
        strokeWidth={1.6}
      />
    </Svg>
  );
}
