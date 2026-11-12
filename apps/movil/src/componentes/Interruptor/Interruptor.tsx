import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';

export interface PropiedadesInterruptor {
  activo: boolean;
  alCambiar: (activo: boolean) => void;
  deshabilitado?: boolean;
  etiqueta: string;
}

const RECORRIDO =
  espacios.cuarentaYOcho - espacios.veinticuatro - 2 * espacios.cuatro;

/** interruptor de pista y perilla: ámbar cuando está encendido */
export function Interruptor({
  activo,
  alCambiar,
  deshabilitado = false,
  etiqueta,
}: PropiedadesInterruptor) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const posicion = useRef(new Animated.Value(activo ? 1 : 0)).current;

  useEffect(() => {
    if (reducido) {
      posicion.setValue(activo ? 1 : 0);
      return;
    }
    const animacion = Animated.spring(posicion, {
      friction: 7,
      toValue: activo ? 1 : 0,
      useNativeDriver: true,
    });
    animacion.start();
    return () => animacion.stop();
  }, [activo, posicion, reducido]);

  return (
    <Pressable
      accessibilityLabel={etiqueta}
      accessibilityRole="switch"
      accessibilityState={{ checked: activo, disabled: deshabilitado }}
      disabled={deshabilitado}
      hitSlop={8}
      onPress={() => {
        void Haptics.selectionAsync().catch(() => undefined);
        alCambiar(!activo);
      }}
      style={[
        estilos.pista,
        {
          backgroundColor: activo ? colores.ambar : colores.linea,
          opacity: deshabilitado ? 0.5 : 1,
        },
      ]}
    >
      <Animated.View
        style={[
          estilos.perilla,
          {
            backgroundColor: activo ? colores.sobreAmbar : colores.tintaSuave,
            transform: [
              {
                translateX: posicion.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, RECORRIDO],
                }),
              },
            ],
          },
        ]}
      />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  perilla: {
    borderRadius: radios.pildora,
    height: espacios.veinticuatro,
    width: espacios.veinticuatro,
  },
  pista: {
    borderRadius: radios.pildora,
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
    padding: espacios.cuatro,
    width: espacios.cuarentaYOcho,
  },
});
