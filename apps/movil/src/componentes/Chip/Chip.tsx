import { Pressable, StyleSheet, Text, View } from 'react-native';

import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export interface PropiedadesChip {
  alCambiar: (seleccionado: boolean) => void;
  deshabilitado?: boolean;
  etiqueta: string;
  seleccionado?: boolean;
}

export function Chip({
  alCambiar,
  deshabilitado = false,
  etiqueta,
  seleccionado = false,
}: PropiedadesChip) {
  const { colores } = useTema();

  return (
    <Pressable
      accessibilityLabel={etiqueta}
      accessibilityRole="button"
      accessibilityState={{ disabled: deshabilitado, selected: seleccionado }}
      disabled={deshabilitado}
      onPress={() => alCambiar(!seleccionado)}
      style={({ pressed }) => [
        estilos.base,
        {
          backgroundColor: seleccionado ? colores.ambar : colores.superficie,
          borderColor: seleccionado ? colores.ambar : colores.linea,
        },
        deshabilitado && estilos.deshabilitado,
        pressed && estilos.presionado,
      ]}
    >
      {seleccionado && (
        <View
          style={[estilos.indicador, { backgroundColor: colores.sobreAmbar }]}
          testID="chip-seleccionado-indicador"
        />
      )}
      <Text
        style={[
          tipografia.pequeno,
          { color: seleccionado ? colores.sobreAmbar : colores.tinta },
        ]}
      >
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
    flexDirection: 'row',
    gap: espacios.ocho,
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
    paddingHorizontal: espacios.dieciseis,
  },
  deshabilitado: { opacity: 0.45 },
  indicador: {
    borderRadius: radios.pildora,
    height: espacios.doce,
    width: espacios.cuatro,
  },
  presionado: { opacity: 0.82 },
});
