import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icono } from '@/componentes/Icono';
import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export type VarianteBoton = 'pildora' | 'principal' | 'secundario';

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
  const colorTexto =
    variante === 'principal' ? colores.sobreAmbar : colores.tinta;

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
        variante === 'secundario' && {
          backgroundColor: colores.superficie,
          borderColor: colores.linea,
        },
        variante === 'pildora' && {
          backgroundColor: colores.superficieAlta,
          borderColor: colores.linea,
          borderRadius: radios.pildora,
          justifyContent: 'space-between',
        },
        pressed && estilos.presionado,
      ]}
    >
      <Text style={[tipografia.subtitulo, { color: colorTexto }]}>
        {etiqueta}
      </Text>
      {variante === 'pildora' && (
        <View
          style={[estilos.flecha, { backgroundColor: colores.ambar }]}
          testID="boton-pildora-flecha"
        >
          <Icono
            color={colores.sobreAmbar}
            colorDetalle={colores.ambar}
            nombre="siguiente"
            tamano="mediano"
          />
        </View>
      )}
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
  flecha: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    height: tamanosControl.circuloPildora,
    justifyContent: 'center',
    width: tamanosControl.circuloPildora,
  },
  presionado: { opacity: 0.82 },
});
