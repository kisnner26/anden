import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { coloresIA } from '@/tema/colores';
import { movimiento } from '@/tema/movimiento';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

function Punto({ indice, reducir }: { indice: number; reducir: boolean }) {
  const valor = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducir) return;
    const ciclo = Animated.loop(
      Animated.sequence([
        Animated.delay(indice * (movimiento.puntoPensando / 2)),
        Animated.timing(valor, {
          duration: movimiento.puntoPensando,
          easing: Easing.out(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(valor, {
          duration: movimiento.puntoPensando,
          easing: Easing.in(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.delay((2 - indice) * (movimiento.puntoPensando / 2)),
      ]),
    );
    ciclo.start();
    return () => ciclo.stop();
  }, [indice, reducir, valor]);

  return (
    <Animated.View
      style={[
        estilos.punto,
        {
          backgroundColor: coloresIA[indice % coloresIA.length],
          opacity: reducir
            ? 1
            : valor.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
          transform: [
            {
              translateY: valor.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -6],
              }),
            },
          ],
        },
      ]}
    />
  );
}

/** tres puntos de colores que suben y bajan mientras el modelo piensa */
export function PuntosPensando() {
  const reducir = useMovimientoReducido();
  return (
    <View accessibilityElementsHidden style={estilos.fila}>
      {[0, 1, 2].map((indice) => (
        <Punto indice={indice} key={indice} reducir={reducir} />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { alignItems: 'center', flexDirection: 'row', gap: 6, height: 20 },
  punto: { borderRadius: 5, height: 10, width: 10 },
});
