import { Pressable, StyleSheet, Text, View } from 'react-native';

import { conAlfa } from '@/tema/alfa';
import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export interface OpcionSegmento<T extends string> {
  clave: T;
  etiqueta: string;
}

export interface PropiedadesControlSegmentado<T extends string> {
  alCambiar: (clave: T) => void;
  opciones: readonly OpcionSegmento<T>[];
  valor: T;
}

/** dos o tres opciones del mismo ancho en una sola pastilla; la elegida se llena de oscuro */
export function ControlSegmentado<T extends string>({
  alCambiar,
  opciones,
  valor,
}: PropiedadesControlSegmentado<T>) {
  const { colores } = useTema();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        estilos.pista,
        {
          backgroundColor: conAlfa(colores.tinta, 0.06),
          borderColor: colores.linea,
        },
      ]}
    >
      {opciones.map((opcion) => {
        const activa = opcion.clave === valor;
        return (
          <Pressable
            accessibilityLabel={opcion.etiqueta}
            accessibilityRole="tab"
            accessibilityState={{ selected: activa }}
            key={opcion.clave}
            onPress={() => alCambiar(opcion.clave)}
            style={[
              estilos.opcion,
              activa && { backgroundColor: colores.fichaActiva },
            ]}
          >
            <Text
              style={[
                tipografia.subtitulo,
                {
                  color: activa ? colores.sobreFichaActiva : colores.tintaSuave,
                },
              ]}
            >
              {opcion.etiqueta}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  opcion: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    flex: 1,
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
  },
  pista: {
    borderRadius: radios.pildora,
    borderWidth: 1,
    flexDirection: 'row',
    gap: espacios.cuatro,
    padding: espacios.cuatro,
  },
});
