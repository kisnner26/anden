import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

import { movimiento } from '@/tema/movimiento';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

export interface PropiedadesRebote {
  /** al pasar a true el contenido da un pequeño salto */
  activo: boolean;
  children: ReactNode;
  estilo?: StyleProp<ViewStyle>;
}

/** salto breve al activarse; sin movimiento si el modo lo pide. */
export function Rebote({ activo, children, estilo }: PropiedadesRebote) {
  const reducido = useMovimientoReducido();
  const escala = useRef(new Animated.Value(1)).current;
  const primera = useRef(true);

  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    if (!activo || reducido) {
      escala.setValue(1);
      return;
    }
    const animacion = Animated.sequence([
      Animated.timing(escala, {
        duration: movimiento.toque / 2,
        toValue: movimiento.escalaRebote,
        useNativeDriver: true,
      }),
      Animated.spring(escala, {
        friction: 4,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]);
    animacion.start();
    return () => animacion.stop();
  }, [activo, escala, reducido]);

  return (
    <Animated.View style={[estilo, { transform: [{ scale: escala }] }]}>
      {children}
    </Animated.View>
  );
}
