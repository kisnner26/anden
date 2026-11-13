import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Autobus, varianteDeClave } from '@/componentes/Autobus';
import { conAlfa } from '@/tema/alfa';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';

export type TipoEscena = 'llegada' | 'salida';

export interface PropiedadesEscenaViaje {
  alTerminar: () => void;
  /** el destino: sirve para elegir el modelo de bus y no se escribe en pantalla */
  destino: string;
  detalle: string;
  tipo: TipoEscena;
  titulo: string;
}

const DURACION_SALIDA = 3400;
const DURACION_LLEGADA = 3000;
const DURACION_REDUCIDA = 1400;

/**
 * escena a pantalla completa: amanece, las montañas se desplazan despacio y el bus recorre la
 * carretera. En la salida cruza y se va; en la llegada frena en el centro. Se cierra sola o al tocar.
 */
export function EscenaViaje({
  alTerminar,
  destino,
  detalle,
  tipo,
  titulo,
}: PropiedadesEscenaViaje) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const { height, width } = useWindowDimensions();
  const progreso = useRef(new Animated.Value(0)).current;
  const sol = useRef(new Animated.Value(0)).current;
  const texto = useRef(new Animated.Value(reducido ? 1 : 0)).current;
  const lineas = useRef(new Animated.Value(0)).current;
  const duracion = tipo === 'salida' ? DURACION_SALIDA : DURACION_LLEGADA;
  const anchoBus = Math.min(width * 0.62, 300);
  const altoCarretera = Math.max(90, height * 0.13);

  useEffect(() => {
    if (reducido) {
      const espera = setTimeout(alTerminar, DURACION_REDUCIDA);
      return () => clearTimeout(espera);
    }
    const recorrido = Animated.timing(progreso, {
      duration: duracion,
      easing:
        tipo === 'salida'
          ? Easing.bezier(0.45, 0, 0.75, 1)
          : Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    });
    const amanecer = Animated.timing(sol, {
      duration: duracion,
      easing: Easing.out(Easing.quad),
      toValue: 1,
      useNativeDriver: true,
    });
    const aparecerTexto = Animated.sequence([
      Animated.delay(duracion * 0.22),
      Animated.timing(texto, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
    ]);
    const rayas = Animated.loop(
      Animated.timing(lineas, {
        duration: 520,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    rayas.start();
    Animated.parallel([recorrido, amanecer, aparecerTexto]).start(
      ({ finished }) => {
        if (finished) alTerminar();
      },
    );
    return () => {
      rayas.stop();
      progreso.stopAnimation();
      sol.stopAnimation();
      texto.stopAnimation();
    };
  }, [alTerminar, duracion, lineas, progreso, reducido, sol, texto, tipo]);

  const yBus = height - altoCarretera - anchoBus * 0.5 + 12;
  const xBus = progreso.interpolate({
    inputRange: tipo === 'salida' ? [0, 0.38, 1] : [0, 1],
    outputRange:
      tipo === 'salida'
        ? [-anchoBus, (width - anchoBus) / 2 - 18, width + anchoBus]
        : [-anchoBus, (width - anchoBus) / 2],
  });
  const rebote = lineas.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -2.5, 0],
  });

  return (
    <Pressable
      accessibilityLabel={titulo}
      accessibilityLiveRegion="polite"
      accessibilityRole="button"
      onPress={alTerminar}
      style={estilos.escena}
      testID="escena-viaje"
    >
      <LinearGradient
        colors={[
          colores.fondoProfundo,
          colores.fondo,
          conAlfa(colores.ambar, 0.55),
        ]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          estilos.sol,
          {
            opacity: sol.interpolate({
              inputRange: [0, 0.3, 1],
              outputRange: [0, 1, 1],
            }),
            transform: [
              {
                translateY: sol.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height * 0.22, height * 0.02],
                }),
              },
            ],
          },
        ]}
      >
        <Svg height={220} width={220}>
          <Circle
            cx={110}
            cy={110}
            fill={conAlfa(colores.ambar, 0.18)}
            r={108}
          />
          <Circle
            cx={110}
            cy={110}
            fill={conAlfa(colores.ambar, 0.35)}
            r={74}
          />
          <Circle cx={110} cy={110} fill={colores.ambar} r={44} />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[
          estilos.montanas,
          {
            transform: [
              {
                translateX: progreso.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -width * 0.12],
                }),
              },
            ],
          },
        ]}
      >
        <Svg height={height * 0.34} viewBox="0 0 400 200" width={width * 1.3}>
          <Path
            d="M0 200 L0 120 L60 60 L110 110 L170 40 L240 120 L300 70 L360 115 L400 90 L400 200 Z"
            fill={conAlfa(colores.tintaSuave, 0.22)}
          />
          <Path
            d="M0 200 L0 150 L80 100 L140 145 L210 85 L280 150 L340 110 L400 140 L400 200 Z"
            fill={conAlfa(colores.tintaSuave, 0.38)}
          />
        </Svg>
      </Animated.View>

      <View
        style={[
          estilos.carretera,
          { backgroundColor: colores.bloqueNegro, height: altoCarretera },
        ]}
      >
        <Animated.View
          style={[
            estilos.rayas,
            {
              transform: [
                {
                  translateX: lineas.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -48],
                  }),
                },
              ],
            },
          ]}
        >
          {Array.from({ length: Math.ceil(width / 48) + 3 }, (_, i) => (
            <View
              key={i}
              style={[
                estilos.raya,
                { backgroundColor: conAlfa(colores.sobreNegro, 0.55) },
              ]}
            />
          ))}
        </Animated.View>
      </View>

      {!reducido && (
        <Animated.View
          style={[
            estilos.bus,
            {
              top: yBus,
              transform: [{ translateX: xBus }, { translateY: rebote }],
            },
          ]}
        >
          <Autobus
            ancho={anchoBus}
            letrero={destino.toUpperCase()}
            variante={varianteDeClave(destino)}
          />
        </Animated.View>
      )}

      <Animated.View
        style={[
          estilos.textos,
          {
            opacity: texto,
            transform: [
              {
                translateY: texto.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={[tipografia.display, { color: colores.tinta }]}>
          {titulo}
        </Text>
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {detalle}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  bus: { left: 0, position: 'absolute' },
  carretera: {
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
  },
  escena: {
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 20,
  },
  montanas: { bottom: 70, left: 0, position: 'absolute' },
  raya: { borderRadius: 3, height: 6, marginRight: 28, width: 20 },
  rayas: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
  },
  sol: { alignSelf: 'center', position: 'absolute', top: '7%' },
  textos: {
    alignItems: 'center',
    gap: espacios.ocho,
    left: espacios.veinticuatro,
    position: 'absolute',
    right: espacios.veinticuatro,
    top: '41%',
  },
});
