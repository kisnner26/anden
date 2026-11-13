import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { Chispas } from '@/componentes/Chispas';
import { coloresAura } from '@/tema/colores';
import { movimiento } from '@/tema/movimiento';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

export type EstadoOrbe = 'escuchando' | 'hablando' | 'pensando' | 'reposo';

export interface PropiedadesOrbeIA {
  /** qué está haciendo la IA: el orbe cambia de ritmo, tamaño y brillo según el estado */
  estado?: EstadoOrbe;
  /** atajo antiguo: equivale a estado "pensando" */
  pensando?: boolean;
  /** volumen de la voz de la persona, de 0 a 1, para que el orbe crezca al hablarle */
  nivel?: Animated.Value;
  /** si se indica, el orbe es un botón: se hunde al tocarlo y vuelve con un rebote */
  alPresionar?: () => void;
  etiquetaAccesible?: string;
  tamano?: number;
}

/** qué tan rápido gira y respira el orbe en cada estado: 1 es el ritmo de reposo */
const RITMO: Record<EstadoOrbe, number> = {
  escuchando: 1.6,
  hablando: 2.2,
  pensando: 3,
  reposo: 1,
};

/**
 * el orbe de la IA: degradado violeta y rosa en capas que giran en sentidos opuestos. Reacciona:
 * crece con la voz al escuchar, gira rápido al pensar, late como al hablar y se hunde al tocarlo
 */
export function OrbeIA({
  alPresionar,
  estado,
  etiquetaAccesible,
  nivel,
  pensando = false,
  tamano = 72,
}: PropiedadesOrbeIA) {
  const modo: EstadoOrbe = estado ?? (pensando ? 'pensando' : 'reposo');
  const reducir = useMovimientoReducido();
  const giro = useRef(new Animated.Value(0)).current;
  const aro = useRef(new Animated.Value(0)).current;
  const latido = useRef(new Animated.Value(0)).current;
  const hundido = useRef(new Animated.Value(1)).current;
  const sinNivel = useRef(new Animated.Value(0)).current;
  const volumen = nivel ?? sinNivel;
  const ritmo = RITMO[modo];

  useEffect(() => {
    if (reducir) return;
    const girar = Animated.loop(
      Animated.timing(giro, {
        duration: movimiento.giroOrbe / ritmo,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    const expandir = Animated.loop(
      Animated.timing(aro, {
        duration: movimiento.pulsoOrbe / Math.sqrt(ritmo),
        easing: Easing.out(Easing.quad),
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    girar.start();
    expandir.start();
    return () => {
      girar.stop();
      expandir.stop();
      giro.setValue(0);
      aro.setValue(0);
    };
  }, [aro, giro, reducir, ritmo]);

  // al hablar el orbe late con un ritmo irregular, como una voz, no como un metrónomo
  useEffect(() => {
    if (reducir || modo !== 'hablando') {
      latido.setValue(0);
      return;
    }
    const tiempos = [170, 110, 220, 90, 150, 260];
    const alturas = [1, 0.4, 0.85, 0.25, 0.7, 0.5];
    const cadena = Animated.loop(
      Animated.sequence(
        tiempos.map((duracion, i) =>
          Animated.timing(latido, {
            duration: duracion,
            easing: Easing.inOut(Easing.quad),
            toValue: alturas[i] ?? 0.5,
            useNativeDriver: true,
          }),
        ),
      ),
    );
    cadena.start();
    return () => cadena.stop();
  }, [latido, modo, reducir]);

  function tocar() {
    if (!alPresionar) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
      () => undefined,
    );
    Animated.sequence([
      Animated.timing(hundido, {
        duration: 90,
        toValue: 0.86,
        useNativeDriver: true,
      }),
      Animated.spring(hundido, {
        friction: 4,
        tension: 160,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
    alPresionar();
  }

  const rotar = giro.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const alReves = giro.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });
  const crecer = Animated.add(
    1,
    Animated.add(
      volumen.interpolate({
        extrapolate: 'clamp',
        inputRange: [0, 1],
        outputRange: [0, 0.34],
      }),
      latido.interpolate({ inputRange: [0, 1], outputRange: [0, 0.16] }),
    ),
  );
  const escala = Animated.multiply(crecer, hundido);
  const escalaAro = aro.interpolate({
    inputRange: [0, 1],
    outputRange: [1, modo === 'reposo' ? 1.25 : 1.7],
  });
  const opacidadAro = aro.interpolate({
    inputRange: [0, 1],
    outputRange: [modo === 'reposo' ? 0.28 : 0.55, 0],
  });
  const lado = tamano * 1.7;
  const arriba = (lado - tamano) / 2;

  const dibujo = (
    <View
      accessibilityElementsHidden={alPresionar === undefined}
      importantForAccessibility={
        alPresionar === undefined ? 'no-hide-descendants' : 'auto'
      }
      style={{ height: lado, width: lado }}
    >
      {[0, 1].map((n) => (
        <Animated.View
          key={n}
          style={[
            estilos.centro,
            {
              borderColor: coloresAura[n === 0 ? 0 : 1],
              borderRadius: tamano,
              borderWidth: 2,
              height: tamano,
              opacity:
                n === 0 ? opacidadAro : Animated.multiply(opacidadAro, 0.6),
              transform: [
                {
                  scale:
                    n === 0 ? escalaAro : Animated.multiply(escalaAro, 1.12),
                },
              ],
              width: tamano,
            },
          ]}
        />
      ))}
      <Animated.View
        style={[
          estilos.centro,
          {
            height: tamano,
            top: arriba,
            transform: [{ scale: escala }],
            width: tamano,
          },
        ]}
      >
        <Animated.View
          style={[StyleSheet.absoluteFill, { transform: [{ rotate: rotar }] }]}
        >
          <LinearGradient
            colors={[
              coloresAura[0],
              coloresAura[2],
              coloresAura[1],
              coloresAura[3],
              coloresAura[0],
            ]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={{ borderRadius: tamano, flex: 1 }}
          />
        </Animated.View>
        <Animated.View
          style={[
            estilos.capa,
            {
              height: tamano * 0.82,
              opacity: 0.8,
              top: tamano * 0.09,
              transform: [{ rotate: alReves }],
              width: tamano * 0.82,
            },
          ]}
        >
          <LinearGradient
            colors={[
              coloresAura[1],
              coloresAura[3],
              coloresAura[2],
              coloresAura[1],
            ]}
            end={{ x: 0, y: 1 }}
            start={{ x: 1, y: 0 }}
            style={{ borderRadius: tamano, flex: 1 }}
          />
        </Animated.View>
        <View
          style={[
            estilos.capa,
            {
              backgroundColor: 'rgba(255,255,255,0.28)',
              borderRadius: tamano,
              height: tamano * 0.42,
              top: tamano * 0.29,
              width: tamano * 0.42,
            },
          ]}
        />
      </Animated.View>
      {tamano >= 56 && modo !== 'reposo' && <Chispas tamano={lado} />}
    </View>
  );

  if (!alPresionar) return dibujo;
  return (
    <Pressable
      accessibilityLabel={etiquetaAccesible}
      accessibilityRole="button"
      accessibilityState={{ selected: modo === 'escuchando' }}
      hitSlop={8}
      onPress={tocar}
    >
      {dibujo}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  capa: { alignSelf: 'center', position: 'absolute' },
  centro: { alignSelf: 'center', position: 'absolute' },
});
