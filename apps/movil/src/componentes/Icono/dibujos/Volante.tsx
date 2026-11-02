import Svg, { Circle, Defs, Path } from 'react-native-svg';

import { paletaIconos as p } from '@/tema/colores';

import { Degradado } from './Degradado';
import type { PropiedadesDibujo } from './tipos';

export function DibujoVolante({ tamano }: PropiedadesDibujo) {
  return (
    <Svg height={tamano} viewBox="0 0 48 48" width={tamano}>
      <Defs>
        <Degradado
          id="volanteAro"
          paradas={[
            [0, p.negroClaro],
            [1, p.negroOscuro],
          ]}
        />
        <Degradado
          id="volanteCentro"
          paradas={[
            [0, p.ambarClaro],
            [0.5, p.ambar],
            [1, p.ambarOscuro],
          ]}
        />
      </Defs>
      <Circle
        cx={24}
        cy={24}
        fill="none"
        r={17.5}
        stroke="url(#volanteAro)"
        strokeWidth={5.5}
      />
      <Path
        d="M24 30V43M18.5 22.5L6.5 19.5M29.5 22.5L41.5 19.5"
        stroke="url(#volanteAro)"
        strokeLinecap="round"
        strokeWidth={4.6}
      />
      <Circle
        cx={24}
        cy={24}
        fill="url(#volanteCentro)"
        r={6}
        stroke={p.negroTrazo}
        strokeWidth={2.6}
      />
    </Svg>
  );
}
