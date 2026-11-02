import Svg, { Defs, Path } from 'react-native-svg';

import { paletaIconos as p } from '@/tema/colores';

import { Degradado } from './Degradado';
import type { PropiedadesDibujo } from './tipos';

export function DibujoCampana({ tamano }: PropiedadesDibujo) {
  return (
    <Svg height={tamano} viewBox="0 0 48 48" width={tamano}>
      <Defs>
        <Degradado
          id="campana"
          paradas={[
            [0, p.ambarClaro],
            [0.5, p.ambar],
            [1, p.ambarOscuro],
          ]}
        />
        <Degradado
          id="badajo"
          paradas={[
            [0, p.negroClaro],
            [1, p.negroOscuro],
          ]}
        />
      </Defs>
      <Path
        d="M24 7C22.3 7 21 8.3 21 10V10.9C16.4 12.3 14 16.3 14 21V27L10.5 31.5C9.6 32.6 10.4 34 11.8 34H36.2C37.6 34 38.4 32.6 37.5 31.5L34 27V21C34 16.3 31.6 12.3 27 10.9V10C27 8.3 25.7 7 24 7Z"
        fill="url(#campana)"
      />
      <Path d="M19.5 37.5a4.5 4.5 0 0 0 9 0Z" fill="url(#badajo)" />
      <Path
        d="M18 21c0-3 1.5-5.5 4-6.5"
        fill="none"
        stroke={p.brillo}
        strokeLinecap="round"
        strokeOpacity={0.75}
        strokeWidth={2.6}
      />
    </Svg>
  );
}
