import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { nivelDisponibilidad } from '@/datos/disponibilidad';
import { formatoHoraCompleta } from '@/datos/formato';
import { posicionEnElDia } from '@/datos/resumenDelDia';
import type { Salida } from '@/datos/salidas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

const MARCA = 18;
const ETIQUETAS = [
  { posicion: 0, texto: '5 a. m.' },
  { posicion: 6 / 18, texto: '11 a. m.' },
  { posicion: 12 / 18, texto: '5 p. m.' },
  { posicion: 1, texto: '11 p. m.' },
] as const;

export interface PropiedadesLineaDelDia {
  ahora: Date;
  alElegir?: (viajeId: string) => void;
  /** si el día es hoy se marca la hora actual */
  esHoy: boolean;
  salidas: readonly Salida[];
}

/** todas las salidas del día sobre una línea de horas: de un vistazo se ve cuándo hay y cuántos asientos quedan */
export function LineaDelDia({
  ahora,
  alElegir,
  esHoy,
  salidas,
}: PropiedadesLineaDelDia) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const [ancho, establecerAncho] = useState(0);
  const entrada = useRef(new Animated.Value(reducido ? 1 : 0)).current;
  const util = Math.max(0, ancho - MARCA);

  useEffect(() => {
    if (reducido) return;
    entrada.setValue(0);
    Animated.spring(entrada, {
      friction: 6,
      tension: 70,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [entrada, reducido, salidas.length]);

  if (salidas.length === 0) return null;

  const ordenadas = [...salidas].sort(
    (a, b) => a.salida.getTime() - b.salida.getTime(),
  );

  return (
    <Bloque estiloContenido={estilos.tarjeta} testID="linea-del-dia">
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('vistaDia.lineaTitulo')}
      </Text>
      <View
        onLayout={(evento) => establecerAncho(evento.nativeEvent.layout.width)}
        style={estilos.pista}
      >
        <View style={[estilos.eje, { backgroundColor: colores.linea }]} />
        {esHoy && (
          <View
            accessibilityLabel={t('vistaDia.ahora')}
            style={[
              estilos.ahora,
              {
                backgroundColor: colores.tinta,
                left: posicionEnElDia(ahora) * util + MARCA / 2,
              },
            ]}
          />
        )}
        {ordenadas.map((salida, indice) => {
          const nivel = nivelDisponibilidad(salida.asientosLibres);
          const salio =
            salida.estado === 'en-ruta' || salida.estado === 'llego';
          const color =
            nivel === 'agotado'
              ? colores.cancelado
              : nivel === 'pocos'
                ? colores.ambarTexto
                : colores.ambar;
          return (
            <Animated.View
              key={salida.viajeId}
              style={[
                estilos.marca,
                {
                  left: posicionEnElDia(salida.salida) * util,
                  opacity: salio ? 0.35 : 1,
                  top: indice % 2 === 0 ? 4 : 30,
                  transform: [{ scale: entrada }],
                },
              ]}
            >
              <Pressable
                accessibilityLabel={rellenar(t('vistaDia.marca'), {
                  destino: salida.destino,
                  hora: formatoHoraCompleta(salida.salida),
                  libres: salida.asientosLibres,
                })}
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => alElegir?.(salida.viajeId)}
                style={[
                  estilos.punto,
                  { backgroundColor: color, borderColor: colores.fondo },
                ]}
              />
            </Animated.View>
          );
        })}
      </View>
      <View style={estilos.horas}>
        {ETIQUETAS.map(({ texto }) => (
          <Text
            key={texto}
            style={[tipografia.pequeno, { color: colores.tintaSuave }]}
          >
            {texto}
          </Text>
        ))}
      </View>
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  ahora: { bottom: 0, position: 'absolute', top: 0, width: 2 },
  eje: {
    borderRadius: 2,
    height: 3,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 24,
  },
  horas: { flexDirection: 'row', justifyContent: 'space-between' },
  marca: { position: 'absolute' },
  pista: { height: 52 },
  punto: {
    borderRadius: MARCA / 2,
    borderWidth: 2,
    height: MARCA,
    width: MARCA,
  },
  tarjeta: { gap: espacios.doce, padding: espacios.dieciseis },
});
