import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Hoja } from '@/componentes/Hoja';
import { distanciaLegible, estadoDeLaBrujula } from '@/datos/brujula';
import { diferenciaDeRumbo, type Coordenada } from '@/datos/geometria';
import { useBrujula } from '@/datos/useBrujula';
import { conAlfa } from '@/tema/alfa';
import { espacios } from '@/tema/espacios';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesBrujulaAlPunto {
  abierta: boolean;
  alCerrar: () => void;
  punto: Coordenada;
}

/**
 * una flecha grande que gira con el teléfono y siempre apunta al punto de encuentro, con los metros que faltan: en una
 * terminal llena de buses sirve más que un mapa. Usa la ubicación y la brújula del teléfono, sin la cámara
 */
export function BrujulaAlPunto({
  abierta,
  alCerrar,
  punto,
}: PropiedadesBrujulaAlPunto) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const lectura = useBrujula(abierta);
  const giroAcumulado = useRef(0);
  const giroPrevio = useRef<number | null>(null);
  const rotacion = useRef(new Animated.Value(0)).current;

  const estado =
    lectura.posicion && lectura.haciaDondeMira !== null
      ? estadoDeLaBrujula(lectura.posicion, punto, lectura.haciaDondeMira)
      : null;
  const distancia = lectura.posicion
    ? estadoDeLaBrujula(lectura.posicion, punto, 0).distanciaM
    : null;

  useEffect(() => {
    if (!estado) return;
    // se suma el giro más corto para que la flecha no dé la vuelta entera al cruzar el norte
    const previo = giroPrevio.current;
    giroAcumulado.current +=
      previo === null ? estado.giro : diferenciaDeRumbo(previo, estado.giro);
    giroPrevio.current = estado.giro;
    if (reducido) rotacion.setValue(giroAcumulado.current);
    else
      Animated.spring(rotacion, {
        friction: 9,
        tension: 60,
        toValue: giroAcumulado.current,
        useNativeDriver: true,
      }).start();
  }, [estado, reducido, rotacion]);

  const mensaje =
    lectura.estado === 'sin-permiso'
      ? t('brujula.sinPermiso')
      : lectura.estado === 'desactivado'
        ? t('brujula.desactivado')
        : lectura.estado === 'cargando' || distancia === null
          ? t('brujula.buscando')
          : estado?.llego || (distancia !== null && distancia <= 20)
            ? t('brujula.llegaste')
            : estado === null
              ? t('brujula.calibrar')
              : rellenar(t('brujula.faltan'), {
                  distancia: distanciaLegible(estado.distanciaM),
                });

  return (
    <Hoja
      abierta={abierta}
      alCerrar={alCerrar}
      etiquetaCerrar={t('brujula.cerrar')}
    >
      <View style={estilos.contenido} testID="brujula-al-punto">
        <Text style={[tipografia.titulo, { color: colores.tinta }]}>
          {t('brujula.titulo')}
        </Text>
        <View
          accessibilityLabel={mensaje}
          accessible
          style={[estilos.disco, { borderColor: conAlfa(colores.tinta, 0.18) }]}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: rotacion.interpolate({
                    inputRange: [-3600, 3600],
                    outputRange: ['-3600deg', '3600deg'],
                  }),
                },
              ],
            }}
          >
            <Svg height={150} viewBox="0 0 100 100" width={150}>
              <Circle
                cx={50}
                cy={50}
                fill="none"
                r={46}
                stroke={conAlfa(colores.tinta, 0.1)}
                strokeWidth={2}
              />
              <Path
                d="M50 10 L72 62 L50 52 L28 62 Z"
                fill={estado?.llego ? colores.aTiempo : colores.ambar}
                stroke={colores.bloqueNegro}
                strokeLinejoin="round"
                strokeWidth={2.5}
              />
            </Svg>
          </Animated.View>
        </View>
        <Text
          accessibilityLiveRegion="polite"
          style={[tipografia.titularResumen, { color: colores.tinta }]}
        >
          {mensaje}
        </Text>
        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {t('brujula.ayuda')}
        </Text>
      </View>
    </Hoja>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    alignItems: 'center',
    gap: espacios.dieciseis,
    paddingBottom: espacios.dieciseis,
  },
  disco: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 190,
    justifyContent: 'center',
    width: 190,
  },
});
