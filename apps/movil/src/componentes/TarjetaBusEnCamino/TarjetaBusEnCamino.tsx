import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Autobus, varianteDeClave } from '@/componentes/Autobus';
import { Bloque } from '@/componentes/Bloque';
import type { BusEnCamino } from '@/datos/busesEnCamino';
import {
  formatoDuracion,
  formatoHora,
  formatoHoraCompleta,
  sufijoHora,
} from '@/datos/formato';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

const ANCHO_BUS = 40;

export interface PropiedadesTarjetaBusEnCamino {
  alElegir: () => void;
  bus: BusEnCamino;
  /** nombre de la terminal en la que está la persona */
  lugar: string;
  elegido: boolean;
}

/** un bus que viene hacia aquí: cuánto falta, cuándo se estima que llega y en qué punto del camino va */
export function TarjetaBusEnCamino({
  alElegir,
  bus,
  elegido,
  lugar,
}: PropiedadesTarjetaBusEnCamino) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const [ancho, establecerAncho] = useState(0);
  const avance = useRef(
    new Animated.Value(reducido ? bus.progreso : 0),
  ).current;
  const { salida } = bus;
  const enVivo = bus.fuente === 'en-vivo';

  useEffect(() => {
    if (reducido) {
      avance.setValue(bus.progreso);
      return;
    }
    Animated.timing(avance, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
      toValue: bus.progreso,
      useNativeDriver: true,
    }).start();
  }, [avance, bus.progreso, reducido]);

  const recorrido = Math.max(0, ancho - ANCHO_BUS);
  const etiquetaLlegada = `${formatoHora(bus.llegada)} ${sufijoHora(bus.llegada)}`;

  return (
    <Pressable
      accessibilityLabel={`${salida.origen} a ${salida.destino}, ${t('dondeViene.llegaEn')} ${bus.minutosRestantes} min, ${etiquetaLlegada}`}
      accessibilityRole="button"
      accessibilityState={{ selected: elegido }}
      onPress={alElegir}
    >
      <Bloque
        estiloContenido={[
          estilos.tarjeta,
          elegido && { borderColor: colores.ambar, borderWidth: 2 },
        ]}
      >
        <View style={estilos.fila}>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {`${t(`servicios.${salida.servicio}`)} · ${salida.placa}`}
          </Text>
          <View
            style={[
              estilos.fuente,
              {
                backgroundColor: enVivo
                  ? conAlfa(colores.aTiempo, 0.18)
                  : conAlfa(colores.tinta, 0.07),
              },
            ]}
          >
            <View
              style={[
                estilos.punto,
                {
                  backgroundColor: enVivo
                    ? colores.aTiempo
                    : colores.tintaSuave,
                },
              ]}
            />
            <Text
              style={[
                tipografia.etiqueta,
                { color: enVivo ? colores.aTiempo : colores.tintaSuave },
              ]}
            >
              {enVivo ? t('dondeViene.enVivo') : t('dondeViene.segunHorario')}
            </Text>
          </View>
        </View>

        <View style={estilos.fila}>
          <View style={estilos.llega}>
            <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
              {t('dondeViene.llegaEn')}
            </Text>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.55}
              numberOfLines={1}
              style={[tipografia.display, { color: colores.tinta }]}
            >
              {bus.minutosRestantes < 60
                ? `${bus.minutosRestantes} min`
                : formatoDuracion(bus.minutosRestantes)}
            </Text>
          </View>
          <View style={estilos.eta}>
            <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
              {t('dondeViene.llegadaEta')}
            </Text>
            <Text
              style={[tipografia.datoGrande, { color: colores.ambarTexto }]}
            >
              {formatoHora(bus.llegada)}
            </Text>
            <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
              {sufijoHora(bus.llegada)}
            </Text>
          </View>
        </View>

        <View style={estilos.camino}>
          <View style={estilos.extremos}>
            <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
              {salida.origen}
            </Text>
            <Text style={[tipografia.etiqueta, { color: colores.tinta }]}>
              {t('dondeViene.estasAca')}
            </Text>
          </View>
          <View
            onLayout={(evento) =>
              establecerAncho(evento.nativeEvent.layout.width)
            }
            style={estilos.pista}
          >
            <View style={[estilos.linea, { backgroundColor: colores.linea }]} />
            <Animated.View
              style={[
                estilos.recorrido,
                {
                  backgroundColor: colores.ambar,
                  transform: [{ scaleX: avance }],
                  width: ancho,
                },
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                estilos.bus,
                {
                  transform: [
                    {
                      translateX: avance.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, recorrido],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Autobus
                ancho={ANCHO_BUS}
                animado
                usarMiUnidad
                letrero=""
                variante={varianteDeClave(salida.placa)}
              />
            </Animated.View>
          </View>
        </View>

        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {bus.minutosParaSalir !== null
            ? rellenar(t('dondeViene.saleDe'), {
                minutos: bus.minutosParaSalir,
                origen: salida.origen,
              })
            : rellenar(t('dondeViene.unidades'), {
                km: Math.max(1, Math.round(bus.kmRestantes)),
                lugar,
              })}
          {bus.minutosParaSalir === null
            ? ` · ${rellenar(t('dondeViene.salioDe'), {
                hora: formatoHoraCompleta(salida.salida),
                origen: salida.origen,
              })}`
            : ''}
        </Text>
      </Bloque>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  bus: { left: 0, position: 'absolute', top: -ANCHO_BUS * 0.3 },
  camino: { gap: espacios.ocho },
  eta: { alignItems: 'flex-end', gap: 2, minWidth: 110 },
  extremos: { flexDirection: 'row', justifyContent: 'space-between' },
  fila: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fuente: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: espacios.ocho,
    paddingVertical: 3,
  },
  linea: {
    borderRadius: 3,
    height: 6,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 11,
  },
  llega: { flex: 1, gap: 2, paddingRight: espacios.doce },
  pista: { height: 28, justifyContent: 'center' },
  punto: { borderRadius: radios.pildora, height: 8, width: 8 },
  recorrido: {
    borderRadius: 3,
    height: 6,
    left: 0,
    position: 'absolute',
    top: 11,
    transformOrigin: 'left',
  },
  tarjeta: { gap: espacios.doce, padding: espacios.dieciseis },
});
