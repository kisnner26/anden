import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { useTema } from '@/tema/useTema';

export interface PropiedadesInterruptor {
  activo: boolean;
  alCambiar: (activo: boolean) => void;
  deshabilitado?: boolean;
  etiqueta: string;
}

/** interruptor de pista y perilla: ámbar cuando está encendido */
export function Interruptor({
  activo,
  alCambiar,
  deshabilitado = false,
  etiqueta,
}: PropiedadesInterruptor) {
  const { colores } = useTema();

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
      <View
        style={[
          estilos.perilla,
          {
            alignSelf: activo ? 'flex-end' : 'flex-start',
            backgroundColor: activo ? colores.sobreAmbar : colores.fondo,
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
