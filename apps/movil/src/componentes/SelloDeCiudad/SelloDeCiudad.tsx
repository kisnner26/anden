import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Text as TextoSvg } from 'react-native-svg';

import type { CiudadDelSello } from '@/datos/pasaporte';
import { formatoFechaCorta } from '@/datos/formato';
import { conAlfa } from '@/tema/alfa';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesSelloDeCiudad {
  ciudad: CiudadDelSello;
  llegadas: number;
  /** ISO del primer viaje; nulo si todavía no hay sello */
  primera: string | null;
}

/** lo que se dibuja dentro del aro de cada ciudad: Managua, su catedral; Boaco, el arco; Juigalpa, la colina */
function Silueta({ ciudad, color }: { ciudad: CiudadDelSello; color: string }) {
  if (ciudad === 'Managua') {
    return (
      <G fill="none" stroke={color} strokeLinecap="round" strokeWidth={2.4}>
        <Path d="M38 74 V52 M82 74 V52 M38 52 q0 -10 6 -10 q6 0 6 10 M70 52 q0 -10 6 -10 q6 0 6 10 M50 74 V56 q10 -16 20 0 V74 M30 74 H90" />
        <Path d="M60 40 V34 M57 37 H63" />
      </G>
    );
  }
  if (ciudad === 'Boaco') {
    return (
      <G fill="none" stroke={color} strokeLinecap="round" strokeWidth={2.4}>
        <Path d="M34 76 V52 q0 -22 26 -22 q26 0 26 22 V76 M44 76 V54 q0 -14 16 -14 q16 0 16 14 V76 M28 76 H92" />
      </G>
    );
  }
  return (
    <G fill="none" stroke={color} strokeLinecap="round" strokeWidth={2.4}>
      <Path d="M26 76 Q46 40 62 56 Q74 44 94 76 Z M26 76 H94" />
      <Circle cx={80} cy={40} r={6} />
    </G>
  );
}

/** un sello de tinta con el nombre de la ciudad, su silueta, cuántas veces se llegó y el primer viaje; sin viajes queda el aro vacío */
export function SelloDeCiudad({
  ciudad,
  llegadas,
  primera,
}: PropiedadesSelloDeCiudad) {
  const { colores } = useTema();
  const tiene = llegadas > 0;
  const tinta = tiene ? colores.ambarTexto : conAlfa(colores.tintaSuave, 0.6);
  return (
    <View
      accessibilityLabel={
        tiene
          ? rellenar(t('pasaporte.selloAccesible'), {
              ciudad,
              llegadas,
            })
          : rellenar(t('pasaporte.selloVacio'), { ciudad })
      }
      accessible
      style={estilos.sello}
    >
      <View style={{ transform: [{ rotate: tiene ? '-6deg' : '0deg' }] }}>
        <Svg height={132} viewBox="0 0 120 120" width={132}>
          <Circle
            cx={60}
            cy={60}
            fill="none"
            r={56}
            stroke={tinta}
            strokeDasharray={tiene ? undefined : '4 5'}
            strokeWidth={tiene ? 3 : 2}
          />
          <Circle
            cx={60}
            cy={60}
            fill="none"
            r={49}
            stroke={tinta}
            strokeWidth={1.2}
          />
          {tiene ? <Silueta ciudad={ciudad} color={tinta} /> : null}
          <TextoSvg
            fill={tinta}
            fontSize={13}
            fontWeight="800"
            letterSpacing={2}
            textAnchor="middle"
            x={60}
            y={26}
          >
            {ciudad.toUpperCase()}
          </TextoSvg>
          <TextoSvg
            fill={tinta}
            fontSize={10}
            fontWeight="700"
            letterSpacing={1}
            textAnchor="middle"
            x={60}
            y={94}
          >
            {tiene && primera
              ? formatoFechaCorta(new Date(primera)).toUpperCase()
              : t('pasaporte.sinSello').toUpperCase()}
          </TextoSvg>
          {tiene ? (
            <TextoSvg
              fill={tinta}
              fontSize={10}
              fontWeight="700"
              letterSpacing={1}
              textAnchor="middle"
              x={60}
              y={106}
            >
              {`x${llegadas}`}
            </TextoSvg>
          ) : null}
        </Svg>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  sello: { alignItems: 'center' },
});
