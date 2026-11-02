import Svg, { Defs, G, Path, Rect } from 'react-native-svg';

import { paletaIconos as p } from '@/tema/colores';

import { Degradado } from './Degradado';
import type { PropiedadesDibujo } from './tipos';

export function DibujoBoleto({ tamano }: PropiedadesDibujo) {
  return (
    <Svg height={tamano} viewBox="0 0 48 48" width={tamano}>
      <Defs>
        <Degradado
          id="boleto"
          paradas={[
            [0, p.ambarClaro],
            [0.5, p.ambar],
            [1, p.ambarOscuro],
          ]}
        />
      </Defs>
      <Path
        d="M8 12H40A4 4 0 0 1 44 16V20.5A3.5 3.5 0 0 0 44 27.5V32A4 4 0 0 1 40 36H8A4 4 0 0 1 4 32V27.5A3.5 3.5 0 0 0 4 20.5V16A4 4 0 0 1 8 12Z"
        fill="url(#boleto)"
      />
      <Path
        d="M33 15V33"
        stroke={p.perforado}
        strokeDasharray="2.6 3.2"
        strokeLinecap="round"
        strokeOpacity={0.5}
        strokeWidth={2.2}
      />
      <G fill={p.barras} opacity={0.88}>
        <Rect height={12} rx={1.2} width={3} x={9} y={18} />
        <Rect height={12} rx={1} width={2} x={14} y={18} />
        <Rect height={12} rx={1.2} width={4.5} x={18.5} y={18} />
        <Rect height={12} rx={1.2} width={2.5} x={25.5} y={18} />
      </G>
      <Path
        d="M8 14.5H40"
        stroke={p.brillo}
        strokeLinecap="round"
        strokeOpacity={0.7}
        strokeWidth={2.2}
      />
    </Svg>
  );
}
