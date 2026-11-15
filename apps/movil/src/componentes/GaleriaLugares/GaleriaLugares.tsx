import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { LugarTuristico } from '@/datos/lugaresTuristicos';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesGaleriaLugares {
  lugares: readonly LugarTuristico[];
}

/** las fotos de los lugares que pidió la persona, en una fila que se desliza, con su nombre abajo */
export function GaleriaLugares({ lugares }: PropiedadesGaleriaLugares) {
  const { colores } = useTema();
  if (lugares.length === 0) return null;
  return (
    <View style={estilos.contenedor}>
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {t('galeriaLugares.titulo')}
      </Text>
      <ScrollView
        contentContainerStyle={estilos.fila}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {lugares.map((lugar) => (
          <View
            accessibilityLabel={`${lugar.titulo}. ${lugar.descripcion}`}
            accessibilityRole="image"
            key={`${lugar.ciudad}-${lugar.titulo}`}
            style={[estilos.tarjeta, { backgroundColor: colores.bloqueNegro }]}
          >
            <Image
              contentFit="cover"
              contentPosition={{ left: '50%', top: `${lugar.enfoque}%` }}
              source={lugar.fuente}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={[conAlfa(colores.bloqueNegro, 0), colores.bloqueNegro]}
              style={estilos.pie}
            >
              <Text style={[tipografia.pequeno, { color: colores.ambar }]}>
                {lugar.ciudad}
              </Text>
              <Text
                numberOfLines={2}
                style={[tipografia.subtitulo, { color: colores.sobreNegro }]}
              >
                {lugar.titulo}
              </Text>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: espacios.ocho },
  fila: { gap: espacios.doce, paddingRight: espacios.lateral },
  pie: {
    gap: 2,
    justifyContent: 'flex-end',
    minHeight: 80,
    padding: espacios.doce,
  },
  tarjeta: {
    borderRadius: radios.tarjeta,
    height: 170,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: 250,
  },
});
