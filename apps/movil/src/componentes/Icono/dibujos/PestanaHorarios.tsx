import Svg, { G, Rect } from 'react-native-svg';

import { paletaIconos as p } from '@/tema/colores';

import type { PropiedadesDibujo } from './tipos';

const FILAS = [14.5, 22.5, 30.5] as const;

export function DibujoPestanaHorarios({
  tamano,
  color = p.negroTrazo,
  colorDetalle = p.cremaClara,
}: PropiedadesDibujo) {
  return (
    <Svg height={tamano} viewBox="0 0 48 48" width={tamano}>
      <Rect fill={color} height={32} rx={9} width={40} x={4} y={8} />
      <G fill={colorDetalle}>
        {FILAS.map((y) => (
          <G key={y}>
            <Rect height={5} rx={2.2} width={10} x={9.5} y={y} />
            <Rect
              height={5}
              opacity={0.55}
              rx={2.2}
              width={y === 30.5 ? 9 : 15.5}
              x={23}
              y={y}
            />
          </G>
        ))}
      </G>
    </Svg>
  );
}
