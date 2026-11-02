import Svg, { G, Path, Rect } from 'react-native-svg';

import { paletaIconos as p } from '@/tema/colores';

import type { PropiedadesDibujo } from './tipos';

export function DibujoPestanaBoletos({
  tamano,
  color = p.negroTrazo,
  colorDetalle = p.cremaClara,
}: PropiedadesDibujo) {
  return (
    <Svg height={tamano} viewBox="0 0 48 48" width={tamano}>
      <Path
        d="M8 10H40A4 4 0 0 1 44 14V19.5A4.5 4.5 0 0 0 44 28.5V34A4 4 0 0 1 40 38H8A4 4 0 0 1 4 34V28.5A4.5 4.5 0 0 0 4 19.5V14A4 4 0 0 1 8 10Z"
        fill={color}
      />
      <Path
        d="M32 14V34"
        stroke={colorDetalle}
        strokeDasharray="3 3.6"
        strokeLinecap="round"
        strokeWidth={2.6}
      />
      <G fill={colorDetalle}>
        <Rect height={14} rx={1.4} width={3.4} x={10} y={17} />
        <Rect height={14} rx={1.2} width={2.4} x={16} y={17} />
        <Rect height={14} rx={1.4} width={5} x={21.5} y={17} />
      </G>
    </Svg>
  );
}
