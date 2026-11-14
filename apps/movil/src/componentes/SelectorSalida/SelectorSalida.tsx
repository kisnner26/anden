import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { nivelDisponibilidad } from '@/datos/disponibilidad';
import { formatoFechaCorta, formatoHora, sufijoHora } from '@/datos/formato';
import { fraccionDeAsientos } from '@/datos/resumenDelDia';
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

/**
 * las salidas como una lista de renglones que ocupa todo el ancho: hora, servicio y una barra con los asientos
 * que quedan; la elegida lleva un marcador ámbar a la izquierda y un punto lleno a la derecha
 */
export function SelectorSalida({
  alElegir,
  conDia = false,
  elegida,
  salidas,
}: PropiedadesSelectorSalida) {
  const { colores } = useTema();
  const maximo = Math.max(1, ...salidas.map((s) => s.asientosLibres));

  return (
    <View style={estilos.lista}>
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
              estilos.renglon,
              {
                backgroundColor: activa
                  ? conAlfa(colores.ambar, 0.14)
                  : conAlfa(colores.tinta, 0.05),
                borderColor: activa ? colores.ambar : colores.linea,
              },
              pressed && estilos.presionada,
            ]}
          >
            <View style={estilos.hora}>
              {conDia && (
                <Text
                  style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
                >
                  {formatoFechaCorta(salida.salida)}
                </Text>
              )}
              <View style={estilos.horaFila}>
                <Text style={[tipografia.datoGrande, { color: colores.tinta }]}>
                  {formatoHora(salida.salida)}
                </Text>
                <Text
                  style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
                >
                  {sufijoHora(salida.salida)}
                </Text>
              </View>
            </View>
            <View style={estilos.centro}>
              <Text style={[tipografia.pequeno, { color: colores.tinta }]}>
                {t(`servicios.${salida.servicio}`)}
              </Text>
              <View style={estilos.barraFila}>
                <View
                  style={[
                    estilos.pista,
                    { backgroundColor: conAlfa(colores.tinta, 0.1) },
                  ]}
                >
                  <View
                    style={[
                      estilos.relleno,
                      {
                        backgroundColor: colorNivel,
                        width: `${Math.round(fraccionDeAsientos(salida.asientosLibres, maximo) * 100)}%`,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
                >
                  {nivel === 'agotado'
                    ? t('horarios.agotado')
                    : `${salida.asientosLibres} ${t('horarios.libres')}`}
                </Text>
              </View>
            </View>
            <View
              style={[
                estilos.marca,
                {
                  backgroundColor: activa ? colores.ambar : 'transparent',
                  borderColor: activa ? colores.ambar : colores.tintaSuave,
                },
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  barraFila: { alignItems: 'center', flexDirection: 'row', gap: espacios.ocho },
  centro: { flex: 1, gap: espacios.cuatro },
  hora: { gap: 0, minWidth: 86 },
  horaFila: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: espacios.cuatro,
  },
  lista: { gap: espacios.ocho },
  marca: { borderRadius: 11, borderWidth: 2, height: 22, width: 22 },
  pista: { borderRadius: 3, flex: 1, height: 6, overflow: 'hidden' },
  presionada: { opacity: 0.85 },
  relleno: { borderRadius: 3, height: 6 },
  renglon: {
    alignItems: 'center',
    borderRadius: radios.bloque,
    borderWidth: 2,
    flexDirection: 'row',
    gap: espacios.dieciseis,
    paddingHorizontal: espacios.dieciseis,
    paddingVertical: espacios.doce,
  },
});
