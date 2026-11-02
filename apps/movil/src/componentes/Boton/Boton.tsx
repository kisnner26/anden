import { Pressable, StyleSheet, Text } from 'react-native';

import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export type VarianteBoton = 'principal';

export interface PropiedadesBoton {
  alPresionar: () => void;
  etiqueta: string;
  variante?: VarianteBoton;
}

export function Boton({
  alPresionar,
  etiqueta,
  variante = 'principal',
}: PropiedadesBoton) {
  const { colores } = useTema();

  return (
    <Pressable
      accessibilityLabel={etiqueta}
      accessibilityRole="button"
      onPress={alPresionar}
      style={({ pressed }) => [
        estilos.base,
        variante === 'principal' && {
          backgroundColor: colores.ambar,
          borderColor: colores.ambar,
        },
        pressed && estilos.presionado,
      ]}
    >
      <Text style={[tipografia.subtitulo, { color: colores.sobreAmbar }]}>
        {etiqueta}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radios.cuadrado,
    borderWidth: 1,
    flexDirection: 'row',
    gap: espacios.doce,
    height: tamanosControl.altoBoton,
    justifyContent: 'center',
    paddingHorizontal: espacios.dieciseis,
  },
  presionado: { opacity: 0.82 },
});
