import Svg, { Circle, Defs, Path } from 'react-native-svg';

import { paletaIconos as p } from '@/tema/colores';

import { Degradado } from './Degradado';
import type { PropiedadesDibujo } from './tipos';

export function DibujoLupa({ tamano }: PropiedadesDibujo) {
  return (
    <Svg height={tamano} viewBox="0 0 48 48" width={tamano}>
      <Defs>
        <Degradado
          id="lupaMango"
          paradas={[
            [0, p.negroClaro],
            [1, p.negroOscuro],
          ]}
        />
        <Degradado
          id="lupaLente"
          paradas={[
            [0, p.cremaClara],
            [1, p.cremaOscura],
          ]}
        />
      </Defs>
      <Path
        d="M31 31L41 41"
        stroke="url(#lupaMango)"
        strokeLinecap="round"
        strokeWidth={6.5}
      />
      <Circle
        cx={21}
        cy={21}
        fill="url(#lupaLente)"
        r={13}
        stroke={p.negroTrazo}
        strokeWidth={4.5}
      />
      <Path
        d="M14 20c.5-3.5 3-6 6.5-6.8"
        fill="none"
        stroke={p.ambar}
        strokeLinecap="round"
        strokeWidth={3}
      />
    </Svg>
  );
}
