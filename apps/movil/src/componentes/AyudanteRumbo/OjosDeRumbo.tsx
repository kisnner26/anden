import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { conAlfa } from '@/tema/alfa';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

/** lo que se ve de la cabeza fuera del borde de la pantalla */
export const ANCHO_OJOS = 60;
export const ALTO_OJOS = 80;

export type EstadoDeOjos = 'espera' | 'habla' | 'pensando';

export interface PropiedadesOjosDeRumbo {
  alToque: () => void;
  estado: EstadoDeOjos;
  /** dónde queda el borde de arriba, en la ventana */
  y: number;
}

const PUNTOS_DE_MIRADA = [
  { x: -2.6, y: 0 },
  { x: -2, y: -2.4 },
  { x: -2.4, y: 2.4 },
  { x: 0.5, y: 0.5 },
  { x: -1, y: -2.6 },
];

/**
 * lo único que se ve de Rumbo: su cabeza asomándose por el borde derecho como si la pantalla fuera una pared, con dos
 * deditos agarrados al canto. Entra deslizándose, mira de un lado a otro, parpadea y respira; cuando piensa las pupilas
 * giran y cuando habla abre más los ojos y arquea las cejas
 */
export function OjosDeRumbo({ alToque, estado, y }: PropiedadesOjosDeRumbo) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const entrada = useRef(new Animated.Value(reducido ? 1 : 0)).current;
  const respiro = useRef(new Animated.Value(0)).current;
  const [mirada, establecerMirada] = useState(PUNTOS_DE_MIRADA[0]!);
  const [cerrados, establecerCerrados] = useState(false);
  const [vuelta, establecerVuelta] = useState(0);

  useEffect(() => {
    if (reducido) return;
    Animated.spring(entrada, {
      friction: 7,
      tension: 70,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [entrada, reducido]);

  // respira: la cabeza se asoma y se recoge un poco, sin parar
  useEffect(() => {
    if (reducido) return;
    const vaiven = Animated.loop(
      Animated.sequence([
        Animated.timing(respiro, {
          duration: 1800,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(respiro, {
          duration: 1800,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    vaiven.start();
    return () => vaiven.stop();
  }, [reducido, respiro]);

  // mira de un lado a otro y parpadea sin ritmo fijo; pensando, las pupilas dan vueltas
  useEffect(() => {
    let activo = true;
    let mover: ReturnType<typeof setTimeout>;
    let parpadear: ReturnType<typeof setTimeout>;
    const siguienteMirada = () => {
      if (!activo || estado === 'pensando') return;
      establecerMirada(
        PUNTOS_DE_MIRADA[Math.floor(Math.random() * PUNTOS_DE_MIRADA.length)]!,
      );
      mover = setTimeout(siguienteMirada, 1300 + Math.random() * 2200);
    };
    const siguienteParpadeo = () => {
      if (!activo) return;
      establecerCerrados(true);
      setTimeout(() => activo && establecerCerrados(false), 110);
      parpadear = setTimeout(siguienteParpadeo, 1800 + Math.random() * 2800);
    };
    mover = setTimeout(siguienteMirada, 900);
    parpadear = setTimeout(siguienteParpadeo, 1500);
    return () => {
      activo = false;
      clearTimeout(mover);
      clearTimeout(parpadear);
    };
  }, [estado]);

  useEffect(() => {
    if (estado !== 'pensando') return;
    const giro = setInterval(() => establecerVuelta((v) => v + 1), 120);
    return () => clearInterval(giro);
  }, [estado]);

  const pupila =
    estado === 'pensando'
      ? {
          x: Math.cos(vuelta * 0.7) * 3.4,
          y: Math.sin(vuelta * 0.7) * 3.4,
        }
      : estado === 'habla'
        ? { x: -1.6, y: 0.4 }
        : mirada;
  const alto = cerrados ? 1.4 : estado === 'habla' ? 12 : 10.5;
  const tinta = colores.tinta;
  const ojos = [21, 43] as const;

  return (
    <Animated.View
      style={[
        estilos.contenedor,
        {
          top: y,
          transform: [
            {
              translateX: Animated.add(
                entrada.interpolate({
                  inputRange: [0, 1],
                  outputRange: [ANCHO_OJOS + 6, 0],
                }),
                respiro.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 4],
                }),
              ),
            },
          ],
        },
      ]}
    >
      <Pressable
        accessibilityHint={t('mascota.asomaAyuda')}
        accessibilityLabel={t('mascota.asoma')}
        accessibilityRole="button"
        hitSlop={14}
        onPress={alToque}
      >
        <Svg height={ALTO_OJOS} viewBox="0 0 60 80" width={ANCHO_OJOS}>
          <Ellipse
            cx={60}
            cy={42}
            fill={colores.bloqueNegro}
            rx={52}
            ry={34}
            stroke={conAlfa(tinta, 0.55)}
            strokeWidth={1.6}
          />
          {ojos.map((cx) => (
            <Ellipse
              cx={cx}
              cy={38}
              fill={colores.sobreNegro}
              key={`o${cx}`}
              rx={9}
              ry={alto}
            />
          ))}
          {cerrados
            ? null
            : ojos.map((cx) => (
                <Circle
                  cx={cx + pupila.x}
                  cy={38 + pupila.y}
                  fill={colores.bloqueNegro}
                  key={`p${cx}`}
                  r={estado === 'habla' ? 4.6 : 4}
                />
              ))}
          {cerrados
            ? null
            : ojos.map((cx) => (
                <Circle
                  cx={cx + pupila.x + 1.4}
                  cy={38 + pupila.y - 1.6}
                  fill={colores.sobreNegro}
                  key={`b${cx}`}
                  r={1.2}
                />
              ))}
          {estado === 'habla'
            ? ojos.map((cx, i) => (
                <Path
                  d={
                    i === 0
                      ? `M${cx - 9} 21 Q${cx} 16 ${cx + 9} 23`
                      : `M${cx - 9} 23 Q${cx} 16 ${cx + 9} 21`
                  }
                  fill="none"
                  key={`c${cx}`}
                  stroke={colores.sobreNegro}
                  strokeLinecap="round"
                  strokeWidth={2}
                />
              ))
            : null}
          {[8, 72].map((cy) => (
            <Ellipse
              cx={54}
              cy={cy}
              fill={colores.bloqueNegro}
              key={`m${cy}`}
              rx={9}
              ry={4.5}
              stroke={conAlfa(tinta, 0.55)}
              strokeWidth={1.4}
            />
          ))}
        </Svg>
      </Pressable>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { position: 'absolute', right: 0 },
});
