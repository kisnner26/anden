import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Autobus, varianteDeClave } from '@/componentes/Autobus';
import { useSonidos } from '@/datos/useSonidos';
import { Icono } from '@/componentes/Icono';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

const ANCHO_BUS = 180;
const RECORRIDO = 340;

export interface PropiedadesAnimacionEnvio {
  alTerminar: () => void;
  destino: string;
}

/** el bus llega, recibe el paquete, la solicitud queda confirmada y el bus se va; dura poco y no tapa nada después */
export function AnimacionEnvio({
  alTerminar,
  destino,
}: PropiedadesAnimacionEnvio) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const bus = useRef(new Animated.Value(0)).current;
  const paquete = useRef(new Animated.Value(0)).current;
  const sello = useRef(new Animated.Value(0)).current;
  const sonar = useSonidos();

  // el soplo y el golpe del paquete acompañan la caída
  useEffect(() => {
    sonar('envio');
  }, [sonar]);

  useEffect(() => {
    if (reducido) {
      const espera = setTimeout(alTerminar, 900);
      return () => clearTimeout(espera);
    }
    const secuencia = Animated.sequence([
      Animated.timing(bus, {
        duration: movimiento.llegadaBus / 2,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(paquete, {
        duration: 520,
        easing: Easing.in(Easing.quad),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(sello, {
        bounciness: 14,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.delay(450),
      Animated.timing(bus, {
        duration: movimiento.salidaBus / 2,
        easing: Easing.in(Easing.cubic),
        toValue: 2,
        useNativeDriver: true,
      }),
    ]);
    secuencia.start(({ finished }) => {
      if (finished) alTerminar();
    });
    return () => secuencia.stop();
  }, [alTerminar, bus, paquete, reducido, sello]);

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[estilos.velo, { backgroundColor: conAlfa(colores.fondo, 0.94) }]}
      testID="animacion-envio"
    >
      <View style={estilos.escena}>
        {!reducido && (
          <>
            <Animated.View
              style={{
                transform: [
                  {
                    translateX: bus.interpolate({
                      inputRange: [0, 1, 2],
                      outputRange: [-RECORRIDO, 0, RECORRIDO],
                    }),
                  },
                ],
              }}
            >
              <Autobus
                ancho={ANCHO_BUS}
                letrero={destino.toUpperCase()}
                variante={varianteDeClave(destino)}
              />
            </Animated.View>
            <Animated.View
              style={[
                estilos.paquete,
                {
                  backgroundColor: colores.ambar,
                  opacity: paquete.interpolate({
                    inputRange: [0, 0.1, 0.92, 1],
                    outputRange: [0, 1, 1, 0],
                  }),
                  transform: [
                    {
                      translateY: paquete.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-130, -40],
                      }),
                    },
                    {
                      scale: paquete.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.55],
                      }),
                    },
                  ],
                },
              ]}
            />
          </>
        )}
        <Animated.View
          style={[
            estilos.sello,
            {
              opacity: reducido ? 1 : sello,
              transform: [{ scale: reducido ? 1 : sello }],
            },
          ]}
        >
          <View style={[estilos.circulo, { backgroundColor: colores.ambar }]}>
            <Icono nombre="confirmar" tamano="grande" />
          </View>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {t('encomiendas.enviada')}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  circulo: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  escena: { alignItems: 'center', gap: espacios.veinticuatro },
  paquete: {
    borderRadius: radios.asiento,
    height: 44,
    position: 'absolute',
    top: 0,
    width: 44,
  },
  sello: { alignItems: 'center', gap: espacios.doce },
  velo: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
});
