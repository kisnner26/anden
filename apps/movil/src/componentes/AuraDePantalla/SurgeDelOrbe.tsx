import { useEffect, useRef, type ReactNode } from 'react';
import { Animated } from 'react-native';

import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

export interface PropiedadesSurgeDelOrbe {
  children: ReactNode;
}

/**
 * la respuesta aparece como si saliera del orbe: nace chiquita en la esquina de arriba, crece con un
 * resorte hasta su tamaño y se aclara, para que la tarjeta parezca hecha de la misma luz
 */
export function SurgeDelOrbe({ children }: PropiedadesSurgeDelOrbe) {
  const reducido = useMovimientoReducido();
  const avance = useRef(new Animated.Value(reducido ? 1 : 0)).current;

  useEffect(() => {
    if (reducido) return;
    Animated.spring(avance, {
      friction: 7,
      tension: 80,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [avance, reducido]);

  return (
    <Animated.View
      style={{
        opacity: avance.interpolate({
          extrapolate: 'clamp',
          inputRange: [0, 0.4],
          outputRange: [0, 1],
        }),
        transform: [
          {
            scale: avance.interpolate({
              inputRange: [0, 1],
              outputRange: [0.55, 1],
            }),
          },
          {
            translateY: avance.interpolate({
              inputRange: [0, 1],
              outputRange: [-26, 0],
            }),
          },
        ],
        transformOrigin: 'left top',
      }}
    >
      {children}
    </Animated.View>
  );
}
