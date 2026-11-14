import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FotoDestino } from '@/componentes/FotoDestino';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesFiltroDestinos {
  alElegir: (destino: string | null) => void;
  destinos: readonly string[];
  /** nulo es "todos los destinos" */
  elegido: string | null;
}

/** los destinos de la terminal como pastillas con su foto; tocar uno deja solo sus salidas */
export function FiltroDestinos({
  alElegir,
  destinos,
  elegido,
}: PropiedadesFiltroDestinos) {
  const { colores } = useTema();
  if (destinos.length < 2) return null;

  function elegir(destino: string | null) {
    void impactAsync(ImpactFeedbackStyle.Light);
    alElegir(destino);
  }

  const opciones: { clave: string | null; etiqueta: string }[] = [
    { clave: null, etiqueta: t('vistaDia.todosLosDestinos') },
    ...destinos.map((destino) => ({ clave: destino, etiqueta: destino })),
  ];

  return (
    <ScrollView
      contentContainerStyle={estilos.fila}
      horizontal
      showsHorizontalScrollIndicator={false}
      testID="filtro-destinos"
    >
      {opciones.map(({ clave, etiqueta }) => {
        const activa = clave === elegido;
        return (
          <Pressable
            accessibilityLabel={etiqueta}
            accessibilityRole="button"
            accessibilityState={{ selected: activa }}
            key={etiqueta}
            onPress={() => elegir(clave)}
            style={({ pressed }) => [
              estilos.envoltura,
              {
                borderColor: activa ? colores.ambar : 'transparent',
                opacity: activa ? 1 : 0.78,
              },
              pressed && estilos.presionada,
            ]}
          >
            <FotoDestino
              destino={clave ?? ''}
              estilo={estilos.foto}
              radio="loseta"
            >
              <View style={estilos.texto}>
                <Text
                  numberOfLines={1}
                  style={[tipografia.pequeno, { color: colores.sobreNegro }]}
                >
                  {etiqueta}
                </Text>
              </View>
            </FotoDestino>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  envoltura: {
    borderRadius: radios.loseta + 3,
    borderWidth: 2,
    padding: 2,
  },
  fila: { gap: espacios.ocho, paddingVertical: espacios.cuatro },
  foto: { height: 56, justifyContent: 'flex-end', width: 112 },
  presionada: { transform: [{ scale: 0.97 }] },
  texto: { padding: espacios.ocho },
});
