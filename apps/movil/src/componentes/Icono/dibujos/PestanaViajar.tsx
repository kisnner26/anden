import Svg, { Circle, Rect } from 'react-native-svg';

import { paletaIconos as p } from '@/tema/colores';

import type { PropiedadesDibujo } from './tipos';

export function DibujoPestanaViajar({
  tamano,
  color = p.negroTrazo,
  colorDetalle = p.cremaClara,
}: PropiedadesDibujo) {
  return (
    <Svg height={tamano} viewBox="0 0 48 48" width={tamano}>
      <Rect fill={color} height={32} rx={9} width={30} x={9} y={5} />
      <Rect fill={colorDetalle} height={12} rx={4} width={21} x={13.5} y={10} />
      <Circle cx={17} cy={29} fill={colorDetalle} r={2.6} />
      <Circle cx={31} cy={29} fill={colorDetalle} r={2.6} />
      <Rect fill={color} height={8} rx={2.6} width={7} x={12} y={35} />
      <Rect fill={color} height={8} rx={2.6} width={7} x={29} y={35} />
    </Svg>
  );
}
