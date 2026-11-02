import { useEffect, useRef, useState } from 'react';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Icono } from '@/componentes/Icono';
import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export type VarianteBoton = 'pildora' | 'principal' | 'secundario';

export interface PropiedadesBoton {
  alPresionar: () => void;
  cargando?: boolean;
  deshabilitado?: boolean;
  etiqueta: string;
  variante?: VarianteBoton;
}

export function Boton({
  alPresionar,
  cargando = false,
  deshabilitado = false,
  etiqueta,
  variante = 'principal',
}: PropiedadesBoton) {
  const { colores } = useTema();
  const movimientoReducido = useMovimientoReducido();
  const avance = useRef(new Animated.Value(0)).current;
  const colorTexto =
    variante === 'principal' && !cargando ? colores.sobreAmbar : colores.tinta;

  useEffect(() => {
    if (!cargando) {
      avance.setValue(0);
      return;
    }

    if (movimientoReducido) {
      avance.setValue(0.7);
      return;
    }

    const animacion = Animated.loop(
      Animated.timing(avance, {
        duration: movimiento.entradaPantalla * 3,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    animacion.start();
    return () => animacion.stop();
  }, [avance, cargando, movimientoReducido]);

  function presionar() {
    void impactAsync(ImpactFeedbackStyle.Light);
    alPresionar();
  }

  return (
    <Pressable
      accessibilityLabel={etiqueta}
      accessibilityRole="button"
      accessibilityState={{ busy: cargando, disabled: deshabilitado }}
      disabled={cargando || deshabilitado}
      onPress={presionar}
      style={({ pressed }) => [
        estilos.base,
        variante === 'principal' && {
          backgroundColor: colores.ambar,
          borderColor: colores.ambar,
        },
        variante === 'secundario' && {
          backgroundColor: colores.superficie,
          borderColor: colores.linea,
        },
        variante === 'pildora' && {
          backgroundColor: colores.superficieAlta,
          borderColor: colores.linea,
          borderRadius: radios.pildora,
          justifyContent: 'space-between',
        },
        cargando && {
          backgroundColor: colores.superficie,
          borderColor: colores.linea,
        },
        deshabilitado && estilos.deshabilitado,
        pressed && estilos.presionado,
      ]}
    >
      <Text style={[tipografia.subtitulo, { color: colorTexto }]}>
        {etiqueta}
      </Text>
      {variante === 'pildora' && (
        <View
          style={[estilos.flecha, { backgroundColor: colores.ambar }]}
          testID="boton-pildora-flecha"
        >
          <Icono
            color={colores.sobreAmbar}
            colorDetalle={colores.ambar}
            nombre="siguiente"
            tamano="mediano"
          />
        </View>
      )}
      {cargando && (
        <Animated.View
          style={[
            estilos.barraCarga,
            {
              backgroundColor: colores.ambar,
              transform: [{ scaleX: avance }],
            },
          ]}
          testID="boton-cargando-barra"
        />
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  barraCarga: {
    bottom: 0,
    height: espacios.cuatro,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  base: {
    alignItems: 'center',
    borderRadius: radios.cuadrado,
    borderWidth: 1,
    flexDirection: 'row',
    gap: espacios.doce,
    height: tamanosControl.altoBoton,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: espacios.dieciseis,
  },
  deshabilitado: { opacity: 0.45 },
  flecha: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    height: tamanosControl.circuloPildora,
    justifyContent: 'center',
    width: tamanosControl.circuloPildora,
  },
  presionado: { opacity: 0.82 },
});

function useMovimientoReducido() {
  const [reducido, establecerReducido] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(establecerReducido);
    const suscripcion = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      establecerReducido,
    );
    return () => suscripcion.remove();
  }, []);

  return reducido;
}
