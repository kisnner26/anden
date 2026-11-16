import Svg, { Circle, Path } from 'react-native-svg';

import { paletaIconos as p } from '@/tema/colores';

import type { PropiedadesDibujo } from './tipos';

/** el filtro de las páginas web: tres barras con su perilla, cada una en una posición distinta */
export function DibujoFiltro({
  tamano,
  color = p.negroTrazo,
}: PropiedadesDibujo) {
  return (
    <Svg height={tamano} viewBox="0 0 48 48" width={tamano}>
      <Path
        d="M8 14H20M32 14H40M8 24H12M24 24H40M8 34H26M38 34H40"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={4.4}
      />
      <Circle
        cx={26}
        cy={14}
        fill="none"
        r={5}
        stroke={color}
        strokeWidth={4.4}
      />
      <Circle
        cx={18}
        cy={24}
        fill="none"
        r={5}
        stroke={color}
        strokeWidth={4.4}
      />
      <Circle
        cx={32}
        cy={34}
        fill="none"
        r={5}
        stroke={color}
        strokeWidth={4.4}
      />
    </Svg>
  );
}
