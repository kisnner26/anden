import {
  impactAsync,
  ImpactFeedbackStyle,
  notificationAsync,
  NotificationFeedbackType,
} from 'expo-haptics';
import { useMemo, useRef } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

import {
  limitarDesplazamiento,
  marcasCruzadas,
  resolverSoltado,
} from './soltado';

const MANIJA = 52;
const MARGEN = 6;
const TOQUE_MAXIMO = 6;
const EMPUJE_PISTA = 28;

export interface PropiedadesDeslizarParaEmpezar {
  alCompletar: () => void;
  /** ancho total del control */
  ancho: number;
}

/** control para empezar: se arrastra la manija ámbar hasta el final; un toque solo insinúa el gesto (o completa si se redujo el movimiento) */
export function DeslizarParaEmpezar({
  alCompletar,
  ancho,
}: PropiedadesDeslizarParaEmpezar) {
  const { colores } = useTema();
  const reducirMovimiento = useMovimientoReducido();
  const maximo = Math.max(ancho - MANIJA - MARGEN * 2, 0);
  const avance = useSharedValue(0);
  const completado = useRef(false);
  const marcas = useRef(0);
  const estado = useRef({ alCompletar, maximo, reducirMovimiento });
  estado.current = { alCompletar, maximo, reducirMovimiento };

  const completar = () => {
    if (completado.current) return;
    completado.current = true;
    avance.value = withTiming(estado.current.maximo, {
      duration: movimiento.toque,
    });
    void notificationAsync(NotificationFeedbackType.Success);
    estado.current.alCompletar();
  };

  const alToque = () => {
    if (completado.current) return;
    if (estado.current.reducirMovimiento) {
      completar();
      return;
    }
    void impactAsync(ImpactFeedbackStyle.Light);
    avance.value = withSequence(
      withTiming(EMPUJE_PISTA, { duration: movimiento.toque }),
      withSpring(0, { damping: 14, overshootClamping: true, stiffness: 240 }),
    );
  };

  const gesto = useMemo(
    () =>
      PanResponder.create({
        onPanResponderGrant: () => {
          marcas.current = 0;
        },
        onPanResponderMove: (_evento, g) => {
          if (completado.current) return;
          const limite = estado.current.maximo;
          const nuevo = limitarDesplazamiento(g.dx, limite);
          avance.value = nuevo;
          const cruzadas = marcasCruzadas(nuevo, limite);
          if (cruzadas > marcas.current) {
            void impactAsync(ImpactFeedbackStyle.Light);
          }
          marcas.current = cruzadas;
        },
        onPanResponderRelease: (_evento, g) => {
          if (completado.current) return;
          const limite = estado.current.maximo;
          if (Math.abs(g.dx) <= TOQUE_MAXIMO) {
            alToque();
            return;
          }
          const nuevo = limitarDesplazamiento(g.dx, limite);
          if (resolverSoltado(nuevo, limite) === 'completar') {
            completar();
            return;
          }
          avance.value = withSpring(0, {
            damping: 16,
            overshootClamping: true,
            stiffness: 220,
          });
        },
        onPanResponderTerminate: () => {
          if (!completado.current) {
            avance.value = withSpring(0, {
              damping: 16,
              overshootClamping: true,
              stiffness: 220,
            });
          }
        },
        onStartShouldSetPanResponder: () => true,
      }),
    // el gesto lee su estado vivo desde la referencia
    [],
  );

  const estiloManija = useAnimatedStyle(() => ({
    transform: [{ translateX: avance.value }],
  }));
  const estiloRelleno = useAnimatedStyle(() => ({
    width: avance.value > 1 ? avance.value + MANIJA + MARGEN : 0,
  }));
  const estiloTexto = useAnimatedStyle(() => ({
    opacity: maximo > 0 ? Math.max(0, 1 - (avance.value / maximo) * 1.6) : 1,
  }));

  return (
    <View
      accessibilityActions={[{ label: t('portada.empezar'), name: 'activate' }]}
      accessibilityHint={t('portada.deslizarAyuda')}
      accessibilityLabel={t('portada.deslizar')}
      accessibilityRole="button"
      accessible
      onAccessibilityAction={(evento) => {
        if (evento.nativeEvent.actionName === 'activate') completar();
      }}
      style={{ width: ancho }}
      {...gesto.panHandlers}
    >
      <Bloque hundido radio="pildora">
        <View style={[estilos.pista, { height: MANIJA + MARGEN * 2 }]}>
          <Animated.View
            style={[
              estilos.relleno,
              { backgroundColor: colores.ambar },
              estiloRelleno,
            ]}
          />
          <Animated.View style={[estilos.centro, estiloTexto]}>
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {t('portada.deslizar')}
            </Text>
          </Animated.View>
          <Animated.View style={[estilos.manija, estiloManija]}>
            <Loseta tamano={MANIJA} variante="negra">
              <Icono
                color={colores.sobreNegro}
                nombre="siguiente"
                tamano="grande"
              />
            </Loseta>
          </Animated.View>
        </View>
      </Bloque>
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: MANIJA + MARGEN * 2,
    position: 'absolute',
    right: MARGEN * 2,
    top: 0,
  },
  manija: { left: MARGEN, position: 'absolute', top: MARGEN },
  pista: { justifyContent: 'center', overflow: 'hidden' },
  relleno: {
    borderRadius: 999,
    bottom: 0,
    left: 0,
    opacity: 0.9,
    position: 'absolute',
    top: 0,
  },
});
