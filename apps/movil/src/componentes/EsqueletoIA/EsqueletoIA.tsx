import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import { coloresAura } from '@/tema/colores';
import { espacios, radios } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';

const ANCHOS = ['92%', '78%', '56%'] as const;

/** líneas de texto fantasma con un destello de color que las recorre mientras la IA arma la respuesta */
export function EsqueletoIA({ lineas = 3 }: { lineas?: number }) {
  const { colores } = useTema();
  const reducir = useMovimientoReducido();
  const barrido = useRef(new Animated.Value(0)).current;
  const [ancho, establecerAncho] = useState(0);

  useEffect(() => {
    if (reducir) return;
    const ciclo = Animated.loop(
      Animated.timing(barrido, {
        duration: movimiento.brilloEsqueleto,
        easing: Easing.inOut(Easing.quad),
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    ciclo.start();
    return () => ciclo.stop();
  }, [barrido, reducir]);

  const alMedir = (evento: LayoutChangeEvent) =>
    establecerAncho(evento.nativeEvent.layout.width);
  const desplazar = barrido.interpolate({
    inputRange: [0, 1],
    outputRange: [-ancho, ancho],
  });

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={alMedir}
      style={estilos.caja}
    >
      {Array.from({ length: lineas }, (_, indice) => (
        <View
          key={indice}
          style={[
            estilos.linea,
            {
              backgroundColor: colores.barroClaro,
              width: ANCHOS[indice % ANCHOS.length],
            },
          ]}
        >
          {!reducir && (
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                { transform: [{ translateX: desplazar }] },
              ]}
            >
              <LinearGradient
                colors={[
                  'transparent',
                  `${coloresAura[0]}88`,
                  `${coloresAura[4]}55`,
                  'transparent',
                ]}
                end={{ x: 1, y: 0 }}
                start={{ x: 0, y: 0 }}
                style={{ height: '100%', width: Math.max(ancho * 0.5, 80) }}
              />
            </Animated.View>
          )}
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { gap: espacios.ocho },
  linea: { borderRadius: radios.pildora, height: 14, overflow: 'hidden' },
});
