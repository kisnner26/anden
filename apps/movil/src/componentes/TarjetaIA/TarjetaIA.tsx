import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { coloresAura } from '@/tema/colores';
import { radios } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';

export interface PropiedadesTarjetaIA {
  children: ReactNode;
  /** el marco se mueve más rápido mientras la IA trabaja */
  trabajando?: boolean;
}

/** un marco con el aura de la IA que da vueltas alrededor del contenido; marca lo que genera el modelo */
export function TarjetaIA({
  children,
  trabajando = false,
}: PropiedadesTarjetaIA) {
  const { colores } = useTema();
  const reducir = useMovimientoReducido();
  const giro = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducir) return;
    const vuelta = Animated.loop(
      Animated.timing(giro, {
        duration: movimiento.giroOrbe * (trabajando ? 1 : 2),
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    vuelta.start();
    return () => vuelta.stop();
  }, [giro, reducir, trabajando]);

  const rotar = giro.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={estilos.marco}>
      <View style={estilos.recorte}>
        <Animated.View
          style={[estilos.giratorio, { transform: [{ rotate: rotar }] }]}
        >
          <LinearGradient
            colors={[...coloresAura, coloresAura[0]]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
      <View style={[estilos.contenido, { backgroundColor: colores.fondo }]}>
        {children}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: { borderRadius: radios.loseta - 2, margin: 2 },
  giratorio: {
    alignSelf: 'center',
    height: 900,
    position: 'absolute',
    top: -300,
    width: 900,
  },
  marco: { borderRadius: radios.loseta, overflow: 'hidden' },
  recorte: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
});
