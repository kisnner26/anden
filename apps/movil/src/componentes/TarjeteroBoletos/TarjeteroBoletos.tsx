import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { Autobus, varianteDeClave } from '@/componentes/Autobus';
import { BarridoDeLuz } from '@/componentes/BarridoDeLuz';
import { estadoVisibleBoleto, minutosHastaSalida } from '@/datos/estadoBoleto';
import { formatoFechaCorta, formatoHoraCompleta } from '@/datos/formato';
import type { BoletoGuardado } from '@/datos/reserva';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

const ALTO_TARJETA = 152;
/** cuánto asoma cada tarjeta que queda detrás cuando el montón está cerrado */
const ASOMO = 18;
const SEPARACION = 12;
const MAXIMO_VISIBLES = 4;
const REDUCCION_POR_NIVEL = 0.055;

export interface PropiedadesTarjeteroBoletos {
  ahora: Date;
  alAbrirBoleto: (boletoId: string) => void;
  boletos: readonly BoletoGuardado[];
  /** boletos que ya pasaron: se ven apagados y sin barrido de luz */
  pasados?: boolean;
}

/** los boletos como tarjetas en perspectiva: cerrados forman un montón simétrico y al tocarlo se despliegan en columna */
export function TarjeteroBoletos({
  ahora,
  alAbrirBoleto,
  boletos,
  pasados = false,
}: PropiedadesTarjeteroBoletos) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const [abierto, establecerAbierto] = useState(false);
  const n = boletos.length;
  const visibles = Math.min(n, MAXIMO_VISIBLES);
  const despliegue = useRef(new Animated.Value(0)).current;
  const altura = useRef(new Animated.Value(0)).current;
  const entrada = useRef(new Animated.Value(reducido ? 1 : 0)).current;

  const alturaCerrado = ALTO_TARJETA + (visibles - 1) * ASOMO;
  const alturaAbierto = n * ALTO_TARJETA + (n - 1) * SEPARACION;

  useEffect(() => {
    altura.setValue(alturaCerrado);
  }, [altura, alturaCerrado]);

  useEffect(() => {
    if (reducido) return;
    Animated.spring(entrada, {
      bounciness: 6,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [entrada, reducido]);

  function alternar(siguiente: boolean) {
    establecerAbierto(siguiente);
    const duracion = reducido ? 0 : movimiento.despliegueTarjetas;
    Animated.parallel([
      Animated.spring(despliegue, {
        bounciness: 5,
        speed: reducido ? 100 : 12,
        toValue: siguiente ? 1 : 0,
        useNativeDriver: true,
      }),
      Animated.timing(altura, {
        duration: duracion,
        toValue: siguiente ? alturaAbierto : alturaCerrado,
        useNativeDriver: false,
      }),
    ]).start();
  }

  function tarjeta(guardado: BoletoGuardado, indice: number) {
    const { boleto, resumen } = guardado;
    const salida = new Date(resumen.salida);
    const nivel = Math.min(indice, visibles - 1);
    const yCerrado = (visibles - 1 - nivel) * ASOMO;
    const yAbierto = indice * (ALTO_TARJETA + SEPARACION);
    const escala = 1 - nivel * REDUCCION_POR_NIVEL;
    const estado = estadoVisibleBoleto(guardado, ahora);
    const cuando =
      estado === 'vigente'
        ? `${t('boletos.saleEn')} ${minutosHastaSalida(guardado, ahora)} ${t('viajar.minutos')}`
        : {
            cancelado: t('boleto.cancelado'),
            usado: t('boleto.usado'),
            vencido: t('boleto.vencido'),
          }[estado];
    const variante = varianteDeClave(resumen.destino);

    return (
      <Animated.View
        key={boleto.id}
        style={[
          estilos.tarjeta,
          {
            opacity: despliegue.interpolate({
              inputRange: [0, 1],
              outputRange: [indice < visibles ? 1 : 0, 1],
            }),
            transform: [
              { perspective: 900 },
              {
                translateY: despliegue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [yCerrado, yAbierto],
                }),
              },
              {
                rotateX: despliegue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [`${nivel * 4}deg`, '0deg'],
                }),
              },
              {
                scale: despliegue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [escala, 1],
                }),
              },
            ],
            shadowColor: colores.sombraRelieve,
            zIndex: n - indice,
          },
        ]}
      >
        <Pressable
          accessibilityLabel={`${resumen.destino}, ${formatoFechaCorta(salida)}, ${formatoHoraCompleta(salida)}, ${t('boletos.asientoCorto')} ${boleto.asiento}`}
          accessibilityRole="button"
          onPress={() => {
            if (n > 1 && !abierto) alternar(true);
            else alAbrirBoleto(boleto.id);
          }}
          style={estilos.pulsable}
        >
          <LinearGradient
            colors={[colores.bloqueNegroClaro, colores.bloqueNegro]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={[
              estilos.cara,
              {
                borderColor: conAlfa(colores.luzRelieve, 0.12),
                opacity: pasados ? 0.72 : 1,
              },
            ]}
          >
            <View style={estilos.fila}>
              <View style={estilos.textos}>
                <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
                  {cuando}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[tipografia.subtitulo, { color: colores.sobreNegro }]}
                >
                  {resumen.destino}
                </Text>
                <Text
                  style={[
                    tipografia.pequeno,
                    { color: colores.sobreNegroSuave },
                  ]}
                >
                  {`${formatoFechaCorta(salida)} · ${formatoHoraCompleta(salida)}`}
                </Text>
              </View>
              <Autobus
                ancho={92}
                letrero={resumen.destino.toUpperCase()}
                variante={variante}
              />
            </View>
            <View style={estilos.perforacion}>
              <View
                style={[
                  estilos.linea,
                  { borderColor: conAlfa(colores.luzRelieve, 0.18) },
                ]}
              />
            </View>
            <View style={estilos.fila}>
              <View>
                <Text
                  style={[
                    tipografia.etiqueta,
                    { color: colores.sobreNegroSuave },
                  ]}
                >
                  {t('boletos.asientoCorto')}
                </Text>
                <Text style={[tipografia.dato, { color: colores.sobreNegro }]}>
                  {boleto.asiento}
                </Text>
              </View>
              <View style={estilos.derecha}>
                <Text
                  style={[
                    tipografia.etiqueta,
                    { color: colores.sobreNegroSuave },
                  ]}
                >
                  {t('boletos.codigoCorto')}
                </Text>
                <Text style={[tipografia.dato, { color: colores.ambar }]}>
                  {boleto.codigo}
                </Text>
              </View>
            </View>
            {!pasados && indice === 0 && (
              <BarridoDeLuz radio={radios.bloqueNegro} retraso={500} />
            )}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View>
      <Animated.View
        style={{
          opacity: entrada,
          transform: [
            {
              translateY: entrada.interpolate({
                inputRange: [0, 1],
                outputRange: [48, 0],
              }),
            },
          ],
        }}
      >
        <Animated.View style={[estilos.zona, { height: altura }]}>
          {boletos.map((guardado, indice) => tarjeta(guardado, indice))}
        </Animated.View>
      </Animated.View>
      {n > 1 && (
        <Pressable
          accessibilityRole="button"
          onPress={() => alternar(!abierto)}
          style={estilos.alternar}
        >
          <Text style={[tipografia.subtitulo, { color: colores.ambarTexto }]}>
            {abierto
              ? t('boletos.recoger')
              : t('boletos.cantidad').replace('{{cantidad}}', String(n))}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  alternar: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: espacios.doce,
    minHeight: 48,
  },
  cara: {
    borderRadius: radios.bloqueNegro,
    borderWidth: 1,
    gap: espacios.doce,
    height: ALTO_TARJETA,
    overflow: 'hidden',
    padding: espacios.dieciseis,
  },
  derecha: { alignItems: 'flex-end' },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linea: { borderStyle: 'dashed', borderTopWidth: 1 },
  perforacion: { justifyContent: 'center' },
  pulsable: { borderRadius: radios.bloqueNegro },
  tarjeta: {
    elevation: 6,
    left: 0,
    position: 'absolute',
    right: 0,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    top: 0,
  },
  textos: { flex: 1, gap: espacios.cuatro },
  zona: {},
});
