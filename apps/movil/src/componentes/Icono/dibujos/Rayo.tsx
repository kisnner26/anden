import Svg, { Defs, Path } from 'react-native-svg';

import { paletaIconos as p } from '@/tema/colores';

import { Degradado } from './Degradado';
import type { PropiedadesDibujo } from './tipos';

export function DibujoRayo({ tamano }: PropiedadesDibujo) {
  return (
    <Svg height={tamano} viewBox="0 0 48 48" width={tamano}>
      <Defs>
        <Degradado
          id="rayo"
          paradas={[
            [0, p.ambarClaro],
            [0.5, p.ambar],
            [1, p.ambarOscuro],
          ]}
        />
      </Defs>
      <Path
        d="M28 4L10 27H21L18 44L38 19H26.5Z"
        fill="url(#rayo)"
        stroke={p.ambarBorde}
        strokeLinejoin="round"
        strokeOpacity={0.35}
        strokeWidth={1.5}
      />
      <Path
        d="M26 8L15 23"
        stroke={p.brillo}
        strokeLinecap="round"
        strokeOpacity={0.75}
        strokeWidth={2.6}
      />
    </Svg>
  );
}
