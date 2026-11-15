import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { cieloDelViaje, type MomentoDelCielo } from '@/datos/cielo';
import type { Coordenada } from '@/datos/geometria';
import { conAlfa } from '@/tema/alfa';
import { coloresCielo } from '@/tema/colores';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesCieloDelTrayecto {
  duracionMin: number;
  lugar: Coordenada;
  salida: Date;
}

/** el astro que corresponde al momento: una luna de noche y un sol con rayos de día, al amanecer y al atardecer */
function Astro({
  momento,
  color,
}: {
  color: string;
  momento: MomentoDelCielo;
}) {
  if (momento === 'noche') {
    return (
      <Svg height={28} viewBox="0 0 28 28" width={28}>
        <Path d="M20 4a11 11 0 1 0 4 15.5A9 9 0 0 1 20 4Z" fill={color} />
      </Svg>
    );
  }
  return (
    <Svg height={28} viewBox="0 0 28 28" width={28}>
      <Circle cx={14} cy={14} fill={color} r={6} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((g) => (
        <Line
          key={g}
          stroke={color}
          strokeLinecap="round"
          strokeWidth={2}
          transform={`rotate(${g} 14 14)`}
          x1={14}
          x2={14}
          y1={2}
          y2={5}
        />
      ))}
    </Svg>
  );
}

/**
 * una franja con el cielo del viaje: del color del momento en que sale al color del momento en que llega, con el astro de
 * la salida y una frase que dice si es de noche, de día o está amaneciendo; sirve para saber de un vistazo cuándo viajás
 */
export function CieloDelTrayecto({
  duracionMin,
  lugar,
  salida,
}: PropiedadesCieloDelTrayecto) {
  const { colores } = useTema();
  const [inicio, medio, fin] = cieloDelViaje(salida, duracionMin, lugar);
  const franja = [inicio, medio, fin].map((m) => coloresCielo[m][1]);
  const frase = rellenar(t('cielo.frase'), {
    llegada: t(`cielo.${fin}`),
    salida: t(`cielo.${inicio}`),
  });

  return (
    <View
      accessibilityLabel={frase}
      accessible
      style={estilos.contenedor}
      testID="cielo-del-trayecto"
    >
      <LinearGradient
        colors={franja as unknown as [string, string, ...string[]]}
        end={{ x: 1, y: 0.5 }}
        start={{ x: 0, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[
          conAlfa(colores.bloqueNegro, 0),
          conAlfa(colores.bloqueNegro, 0.55),
        ]}
        style={StyleSheet.absoluteFill}
      />
      <Astro color={colores.sobreNegro} momento={inicio} />
      <Text style={[tipografia.subtitulo, { color: colores.sobreNegro }]}>
        {frase}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    borderRadius: radios.tarjeta,
    flexDirection: 'row',
    gap: espacios.doce,
    minHeight: 64,
    overflow: 'hidden',
    paddingHorizontal: espacios.dieciseis,
    paddingVertical: espacios.doce,
  },
});
