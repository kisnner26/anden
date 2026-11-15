import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  PanResponder,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { espacios, radios } from '@/tema/espacios';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';

export type AlturasPanel = readonly [number, number, number];

export interface PropiedadesPanelDeslizable {
  /** las tres posiciones de reposo, de menos a más alta, en puntos */
  alturas: AlturasPanel;
  /** lo que se ve siempre, también con el panel recogido */
  cabecera: ReactNode;
  children: ReactNode;
  /** espacio libre al final del contenido, para que un pie flotante no lo tape */
  espacioFinal?: number;
  /** avisa en qué posición quedó el panel: 0 recogido, 1 a medias, 2 abierto */
  alCambiar?: (posicion: 0 | 1 | 2) => void;
}

/**
 * el panel de abajo de los mapas, como el de las apps de transporte: una asa para arrastrarlo, tres posiciones y el
 * contenido que solo se desplaza cuando está abierto del todo
 */
export function PanelDeslizable({
  alCambiar,
  alturas,
  cabecera,
  children,
  espacioFinal = 0,
}: PropiedadesPanelDeslizable) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const total = alturas[2];
  const [, establecerPosicion] = useState<0 | 1 | 2>(0);
  const desplazamiento = (i: 0 | 1 | 2) => total - alturas[i];
  const ty = useRef(new Animated.Value(desplazamiento(0))).current;
  const actual = useRef(desplazamiento(0));
  const inicio = useRef(0);

  useEffect(() => {
    const oyente = ty.addListener(({ value }) => {
      actual.current = value;
    });
    return () => ty.removeListener(oyente);
  }, [ty]);

  function irA(i: 0 | 1 | 2) {
    establecerPosicion(i);
    alCambiar?.(i);
    if (reducido) {
      ty.setValue(desplazamiento(i));
      return;
    }
    Animated.spring(ty, {
      friction: 9,
      tension: 80,
      toValue: desplazamiento(i),
      useNativeDriver: true,
    }).start();
  }

  const gesto = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderGrant: () => {
        ty.stopAnimation();
        inicio.current = actual.current;
      },
      onPanResponderMove: (_e, g) => {
        ty.setValue(
          Math.min(desplazamiento(0), Math.max(0, inicio.current + g.dy)),
        );
      },
      onPanResponderRelease: (_e, g) => {
        // un tirón rápido manda al siguiente punto; si no, al más cercano
        const destino = inicio.current + g.dy + g.vy * 120;
        let mejor: 0 | 1 | 2 = 0;
        let distancia = Infinity;
        ([0, 1, 2] as const).forEach((i) => {
          const d = Math.abs(destino - desplazamiento(i));
          if (d < distancia) {
            distancia = d;
            mejor = i;
          }
        });
        irA(mejor);
      },
    }),
  ).current;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        estilos.panel,
        {
          backgroundColor: colores.fondo,
          borderColor: colores.linea,
          height: total,
          transform: [{ translateY: ty }],
        },
      ]}
      testID="panel-deslizable"
    >
      <View {...gesto.panHandlers} style={estilos.arrastre}>
        <View style={[estilos.asa, { backgroundColor: colores.linea }]} />
        {cabecera}
      </View>
      <ScrollView
        contentContainerStyle={[
          estilos.contenido,
          { paddingBottom: espacioFinal + espacios.cuarentaYOcho },
        ]}
        nestedScrollEnabled
        scrollEnabled
        showsVerticalScrollIndicator={false}
        testID="panel-contenido"
      >
        {children}
      </ScrollView>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  arrastre: { paddingHorizontal: espacios.lateral, paddingTop: espacios.ocho },
  asa: {
    alignSelf: 'center',
    borderRadius: 3,
    height: 5,
    marginBottom: espacios.ocho,
    width: 44,
  },
  contenido: {
    gap: espacios.doce,
    paddingHorizontal: espacios.lateral,
    paddingTop: espacios.doce,
  },
  panel: {
    borderTopLeftRadius: radios.bloqueNegro,
    borderTopRightRadius: radios.bloqueNegro,
    borderWidth: 1,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
  },
});
