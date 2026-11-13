import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { coloresAura } from '@/tema/colores';
import { movimiento } from '@/tema/movimiento';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

export interface PropiedadesChispas {
  /** cuántas estrellas titilan alrededor */
  cantidad?: number;
  tamano?: number;
}

/** posiciones fijas dentro de un cuadrado de 0 a 1, para que no salten entre dibujos */
const PUESTOS = [
  { x: 0.08, y: 0.18 },
  { x: 0.86, y: 0.1 },
  { x: 0.94, y: 0.62 },
  { x: 0.5, y: 0.96 },
  { x: 0.04, y: 0.72 },
  { x: 0.62, y: 0.02 },
] as const;

function Estrella({
  color,
  demora,
  reducir,
  tamano,
}: {
  color: string;
  demora: number;
  reducir: boolean;
  tamano: number;
}) {
  const brillo = useRef(new Animated.Value(reducir ? 1 : 0)).current;

  useEffect(() => {
    if (reducir) return;
    const ciclo = Animated.loop(
      Animated.sequence([
        Animated.delay(demora),
        Animated.timing(brillo, {
          duration: movimiento.titilarChispa / 2,
          easing: Easing.out(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(brillo, {
          duration: movimiento.titilarChispa / 2,
          easing: Easing.in(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    ciclo.start();
    return () => ciclo.stop();
  }, [brillo, demora, reducir]);

  const grosor = Math.max(2, tamano / 6);
  const escala = brillo.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });
  return (
    <Animated.View
      style={{
        height: tamano,
        opacity: brillo,
        transform: [{ scale: escala }, { rotate: '0deg' }],
        width: tamano,
      }}
    >
      <View
        style={[
          estilos.brazo,
          {
            backgroundColor: color,
            height: grosor,
            top: (tamano - grosor) / 2,
            width: tamano,
          },
        ]}
      />
      <View
        style={[
          estilos.brazo,
          {
            backgroundColor: color,
            height: tamano,
            left: (tamano - grosor) / 2,
            width: grosor,
          },
        ]}
      />
    </Animated.View>
  );
}

/** estrellas de cuatro puntas que titilan en desorden alrededor de lo que genera la IA */
export function Chispas({ cantidad = 5, tamano = 120 }: PropiedadesChispas) {
  const reducir = useMovimientoReducido();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[estilos.caja, { height: tamano, width: tamano }]}
    >
      {PUESTOS.slice(0, cantidad).map((puesto, indice) => (
        <View
          key={indice}
          style={{
            left: puesto.x * tamano - 7,
            position: 'absolute',
            top: puesto.y * tamano - 7,
          }}
        >
          <Estrella
            color={coloresAura[indice % coloresAura.length] ?? coloresAura[0]}
            demora={indice * 330}
            reducir={reducir}
            tamano={indice % 2 === 0 ? 14 : 10}
          />
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  brazo: { borderRadius: 2, position: 'absolute' },
  caja: { position: 'absolute' },
});
