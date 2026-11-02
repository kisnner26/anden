import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { paletaIconos as p } from '@/tema/colores';

import type { PropiedadesDibujo } from './tipos';

export function DibujoPestanaRutas({
  tamano,
  color = p.negroTrazo,
  colorDetalle = p.cremaClara,
}: PropiedadesDibujo) {
  return (
    <Svg height={tamano} viewBox="0 0 48 48" width={tamano}>
      <Ellipse cx={24} cy={43} fill={color} opacity={0.35} rx={11} ry={2.8} />
      <Path
        d="M24 3C16.8 3 11.5 8.3 11.5 15.5C11.5 24.5 24 38 24 38S36.5 24.5 36.5 15.5C36.5 8.3 31.2 3 24 3Z"
        fill={color}
      />
      <Circle cx={24} cy={15.5} fill={colorDetalle} r={5.6} />
    </Svg>
  );
}
