import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { movimiento } from '@/tema/movimiento';
import { useTema } from '@/tema/useTema';

const BOCANADAS = 5;

export interface PropiedadesHumoEscape {
  /** con el arranque el humo sale más rápido, más grande y más denso */
  arranque?: boolean;
  /** diámetro base de cada bocanada */
  tamano: number;
}

interface PropiedadesBocanada {
  arranque: boolean;
  indice: number;
  tamano: number;
}

function Bocanada({ arranque, indice, tamano }: PropiedadesBocanada) {
  const { colores } = useTema();
  const avance = useSharedValue(0);
  const ciclo = arranque ? movimiento.humoArranque : movimiento.humoCiclo;

  useEffect(() => {
    avance.value = 0;
    avance.value = withRepeat(
      withDelay(
        (ciclo / BOCANADAS) * indice,
        withTiming(1, { duration: ciclo, easing: Easing.out(Easing.quad) }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(avance);
  }, [avance, ciclo, indice]);

  const estilo = useAnimatedStyle(() => ({
    opacity: (1 - avance.value) * (arranque ? 0.7 : 0.5),
    transform: [
      { translateX: -avance.value * tamano * (arranque ? 5.5 : 3.4) },
      { translateY: -avance.value * tamano * (arranque ? 1.4 : 2.2) },
      { scale: 0.45 + avance.value * (arranque ? 2.6 : 1.7) },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        estilos.bocanada,
        {
          backgroundColor: arranque ? colores.tintaSuave : colores.linea,
          borderRadius: tamano,
          height: tamano,
          width: tamano,
        },
        estilo,
      ]}
    />
  );
}

/** nubes de humo que salen del escape y se disuelven hacia atrás; el contenedor se coloca en la cola del bus */
export function HumoEscape({
  arranque = false,
  tamano,
}: PropiedadesHumoEscape) {
  return (
    <>
      {Array.from({ length: BOCANADAS }, (_, indice) => (
        <Bocanada
          arranque={arranque}
          indice={indice}
          key={indice}
          tamano={tamano}
        />
      ))}
    </>
  );
}

const estilos = StyleSheet.create({
  bocanada: { left: 0, position: 'absolute', top: 0 },
});
