import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { coloresAura } from '@/tema/colores';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

const GROSOR = 56;
const CAPAS = [
  [coloresAura[0], coloresAura[2], coloresAura[4]],
  [coloresAura[3], coloresAura[5], coloresAura[1]],
] as const;

export interface PropiedadesAuraDePantalla {
  /** mientras es verdadero el aura rodea la pantalla y late; al volverse falso hace un destello y se apaga */
  activa: boolean;
}

function Borde({ colores }: { colores: readonly [string, string, string] }) {
  const transparente = 'rgba(255,255,255,0)';
  return (
    <>
      <LinearGradient
        colors={[colores[0], transparente]}
        pointerEvents="none"
        style={[estilos.lado, estilos.arriba]}
      />
      <LinearGradient
        colors={[transparente, colores[1]]}
        pointerEvents="none"
        style={[estilos.lado, estilos.abajo]}
      />
      <LinearGradient
        colors={[colores[2], transparente]}
        end={{ x: 1, y: 0 }}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={[estilos.lado, estilos.izquierda]}
      />
      <LinearGradient
        colors={[transparente, colores[0]]}
        end={{ x: 1, y: 0 }}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={[estilos.lado, estilos.derecha]}
      />
    </>
  );
}

/**
 * el aura de Apple Intelligence: un resplandor de colores que rodea los bordes de la pantalla mientras la IA
 * piensa, cambia de color despacio y, al terminar, da un destello y se apaga
 */
export function AuraDePantalla({ activa }: PropiedadesAuraDePantalla) {
  const reducido = useMovimientoReducido();
  const presencia = useRef(new Animated.Value(0)).current;
  const cambio = useRef(new Animated.Value(0)).current;
  const latido = useRef(new Animated.Value(0)).current;
  const estabaActiva = useRef(false);

  useEffect(() => {
    if (reducido) {
      presencia.setValue(activa ? 0.6 : 0);
      return;
    }
    if (activa) {
      estabaActiva.current = true;
      Animated.timing(presencia, {
        duration: 450,
        toValue: 1,
        useNativeDriver: true,
      }).start();
      return;
    }
    if (estabaActiva.current) {
      // el destello de "listo": se enciende más fuerte un instante y se apaga
      estabaActiva.current = false;
      Animated.sequence([
        Animated.timing(presencia, {
          duration: 160,
          toValue: 1.6,
          useNativeDriver: true,
        }),
        Animated.timing(presencia, {
          duration: 900,
          easing: Easing.out(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [activa, presencia, reducido]);

  useEffect(() => {
    if (reducido || !activa) return;
    const cruce = Animated.loop(
      Animated.sequence([
        Animated.timing(cambio, {
          duration: 2200,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(cambio, {
          duration: 2200,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    const pulso = Animated.loop(
      Animated.sequence([
        Animated.timing(latido, {
          duration: 900,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(latido, {
          duration: 900,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    cruce.start();
    pulso.start();
    return () => {
      cruce.stop();
      pulso.stop();
    };
  }, [activa, cambio, latido, reducido]);

  const brillo = Animated.multiply(
    presencia,
    latido.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }),
  );

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      testID="aura-de-pantalla"
    >
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: brillo }]}>
        <Borde colores={CAPAS[0]} />
      </Animated.View>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { opacity: Animated.multiply(brillo, cambio) },
        ]}
      >
        <Borde colores={CAPAS[1]} />
      </Animated.View>
    </View>
  );
}

const estilos = StyleSheet.create({
  abajo: { bottom: 0, height: GROSOR, left: 0, right: 0 },
  arriba: { height: GROSOR, left: 0, right: 0, top: 0 },
  derecha: { bottom: 0, right: 0, top: 0, width: GROSOR },
  izquierda: { bottom: 0, left: 0, top: 0, width: GROSOR },
  lado: { position: 'absolute' },
});
