import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Path,
  Text as TextoSvg,
  TextPath,
} from 'react-native-svg';

import type { CiudadDelSello } from '@/datos/pasaporte';
import { formatoFechaCorta } from '@/datos/formato';
import { conAlfa } from '@/tema/alfa';
import { paletaPasaporte as hoja } from '@/tema/colores';
import { movimiento } from '@/tema/movimiento';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesSelloDeCiudad {
  ciudad: CiudadDelSello;
  llegadas: number;
  /** ISO del primer viaje; nulo si todavía no hay sello */
  primera: string | null;
  /** cuánto espera antes de estamparse, para que los sellos caigan uno tras otro */
  retardo?: number;
  /** falso mientras el sello todavía no se ve: queda en espera y se estampa al activarse */
  activo?: boolean;
}

/** la tinta de cada sello: cada ciudad estampa con su propio color, como en un pasaporte de verdad */
const TINTAS: Record<CiudadDelSello, string> = {
  Boaco: hoja.tintaSelloAzul,
  Juigalpa: hoja.oroOscuro,
  Managua: hoja.tintaSello,
};

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
  retardo = 0,
  activo = true,
}: PropiedadesSelloDeCiudad) {
  const reducido = useMovimientoReducido();
  const tiene = llegadas > 0;
  const tinta = tiene ? TINTAS[ciudad] : conAlfa(hoja.tintaHojaSuave, 0.55);
  const golpe = useRef(new Animated.Value(tiene && !reducido ? 0 : 1)).current;

  useEffect(() => {
    if (!tiene || reducido) {
      golpe.setValue(1);
      return;
    }
    if (!activo) return;
    golpe.setValue(0);
    const animacion = Animated.timing(golpe, {
      delay: retardo,
      duration: movimiento.estampaSello,
      easing: Easing.out(Easing.back(2.2)),
      toValue: 1,
      useNativeDriver: true,
    });
    animacion.start();
    return () => animacion.stop();
  }, [activo, golpe, reducido, retardo, tiene]);

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
      <Animated.View
        style={{
          opacity: golpe.interpolate({
            inputRange: [0, 0.35, 1],
            outputRange: [0, 1, 1],
          }),
          transform: [
            {
              rotate: golpe.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  tiene ? '-24deg' : '0deg',
                  tiene ? '-6deg' : '0deg',
                ],
              }),
            },
            {
              scale: golpe.interpolate({
                inputRange: [0, 1],
                outputRange: [tiene ? 2.3 : 1, 1],
              }),
            },
          ],
        }}
      >
        <Svg height={132} viewBox="0 0 120 120" width={132}>
          <Defs>
            <Path d="M 21 60 A 39 39 0 0 1 99 60" id={`arriba-${ciudad}`} />
            <Path d="M 12 60 A 48 48 0 0 0 108 60" id={`abajo-${ciudad}`} />
          </Defs>
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
            r={51}
            stroke={tinta}
            strokeWidth={1}
          />
          <Circle
            cx={60}
            cy={60}
            fill="none"
            r={31}
            stroke={tinta}
            strokeWidth={0.8}
          />
          {tiene ? (
            <G transform="translate(60 58) scale(0.74) translate(-60 -56)">
              <Silueta ciudad={ciudad} color={tinta} />
            </G>
          ) : null}
          <TextoSvg
            fill={tinta}
            fontSize={12}
            fontWeight="800"
            letterSpacing={2.4}
          >
            <TextPath
              href={`#arriba-${ciudad}`}
              startOffset="50%"
              textAnchor="middle"
            >
              {ciudad.toUpperCase()}
            </TextPath>
          </TextoSvg>
          <TextoSvg
            fill={tinta}
            fontSize={9.5}
            fontWeight="700"
            letterSpacing={1.4}
          >
            <TextPath
              href={`#abajo-${ciudad}`}
              startOffset="50%"
              textAnchor="middle"
            >
              {tiene && primera
                ? formatoFechaCorta(new Date(primera)).toUpperCase()
                : t('pasaporte.sinSello').toUpperCase()}
            </TextPath>
          </TextoSvg>
          {tiene ? (
            <TextoSvg
              fill={tinta}
              fontSize={10}
              fontWeight="800"
              letterSpacing={1}
              textAnchor="middle"
              x={60}
              y={86}
            >
              {`x${llegadas}`}
            </TextoSvg>
          ) : null}
        </Svg>
      </Animated.View>
    </View>
  );
}

const estilos = StyleSheet.create({
  sello: { alignItems: 'center' },
});
