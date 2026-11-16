import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

import { useSensaciones } from '@/datos/useSensaciones';
import {
  AVANCE_PARA_BRILLO,
  esArrastreHaciaArriba,
  progresoDeArrastre,
} from '@/datos/arrastreBoleto';
import { espacios, radios } from '@/tema/espacios';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

import { useBrilloMaximo } from './useBrilloMaximo';
import { useAppActiva } from '@/tema/useAppActiva';

export interface PropiedadesTalonAmpliable {
  /** el boleto que se ve normal; lo que se agranda lo dibuja OverlayBoleto con este mismo avance */
  children: ReactNode;
  /** si es falso (boleto ya usado o vencido) el gesto no hace nada */
  habilitado: boolean;
  progreso: Animated.Value;
}

/**
 * envuelve el boleto: arrastrándolo hacia arriba crece la versión grande y sube el brillo, y al soltar todo
 * vuelve a su sitio. Una barrita sobre el boleto sube y baja despacio para invitar al gesto
 */
export function TalonAmpliable({
  children,
  habilitado,
  progreso,
}: PropiedadesTalonAmpliable) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const activa = useAppActiva();
  const sentir = useSensaciones();
  const [sostenido, establecerSostenido] = useState(false);
  const pista = useRef(new Animated.Value(0)).current;
  const llegoAlMaximo = useRef(false);

  useBrilloMaximo(sostenido);

  useEffect(() => {
    const oyente = progreso.addListener(({ value }) => {
      if (value >= 1 && !llegoAlMaximo.current) {
        llegoAlMaximo.current = true;
        sentir('empuje');
      }
      if (value < 0.5) llegoAlMaximo.current = false;
    });
    return () => progreso.removeListener(oyente);
  }, [progreso, sentir]);

  // la barrita sube y baja para que se note que el boleto se puede arrastrar
  useEffect(() => {
    if (!habilitado || reducido || !activa) return;
    const bucle = Animated.loop(
      Animated.sequence([
        Animated.timing(pista, {
          duration: 900,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pista, {
          duration: 900,
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.delay(1600),
      ]),
    );
    bucle.start();
    return () => bucle.stop();
  }, [activa, habilitado, pista, reducido]);

  const arrastre = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evento, { dx, dy }) =>
          habilitado && esArrastreHaciaArriba(dx, dy),
        onPanResponderMove: (_evento, { dy }) => {
          const avance = progresoDeArrastre(dy);
          progreso.setValue(avance);
          if (avance > AVANCE_PARA_BRILLO) establecerSostenido(true);
        },
        onPanResponderRelease: () => soltar(),
        onPanResponderTerminate: () => soltar(),
        // el ScrollView de la pantalla no debe quitarle el arrastre al boleto
        onPanResponderTerminationRequest: () => false,
      }),
    [habilitado, progreso],
  );

  function soltar() {
    establecerSostenido(false);
    sentir('seleccion');
    Animated.spring(progreso, {
      friction: 7,
      tension: 90,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }

  return (
    <View
      accessibilityActions={
        habilitado
          ? [{ label: t('boleto.ampliarAccion'), name: 'magnify' }]
          : undefined
      }
      onAccessibilityAction={(evento) => {
        if (evento.nativeEvent.actionName !== 'magnify') return;
        establecerSostenido(true);
        Animated.timing(progreso, {
          duration: 300,
          toValue: 1,
          useNativeDriver: true,
        }).start();
        setTimeout(() => soltar(), 6000);
      }}
      {...arrastre.panHandlers}
      style={estilos.contenedor}
    >
      {habilitado ? (
        <Animated.View
          pointerEvents="none"
          style={[
            estilos.tirador,
            { backgroundColor: colores.tintaSuave },
            {
              opacity: pista.interpolate({
                inputRange: [0, 1],
                outputRange: [0.35, 0.8],
              }),
              transform: [
                {
                  translateY: pista.interpolate({
                    inputRange: [0, 1],
                    outputRange: [3, -3],
                  }),
                },
              ],
            },
          ]}
        />
      ) : null}
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: espacios.ocho },
  tirador: {
    alignSelf: 'center',
    borderRadius: radios.pildora,
    height: 5,
    width: 44,
  },
});
