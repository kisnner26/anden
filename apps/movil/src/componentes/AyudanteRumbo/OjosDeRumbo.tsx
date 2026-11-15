import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { conAlfa } from '@/tema/alfa';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export const ANCHO_OJOS = 76;
export const ALTO_OJOS = 40;

export type EstadoDeOjos = 'espera' | 'habla' | 'pensando';

export interface PropiedadesOjosDeRumbo {
  alToque: () => void;
  estado: EstadoDeOjos;
  /** dónde queda el borde de arriba, en la ventana */
  y: number;
}

const PUNTOS_DE_MIRADA = [
  { x: -3.2, y: 0 },
  { x: -2.4, y: -2.6 },
  { x: -3, y: 2.4 },
  { x: 0.5, y: 0 },
  { x: -1, y: -3 },
];

/**
 * lo único que se ve de Rumbo: sus ojos. Entran deslizándose desde el borde derecho, miran de un lado a otro, parpadean y
 * esperan; cuando piensan las pupilas giran y cuando hablan se abren un poco más y arquean las cejas
 */
export function OjosDeRumbo({ alToque, estado, y }: PropiedadesOjosDeRumbo) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const entrada = useRef(new Animated.Value(reducido ? 1 : 0)).current;
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
  const alto = cerrados ? 1.6 : estado === 'habla' ? 15 : 13;
  const tinta = colores.tinta;
  const ojos = [20, 56] as const;

  return (
    <Animated.View
      style={[
        estilos.contenedor,
        {
          top: y,
          transform: [
            {
              translateX: entrada.interpolate({
                inputRange: [0, 1],
                outputRange: [ANCHO_OJOS + 20, 0],
              }),
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
        <Svg height={ALTO_OJOS} viewBox="0 0 76 40" width={ANCHO_OJOS}>
          {ojos.map((cx) => (
            <Ellipse
              cx={cx}
              cy={24}
              fill={conAlfa(tinta, 0.18)}
              key={`s${cx}`}
              rx={15}
              ry={3}
            />
          ))}
          {ojos.map((cx) => (
            <Ellipse
              cx={cx}
              cy={20}
              fill={colores.sobreNegro}
              key={`o${cx}`}
              rx={15}
              ry={alto}
              stroke={conAlfa(tinta, 0.55)}
              strokeWidth={1.6}
            />
          ))}
          {cerrados
            ? null
            : ojos.map((cx) => (
                <Circle
                  cx={cx + pupila.x}
                  cy={20 + pupila.y}
                  fill={colores.bloqueNegro}
                  key={`p${cx}`}
                  r={estado === 'habla' ? 7 : 6.2}
                />
              ))}
          {cerrados
            ? null
            : ojos.map((cx) => (
                <Circle
                  cx={cx + pupila.x + 2}
                  cy={20 + pupila.y - 2.2}
                  fill={colores.sobreNegro}
                  key={`b${cx}`}
                  r={1.7}
                />
              ))}
          {estado === 'habla'
            ? ojos.map((cx, i) => (
                <Path
                  d={
                    i === 0
                      ? `M${cx - 12} 3 Q${cx} -1 ${cx + 12} 5`
                      : `M${cx - 12} 5 Q${cx} -1 ${cx + 12} 3`
                  }
                  fill="none"
                  key={`c${cx}`}
                  stroke={tinta}
                  strokeLinecap="round"
                  strokeWidth={2.2}
                />
              ))
            : null}
        </Svg>
      </Pressable>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { position: 'absolute', right: 6 },
});
