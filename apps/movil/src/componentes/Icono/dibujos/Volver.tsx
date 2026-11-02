import Svg, { Path } from 'react-native-svg';

import { paletaIconos as p } from '@/tema/colores';

import type { PropiedadesDibujo } from './tipos';

export function DibujoVolver({
  tamano,
  color = p.negroTrazo,
}: PropiedadesDibujo) {
  return (
    <Svg height={tamano} viewBox="0 0 48 48" width={tamano}>
      <Path
        d="M29.5 11L17 24L29.5 37"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={5.2}
      />
    </Svg>
  );
}
