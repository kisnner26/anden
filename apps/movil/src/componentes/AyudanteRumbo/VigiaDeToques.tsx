import { useRef, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { registrarToque, type Toque } from '@/datos/dificultad';
import { emitirSenal } from '@/datos/senalesDeAyuda';

/**
 * envuelve toda la app y mira los toques sin interferir: si alguien golpea varias veces seguidas el mismo lugar es que
 * algo no responde, y lo avisa como señal de que necesita ayuda
 */
export function VigiaDeToques({ children }: { children: ReactNode }) {
  const toques = useRef<Toque[]>([]);
  return (
    <View
      onTouchStart={(evento) => {
        const { pageX, pageY } = evento.nativeEvent;
        const r = registrarToque(toques.current, {
          en: Date.now(),
          x: pageX,
          y: pageY,
        });
        toques.current = r.toques;
        if (r.repetidos) emitirSenal('toquesRepetidos');
      }}
      style={estilos.todo}
    >
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({ todo: { flex: 1 } });
