import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { nivelDisponibilidad } from '@/datos/disponibilidad';
import { formatoFechaCorta, formatoHora, sufijoHora } from '@/datos/formato';
import type { Salida } from '@/datos/salidas';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesSelectorSalida {
  alElegir: (viajeId: string) => void;
  /** con salidas de mañana se muestra el día en cada una */
  conDia?: boolean;
  elegida: string | null;
  salidas: readonly Salida[];
}

/** las salidas como fichas grandes que se deslizan; la elegida se oscurece y las que se llenan lo dicen */
export function SelectorSalida({
  alElegir,
  conDia = false,
  elegida,
  salidas,
}: PropiedadesSelectorSalida) {
  const { colores } = useTema();

  return (
    <ScrollView
      contentContainerStyle={estilos.pista}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {salidas.map((salida) => {
        const activa = salida.viajeId === elegida;
        const nivel = nivelDisponibilidad(salida.asientosLibres);
        const colorNivel =
          nivel === 'agotado'
            ? colores.cancelado
            : nivel === 'pocos'
              ? colores.ambar
              : colores.aTiempo;
        return (
          <Pressable
            accessibilityLabel={`${formatoHora(salida.salida)} ${sufijoHora(salida.salida)}, ${t(`servicios.${salida.servicio}`)}, ${salida.asientosLibres} ${t('horarios.libres')}`}
            accessibilityRole="button"
            accessibilityState={{ selected: activa }}
            key={salida.viajeId}
            onPress={() => {
              void Haptics.selectionAsync().catch(() => undefined);
              alElegir(salida.viajeId);
            }}
            style={({ pressed }) => [
              estilos.ficha,
              {
                backgroundColor: activa
                  ? colores.bloqueNegro
                  : conAlfa(colores.tinta, 0.06),
                borderColor: activa ? colores.ambar : colores.linea,
              },
              pressed && estilos.presionada,
            ]}
          >
            {conDia && (
              <Text
                style={[
                  tipografia.etiqueta,
                  {
                    color: activa
                      ? colores.sobreNegroSuave
                      : colores.tintaSuave,
                  },
                ]}
              >
                {formatoFechaCorta(salida.salida)}
              </Text>
            )}
            <Text
              style={[
                tipografia.datoGrande,
                { color: activa ? colores.sobreNegro : colores.tinta },
              ]}
            >
              {formatoHora(salida.salida)}
            </Text>
            <Text
              style={[
                tipografia.etiqueta,
                { color: activa ? colores.ambar : colores.ambarTexto },
              ]}
            >
              {sufijoHora(salida.salida)}
            </Text>
            <Text
              style={[
                tipografia.pequeno,
                { color: activa ? colores.sobreNegro : colores.tinta },
              ]}
            >
              {t(`servicios.${salida.servicio}`)}
            </Text>
            <View style={estilos.libres}>
              <View style={[estilos.punto, { backgroundColor: colorNivel }]} />
              <Text
                style={[
                  tipografia.etiqueta,
                  {
                    color: activa
                      ? colores.sobreNegroSuave
                      : colores.tintaSuave,
                  },
                ]}
              >
                {nivel === 'agotado'
                  ? t('horarios.agotado')
                  : `${salida.asientosLibres} ${t('horarios.libres')}`}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  ficha: {
    alignItems: 'center',
    borderRadius: radios.bloque,
    borderWidth: 2,
    gap: espacios.cuatro,
    minWidth: 112,
    paddingHorizontal: espacios.dieciseis,
    paddingVertical: espacios.dieciseis,
  },
  libres: { alignItems: 'center', flexDirection: 'row', gap: espacios.cuatro },
  pista: { gap: espacios.doce, paddingVertical: espacios.cuatro },
  presionada: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  punto: { borderRadius: radios.pildora, height: 8, width: 8 },
});
