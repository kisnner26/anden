import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { nivelDisponibilidad } from '@/datos/disponibilidad';
import { formatoHora, formatoHoraCompleta, sufijoHora } from '@/datos/formato';
import {
  agruparPorFranja,
  altoDeBarra,
  type FranjaDelDia,
} from '@/datos/resumenDelDia';
import type { Salida } from '@/datos/salidas';
import { coloresFranja } from '@/tema/colores';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

const ANCHO_COLUMNA = 50;
const ALTO_MAXIMO = 72;

const NOMBRE_FRANJA: Record<FranjaDelDia, () => string> = {
  madrugada: () => t('vistaDia.madrugada'),
  manana: () => t('vistaDia.manana'),
  noche: () => t('vistaDia.noche'),
  tarde: () => t('vistaDia.tarde'),
};

export interface PropiedadesLineaDelDia {
  ahora: Date;
  alElegir?: (viajeId: string) => void;
  /** si el día es hoy se marca dónde está "ahora" y se apagan las que ya salieron */
  esHoy: boolean;
  salidas: readonly Salida[];
}

function Columna({
  alElegir,
  indice,
  maximo,
  salida,
  yaSalio,
}: {
  alElegir?: (viajeId: string) => void;
  indice: number;
  maximo: number;
  salida: Salida;
  yaSalio: boolean;
}) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const crecimiento = useRef(new Animated.Value(reducido ? 1 : 0)).current;

  useEffect(() => {
    if (reducido) return;
    Animated.spring(crecimiento, {
      delay: Math.min(indice, 14) * 45,
      friction: 7,
      tension: 80,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [crecimiento, indice, reducido]);

  const nivel = nivelDisponibilidad(salida.asientosLibres);
  const color =
    nivel === 'agotado'
      ? colores.cancelado
      : nivel === 'pocos'
        ? colores.ambarTexto
        : colores.ambar;
  const alto = altoDeBarra(salida.asientosLibres, maximo, 8, ALTO_MAXIMO);

  return (
    <Pressable
      accessibilityLabel={rellenar(t('vistaDia.marca'), {
        destino: salida.destino,
        hora: formatoHoraCompleta(salida.salida),
        libres: salida.asientosLibres,
      })}
      accessibilityRole="button"
      onPress={() => alElegir?.(salida.viajeId)}
      style={({ pressed }) => [
        estilos.columna,
        { opacity: yaSalio ? 0.38 : 1 },
        pressed && estilos.presionada,
      ]}
    >
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {salida.asientosLibres > 0 ? salida.asientosLibres : '0'}
      </Text>
      <View style={estilos.carril}>
        <Animated.View
          style={[
            estilos.barra,
            {
              backgroundColor: color,
              height: alto,
              transform: [{ scaleY: crecimiento }],
              transformOrigin: 'bottom',
            },
          ]}
        />
      </View>
      <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
        {formatoHora(salida.salida)}
      </Text>
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {sufijoHora(salida.salida)}
      </Text>
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {salida.codigoDestino}
      </Text>
    </Pressable>
  );
}

/**
 * las salidas del día como columnas: cada una muestra cuántos asientos quedan con una barra que crece,
 * agrupadas por momento del día (mañana, tarde, noche); las que ya salieron se apagan y se marca "ahora"
 */
export function LineaDelDia({
  ahora,
  alElegir,
  esHoy,
  salidas,
}: PropiedadesLineaDelDia) {
  const { colores } = useTema();
  if (salidas.length === 0) return null;

  const grupos = agruparPorFranja(salidas);
  const maximo = Math.max(1, ...salidas.map((s) => s.asientosLibres));
  const antesDeAhora = (salida: Salida) =>
    esHoy && salida.salida.getTime() < ahora.getTime();
  const primeraPorSalir = salidas
    .filter((s) => !antesDeAhora(s))
    .sort((a, b) => a.salida.getTime() - b.salida.getTime())[0];
  const indicePrimera = primeraPorSalir
    ? [...salidas]
        .sort((a, b) => a.salida.getTime() - b.salida.getTime())
        .indexOf(primeraPorSalir)
    : 0;
  let contador = 0;

  return (
    <Bloque estiloContenido={estilos.tarjeta} testID="linea-del-dia">
      <View style={estilos.cabecera}>
        <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
          {t('vistaDia.lineaTitulo')}
        </Text>
        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {t('vistaDia.leyenda')}
        </Text>
      </View>
      <ScrollView
        contentOffset={{
          x: Math.max(0, indicePrimera * ANCHO_COLUMNA - ANCHO_COLUMNA),
          y: 0,
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <View style={estilos.fila}>
          {grupos.map((grupo) => {
            const [claro, oscuro] = coloresFranja[grupo.franja];
            return (
              <View key={grupo.franja} style={estilos.grupo}>
                <LinearGradient
                  colors={[oscuro, claro]}
                  end={{ x: 1, y: 0 }}
                  start={{ x: 0, y: 0 }}
                  style={estilos.franja}
                >
                  <Text
                    style={[tipografia.etiqueta, { color: colores.sobreNegro }]}
                  >
                    {NOMBRE_FRANJA[grupo.franja]()}
                  </Text>
                </LinearGradient>
                <View style={estilos.columnas}>
                  {grupo.salidas.map((salida) => {
                    const indice = contador;
                    contador += 1;
                    return (
                      <Columna
                        alElegir={alElegir}
                        indice={indice}
                        key={salida.viajeId}
                        maximo={maximo}
                        salida={salida}
                        yaSalio={antesDeAhora(salida)}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
      {esHoy && primeraPorSalir ? (
        <Text
          accessibilityLabel={t('vistaDia.ahora')}
          style={[tipografia.pequeno, { color: colores.tintaSuave }]}
        >
          {rellenar(t('vistaDia.siguiente'), {
            hora: formatoHoraCompleta(primeraPorSalir.salida),
          })}
        </Text>
      ) : null}
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  barra: { borderRadius: radios.cuadrado + 4, width: 22 },
  cabecera: { gap: 2 },
  carril: {
    alignItems: 'center',
    height: ALTO_MAXIMO,
    justifyContent: 'flex-end',
  },
  columna: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: espacios.cuatro,
    width: ANCHO_COLUMNA,
  },
  columnas: { flexDirection: 'row' },
  fila: { flexDirection: 'row', gap: espacios.ocho },
  franja: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    paddingVertical: espacios.cuatro,
  },
  grupo: { gap: espacios.ocho },
  presionada: { transform: [{ scale: 0.95 }] },
  tarjeta: { gap: espacios.doce, padding: espacios.dieciseis },
});
