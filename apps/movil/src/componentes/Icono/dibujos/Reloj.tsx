import Svg, { Circle, Defs, Path, Rect } from 'react-native-svg';

import { paletaIconos as p } from '@/tema/colores';

import { Degradado } from './Degradado';
import type { PropiedadesDibujo } from './tipos';

export function DibujoReloj({ tamano }: PropiedadesDibujo) {
  return (
    <Svg height={tamano} viewBox="0 0 48 48" width={tamano}>
      <Defs>
        <Degradado
          id="relojBoton"
          paradas={[
            [0, p.negroClaro],
            [1, p.negroOscuro],
          ]}
        />
        <Degradado
          id="relojEsfera"
          paradas={[
            [0, p.cremaClara],
            [1, p.cremaOscura],
          ]}
        />
      </Defs>
      <Rect
        fill="url(#relojBoton)"
        height={5}
        rx={2.2}
        width={9}
        x={19.5}
        y={3.5}
      />
      <Circle
        cx={24}
        cy={27}
        fill="url(#relojEsfera)"
        r={17}
        stroke={p.negroTrazo}
        strokeWidth={3.8}
      />
      <Path
        d="M24 16.5V27.5L31 32"
        fill="none"
        stroke={p.manecillas}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={4}
      />
    </Svg>
  );
}
