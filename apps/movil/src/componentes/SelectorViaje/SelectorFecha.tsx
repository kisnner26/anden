import { Pressable, StyleSheet, Text, View } from 'react-native';

import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export interface DiaViaje {
  etiqueta: string;
  id: string;
  numero: string;
}

interface PropiedadesSelectorFecha {
  alElegir: (id: string) => void;
  dias: readonly DiaViaje[];
  etiqueta: string;
  seleccionado: string;
}

export function SelectorFecha({
  alElegir,
  dias,
  etiqueta,
  seleccionado,
}: PropiedadesSelectorFecha) {
  const { colores } = useTema();

  return (
    <View accessibilityLabel={etiqueta} accessibilityRole="radiogroup">
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {etiqueta}
      </Text>
      <View style={estilos.fila}>
        {dias.map((dia) => {
          const activo = dia.id === seleccionado;
          return (
            <Pressable
              accessibilityLabel={`${dia.etiqueta} ${dia.numero}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: activo }}
              key={dia.id}
              onPress={() => alElegir(dia.id)}
              style={[
                estilos.dia,
                {
                  backgroundColor: activo
                    ? colores.bloqueNegro
                    : colores.superficieAlta,
                  borderColor: activo ? colores.ambar : colores.linea,
                },
              ]}
            >
              <Text
                style={[
                  tipografia.pequeno,
                  { color: activo ? colores.sobreNegroSuave : colores.tintaSuave },
                ]}
              >
                {dia.etiqueta}
              </Text>
              <Text
                style={[
                  tipografia.datoGrande,
                  { color: activo ? colores.ambar : colores.tinta },
                ]}
              >
                {dia.numero}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  dia: {
    alignItems: 'center',
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: tamanosControl.altoBoton + espacios.dieciseis,
    paddingVertical: espacios.ocho,
  },
  fila: {
    flexDirection: 'row',
    gap: espacios.ocho,
    marginTop: espacios.ocho,
  },
});
