import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { coloresAura } from '@/tema/colores';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useAppActiva } from '@/tema/useAppActiva';

interface Satelite {
  /** cuánto tarda en dar una vuelta, en milisegundos, a ritmo 1 */
  duracion: number;
  /** a qué distancia del centro, como proporción del tamaño del orbe */
  radio: number;
  /** de qué color, un índice de la paleta del aura */
  color: number;
  /** el diámetro, como proporción del tamaño del orbe */
  grosor: number;
  /** en qué punto de la órbita arranca, de 0 a 1 */
  fase: number;
}

const SATELITES: readonly Satelite[] = [
  { color: 1, duracion: 5200, fase: 0, grosor: 0.1, radio: 0.74 },
  { color: 5, duracion: 7600, fase: 0.4, grosor: 0.07, radio: 0.86 },
  { color: 2, duracion: 3800, fase: 0.7, grosor: 0.06, radio: 0.66 },
];

function Orbita({
  actual,
  ritmo,
  satelite,
  tamano,
}: {
  actual: boolean;
  ritmo: number;
  satelite: Satelite;
  tamano: number;
}) {
  const reducido = useMovimientoReducido();
  const activa = useAppActiva();
  const vuelta = useRef(new Animated.Value(satelite.fase)).current;

  useEffect(() => {
    if (reducido || !activa) return;
    vuelta.setValue(satelite.fase);
    const bucle = Animated.loop(
      Animated.timing(vuelta, {
        duration: satelite.duracion / ritmo,
        easing: Easing.linear,
        toValue: satelite.fase + 1,
        useNativeDriver: true,
      }),
    );
    bucle.start();
    return () => bucle.stop();
  }, [activa, reducido, ritmo, satelite, vuelta]);

  const diametro = tamano * satelite.grosor;
  const lado = tamano * satelite.radio * 2;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        estilos.orbita,
        {
          height: lado,
          opacity: actual ? 1 : 0.45,
          transform: [
            {
              rotate: vuelta.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
          width: lado,
        },
      ]}
    >
      <View
        style={{
          backgroundColor: coloresAura[satelite.color],
          borderRadius: diametro,
          height: diametro,
          left: lado / 2 - diametro / 2,
          position: 'absolute',
          shadowColor: coloresAura[satelite.color],
          shadowOpacity: 0.9,
          shadowRadius: diametro,
          top: 0,
          width: diametro,
        }}
      />
    </Animated.View>
  );
}

/**
 * pequeñas luces que giran alrededor del orbe a distintas distancias y velocidades; con la IA pensando o
 * hablando giran más rápido y se ven fuertes, en reposo se quedan suaves
 */
export function Satelites({
  actual,
  ritmo,
  tamano,
}: {
  actual: boolean;
  ritmo: number;
  tamano: number;
}) {
  return (
    <View pointerEvents="none" style={estilos.contenedor}>
      {SATELITES.map((satelite) => (
        <Orbita
          actual={actual}
          key={satelite.color}
          ritmo={ritmo}
          satelite={satelite}
          tamano={tamano}
        />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleSheet.absoluteFill,
  },
  orbita: { position: 'absolute' },
});
