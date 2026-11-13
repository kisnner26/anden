import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { coloresAura, coloresOro } from '@/tema/colores';
import { movimiento } from '@/tema/movimiento';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

export type ModoBorde = 'apagado' | 'hablando' | 'pensando';

export interface PropiedadesBordeLuminoso {
  /** colores del aura mientras piensa o escucha, dorado mientras habla */
  modo: ModoBorde;
}

const GROSOR = 46;
const AURA_A = [coloresAura[0], coloresAura[2], coloresAura[1]] as const;
const AURA_B = [coloresAura[4], coloresAura[5], coloresAura[3]] as const;
const ORO_A = [coloresOro[0], coloresOro[1], coloresOro[2]] as const;
const ORO_B = [coloresOro[3], coloresOro[4], coloresOro[5]] as const;

function Borde({
  colores,
  lado,
}: {
  colores: readonly [string, string, string];
  lado: 'abajo' | 'arriba' | 'derecha' | 'izquierda';
}) {
  const vertical = lado === 'arriba' || lado === 'abajo';
  const inicio =
    lado === 'arriba'
      ? { x: 0.5, y: 0 }
      : lado === 'abajo'
        ? { x: 0.5, y: 1 }
        : lado === 'izquierda'
          ? { x: 0, y: 0.5 }
          : { x: 1, y: 0.5 };
  const fin =
    lado === 'arriba'
      ? { x: 0.5, y: 1 }
      : lado === 'abajo'
        ? { x: 0.5, y: 0 }
        : lado === 'izquierda'
          ? { x: 1, y: 0.5 }
          : { x: 0, y: 0.5 };
  return (
    <LinearGradient
      colors={[`${colores[0]}CC`, `${colores[1]}66`, `${colores[2]}00`]}
      end={fin}
      start={inicio}
      style={[
        estilos.borde,
        vertical
          ? { height: GROSOR, left: 0, right: 0 }
          : { bottom: 0, top: 0, width: GROSOR },
        lado === 'arriba' && { top: 0 },
        lado === 'abajo' && { bottom: 0 },
        lado === 'izquierda' && { left: 0 },
        lado === 'derecha' && { right: 0 },
      ]}
    />
  );
}

function Capa({ colores }: { colores: readonly [string, string, string] }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Borde colores={colores} lado="arriba" />
      <Borde colores={colores} lado="abajo" />
      <Borde colores={colores} lado="izquierda" />
      <Borde colores={colores} lado="derecha" />
    </View>
  );
}

/**
 * el resplandor en los bordes de la pantalla que enciende la IA, como el de Apple Intelligence:
 * dos capas de color que se turnan y respiran mientras trabaja
 */
export function BordeLuminoso({ modo }: PropiedadesBordeLuminoso) {
  const activo = modo !== 'apagado';
  const capaA = modo === 'hablando' ? ORO_A : AURA_A;
  const capaB = modo === 'hablando' ? ORO_B : AURA_B;
  const reducir = useMovimientoReducido();
  const presencia = useRef(new Animated.Value(0)).current;
  const mezcla = useRef(new Animated.Value(0)).current;
  const respira = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(presencia, {
      duration: movimiento.entradaAura,
      easing: Easing.out(Easing.cubic),
      toValue: activo ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [activo, presencia]);

  useEffect(() => {
    if (!activo || reducir) return;
    const cambiar = Animated.loop(
      Animated.sequence([
        Animated.timing(mezcla, {
          duration: movimiento.cambioAura,
          easing: Easing.inOut(Easing.sin),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(mezcla, {
          duration: movimiento.cambioAura,
          easing: Easing.inOut(Easing.sin),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    const respirar = Animated.loop(
      Animated.sequence([
        Animated.timing(respira, {
          duration: movimiento.respiraAura,
          easing: Easing.inOut(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(respira, {
          duration: movimiento.respiraAura,
          easing: Easing.inOut(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    cambiar.start();
    respirar.start();
    return () => {
      cambiar.stop();
      respirar.stop();
    };
  }, [activo, mezcla, reducir, respira]);

  const opacidad = Animated.multiply(
    presencia,
    respira.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
  );

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { opacity: opacidad }]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: mezcla.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          },
        ]}
      >
        <Capa colores={capaA} />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { opacity: mezcla }]}
      >
        <Capa colores={capaB} />
      </Animated.View>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  borde: { position: 'absolute' },
});
