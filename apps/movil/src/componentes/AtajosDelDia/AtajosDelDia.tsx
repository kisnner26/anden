import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { formatoHoraCompleta } from '@/datos/formato';
import type { AtajosDelDia as DatosAtajos } from '@/datos/resumenDelDia';
import type { Salida } from '@/datos/salidas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesAtajosDelDia {
  alAbrir?: (viajeId: string) => void;
  atajos: DatosAtajos;
}

/** tres respuestas rápidas con datos reales: la más barata, la más temprana y la que tiene más espacio */
export function AtajosDelDia({ alAbrir, atajos }: PropiedadesAtajosDelDia) {
  const { colores } = useTema();
  const filas: {
    clave: string;
    etiqueta: string;
    salida: Salida | null;
    valor: string;
  }[] = [
    {
      clave: 'barata',
      etiqueta: t('vistaDia.masBarata'),
      salida: atajos.masBarata,
      valor: atajos.masBarata ? `C$ ${atajos.masBarata.tarifa}` : '',
    },
    {
      clave: 'temprana',
      etiqueta: t('vistaDia.masTemprana'),
      salida: atajos.masTemprana,
      valor: atajos.masTemprana
        ? formatoHoraCompleta(atajos.masTemprana.salida)
        : '',
    },
    {
      clave: 'libre',
      etiqueta: t('vistaDia.masLibre'),
      salida: atajos.masLibre,
      valor: atajos.masLibre
        ? `${atajos.masLibre.asientosLibres} ${t('horarios.libres')}`
        : '',
    },
  ];
  const disponibles = filas.filter((fila) => fila.salida !== null);
  if (disponibles.length === 0) return null;

  return (
    <View style={estilos.contenedor} testID="atajos-del-dia">
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {t('vistaDia.atajos')}
      </Text>
      <View style={estilos.fila}>
        {disponibles.map(({ clave, etiqueta, salida, valor }) => (
          <Pressable
            accessibilityLabel={`${etiqueta}: ${salida?.destino}, ${valor}`}
            accessibilityRole="button"
            key={clave}
            onPress={() => salida && alAbrir?.(salida.viajeId)}
            style={({ pressed }) => [
              estilos.atajo,
              pressed && estilos.presionado,
            ]}
          >
            <Bloque estiloContenido={estilos.contenido}>
              <Text
                style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
              >
                {etiqueta}
              </Text>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                numberOfLines={1}
                style={[tipografia.dato, { color: colores.tinta }]}
              >
                {valor}
              </Text>
              <Text
                numberOfLines={1}
                style={[tipografia.pequeno, { color: colores.tintaSuave }]}
              >
                {salida?.destino}
              </Text>
            </Bloque>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  atajo: { flex: 1 },
  contenedor: { gap: espacios.ocho },
  contenido: { gap: 2, padding: espacios.doce },
  fila: { flexDirection: 'row', gap: espacios.ocho },
  presionado: { opacity: 0.9, transform: [{ scale: 0.98 }] },
});
