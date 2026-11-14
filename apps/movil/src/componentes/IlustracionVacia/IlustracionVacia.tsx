import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { Autobus } from '@/componentes/Autobus';
import { conAlfa } from '@/tema/alfa';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';

export type TipoIlustracion = 'boletos' | 'error' | 'salidas';

export interface PropiedadesIlustracionVacia {
  tamano?: number;
  tipo: TipoIlustracion;
}

/** hace flotar suavemente lo que lleva adentro; quieto si la persona pidió reducir el movimiento */
function Flotar({ children }: { children: React.ReactNode }) {
  const reducido = useMovimientoReducido();
  const flote = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducido) return;
    const bucle = Animated.loop(
      Animated.sequence([
        Animated.timing(flote, {
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(flote, {
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    bucle.start();
    return () => bucle.stop();
  }, [flote, reducido]);

  return (
    <Animated.View
      style={{
        transform: [
          {
            translateY: flote.interpolate({
              inputRange: [0, 1],
              outputRange: [4, -4],
            }),
          },
          {
            rotate: flote.interpolate({
              inputRange: [0, 1],
              outputRange: ['-1.5deg', '1.5deg'],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

/** una chispa que se enciende y se apaga, en la posición dada */
function Chispa({ demora, x, y }: { demora: number; x: number; y: number }) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const brillo = useRef(new Animated.Value(reducido ? 0.7 : 0)).current;

  useEffect(() => {
    if (reducido) return;
    const bucle = Animated.loop(
      Animated.sequence([
        Animated.delay(demora),
        Animated.timing(brillo, {
          duration: 700,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(brillo, {
          duration: 700,
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.delay(900),
      ]),
    );
    bucle.start();
    return () => bucle.stop();
  }, [brillo, demora, reducido]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        estilos.chispa,
        {
          backgroundColor: colores.ambar,
          left: x,
          opacity: brillo,
          top: y,
          transform: [
            { rotate: '45deg' },
            {
              scale: brillo.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 1.2],
              }),
            },
          ],
        },
      ]}
    />
  );
}

/** el boleto en blanco: papel inclinado con su línea punteada y muescas */
function DibujoBoletos({ tamano }: { tamano: number }) {
  const { colores } = useTema();
  const trazo = colores.tinta;
  return (
    <Svg height={tamano * 0.75} viewBox="0 0 160 120" width={tamano}>
      <G rotation={-7} origin="80, 60">
        <Rect
          fill={colores.papel}
          height={74}
          rx={12}
          stroke={trazo}
          strokeWidth={3}
          width={118}
          x={21}
          y={23}
        />
        <Circle
          cx={21}
          cy={60}
          fill={colores.fondo}
          r={8}
          stroke={trazo}
          strokeWidth={3}
        />
        <Circle
          cx={139}
          cy={60}
          fill={colores.fondo}
          r={8}
          stroke={trazo}
          strokeWidth={3}
        />
        <Line
          stroke={conAlfa(trazo, 0.5)}
          strokeDasharray="5 5"
          strokeWidth={2.5}
          x1={34}
          x2={126}
          y1={60}
          y2={60}
        />
        <Rect
          fill={colores.ambar}
          height={9}
          rx={4.5}
          width={44}
          x={34}
          y={34}
        />
        <Rect
          fill={conAlfa(trazo, 0.25)}
          height={7}
          rx={3.5}
          width={70}
          x={34}
          y={72}
        />
        <Rect
          fill={conAlfa(trazo, 0.15)}
          height={7}
          rx={3.5}
          width={46}
          x={34}
          y={84}
        />
      </G>
    </Svg>
  );
}

/** sin señal: tres arcos y una raya cruzada */
function DibujoError({ tamano }: { tamano: number }) {
  const { colores } = useTema();
  const trazo = colores.tinta;
  return (
    <Svg height={tamano * 0.75} viewBox="0 0 160 120" width={tamano}>
      <Path
        d="M30 52 A70 70 0 0 1 130 52"
        fill="none"
        stroke={conAlfa(trazo, 0.25)}
        strokeLinecap="round"
        strokeWidth={6}
      />
      <Path
        d="M46 68 A46 46 0 0 1 114 68"
        fill="none"
        stroke={conAlfa(trazo, 0.5)}
        strokeLinecap="round"
        strokeWidth={6}
      />
      <Path
        d="M62 84 A22 22 0 0 1 98 84"
        fill="none"
        stroke={trazo}
        strokeLinecap="round"
        strokeWidth={6}
      />
      <Circle cx={80} cy={98} fill={colores.ambar} r={7} />
      <Line
        stroke={colores.cancelado}
        strokeLinecap="round"
        strokeWidth={6}
        x1={40}
        x2={120}
        y1={26}
        y2={106}
      />
    </Svg>
  );
}

/** el camino con rayas que corren y un bus esperando */
function DibujoSalidas({ tamano }: { tamano: number }) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const camino = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducido) return;
    const bucle = Animated.loop(
      Animated.timing(camino, {
        duration: 1400,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    bucle.start();
    return () => bucle.stop();
  }, [camino, reducido]);

  return (
    <View
      style={{ alignItems: 'center', height: tamano * 0.75, width: tamano }}
    >
      <Autobus ancho={tamano * 0.62} />
      <View
        style={[
          estilos.camino,
          { backgroundColor: conAlfa(colores.tinta, 0.12) },
        ]}
      >
        <Animated.View
          style={[
            estilos.rayas,
            {
              transform: [
                {
                  translateX: camino.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -28],
                  }),
                },
              ],
            },
          ]}
        >
          {Array.from({ length: 14 }, (_, i) => (
            <View
              key={i}
              style={[
                estilos.raya,
                { backgroundColor: conAlfa(colores.tinta, 0.35) },
              ]}
            />
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

/**
 * un dibujo que flota para los estados vacíos: el boleto en blanco, el bus esperando en el camino o la
 * pérdida de señal. Reemplaza al texto plano para que la pantalla vacía tenga vida
 */
export function IlustracionVacia({
  tamano = 160,
  tipo,
}: PropiedadesIlustracionVacia) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[estilos.contenedor, { height: tamano * 0.8, width: tamano }]}
      testID={`ilustracion-${tipo}`}
    >
      <Flotar>
        {tipo === 'boletos' ? (
          <DibujoBoletos tamano={tamano} />
        ) : tipo === 'error' ? (
          <DibujoError tamano={tamano} />
        ) : (
          <DibujoSalidas tamano={tamano} />
        )}
      </Flotar>
      <Chispa demora={0} x={tamano * 0.08} y={tamano * 0.12} />
      <Chispa demora={500} x={tamano * 0.88} y={tamano * 0.2} />
      <Chispa demora={1000} x={tamano * 0.78} y={tamano * 0.62} />
    </View>
  );
}

const estilos = StyleSheet.create({
  camino: {
    borderRadius: 4,
    bottom: 0,
    height: 8,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
  },
  chispa: { height: 9, position: 'absolute', width: 9 },
  contenedor: { alignItems: 'center', justifyContent: 'center' },
  raya: { borderRadius: 2, height: 4, width: 14 },
  rayas: { flexDirection: 'row', gap: 14, marginTop: 2 },
});
