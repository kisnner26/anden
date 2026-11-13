import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { coloresEfectos } from '@/tema/colores';
import { movimientoVehiculo } from '@/tema/movimiento';

/** una escala para pasar de las unidades del dibujo (520 de ancho) a puntos de pantalla */
export interface Medida {
  k: number;
}

function bucle(
  valor: Animated.Value,
  duracion: number,
  demora = 0,
  easing: (t: number) => number = Easing.linear,
) {
  return Animated.loop(
    Animated.sequence([
      Animated.delay(demora),
      Animated.timing(valor, {
        duration: duracion,
        easing,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(valor, {
        duration: 0,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]),
  );
}

/** una rueda que gira: dos rayos cruzados sobre el centro de la llanta */
export function Rueda({
  cx,
  cy,
  k,
  r,
  color = 'rgba(255,255,255,0.55)',
  velocidad = 1,
}: Medida & {
  color?: string;
  cx: number;
  cy: number;
  r: number;
  velocidad?: number;
}) {
  const giro = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animacion = bucle(giro, movimientoVehiculo.giroRueda / velocidad);
    animacion.start();
    return () => animacion.stop();
  }, [giro, velocidad]);
  const lado = r * 2 * k;
  const grosor = Math.max(2, 5 * k);
  const rotar = giro.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        estilos.abs,
        {
          height: lado,
          left: (cx - r) * k,
          top: (cy - r) * k,
          transform: [{ rotate: rotar }],
          width: lado,
        },
      ]}
    >
      {[0, 60, 120].map((grados) => (
        <View
          key={grados}
          style={[
            estilos.rayo,
            {
              backgroundColor: color,
              borderRadius: grosor,
              height: grosor,
              left: 0,
              top: lado / 2 - grosor / 2,
              transform: [{ rotate: `${grados}deg` }],
              width: lado,
            },
          ]}
        />
      ))}
    </Animated.View>
  );
}

/** bocanadas que suben y se desvanecen: humo del escape, vapor o burbujas según el color */
export function Humo({
  cantidad = 4,
  color = coloresEfectos.humo,
  deriva = -26,
  k,
  sube = 38,
  tamano = 14,
  x,
  y,
}: Medida & {
  cantidad?: number;
  color?: string;
  /** cuánto se corre hacia los lados mientras sube, en unidades del dibujo */
  deriva?: number;
  sube?: number;
  tamano?: number;
  x: number;
  y: number;
}) {
  return (
    <>
      {Array.from({ length: cantidad }, (_, i) => (
        <Bocanada
          color={color}
          demora={(i * movimientoVehiculo.humo) / cantidad}
          deriva={deriva}
          k={k}
          key={i}
          sube={sube}
          tamano={tamano}
          x={x}
          y={y}
        />
      ))}
    </>
  );
}

function Bocanada({
  color,
  demora,
  deriva,
  k,
  sube,
  tamano,
  x,
  y,
}: Medida & {
  color: string;
  demora: number;
  deriva: number;
  sube: number;
  tamano: number;
  x: number;
  y: number;
}) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animacion = bucle(
      t,
      movimientoVehiculo.humo,
      demora,
      Easing.out(Easing.quad),
    );
    animacion.start();
    return () => animacion.stop();
  }, [demora, t]);
  const lado = tamano * k;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        estilos.abs,
        {
          backgroundColor: color,
          borderRadius: lado,
          height: lado,
          left: x * k - lado / 2,
          opacity: t.interpolate({
            inputRange: [0, 0.15, 1],
            outputRange: [0, 0.9, 0],
          }),
          top: y * k - lado / 2,
          transform: [
            {
              translateX: t.interpolate({
                inputRange: [0, 1],
                outputRange: [0, deriva * k],
              }),
            },
            {
              translateY: t.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -sube * k],
              }),
            },
            {
              scale: t.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1.9],
              }),
            },
          ],
          width: lado,
        },
      ]}
    />
  );
}

/** un resplandor que se enciende y se apaga: faros, luces de posición, ventanillas */
export function Resplandor({
  color = coloresEfectos.faro,
  demora = 0,
  k,
  minimo = 0.15,
  r,
  ritmo = movimientoVehiculo.parpadeo,
  x,
  y,
}: Medida & {
  color?: string;
  demora?: number;
  minimo?: number;
  r: number;
  ritmo?: number;
  x: number;
  y: number;
}) {
  const brillo = useRef(new Animated.Value(minimo)).current;
  useEffect(() => {
    const animacion = Animated.loop(
      Animated.sequence([
        Animated.delay(demora),
        Animated.timing(brillo, {
          duration: ritmo / 2,
          easing: Easing.inOut(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(brillo, {
          duration: ritmo / 2,
          easing: Easing.inOut(Easing.quad),
          toValue: minimo,
          useNativeDriver: true,
        }),
      ]),
    );
    animacion.start();
    return () => animacion.stop();
  }, [brillo, demora, minimo, ritmo]);
  const lado = r * 2 * k;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        estilos.abs,
        {
          backgroundColor: color,
          borderRadius: lado,
          height: lado,
          left: (x - r) * k,
          opacity: brillo,
          shadowColor: color,
          shadowOpacity: 0.9,
          shadowRadius: lado * 0.8,
          top: (y - r) * k,
          width: lado,
        },
      ]}
    />
  );
}

/** una aspa o rotor que da vueltas rapidísimas; vista de lado se achata y se estira */
export function Rotor({
  ancho,
  color = 'rgba(30,30,35,0.55)',
  grosor = 5,
  k,
  vertical = false,
  x,
  y,
}: Medida & {
  ancho: number;
  color?: string;
  grosor?: number;
  vertical?: boolean;
  x: number;
  y: number;
}) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animacion = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          duration: movimientoVehiculo.giroRotor,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          duration: movimientoVehiculo.giroRotor,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    animacion.start();
    return () => animacion.stop();
  }, [t]);
  const largo = ancho * k;
  const alto = grosor * k;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        estilos.abs,
        {
          backgroundColor: color,
          borderRadius: alto,
          height: vertical ? largo : alto,
          left: x * k - (vertical ? alto : largo) / 2,
          top: y * k - (vertical ? largo : alto) / 2,
          transform: [
            vertical
              ? {
                  scaleY: t.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.25],
                  }),
                }
              : {
                  scaleX: t.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.25],
                  }),
                },
          ],
          width: vertical ? alto : largo,
        },
      ]}
    />
  );
}

/** rayos que chisporrotean alrededor de la nave: parpadean con formas distintas */
export function Rayos({
  k,
  puntos,
}: Medida & {
  puntos: readonly { color?: string; d: string }[];
}) {
  const brillo = useRef(puntos.map(() => new Animated.Value(0))).current;
  useEffect(() => {
    const animaciones = brillo.map((valor, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 170 + 200),
          Animated.timing(valor, {
            duration: movimientoVehiculo.rayo / 2,
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(valor, {
            duration: movimientoVehiculo.rayo,
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.delay(500 + i * 90),
        ]),
      ),
    );
    animaciones.forEach((a) => a.start());
    return () => animaciones.forEach((a) => a.stop());
  }, [brillo]);
  return (
    <>
      {puntos.map((punto, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={[
            estilos.abs,
            {
              height: 300 * k,
              left: 0,
              opacity: brillo[i],
              top: 0,
              width: 520 * k,
            },
          ]}
        >
          <Svg height={300 * k} viewBox="0 0 520 300" width={520 * k}>
            <Path
              d={punto.d}
              fill="none"
              stroke={punto.color ?? coloresEfectos.rayo}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={5}
            />
            <Path
              d={punto.d}
              fill="none"
              stroke={coloresEfectos.rayoIntenso}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
            />
          </Svg>
        </Animated.View>
      ))}
    </>
  );
}

/** la estela de un avión: rayas que se estiran hacia atrás y se desvanecen */
export function Estela({
  k,
  largo = 150,
  x,
  y,
}: Medida & { largo?: number; x: number; y: number }) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <Raya
          demora={i * 330}
          k={k}
          key={i}
          largo={largo}
          x={x}
          y={y + (i - 1) * 9}
        />
      ))}
    </>
  );
}

function Raya({
  demora,
  k,
  largo,
  x,
  y,
}: Medida & { demora: number; largo: number; x: number; y: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animacion = bucle(t, 1000, demora, Easing.out(Easing.quad));
    animacion.start();
    return () => animacion.stop();
  }, [demora, t]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        estilos.abs,
        {
          backgroundColor: coloresEfectos.estela,
          borderRadius: 3 * k,
          height: 3.5 * k,
          left: x * k - largo * k,
          opacity: t.interpolate({
            inputRange: [0, 0.2, 1],
            outputRange: [0, 0.7, 0],
          }),
          top: y * k,
          transform: [
            {
              translateX: t.interpolate({
                inputRange: [0, 1],
                outputRange: [largo * 0.5 * k, -largo * 0.4 * k],
              }),
            },
            {
              scaleX: t.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 1],
              }),
            },
          ],
          width: largo * k,
        },
      ]}
    />
  );
}

const estilos = StyleSheet.create({
  abs: { position: 'absolute' },
  rayo: { position: 'absolute' },
});
