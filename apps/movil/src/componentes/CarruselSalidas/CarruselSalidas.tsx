import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icono } from '@/componentes/Icono';
import { minutosParaSalir, nivelDisponibilidad } from '@/datos/disponibilidad';
import { formatoHora, formatoHoraCompleta, sufijoHora } from '@/datos/formato';
import { fraccionDeAsientos } from '@/datos/resumenDelDia';
import type { Salida } from '@/datos/salidas';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

const COLUMNA_HORA = 76;
const NODO = 14;

/** el nodo de la línea: lleno y latiendo si es la que sigue, hueco si falta, apagado si ya salió */
function Nodo({ esProxima, salio }: { esProxima: boolean; salio: boolean }) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const onda = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducido || !esProxima) return;
    const bucle = Animated.loop(
      Animated.timing(onda, {
        duration: 1600,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    bucle.start();
    return () => bucle.stop();
  }, [esProxima, onda, reducido]);

  return (
    <View style={estilos.nodoCaja}>
      {esProxima && !reducido ? (
        <Animated.View
          style={[
            estilos.onda,
            {
              backgroundColor: colores.ambar,
              opacity: onda.interpolate({
                inputRange: [0, 1],
                outputRange: [0.45, 0],
              }),
              transform: [
                {
                  scale: onda.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2.4],
                  }),
                },
              ],
            },
          ]}
        />
      ) : null}
      <View
        style={[
          estilos.nodo,
          esProxima
            ? { backgroundColor: colores.ambar, borderColor: colores.ambar }
            : {
                backgroundColor: salio ? colores.linea : colores.fondo,
                borderColor: salio ? colores.linea : colores.tintaSuave,
              },
        ]}
      />
    </View>
  );
}

/** la barra de asientos: una pista con el tramo que queda libre, del color de qué tan llena está */
function BarraDeAsientos({
  fraccion,
  libres,
}: {
  fraccion: number;
  libres: number;
}) {
  const { colores } = useTema();
  const nivel = nivelDisponibilidad(libres);
  const color =
    nivel === 'agotado'
      ? colores.cancelado
      : nivel === 'pocos'
        ? colores.ambar
        : colores.aTiempo;
  return (
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
            { backgroundColor: color, width: `${Math.round(fraccion * 100)}%` },
          ]}
        />
      </View>
      <Text style={[tipografia.etiqueta, { color: colores.tinta }]}>
        {libres}
      </Text>
      <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
        {t('horarios.libres')}
      </Text>
    </View>
  );
}

function Fila({
  alElegir,
  ahora,
  esProxima,
  indice,
  maximo,
  salio,
  salida,
  ultima,
}: {
  ahora: Date;
  alElegir?: (viajeId: string) => void;
  esProxima: boolean;
  indice: number;
  maximo: number;
  salida: Salida;
  salio: boolean;
  ultima: boolean;
}) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const entrada = useRef(new Animated.Value(reducido ? 1 : 0)).current;

  useEffect(() => {
    if (reducido) return;
    Animated.spring(entrada, {
      delay: Math.min(indice, 8) * 60,
      friction: 9,
      tension: 80,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [entrada, indice, reducido]);

  const falta = minutosParaSalir(salida, ahora);
  const expreso = salida.servicio === 'expreso';

  return (
    <Animated.View
      style={{
        opacity: Animated.multiply(entrada, salio ? 0.5 : 1),
        transform: [
          {
            translateX: entrada.interpolate({
              inputRange: [0, 1],
              outputRange: [-18, 0],
            }),
          },
        ],
      }}
      testID={
        esProxima ? 'salida-proxima' : salio ? 'salida-pasada' : 'salida-futura'
      }
    >
      <Pressable
        accessibilityLabel={rellenar(t('vistaDia.marca'), {
          destino: salida.destino,
          hora: formatoHoraCompleta(salida.salida),
          libres: salida.asientosLibres,
        })}
        accessibilityRole="button"
        onPress={() => alElegir?.(salida.viajeId)}
        style={({ pressed }) => [
          estilos.fila,
          esProxima && { backgroundColor: conAlfa(colores.ambar, 0.12) },
          pressed && estilos.presionada,
        ]}
      >
        <View style={estilos.hora}>
          <Text style={[estilos.numeral, { color: colores.tinta }]}>
            {formatoHora(salida.salida)}
          </Text>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {sufijoHora(salida.salida)}
          </Text>
        </View>
        <View style={estilos.columnaLinea}>
          <View
            style={[
              estilos.hilo,
              { backgroundColor: colores.linea, opacity: indice === 0 ? 0 : 1 },
            ]}
          />
          <Nodo esProxima={esProxima} salio={salio} />
          <View
            style={[
              estilos.hilo,
              { backgroundColor: colores.linea, opacity: ultima ? 0 : 1 },
            ]}
          />
        </View>
        <View style={estilos.detalle}>
          <View style={estilos.titulo}>
            <Text
              numberOfLines={1}
              style={[
                tipografia.subtitulo,
                estilos.destino,
                { color: colores.tinta },
              ]}
            >
              {salida.destino}
            </Text>
            {expreso ? (
              <Icono
                color={colores.ambarTexto}
                nombre="rayo"
                tamano="mediano"
              />
            ) : null}
            <Text style={[tipografia.dato, { color: colores.tinta }]}>
              {salida.tarifa === null ? '—' : `C$ ${salida.tarifa}`}
            </Text>
          </View>
          {esProxima && falta > 0 ? (
            <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
              {rellenar(t('vistaDia.enMinutos'), { minutos: falta })}
            </Text>
          ) : null}
          <BarraDeAsientos
            fraccion={fraccionDeAsientos(salida.asientosLibres, maximo)}
            libres={salida.asientosLibres}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export interface PropiedadesCarruselSalidas {
  ahora: Date;
  alElegir?: (viajeId: string) => void;
  /** si el día es hoy se marca la que sigue y se apagan las que ya salieron */
  esHoy: boolean;
  salidas: readonly Salida[];
}

/**
 * las salidas del día como una línea de tiempo: la hora a la izquierda, un hilo con un nodo por salida
 * (el que sigue late) y a la derecha el destino, la tarifa y una barra con los asientos que quedan
 */
export function CarruselSalidas({
  ahora,
  alElegir,
  esHoy,
  salidas,
}: PropiedadesCarruselSalidas) {
  const { colores } = useTema();
  if (salidas.length === 0) return null;

  const ordenadas = [...salidas].sort(
    (a, b) => a.salida.getTime() - b.salida.getTime(),
  );
  const salio = (salida: Salida) =>
    esHoy && salida.salida.getTime() < ahora.getTime();
  const indiceProxima = ordenadas.findIndex((salida) => !salio(salida));
  const maximo = Math.max(1, ...ordenadas.map((s) => s.asientosLibres));

  return (
    <View style={estilos.contenedor} testID="salidas-del-dia">
      <View style={estilos.cabecera}>
        <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
          {t('vistaDia.lineaTitulo')}
        </Text>
        <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
          {rellenar(
            t(
              ordenadas.length === 1 ? 'vistaDia.cuentaUna' : 'vistaDia.cuenta',
            ),
            { cantidad: ordenadas.length },
          )}
        </Text>
      </View>
      <View>
        {ordenadas.map((salida, indice) => (
          <Fila
            ahora={ahora}
            alElegir={alElegir}
            esProxima={esHoy && indice === indiceProxima}
            indice={indice}
            key={salida.viajeId}
            maximo={maximo}
            salida={salida}
            salio={salio(salida)}
            ultima={indice === ordenadas.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  barraFila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.cuatro,
  },
  cabecera: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  columnaLinea: {
    alignItems: 'center',
    alignSelf: 'stretch',
    width: NODO + 12,
  },
  contenedor: { gap: espacios.doce },
  destino: { flex: 1 },
  detalle: { flex: 1, gap: espacios.cuatro, paddingVertical: espacios.doce },
  fila: {
    alignItems: 'stretch',
    borderRadius: radios.bloque,
    flexDirection: 'row',
    paddingRight: espacios.doce,
  },
  hilo: { flex: 1, width: 2 },
  hora: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: espacios.doce,
    width: COLUMNA_HORA,
  },
  nodo: { borderRadius: NODO, borderWidth: 2, height: NODO, width: NODO },
  nodoCaja: {
    alignItems: 'center',
    height: NODO,
    justifyContent: 'center',
    width: NODO,
  },
  numeral: {
    fontFamily: tipografia.display.fontFamily,
    fontSize: 30,
    lineHeight: 32,
  },
  onda: { borderRadius: NODO, height: NODO, position: 'absolute', width: NODO },
  pista: { borderRadius: 3, flex: 1, height: 6, overflow: 'hidden' },
  presionada: { opacity: 0.85 },
  relleno: { borderRadius: 3, height: 6 },
  titulo: { alignItems: 'center', flexDirection: 'row', gap: espacios.ocho },
});
