import { useEffect, useRef, type ReactNode } from 'react';
import { Animated } from 'react-native';

import { movimiento } from '@/tema/movimiento';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

export interface PropiedadesCampaneo {
  /** mientras es true el contenido se balancea como una campana */
  activo: boolean;
  children: ReactNode;
}

/** balanceo corto y repetido para llamar la atención sin cansar; quieto si el modo lo pide. */
export function Campaneo({ activo, children }: PropiedadesCampaneo) {
  const reducido = useMovimientoReducido();
  const giro = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!activo || reducido) {
      giro.setValue(0);
      return;
    }
    const mitad = movimiento.campaneo / 2;
    const paso = (valor: number) =>
      Animated.timing(giro, {
        duration: mitad,
        toValue: valor,
        useNativeDriver: true,
      });
    const animacion = Animated.loop(
      Animated.sequence([
        paso(1),
        paso(-1),
        paso(0.6),
        paso(-0.6),
        paso(0),
        Animated.delay(movimiento.pausaCampaneo),
      ]),
    );
    animacion.start();
    return () => animacion.stop();
  }, [activo, giro, reducido]);

  return (
    <Animated.View
      style={{
        transform: [
          {
            rotate: giro.interpolate({
              inputRange: [-1, 1],
              outputRange: [
                `-${movimiento.anguloCampaneo}deg`,
                `${movimiento.anguloCampaneo}deg`,
              ],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}
