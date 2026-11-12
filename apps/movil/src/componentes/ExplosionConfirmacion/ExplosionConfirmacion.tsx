import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { movimiento } from '@/tema/movimiento';
import { useTema } from '@/tema/useTema';

const TAMANO_CHISPA = 10;

function Chispa({ indice }: { indice: number }) {
  const { colores } = useTema();
  const reducir = useReducedMotion();
  const progreso = useSharedValue(0);
  const angulo = (indice / movimiento.chispas) * Math.PI * 2;
  // las chispas alternan alcance para que el círculo no se vea mecánico
  const alcance = movimiento.radioChispas * (indice % 2 === 0 ? 1 : 0.7);

  useEffect(() => {
    if (reducir) return;
    progreso.value = withDelay(
      movimiento.confirmacionReserva / 2,
      withTiming(1, { duration: movimiento.chispa }),
    );
  }, [progreso, reducir]);

  const estilo = useAnimatedStyle(() => ({
    opacity: 1 - progreso.value,
    transform: [
      { translateX: Math.cos(angulo) * alcance * progreso.value },
      { translateY: Math.sin(angulo) * alcance * progreso.value },
      { scale: 1 - progreso.value * 0.6 },
    ],
  }));

  return (
    <Animated.View
      style={[
        estilos.chispa,
        { backgroundColor: indice % 2 === 0 ? colores.ambar : colores.tinta },
        estilo,
      ]}
    />
  );
}

function Anillo({ demora }: { demora: number }) {
  const { colores } = useTema();
  const reducir = useReducedMotion();
  const progreso = useSharedValue(0);

  useEffect(() => {
    if (reducir) return;
    progreso.value = withDelay(
      demora,
      withTiming(1, { duration: movimiento.pulsoConfirmacion }),
    );
  }, [demora, progreso, reducir]);

  const estilo = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - progreso.value),
    transform: [{ scale: 0.7 + progreso.value * 1.5 }],
  }));

  return (
    <Animated.View
      style={[estilos.anillo, { borderColor: colores.ambar }, estilo]}
    />
  );
}

/** anillos que laten y chispas que salen del centro; no dibuja nada con "reducir movimiento" */
export function ExplosionConfirmacion() {
  const reducir = useReducedMotion();
  if (reducir) return null;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={estilos.centro}
      testID="explosion-confirmacion"
    >
      <Anillo demora={0} />
      <Anillo demora={movimiento.confirmacionReserva / 3} />
      {Array.from({ length: movimiento.chispas }, (_, indice) => (
        <Chispa indice={indice} key={indice} />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  anillo: {
    borderRadius: 999,
    borderWidth: 3,
    height: 120,
    position: 'absolute',
    width: 120,
  },
  centro: {
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleSheet.absoluteFill,
  },
  chispa: {
    borderRadius: 999,
    height: TAMANO_CHISPA,
    position: 'absolute',
    width: TAMANO_CHISPA,
  },
});
