import Svg, { Path, Rect } from 'react-native-svg';

import { useTema } from '@/tema/useTema';

import type { TamanoEncomienda } from '@/datos/encomiendas';

export interface PropiedadesFormaPaquete {
  color?: string;
  tamano: TamanoEncomienda;
}

/** dibujo simple del tamaño del paquete: un sobre plano, una caja chica o una caja grande con su cinta */
export function FormaPaquete({ color, tamano }: PropiedadesFormaPaquete) {
  const { colores } = useTema();
  const trazo = color ?? colores.tinta;
  return (
    <Svg height={56} viewBox="0 0 80 56" width={80}>
      {tamano === 'sobre' && (
        <>
          <Rect
            fill="none"
            height={32}
            rx={4}
            stroke={trazo}
            strokeWidth={3}
            width={58}
            x={11}
            y={12}
          />
          <Path
            d="M11 16 L40 36 L69 16"
            fill="none"
            stroke={trazo}
            strokeLinejoin="round"
            strokeWidth={3}
          />
        </>
      )}
      {tamano === 'pequeno' && (
        <>
          <Rect
            fill="none"
            height={30}
            rx={4}
            stroke={trazo}
            strokeWidth={3}
            width={36}
            x={22}
            y={18}
          />
          <Path
            d="M22 28 H58 M40 18 V28"
            fill="none"
            stroke={trazo}
            strokeWidth={3}
          />
        </>
      )}
      {tamano === 'grande' && (
        <>
          <Rect
            fill="none"
            height={44}
            rx={5}
            stroke={trazo}
            strokeWidth={3}
            width={56}
            x={12}
            y={8}
          />
          <Path
            d="M12 22 H68 M40 8 V22"
            fill="none"
            stroke={trazo}
            strokeWidth={3}
          />
        </>
      )}
    </Svg>
  );
}
