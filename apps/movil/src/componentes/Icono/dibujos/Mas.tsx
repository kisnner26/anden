import Svg, { Path } from 'react-native-svg';

import { paletaIconos as p } from '@/tema/colores';

import type { PropiedadesDibujo } from './tipos';

export function DibujoMas({ tamano, color = p.negroTrazo }: PropiedadesDibujo) {
  return (
    <Svg height={tamano} viewBox="0 0 48 48" width={tamano}>
      <Path
        d="M24 11V37M11 24H37"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={5.2}
      />
    </Svg>
  );
}
