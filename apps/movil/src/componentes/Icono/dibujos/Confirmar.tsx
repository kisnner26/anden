import Svg, { Path } from 'react-native-svg';

import { paletaIconos as p } from '@/tema/colores';

import type { PropiedadesDibujo } from './tipos';

export function DibujoConfirmar({
  tamano,
  color = p.negroTrazo,
}: PropiedadesDibujo) {
  return (
    <Svg height={tamano} viewBox="0 0 48 48" width={tamano}>
      <Path
        d="M12 25.5L20.5 34L36.5 14.5"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={5.2}
      />
    </Svg>
  );
}
