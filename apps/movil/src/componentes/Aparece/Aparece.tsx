import { useEffect, useRef, type ReactNode } from 'react';
import { Animated } from 'react-native';

import { espacios } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

export interface PropiedadesAparece {
  children: ReactNode;
  /** posición en la lista; cada una entra un poco después que la anterior */
  indice?: number;
}

/** entrada suave: aparece y sube unos puntos; sin movimiento si el modo lo pide. */
export function Aparece({ children, indice = 0 }: PropiedadesAparece) {
  const reducido = useMovimientoReducido();
  const avance = useRef(new Animated.Value(reducido ? 1 : 0)).current;

  useEffect(() => {
    if (reducido) {
      avance.setValue(1);
      return;
    }
    const animacion = Animated.timing(avance, {
      delay: Math.min(indice, movimiento.maximoEscalon) * movimiento.escalon,
      duration: movimiento.entradaPantalla,
      toValue: 1,
      useNativeDriver: true,
    });
    animacion.start();
    return () => animacion.stop();
  }, [avance, indice, reducido]);

  return (
    <Animated.View
      style={{
        opacity: avance,
        transform: [
          {
            translateY: avance.interpolate({
              inputRange: [0, 1],
              outputRange: [espacios.dieciseis, 0],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}
