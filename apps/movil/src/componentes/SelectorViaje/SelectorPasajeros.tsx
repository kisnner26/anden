import { Pressable, StyleSheet, Text, View } from 'react-native';

import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

interface PropiedadesSelectorPasajeros {
  alCambiar: (cantidad: number) => void;
  cantidad: number;
  etiqueta: string;
  etiquetaAumentar: string;
  etiquetaDisminuir: string;
  maximo?: number;
  minimo?: number;
}

export function SelectorPasajeros({
  alCambiar,
  cantidad,
  etiqueta,
  etiquetaAumentar,
  etiquetaDisminuir,
  maximo = 6,
  minimo = 1,
}: PropiedadesSelectorPasajeros) {
  const { colores } = useTema();
  const Boton = ({
    desactivado,
    etiquetaBoton,
    signo,
    valor,
  }: {
    desactivado: boolean;
    etiquetaBoton: string;
    signo: string;
    valor: number;
  }) => (
    <Pressable
      accessibilityLabel={etiquetaBoton}
      accessibilityRole="button"
      accessibilityState={{ disabled: desactivado }}
      disabled={desactivado}
      onPress={() => alCambiar(valor)}
      style={[
        estilos.boton,
        {
          backgroundColor: desactivado
            ? colores.superficie
            : colores.bloqueNegro,
          borderColor: desactivado ? colores.linea : colores.ambar,
        },
      ]}
    >
      <Text
        style={[
          tipografia.subtitulo,
          { color: desactivado ? colores.tintaSuave : colores.ambar },
        ]}
      >
        {signo}
      </Text>
    </Pressable>
  );

  return (
    <View>
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {etiqueta}
      </Text>
      <View style={estilos.fila}>
        <Boton
          desactivado={cantidad <= minimo}
          etiquetaBoton={etiquetaDisminuir}
          signo="−"
          valor={cantidad - 1}
        />
        <Text
          accessibilityLabel={`${cantidad} ${etiqueta}`}
          accessibilityLiveRegion="polite"
          style={[tipografia.datoGrande, { color: colores.tinta }]}
        >
          {cantidad.toString().padStart(2, '0')}
        </Text>
        <Boton
          desactivado={cantidad >= maximo}
          etiquetaBoton={etiquetaAumentar}
          signo="+"
          valor={cantidad + 1}
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  boton: {
    alignItems: 'center',
    borderRadius: radios.loseta,
    borderWidth: 1,
    height: tamanosControl.toqueMinimo,
    justifyContent: 'center',
    width: tamanosControl.toqueMinimo,
  },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
    marginTop: espacios.ocho,
  },
});
