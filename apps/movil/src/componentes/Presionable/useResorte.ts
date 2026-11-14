import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';

import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

/**
 * el resorte de un control: al apretar se hunde rápido y al soltar vuelve con un pequeño rebote, como
 * una pieza de barro blando. Se aplica con el estilo devuelto a un Animated.View
 */
export function useResorte(escalaPresionada = 0.95) {
  const reducido = useMovimientoReducido();
  const escala = useRef(new Animated.Value(1)).current;

  const alApretar = useCallback(() => {
    if (reducido) return;
    Animated.spring(escala, {
      bounciness: 0,
      speed: 60,
      toValue: escalaPresionada,
      useNativeDriver: true,
    }).start();
  }, [escala, escalaPresionada, reducido]);

  const alSoltar = useCallback(() => {
    if (reducido) return;
    Animated.spring(escala, {
      friction: 3.4,
      tension: 190,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [escala, reducido]);

  return { alApretar, alSoltar, estilo: { transform: [{ scale: escala }] } };
}
