import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';

/** cada cuántos milisegundos aparece la siguiente letra */
export const MS_POR_LETRA = 14;

export interface PropiedadesGloboDeAyuda {
  alToque: () => void;
  /** dónde queda el borde de arriba, en la ventana */
  y: number;
  /** hasta dónde llega el globo por la derecha: el borde de los ojos */
  derecha: number;
  texto: string;
}

/**
 * lo que dice Rumbo: un globo pequeño y claro que sale de sus ojos hacia la izquierda, con la ayuda escribiéndose letra por
 * letra; no tapa el contenido más de lo necesario y se va solo
 */
export function GloboDeAyuda({
  alToque,
  derecha,
  texto,
  y,
}: PropiedadesGloboDeAyuda) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const [letras, establecerLetras] = useState(reducido ? texto.length : 0);
  const aparicion = useRef(new Animated.Value(reducido ? 1 : 0)).current;

  useEffect(() => {
    if (reducido) return;
    Animated.spring(aparicion, {
      friction: 7,
      tension: 90,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [aparicion, reducido]);

  useEffect(() => {
    if (reducido) {
      establecerLetras(texto.length);
      return;
    }
    establecerLetras(0);
    let n = 0;
    const ritmo = setInterval(() => {
      n += 1;
      establecerLetras(n);
      if (n >= texto.length) clearInterval(ritmo);
    }, MS_POR_LETRA);
    return () => clearInterval(ritmo);
  }, [reducido, texto]);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        estilos.contenedor,
        {
          opacity: aparicion,
          right: derecha,
          top: y,
          transform: [
            {
              scale: aparicion.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              }),
            },
            {
              translateX: aparicion.interpolate({
                inputRange: [0, 1],
                outputRange: [40, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Pressable
        accessibilityLabel={texto}
        accessibilityLiveRegion="polite"
        accessibilityRole="button"
        onPress={alToque}
        style={[
          estilos.globo,
          { backgroundColor: colores.barroClaro, borderColor: colores.linea },
        ]}
        testID="globo-de-ayuda"
      >
        <Text style={[tipografia.pequeno, { color: colores.tinta }]}>
          {texto.slice(0, letras)}
          <Text style={{ color: 'transparent' }}>{texto.slice(letras)}</Text>
        </Text>
      </Pressable>
      <View
        style={[
          estilos.cola,
          { backgroundColor: colores.barroClaro, borderColor: colores.linea },
        ]}
      />
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  cola: {
    borderRightWidth: 1,
    borderTopWidth: 1,
    height: 12,
    position: 'absolute',
    right: -6,
    top: 20,
    transform: [{ rotate: '45deg' }],
    width: 12,
  },
  contenedor: { position: 'absolute' },
  globo: {
    borderRadius: radios.bloque,
    borderWidth: 1,
    maxWidth: 250,
    minWidth: 150,
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.doce,
  },
});
