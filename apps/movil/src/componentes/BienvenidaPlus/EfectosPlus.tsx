import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';

const RAYOS = 14;
const LADO = 340;

/** una corona de rayos que sale detrás del sello y gira despacio, como un sello de premio */
export function RayosPlus() {
  const { colores } = useTema();
  const reducir = useMovimientoReducido();
  const aparicion = useSharedValue(reducir ? 1 : 0);
  const giro = useSharedValue(0);

  useEffect(() => {
    if (reducir) return;
    aparicion.value = withDelay(350, withTiming(1, { duration: 1100 }));
    giro.value = withRepeat(
      withTiming(360, { duration: 24_000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [aparicion, giro, reducir]);

  const estilo = useAnimatedStyle(() => ({
    opacity: aparicion.value * 0.7,
    transform: [
      { scale: 0.55 + aparicion.value * 0.45 },
      { rotate: `${giro.value}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[estilos.rayos, estilo]}
      testID="rayos-plus"
    >
      {Array.from({ length: RAYOS }, (_, i) => (
        <LinearGradient
          colors={[colores.ambar, 'transparent']}
          key={i}
          style={[
            estilos.rayo,
            {
              transform: [{ rotate: `${(i * 360) / RAYOS}deg` }],
            },
          ]}
        />
      ))}
    </Animated.View>
  );
}

function Anillo({ demora }: { demora: number }) {
  const { colores } = useTema();
  const reducir = useMovimientoReducido();
  const progreso = useSharedValue(0);

  useEffect(() => {
    if (reducir) return;
    progreso.value = withDelay(
      demora,
      withRepeat(
        withTiming(1, { duration: 2600, easing: Easing.out(Easing.cubic) }),
        -1,
        false,
      ),
    );
  }, [demora, progreso, reducir]);

  const estilo = useAnimatedStyle(() => ({
    opacity: reducir ? 0 : (1 - progreso.value) * 0.5,
    transform: [{ scale: 0.7 + progreso.value * 1.9 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[estilos.anillo, { borderColor: colores.ambar }, estilo]}
    />
  );
}

/** ondas que salen del sello una tras otra, como un latido */
export function AnillosPlus() {
  return (
    <View pointerEvents="none" style={estilos.centro}>
      {[0, 800, 1600].map((demora) => (
        <Anillo demora={demora} key={demora} />
      ))}
    </View>
  );
}

const POSICIONES = [
  { demora: 0, x: -118, y: -92 },
  { demora: 420, x: 124, y: -70 },
  { demora: 900, x: -136, y: 28 },
  { demora: 250, x: 138, y: 54 },
  { demora: 1300, x: -64, y: 116 },
  { demora: 700, x: 78, y: -126 },
  { demora: 1100, x: 22, y: 128 },
  { demora: 560, x: -92, y: -132 },
] as const;

function Destello({ demora, x, y }: { demora: number; x: number; y: number }) {
  const { colores } = useTema();
  const reducir = useMovimientoReducido();
  const brillo = useSharedValue(0);

  useEffect(() => {
    if (reducir) return;
    brillo.value = withDelay(
      900 + demora,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 520 }),
          withTiming(0, { duration: 520 }),
          withTiming(0, { duration: 900 }),
        ),
        -1,
        false,
      ),
    );
  }, [brillo, demora, reducir]);

  const estilo = useAnimatedStyle(() => ({
    opacity: reducir ? 0 : brillo.value,
    transform: [
      { translateX: x },
      { translateY: y },
      { scale: 0.3 + brillo.value * 0.9 },
      { rotate: `${45 + brillo.value * 90}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[estilos.destello, { backgroundColor: colores.ambar }, estilo]}
    />
  );
}

/** puntos de luz que se encienden y apagan alrededor del sello */
export function DestellosPlus() {
  return (
    <View pointerEvents="none" style={estilos.centro}>
      {POSICIONES.map((posicion) => (
        <Destello key={`${posicion.x}${posicion.y}`} {...posicion} />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  anillo: {
    borderRadius: 999,
    borderWidth: 2,
    height: 160,
    position: 'absolute',
    width: 160,
  },
  centro: {
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleSheet.absoluteFill,
  },
  destello: { borderRadius: 2, height: 10, position: 'absolute', width: 10 },
  rayo: {
    height: LADO / 2,
    left: LADO / 2 - 6,
    position: 'absolute',
    top: 0,
    transformOrigin: '50% 100%',
    width: 12,
  },
  rayos: { height: LADO, position: 'absolute', width: LADO },
});
