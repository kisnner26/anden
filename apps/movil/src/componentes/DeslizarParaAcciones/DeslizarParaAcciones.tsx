import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';

import { Icono, type NombreIcono } from '@/componentes/Icono';
import {
  accionAlSoltar,
  avanceDeAccion,
  limitarArrastre,
  UMBRAL_ACCION,
} from '@/datos/deslizarAcciones';
import { useSensaciones } from '@/datos/useSensaciones';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

export interface AccionDeslizable {
  /** lo que lee el lector de pantalla y se muestra bajo el ícono */
  etiqueta: string;
  alActivar: () => void;
  color: string;
  icono: NombreIcono;
  /** color del ícono y del texto sobre el fondo de la acción */
  colorTexto: string;
}

export interface PropiedadesDeslizarParaAcciones {
  children: ReactNode;
  /** se activa deslizando la fila hacia la derecha */
  izquierda?: AccionDeslizable;
  /** se activa deslizando la fila hacia la izquierda */
  derecha?: AccionDeslizable;
  /** si la fila tiene un margen arriba, el fondo de las acciones empieza después de él */
  margenSuperior?: number;
}

function Fondo({
  accion,
  lado,
  margenSuperior,
  progreso,
}: {
  accion: AccionDeslizable;
  margenSuperior: number;
  lado: 'derecha' | 'izquierda';
  progreso: Animated.AnimatedInterpolation<number>;
}) {
  const escala = progreso.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, 0.7, 1],
    outputRange: [0.5, 0.9, 1.25],
  });
  return (
    <View
      pointerEvents="none"
      style={[
        estilos.fondo,
        lado === 'izquierda' ? estilos.fondoIzquierda : estilos.fondoDerecha,
        { backgroundColor: accion.color, top: margenSuperior },
      ]}
    >
      <Animated.View
        style={[
          estilos.contenidoFondo,
          { opacity: progreso, transform: [{ scale: escala }] },
        ]}
      >
        <Icono
          color={accion.colorTexto}
          nombre={accion.icono}
          tamano="grande"
        />
        <Text style={[tipografia.etiqueta, { color: accion.colorTexto }]}>
          {accion.etiqueta}
        </Text>
      </Animated.View>
    </View>
  );
}

/**
 * una fila con acciones al deslizarla: a la derecha una, a la izquierda otra. Al llegar al umbral vibra y el
 * ícono crece; al soltar la acción se ejecuta y la fila vuelve con un rebote. El lector de pantalla recibe
 * las dos acciones como acciones propias
 */
export function DeslizarParaAcciones({
  children,
  derecha,
  izquierda,
  margenSuperior = 0,
}: PropiedadesDeslizarParaAcciones) {
  const reducido = useMovimientoReducido();
  const sentir = useSensaciones();
  const desplazamiento = useRef(new Animated.Value(0)).current;
  const alcanzado = useRef(false);
  const accionesActuales = useRef({ derecha, izquierda });
  accionesActuales.current = { derecha, izquierda };

  const volver = useRef((conRebote: boolean) => {
    Animated.spring(desplazamiento, {
      bounciness: conRebote ? 14 : 0,
      speed: 18,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }).current;

  // el avance (0..1) de cada lado, derivado del desplazamiento
  const progresoIzquierda = desplazamiento.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, UMBRAL_ACCION],
    outputRange: [0, 1],
  });
  const progresoDerecha = desplazamiento.interpolate({
    extrapolate: 'clamp',
    inputRange: [-UMBRAL_ACCION, 0],
    outputRange: [1, 0],
  });

  const gesto = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evento, { dx, dy }) =>
          Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.6,
        onPanResponderMove: (_evento, { dx }) => {
          const { derecha: der, izquierda: izq } = accionesActuales.current;
          // si ese lado no tiene acción, la fila apenas se mueve
          const permitido = dx > 0 ? izq : der;
          desplazamiento.setValue(limitarArrastre(permitido ? dx : dx * 0.15));
          const llego = permitido && avanceDeAccion(dx) >= 1;
          if (llego && !alcanzado.current) {
            alcanzado.current = true;
            sentir('seleccion');
          }
          if (!llego) alcanzado.current = false;
        },
        onPanResponderRelease: (_evento, { dx }) => {
          const { derecha: der, izquierda: izq } = accionesActuales.current;
          const lado = accionAlSoltar(dx, Boolean(izq), Boolean(der));
          alcanzado.current = false;
          if (lado) {
            sentir('exito');
            (lado === 'izquierda' ? izq : der)?.alActivar();
          }
          volver(lado !== null);
        },
        onPanResponderTerminate: () => {
          alcanzado.current = false;
          volver(false);
        },
      }),
    [desplazamiento, sentir, volver],
  );

  useEffect(() => {
    if (reducido) desplazamiento.setValue(0);
  }, [desplazamiento, reducido]);

  const acciones = [
    ...(izquierda ? [{ ...izquierda, nombre: 'izquierda' }] : []),
    ...(derecha ? [{ ...derecha, nombre: 'derecha' }] : []),
  ];

  return (
    <View
      accessibilityActions={acciones.map((a) => ({
        label: a.etiqueta,
        name: a.nombre,
      }))}
      onAccessibilityAction={(evento) => {
        const elegida = acciones.find(
          (a) => a.nombre === evento.nativeEvent.actionName,
        );
        elegida?.alActivar();
      }}
      style={estilos.contenedor}
      testID="deslizar-acciones"
    >
      {izquierda ? (
        <Fondo
          accion={izquierda}
          lado="izquierda"
          margenSuperior={margenSuperior}
          progreso={progresoIzquierda}
        />
      ) : null}
      {derecha ? (
        <Fondo
          accion={derecha}
          lado="derecha"
          margenSuperior={margenSuperior}
          progreso={progresoDerecha}
        />
      ) : null}
      <Animated.View
        {...gesto.panHandlers}
        style={{ transform: [{ translateX: desplazamiento }] }}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { position: 'relative' },
  contenidoFondo: { alignItems: 'center', gap: 2 },
  fondo: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    borderRadius: radios.bloque,
    justifyContent: 'center',
    width: 120,
  },
  fondoDerecha: {
    alignSelf: 'flex-end',
    left: undefined,
    right: 0,
    paddingRight: espacios.doce,
  },
  fondoIzquierda: { left: 0, paddingLeft: espacios.doce, right: undefined },
});
