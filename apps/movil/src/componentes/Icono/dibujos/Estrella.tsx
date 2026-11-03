import Svg, { Defs, Path } from 'react-native-svg';

import { paletaIconos as p } from '@/tema/colores';

import { Degradado } from './Degradado';
import type { PropiedadesDibujo } from './tipos';

export function DibujoEstrella({ tamano }: PropiedadesDibujo) {
  return (
    <Svg height={tamano} viewBox="0 0 48 48" width={tamano}>
      <Defs>
        <Degradado
          id="estrella"
          paradas={[
            [0, p.ambarClaro],
            [0.5, p.ambar],
            [1, p.ambarOscuro],
          ]}
        />
      </Defs>
      <Path
        d="M24 5L29.800 17.200L43 19L33.400 28.200L35.800 41.400L24 35.200L12.200 41.400L14.600 28.200L5 19L18.200 17.200Z"
        fill="url(#estrella)"
        stroke={p.ambarBorde}
        strokeLinejoin="round"
        strokeOpacity={0.4}
        strokeWidth={2}
      />
      <Path
        d="M20.500 15L24 9"
        stroke={p.brillo}
        strokeLinecap="round"
        strokeOpacity={0.75}
        strokeWidth={2.6}
      />
    </Svg>
  );
}
