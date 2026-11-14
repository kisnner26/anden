import { Animated, Pressable, type PressableProps } from 'react-native';

import { useSensaciones } from '@/datos/useSensaciones';
import type { Sensacion } from '@/datos/sensaciones';

import { useResorte } from './useResorte';

export interface PropiedadesPresionable extends PressableProps {
  /** qué tanto se achica al apretarlo; por defecto un poco */
  escala?: number;
  /** vibración y sonido al tocar; por defecto un toque ligero */
  sensacion?: Sensacion;
}

/**
 * un Pressable cuyo contenido se hunde al apretarlo y rebota al soltarlo, con la vibración de la app; el
 * estilo del Pressable no cambia, solo lo de adentro se mueve
 */
export function Presionable({
  children,
  escala = 0.96,
  onPress,
  onPressIn,
  onPressOut,
  sensacion = 'toque',
  ...resto
}: PropiedadesPresionable) {
  const resorte = useResorte(escala);
  const sentir = useSensaciones();

  return (
    <Pressable
      {...resto}
      onPress={(evento) => {
        sentir(sensacion);
        onPress?.(evento);
      }}
      onPressIn={(evento) => {
        resorte.alApretar();
        onPressIn?.(evento);
      }}
      onPressOut={(evento) => {
        resorte.alSoltar();
        onPressOut?.(evento);
      }}
    >
      {(estado) => (
        <Animated.View style={resorte.estilo}>
          {typeof children === 'function' ? children(estado) : children}
        </Animated.View>
      )}
    </Pressable>
  );
}
