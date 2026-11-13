import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Autobus, varianteDeClave } from '@/componentes/Autobus';
import { Bloque } from '@/componentes/Bloque';
import { formatoDuracion } from '@/datos/formato';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

const ANCHO_BUS = 56;

export interface PropiedadesTrayectoCorredor {
  destino: string;
  distanciaKm: number | null;
  duracionMin: number | null;
  origen: string;
  /** cambia cada vez que se elige otra salida: el bus recorre el trayecto una vez */
  recorrido: string;
}

/** el trayecto en una línea: origen a la izquierda, destino a la derecha, el bus que lo recorre y lo que se estima que dura */
export function TrayectoCorredor({
  destino,
  distanciaKm,
  duracionMin,
  origen,
  recorrido,
}: PropiedadesTrayectoCorredor) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const [ancho, establecerAncho] = useState(0);
  const avance = useRef(new Animated.Value(reducido ? 0.5 : 0)).current;

  useEffect(() => {
    if (reducido || ancho === 0) return;
    avance.setValue(0);
    Animated.timing(avance, {
      duration: 1600,
      easing: Easing.inOut(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [ancho, avance, recorrido, reducido]);

  const recorridoUtil = Math.max(0, ancho - ANCHO_BUS);

  return (
    <Bloque estiloContenido={estilos.tarjeta}>
      <View style={estilos.extremos}>
        <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
          {origen}
        </Text>
        <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
          {destino}
        </Text>
      </View>
      <View
        onLayout={(evento) => establecerAncho(evento.nativeEvent.layout.width)}
        style={estilos.linea}
      >
        <View
          style={[estilos.punto, { backgroundColor: colores.bloqueNegro }]}
        />
        <View style={[estilos.guia, { borderColor: colores.linea }]} />
        <View style={[estilos.punto, { backgroundColor: colores.ambar }]} />
        <Animated.View
          pointerEvents="none"
          style={[
            estilos.bus,
            {
              transform: [
                {
                  translateX: avance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, recorridoUtil],
                  }),
                },
              ],
            },
          ]}
        >
          <Autobus
            ancho={ANCHO_BUS}
            letrero=""
            variante={varianteDeClave(`${origen}${destino}`)}
          />
        </Animated.View>
      </View>
      <View style={estilos.datos}>
        <View style={estilos.dato}>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            numberOfLines={1}
            style={[tipografia.dato, { color: colores.tinta }]}
          >
            {distanciaKm !== null ? Math.round(distanciaKm) : '—'}
          </Text>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {t('rutas.km')}
          </Text>
        </View>
        <View style={[estilos.divisor, { backgroundColor: colores.linea }]} />
        <View style={estilos.dato}>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            numberOfLines={1}
            style={[tipografia.dato, { color: colores.tinta }]}
          >
            {duracionMin !== null ? formatoDuracion(duracionMin) : '—'}
          </Text>
          <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
            {t('rutas.duracionEstimada')}
          </Text>
        </View>
      </View>
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  bus: { left: 0, position: 'absolute', top: -ANCHO_BUS * 0.34 },
  dato: { alignItems: 'center', flex: 1, gap: espacios.cuatro },
  datos: { alignItems: 'center', flexDirection: 'row' },
  divisor: { alignSelf: 'stretch', width: 1 },
  extremos: { flexDirection: 'row', justifyContent: 'space-between' },
  guia: {
    borderStyle: 'dashed',
    borderTopWidth: 2,
    flex: 1,
    marginHorizontal: espacios.ocho,
  },
  linea: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 28,
    marginTop: espacios.dieciseis,
  },
  punto: { borderRadius: radios.pildora, height: 14, width: 14 },
  tarjeta: { gap: espacios.doce, padding: espacios.lateral },
});
