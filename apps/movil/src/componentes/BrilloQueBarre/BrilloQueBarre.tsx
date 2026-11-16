import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { conAlfa } from '@/tema/alfa';
import { paletaPasaporte } from '@/tema/colores';
import { movimiento } from '@/tema/movimiento';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useAppActiva } from '@/tema/useAppActiva';

export interface PropiedadesBrilloQueBarre {
  /** pausa antes de cada barrido, en milisegundos */
  pausa?: number;
  /** cuánto se retrasa el primer barrido */
  retardo?: number;
}

/**
 * una franja de luz diagonal que cruza el elemento de lado a lado y espera un rato: da la sensación de lámina
 * metálica o de holograma. Va dentro de un contenedor con `overflow: hidden`; sin movimiento no se dibuja
 */
export function BrilloQueBarre({
  pausa = 2600,
  retardo = 0,
}: PropiedadesBrilloQueBarre) {
  const reducido = useMovimientoReducido();
  const activa = useAppActiva();
  const avance = useRef(new Animated.Value(0)).current;
  const [ancho, establecerAncho] = useState(0);

  useEffect(() => {
    if (reducido || !activa || ancho === 0) return;
    const bucle = Animated.loop(
      Animated.sequence([
        Animated.delay(retardo),
        Animated.timing(avance, {
          duration: movimiento.brilloMedalla,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.delay(pausa),
        Animated.timing(avance, {
          duration: 0,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    bucle.start();
    return () => bucle.stop();
  }, [activa, ancho, avance, pausa, reducido, retardo]);

  if (reducido) return null;
  return (
    <Animated.View
      onLayout={(e) => establecerAncho(e.nativeEvent.layout.width)}
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          transform: [
            {
              translateX: avance.interpolate({
                inputRange: [0, 1],
                outputRange: [-ancho, ancho],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={[
          'transparent',
          conAlfa(paletaPasaporte.oroClaro, 0.4),
          'transparent',
        ]}
        end={{ x: 1, y: 0.2 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}
