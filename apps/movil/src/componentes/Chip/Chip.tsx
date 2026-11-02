import { Pressable, StyleSheet, Text } from 'react-native';

import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export interface PropiedadesChip {
  alPresionar: () => void;
  deshabilitado?: boolean;
  etiqueta: string;
}

export function Chip({
  alPresionar,
  deshabilitado = false,
  etiqueta,
}: PropiedadesChip) {
  const { colores } = useTema();

  return (
    <Pressable
      accessibilityLabel={etiqueta}
      accessibilityRole="button"
      accessibilityState={{ disabled: deshabilitado }}
      disabled={deshabilitado}
      onPress={alPresionar}
      style={({ pressed }) => [
        estilos.base,
        {
          backgroundColor: colores.superficie,
          borderColor: colores.linea,
        },
        deshabilitado && estilos.deshabilitado,
        pressed && estilos.presionado,
      ]}
    >
      <Text style={[tipografia.pequeno, { color: colores.tinta }]}>
        {etiqueta}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radios.pildora,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
    paddingHorizontal: espacios.dieciseis,
  },
  deshabilitado: { opacity: 0.45 },
  presionado: { opacity: 0.82 },
});
