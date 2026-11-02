import Svg, { Circle, Defs, Path, Rect } from 'react-native-svg';

import { paletaIconos as p } from '@/tema/colores';

import { Degradado } from './Degradado';
import type { PropiedadesDibujo } from './tipos';

export function DibujoTaxi({ tamano }: PropiedadesDibujo) {
  return (
    <Svg height={tamano} viewBox="0 0 48 48" width={tamano}>
      <Defs>
        <Degradado
          id="taxiLetrero"
          paradas={[
            [0, p.ambarClaro],
            [0.5, p.ambar],
            [1, p.ambarOscuro],
          ]}
        />
        <Degradado
          id="taxiCarroceria"
          paradas={[
            [0, p.verdeClaro],
            [1, p.verdeOscuro],
          ]}
        />
        <Degradado
          id="taxiVidrio"
          paradas={[
            [0, p.negroClaro],
            [1, p.negroOscuro],
          ]}
        />
      </Defs>
      <Rect
        fill="url(#taxiLetrero)"
        height={6}
        rx={2.5}
        width={12}
        x={18}
        y={9}
      />
      <Path
        d="M6 31L9.5 21.5C10.2 19.4 12.1 18 14.3 18H33.7C35.9 18 37.8 19.4 38.5 21.5L42 31V37A2 2 0 0 1 40 39H37A2 2 0 0 1 35 37V36H13V37A2 2 0 0 1 11 39H8A2 2 0 0 1 6 37Z"
        fill="url(#taxiCarroceria)"
      />
      <Path d="M13.5 21.5H34.5L37 28.5H11Z" fill="url(#taxiVidrio)" />
      <Path d="M16 23L20 23L17.5 27H14.5Z" fill={p.brillo} opacity={0.18} />
      <Circle cx={14.5} cy={35.5} fill={p.rueda} r={4.6} />
      <Circle cx={14.5} cy={35.5} fill={p.cremaOscura} r={2} />
      <Circle cx={33.5} cy={35.5} fill={p.rueda} r={4.6} />
      <Circle cx={33.5} cy={35.5} fill={p.cremaOscura} r={2} />
      <Circle cx={9} cy={31} fill={p.ambarClaro} r={1.8} />
      <Circle cx={39} cy={31} fill={p.ambarClaro} r={1.8} />
    </Svg>
  );
}
