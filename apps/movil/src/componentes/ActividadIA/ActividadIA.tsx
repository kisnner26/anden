import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';

export interface PropiedadesActividadIA {
  /** lo que está haciendo el modelo, por ejemplo "Buscando salidas" */
  actividad: string;
}

/** una pastilla con un punto que late mientras el asistente consulta los datos de la app */
export function ActividadIA({ actividad }: PropiedadesActividadIA) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const pulso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducido) return;
    const bucle = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, {
          duration: 650,
          easing: Easing.inOut(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulso, {
          duration: 650,
          easing: Easing.inOut(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    bucle.start();
    return () => bucle.stop();
  }, [pulso, reducido]);

  return (
    <Bloque
      estilo={estilos.envoltura}
      estiloContenido={estilos.contenido}
      radio="pildora"
    >
      <Animated.View
        style={[
          estilos.punto,
          {
            backgroundColor: colores.ambar,
            opacity: reducido
              ? 1
              : pulso.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.35, 1],
                }),
            transform: [
              {
                scale: reducido
                  ? 1
                  : pulso.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.25],
                    }),
              },
            ],
          },
        ]}
      />
      <View>
        <Text
          accessibilityLiveRegion="polite"
          style={[tipografia.pequeno, { color: colores.tinta }]}
        >
          {`${actividad}…`}
        </Text>
      </View>
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.ocho,
    paddingHorizontal: espacios.dieciseis,
    paddingVertical: espacios.ocho,
  },
  envoltura: { alignSelf: 'flex-start' },
  punto: { borderRadius: 5, height: 10, width: 10 },
});
