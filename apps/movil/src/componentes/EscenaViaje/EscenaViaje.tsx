import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef } from 'react';
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
import { HumoEscape } from '@/componentes/HumoEscape';
import { conAlfa, mezclar } from '@/tema/alfa';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';

export type TipoEscena = 'llegada' | 'salida';

export interface PropiedadesEscenaViaje {
  alTerminar: () => void;
  /** el destino: sirve para elegir el modelo de bus y para el letrero */
  destino: string;
  detalle: string;
  /** milisegundos que dura; sin indicar, lo normal de cada tipo */
  duracion?: number;
  tipo: TipoEscena;
  titulo: string;
}

const DURACION_SALIDA = 4200;
const DURACION_LLEGADA = 3600;
const DURACION_REDUCIDA = 1400;
const ENTRADA = 320;
const SALIDA_DE_ESCENA = 380;
/** posición (de 0 a 1 del ancho) y tamaño de cada estrella; fijas, para que no cambien entre dibujos */
const ESTRELLAS = [
  [0.08, 0.06, 2],
  [0.22, 0.14, 3],
  [0.36, 0.05, 2],
  [0.5, 0.12, 2.5],
  [0.63, 0.04, 3],
  [0.78, 0.15, 2],
  [0.9, 0.08, 3],
  [0.15, 0.24, 2],
  [0.7, 0.26, 2],
  [0.44, 0.22, 2],
] as const;

/**
 * escena a pantalla completa y opaca: de noche a amanecer, estrellas, sol que sube detrás de tres
 * capas de montañas, nubes, carretera y un bus con faros y humo. Entra y sale con un fundido, así que
 * nunca deja ver la pantalla de atrás. En la salida cruza y se va; en la llegada frena en el centro.
 */
export function EscenaViaje({
  alTerminar,
  destino,
  detalle,
  duracion: duracionPropia,
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
  const deriva = useRef(new Animated.Value(0)).current;
  const brillo = useRef(new Animated.Value(0)).current;
  const velo = useRef(new Animated.Value(reducido ? 1 : 0)).current;
  const terminada = useRef(false);
  const duracion =
    duracionPropia ?? (tipo === 'salida' ? DURACION_SALIDA : DURACION_LLEGADA);
  const anchoBus = Math.min(width * 0.66, 320);
  const escalaBus = anchoBus / 520;
  const altoCarretera = Math.max(110, height * 0.15);

  const paleta = useMemo(() => {
    const noche = colores.bloqueNegro;
    return {
      cerca: mezclar(noche, colores.bloqueNegroClaro, 0.6),
      cielo: [
        noche,
        mezclar(noche, colores.ambar, 0.18),
        mezclar(noche, colores.ambar, 0.5),
      ] as const,
      lejos: mezclar(noche, colores.ambar, 0.3),
      medio: mezclar(noche, colores.ambar, 0.14),
      nube: mezclar(noche, colores.ambar, 0.45),
    };
  }, [colores.ambar, colores.bloqueNegro, colores.bloqueNegroClaro]);

  function cerrar() {
    if (terminada.current) return;
    terminada.current = true;
    if (reducido) {
      alTerminar();
      return;
    }
    Animated.timing(velo, {
      duration: SALIDA_DE_ESCENA,
      easing: Easing.in(Easing.quad),
      toValue: 0,
      useNativeDriver: true,
    }).start(() => alTerminar());
  }

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
      Animated.delay(duracion * 0.2),
      Animated.timing(texto, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
    ]);
    const aparecer = Animated.timing(velo, {
      duration: ENTRADA,
      easing: Easing.out(Easing.quad),
      toValue: 1,
      useNativeDriver: true,
    });
    const rayas = Animated.loop(
      Animated.timing(lineas, {
        duration: 480,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    const nubes = Animated.loop(
      Animated.timing(deriva, {
        duration: 14000,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    const titilar = Animated.loop(
      Animated.sequence([
        Animated.timing(brillo, {
          duration: 1300,
          easing: Easing.inOut(Easing.sin),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(brillo, {
          duration: 1300,
          easing: Easing.inOut(Easing.sin),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    rayas.start();
    nubes.start();
    titilar.start();
    aparecer.start();
    Animated.parallel([recorrido, amanecer, aparecerTexto]).start(
      ({ finished }) => {
        if (finished) cerrar();
      },
    );
    return () => {
      rayas.stop();
      nubes.stop();
      titilar.stop();
      progreso.stopAnimation();
      sol.stopAnimation();
      texto.stopAnimation();
    };
    // la escena se arma una sola vez
  }, []);

  const yBus = height - altoCarretera - anchoBus * 0.5 + 18;
  const xBus = progreso.interpolate({
    inputRange: tipo === 'salida' ? [0, 0.4, 1] : [0, 1],
    outputRange:
      tipo === 'salida'
        ? [-anchoBus, (width - anchoBus) / 2 - 14, width + anchoBus]
        : [-anchoBus, (width - anchoBus) / 2],
  });
  const rebote = lineas.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -2.5, 0],
  });
  const lejos = (factor: number) =>
    progreso.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -width * factor],
    });
  const altoMontes = height * 0.34;

  return (
    <Animated.View
      pointerEvents="auto"
      style={[
        estilos.escena,
        { backgroundColor: colores.bloqueNegro, opacity: velo },
      ]}
      testID="escena-viaje-capa"
    >
      <Pressable
        accessibilityLabel={titulo}
        accessibilityLiveRegion="polite"
        accessibilityRole="button"
        onPress={cerrar}
        style={StyleSheet.absoluteFill}
        testID="escena-viaje"
      >
        <LinearGradient
          colors={[...paleta.cielo]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {ESTRELLAS.map(([x, y, tamano], indice) => (
            <Animated.View
              key={indice}
              style={[
                estilos.estrella,
                {
                  backgroundColor: colores.sobreNegro,
                  borderRadius: tamano,
                  height: tamano,
                  left: x * width,
                  opacity:
                    indice % 2 === 0
                      ? brillo.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.25, 0.95],
                        })
                      : brillo.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.95, 0.25],
                        }),
                  top: y * height,
                  width: tamano,
                },
              ]}
            />
          ))}
        </View>

        <Animated.View
          pointerEvents="none"
          style={[
            estilos.sol,
            {
              opacity: sol.interpolate({
                inputRange: [0, 0.25, 1],
                outputRange: [0, 1, 1],
              }),
              transform: [
                {
                  translateY: sol.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height * 0.2, -height * 0.04],
                  }),
                },
              ],
            },
          ]}
        >
          <Svg height={260} width={260}>
            <Circle
              cx={130}
              cy={130}
              fill={conAlfa(colores.ambar, 0.12)}
              r={128}
            />
            <Circle
              cx={130}
              cy={130}
              fill={conAlfa(colores.ambar, 0.26)}
              r={92}
            />
            <Circle cx={130} cy={130} fill={colores.ambar} r={52} />
          </Svg>
        </Animated.View>

        {[0, 1, 2].map((indice) => (
          <Animated.View
            key={indice}
            pointerEvents="none"
            style={[
              estilos.nube,
              {
                backgroundColor: conAlfa(paleta.nube, 0.5),
                height: 16 + indice * 5,
                top: height * (0.17 + indice * 0.07),
                transform: [
                  {
                    translateX: deriva.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        -140 - indice * 90,
                        width + 60 + indice * 40,
                      ],
                    }),
                  },
                ],
                width: 110 + indice * 40,
              },
            ]}
          />
        ))}

        {(
          [
            [paleta.lejos, 0.06, 0.18, 0.55],
            [paleta.medio, 0.12, 0.1, 0.4],
            [paleta.cerca, 0.22, 0.02, 0.28],
          ] as const
        ).map(([color, factor, subida], indice) => (
          <Animated.View
            key={indice}
            pointerEvents="none"
            style={[
              estilos.montanas,
              {
                bottom: altoCarretera - 4 + height * subida * 0.1 - indice * 2,
                transform: [{ translateX: lejos(factor) }],
              },
            ]}
          >
            <Svg
              height={altoMontes * (1 - indice * 0.22)}
              preserveAspectRatio="none"
              viewBox="0 0 400 200"
              width={width * 1.3}
            >
              <Path
                d={
                  indice === 0
                    ? 'M0 200 L0 120 L60 60 L110 110 L170 40 L240 120 L300 70 L360 115 L400 90 L400 200 Z'
                    : indice === 1
                      ? 'M0 200 L0 150 L80 100 L140 145 L210 85 L280 150 L340 110 L400 140 L400 200 Z'
                      : 'M0 200 L0 170 L70 135 L130 165 L200 125 L270 168 L340 140 L400 165 L400 200 Z'
                }
                fill={color}
              />
            </Svg>
          </Animated.View>
        ))}

        <View
          pointerEvents="none"
          style={[
            estilos.carretera,
            { backgroundColor: colores.bloqueNegro, height: altoCarretera },
          ]}
        >
          <View
            style={[
              estilos.borde,
              { backgroundColor: conAlfa(colores.ambar, 0.55) },
            ]}
          />
          <Animated.View
            style={[
              estilos.rayas,
              {
                transform: [
                  {
                    translateX: lineas.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -52],
                    }),
                  },
                ],
              },
            ]}
          >
            {Array.from({ length: Math.ceil(width / 52) + 3 }, (_, i) => (
              <View
                key={i}
                style={[
                  estilos.raya,
                  { backgroundColor: conAlfa(colores.sobreNegro, 0.6) },
                ]}
              />
            ))}
          </Animated.View>
        </View>

        {!reducido && (
          <Animated.View
            pointerEvents="none"
            style={[
              estilos.bus,
              {
                height: (anchoBus * 300) / 520,
                top: yBus,
                transform: [{ translateX: xBus }, { translateY: rebote }],
                width: anchoBus,
              },
            ]}
          >
            {tipo === 'salida' && (
              <LinearGradient
                colors={[
                  conAlfa(colores.ambar, 0.45),
                  conAlfa(colores.ambar, 0),
                ]}
                end={{ x: 1, y: 0.5 }}
                start={{ x: 0, y: 0.5 }}
                style={[
                  estilos.haz,
                  {
                    height: anchoBus * 0.2,
                    left: anchoBus * 0.94,
                    top: anchoBus * 0.31,
                    width: anchoBus * 0.7,
                  },
                ]}
              />
            )}
            <Autobus
              ancho={anchoBus}
              animado
              usarMiUnidad
              letrero={destino.toUpperCase()}
              variante={varianteDeClave(destino)}
            />
            <View
              style={{
                left: 34 * escalaBus,
                position: 'absolute',
                top: 226 * escalaBus,
              }}
            >
              <HumoEscape
                arranque={tipo === 'salida'}
                tamano={Math.max(10, 28 * escalaBus)}
              />
            </View>
          </Animated.View>
        )}

        <Animated.View
          pointerEvents="none"
          style={[
            estilos.textos,
            {
              opacity: texto,
              transform: [
                {
                  translateY: texto.interpolate({
                    inputRange: [0, 1],
                    outputRange: [22, 0],
                  }),
                },
                {
                  scale: texto.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.94, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text
            style={[
              tipografia.display,
              estilos.centrado,
              { color: colores.sobreNegro },
            ]}
          >
            {titulo}
          </Text>
          <Text
            style={[
              tipografia.cuerpo,
              estilos.centrado,
              { color: colores.sobreNegroSuave },
            ]}
          >
            {detalle}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  borde: { height: 3, left: 0, position: 'absolute', right: 0, top: 6 },
  bus: { left: 0, position: 'absolute' },
  carretera: {
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
  },
  centrado: { textAlign: 'center' },
  escena: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 50,
  },
  estrella: { position: 'absolute' },
  haz: { borderRadius: 40, position: 'absolute' },
  montanas: { left: 0, position: 'absolute' },
  nube: { borderRadius: 20, left: 0, position: 'absolute' },
  raya: { borderRadius: 3, height: 6, marginRight: 32, width: 20 },
  rayas: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
  },
  sol: { alignSelf: 'center', position: 'absolute', top: '10%' },
  textos: {
    alignItems: 'center',
    gap: espacios.ocho,
    left: espacios.veinticuatro,
    position: 'absolute',
    right: espacios.veinticuatro,
    top: '46%',
  },
});
