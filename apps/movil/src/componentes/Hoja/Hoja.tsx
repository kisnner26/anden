import { BlurView } from 'expo-blur';
import { useEffect, useRef, type ReactNode } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { espacios, radios } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';

export interface PropiedadesHoja {
  abierta: boolean;
  alCerrar: () => void;
  children: ReactNode;
  etiquetaCerrar: string;
}

/** hoja inferior de cristal cálido; se cierra al tocar el fondo o arrastrar su asa hacia abajo. */
export function Hoja({
  abierta,
  alCerrar,
  children,
  etiquetaCerrar,
}: PropiedadesHoja) {
  const { colores } = useTema();
  const reducirMovimiento = useMovimientoReducido();
  const desplazamiento = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!abierta || reducirMovimiento) {
      desplazamiento.setValue(0);
      return;
    }
    desplazamiento.setValue(espacios.cuarentaYOcho);
    Animated.timing(desplazamiento, {
      duration: movimiento.entradaPantalla,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [abierta, desplazamiento, reducirMovimiento]);

  const gesto = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestoActual) =>
        gestoActual.dy > espacios.ocho,
      onPanResponderMove: (_, gestoActual) => {
        if (gestoActual.dy > 0) desplazamiento.setValue(gestoActual.dy);
      },
      onPanResponderRelease: (_, gestoActual) => {
        if (gestoActual.dy >= espacios.cuarentaYOcho) {
          alCerrar();
          return;
        }
        Animated.timing(desplazamiento, {
          duration: movimiento.reducir,
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  return (
    <Modal
      animationType="none"
      onRequestClose={alCerrar}
      transparent
      visible={abierta}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={estilos.modal}
      >
        <Pressable
          accessibilityLabel={etiquetaCerrar}
          accessibilityRole="button"
          onPress={alCerrar}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          accessibilityViewIsModal
          style={[
            estilos.contenedor,
            { transform: [{ translateY: desplazamiento }] },
          ]}
        >
          <BlurView
            intensity={espacios.cuarentaYOcho}
            style={[estilos.cristal, { backgroundColor: colores.barroClaro }]}
          >
            <Pressable
              accessibilityLabel={etiquetaCerrar}
              accessibilityRole="button"
              onPress={alCerrar}
              style={estilos.asaZona}
              {...gesto.panHandlers}
            >
              <View
                style={[estilos.asa, { backgroundColor: colores.marcaAbajo }]}
              />
            </Pressable>
            {children}
          </BlurView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  asa: {
    borderRadius: radios.pildora,
    height: espacios.cuatro,
    width: espacios.cuarentaYOcho,
  },
  asaZona: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: espacios.treintaYDos,
  },
  contenedor: { justifyContent: 'flex-end' },
  cristal: {
    borderTopLeftRadius: radios.bloqueNegro,
    borderTopRightRadius: radios.bloqueNegro,
    gap: espacios.dieciseis,
    overflow: 'hidden',
    paddingBottom: espacios.cuarentaYOcho,
    paddingHorizontal: espacios.lateral,
  },
  modal: { flex: 1, justifyContent: 'flex-end' },
});
