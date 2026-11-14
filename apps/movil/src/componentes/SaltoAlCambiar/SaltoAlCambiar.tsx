import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

import { movimiento } from '@/tema/movimiento';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

export interface PropiedadesSaltoAlCambiar {
  children: ReactNode;
  estilo?: StyleProp<ViewStyle>;
  /** cada vez que cambia, el contenido da un pequeño salto */
  valor: number | string | null;
}

/** hace que una cifra "se note" al cambiar: crece un poco y vuelve; no salta la primera vez */
export function SaltoAlCambiar({
  children,
  estilo,
  valor,
}: PropiedadesSaltoAlCambiar) {
  const reducido = useMovimientoReducido();
  const escala = useRef(new Animated.Value(1)).current;
  const anterior = useRef(valor);

  useEffect(() => {
    if (anterior.current === valor) return;
    anterior.current = valor;
    if (reducido) return;
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
  }, [escala, reducido, valor]);

  return (
    <Animated.View style={[estilo, { transform: [{ scale: escala }] }]}>
      {children}
    </Animated.View>
  );
}
