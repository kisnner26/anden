import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Rect } from 'react-native-svg';

import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export const ANCHO_OJOS = 64;
export const ALTO_OJOS = 46;

export interface PropiedadesOjosQueAsoman {
  alToque: () => void;
  /** dónde queda el borde de arriba, en la ventana */
  y: number;
}

/**
 * solo los ojos de Rumbo y un pedazo de su cuerpo asomándose por el borde derecho de la pantalla: se deslizan hacia
 * adentro, miran hacia el contenido, parpadean y esperan a que la persona los toque
 */
export function OjosQueAsoman({ alToque, y }: PropiedadesOjosQueAsoman) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const entrada = useRef(new Animated.Value(reducido ? 1 : 0)).current;
  const [mirada, establecerMirada] = useState({ x: -2.5, y: 0 });
  const [cerrados, establecerCerrados] = useState(false);

  useEffect(() => {
    if (reducido) return;
    Animated.spring(entrada, {
      friction: 7,
      tension: 70,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [entrada, reducido]);

  // mira de un lado a otro y parpadea sin ritmo fijo, como quien espera que lo vean
  useEffect(() => {
    let activo = true;
    let espera: ReturnType<typeof setTimeout>;
    const puntos = [
      { x: -2.5, y: 0 },
      { x: -2, y: -2 },
      { x: -2.5, y: 2 },
      { x: 0, y: 0 },
    ];
    const mover = () => {
      if (!activo) return;
      establecerMirada(puntos[Math.floor(Math.random() * puntos.length)]!);
      espera = setTimeout(mover, 1200 + Math.random() * 1800);
    };
    const parpadear = () => {
      if (!activo) return;
      establecerCerrados(true);
      setTimeout(() => activo && establecerCerrados(false), 120);
      setTimeout(parpadear, 1800 + Math.random() * 2600);
    };
    espera = setTimeout(mover, 900);
    const p = setTimeout(parpadear, 1400);
    return () => {
      activo = false;
      clearTimeout(espera);
      clearTimeout(p);
    };
  }, []);

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
                outputRange: [ANCHO_OJOS, 0],
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
        hitSlop={12}
        onPress={alToque}
      >
        <Svg height={ALTO_OJOS} viewBox="0 0 64 46" width={ANCHO_OJOS}>
          <Rect
            fill={colores.ambar}
            height={44}
            rx={16}
            stroke={colores.ambarProfundo}
            strokeWidth={2.5}
            width={60}
            x={14}
            y={1}
          />
          <Rect
            fill={colores.bloqueNegro}
            height={28}
            rx={10}
            width={50}
            x={18}
            y={8}
          />
          {[30, 48].map((cx) => (
            <Circle
              cx={cx}
              cy={22}
              fill={colores.sobreNegro}
              key={cx}
              r={cerrados ? 0.1 : 7.5}
            />
          ))}
          {[30, 48].map((cx) =>
            cerrados ? (
              <Ellipse
                cx={cx}
                cy={22}
                fill={colores.sobreNegro}
                key={`p${cx}`}
                rx={7.5}
                ry={1}
              />
            ) : (
              <Circle
                cx={cx + mirada.x}
                cy={22 + mirada.y}
                fill={colores.bloqueNegro}
                key={`p${cx}`}
                r={3.4}
              />
            ),
          )}
        </Svg>
      </Pressable>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { position: 'absolute', right: 0 },
});
