import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { Chispas } from '@/componentes/Chispas';
import { coloresAura, coloresIA } from '@/tema/colores';
import { movimiento } from '@/tema/movimiento';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

export interface PropiedadesOrbeIA {
  /** más rápido y brillante mientras el modelo piensa */
  pensando?: boolean;
  tamano?: number;
}

/** el orbe de la IA: un degradado que gira y un halo que pulsa; con movimiento reducido queda quieto */
export function OrbeIA({ pensando = false, tamano = 72 }: PropiedadesOrbeIA) {
  const reducir = useMovimientoReducido();
  const giro = useRef(new Animated.Value(0)).current;
  const pulso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducir) return;
    const factor = pensando ? 0.45 : 1;
    const girar = Animated.loop(
      Animated.timing(giro, {
        duration: movimiento.giroOrbe * factor,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    const pulsar = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, {
          duration: (movimiento.pulsoOrbe * factor) / 2,
          easing: Easing.inOut(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulso, {
          duration: (movimiento.pulsoOrbe * factor) / 2,
          easing: Easing.inOut(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    girar.start();
    pulsar.start();
    return () => {
      girar.stop();
      pulsar.stop();
    };
  }, [giro, pensando, pulso, reducir]);

  const rotar = giro.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const girarAlReves = giro.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });
  const escalaHalo = pulso.interpolate({
    inputRange: [0, 1],
    outputRange: [1, pensando ? 1.5 : 1.3],
  });
  const opacidadHalo = pulso.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0],
  });

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ height: tamano * 1.6, width: tamano * 1.6 }}
    >
      <Animated.View
        style={[
          estilos.centro,
          {
            borderColor: coloresIA[1],
            borderRadius: tamano,
            borderWidth: 2,
            height: tamano,
            opacity: opacidadHalo,
            transform: [{ scale: escalaHalo }],
            width: tamano,
          },
        ]}
      />
      <Animated.View
        style={[
          estilos.centro,
          {
            height: tamano,
            transform: [{ rotate: rotar }],
            width: tamano,
          },
        ]}
      >
        <LinearGradient
          colors={[
            coloresAura[0],
            coloresAura[2],
            coloresAura[1],
            coloresAura[4],
            coloresAura[0],
          ]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={{ borderRadius: tamano, flex: 1 }}
        />
      </Animated.View>
      <Animated.View
        style={[
          estilos.centro,
          {
            height: tamano * 0.82,
            opacity: 0.75,
            top: '19%',
            transform: [
              { rotate: girarAlReves },
              { translateY: tamano * 0.09 },
            ],
            width: tamano * 0.82,
          },
        ]}
      >
        <LinearGradient
          colors={[
            coloresAura[5],
            coloresAura[3],
            coloresAura[2],
            coloresAura[5],
          ]}
          end={{ x: 0, y: 1 }}
          start={{ x: 1, y: 0 }}
          style={{ borderRadius: tamano, flex: 1 }}
        />
      </Animated.View>
      <View
        style={[
          estilos.centro,
          {
            backgroundColor: 'rgba(255,255,255,0.22)',
            borderRadius: tamano,
            height: tamano * 0.46,
            width: tamano * 0.46,
          },
        ]}
      />
      {tamano >= 56 && <Chispas tamano={tamano * 1.6} />}
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: { alignSelf: 'center', position: 'absolute', top: '19%' },
});
