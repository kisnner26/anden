import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { conAlfa } from '@/tema/alfa';
import { movimiento } from '@/tema/movimiento';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';

export interface PropiedadesBarridoDeLuz {
  /** milisegundos de espera antes de pasar la luz */
  retraso?: number;
  radio: number;
}

/** una franja de luz que cruza la superficie una vez, como el brillo de una tarjeta; no tapa los toques */
export function BarridoDeLuz({ radio, retraso = 0 }: PropiedadesBarridoDeLuz) {
  const reducido = useMovimientoReducido();
  const { colores } = useTema();
  const avance = useRef(new Animated.Value(0)).current;
  const [ancho, establecerAncho] = useState(0);

  useEffect(() => {
    if (reducido || ancho === 0) return;
    const animacion = Animated.timing(avance, {
      delay: retraso,
      duration: movimiento.barridoLuz,
      toValue: 1,
      useNativeDriver: true,
    });
    animacion.start();
    return () => animacion.stop();
  }, [ancho, avance, reducido, retraso]);

  if (reducido) return null;

  return (
    <View
      onLayout={(evento) => establecerAncho(evento.nativeEvent.layout.width)}
      pointerEvents="none"
      style={[estilos.marco, { borderRadius: radio }]}
      testID="barrido-de-luz"
    >
      <Animated.View
        style={[
          estilos.franja,
          {
            transform: [
              {
                translateX: avance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-ancho * 0.5, ancho * 1.2],
                }),
              },
              { skewX: '-18deg' },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[
            conAlfa(colores.luzRelieve, 0),
            conAlfa(colores.luzRelieve, 0.22),
            conAlfa(colores.luzRelieve, 0),
          ]}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 0 }}
          style={estilos.relleno}
        />
      </Animated.View>
    </View>
  );
}

const estilos = StyleSheet.create({
  franja: { bottom: 0, position: 'absolute', top: 0, width: 80 },
  marco: {
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  relleno: { flex: 1 },
});
