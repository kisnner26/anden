import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { mismoDia } from '@/datos/dias';
import { formatoDiaCorto } from '@/datos/formato';
import { FRANJAS, type Celda } from '@/datos/mapaDeCalor';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesMapaDeCalor {
  alElegirDia: (dia: Date) => void;
  celdas: readonly Celda[];
  dias: readonly Date[];
  seleccionado: Date;
}

const ANCHO_CELDA = 52;

/**
 * la semana de un vistazo: una cuadrícula de días por franjas del día donde cada casilla dice cuántas salidas hay y qué tan
 * fácil es conseguir lugar (verde sobra, ámbar queda poco, rojo casi lleno, vacía no hay bus); tocarla lleva a ese día
 */
export function MapaDeCalor({
  alElegirDia,
  celdas,
  dias,
  seleccionado,
}: PropiedadesMapaDeCalor) {
  const { colores } = useTema();

  function colorDe(celda: Celda): string | null {
    if (celda.salidas === 0) return null;
    if (celda.holgura === null) return colores.tintaSuave;
    if (celda.holgura > 0.45) return colores.aTiempo;
    if (celda.holgura > 0.15) return colores.ambar;
    return colores.cancelado;
  }

  function descripcion(celda: Celda): string {
    const lugar = `${formatoDiaCorto(celda.dia)}, ${t(`calor.${celda.franja}`)}`;
    if (celda.salidas === 0) return `${lugar}: ${t('calor.sinBuses')}`;
    const buses = rellenar(
      celda.salidas === 1 ? t('calor.unBus') : t('calor.variosBuses'),
      { n: celda.salidas },
    );
    const estado =
      celda.holgura === null
        ? ''
        : celda.holgura > 0.45
          ? `, ${t('calor.sobra')}`
          : celda.holgura > 0.15
            ? `, ${t('calor.poco')}`
            : `, ${t('calor.casiLleno')}`;
    return `${lugar}: ${buses}${estado}`;
  }

  return (
    <View style={estilos.contenedor} testID="mapa-de-calor">
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {t('calor.titulo')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={estilos.cuadricula}>
          <View style={estilos.fila}>
            <View style={estilos.rotulo} />
            {dias.map((dia) => (
              <Text
                key={dia.getTime()}
                style={[
                  tipografia.pequeno,
                  estilos.encabezado,
                  {
                    color: mismoDia(dia, seleccionado)
                      ? colores.ambarTexto
                      : colores.tintaSuave,
                  },
                ]}
              >
                {formatoDiaCorto(dia)}
              </Text>
            ))}
          </View>
          {FRANJAS.map((franja) => (
            <View key={franja} style={estilos.fila}>
              <View style={estilos.rotulo}>
                <Text
                  style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                >
                  {t(`calor.${franja}`)}
                </Text>
              </View>
              {dias.map((dia) => {
                const celda = celdas.find(
                  (c) => c.franja === franja && mismoDia(c.dia, dia),
                );
                if (!celda)
                  return <View key={dia.getTime()} style={estilos.celda} />;
                const color = colorDe(celda);
                const elegida = mismoDia(dia, seleccionado);
                return (
                  <Pressable
                    accessibilityLabel={descripcion(celda)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: elegida }}
                    key={dia.getTime()}
                    onPress={() => alElegirDia(dia)}
                    style={[
                      estilos.celda,
                      {
                        backgroundColor: color
                          ? conAlfa(color, 0.3)
                          : 'transparent',
                        borderColor: color
                          ? conAlfa(color, elegida ? 1 : 0.55)
                          : conAlfa(colores.tinta, 0.12),
                        borderStyle: color ? 'solid' : 'dashed',
                        borderWidth: elegida ? 2 : 1,
                      },
                    ]}
                  >
                    {celda.salidas > 0 ? (
                      <Text style={[tipografia.dato, { color: colores.tinta }]}>
                        {celda.salidas}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  celda: {
    alignItems: 'center',
    borderRadius: radios.loseta,
    height: 40,
    justifyContent: 'center',
    width: ANCHO_CELDA,
  },
  contenedor: { gap: espacios.ocho },
  cuadricula: { gap: espacios.cuatro },
  encabezado: { textAlign: 'center', width: ANCHO_CELDA },
  fila: { alignItems: 'center', flexDirection: 'row', gap: espacios.cuatro },
  rotulo: { justifyContent: 'center', width: 78 },
});
