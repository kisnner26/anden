import {
  asientosDe,
  PLANOS,
  type Asiento,
  type ConfiguracionBus,
  type EstadoAsiento,
} from '@anden/dominio';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  LayoutAnimation,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { reproducirSonido } from '@/datos/sonidos';
import { useSensaciones } from '@/datos/useSensaciones';
import {
  distanciaEntreToques,
  NIVELES_DE_ZOOM,
  nivelDespuesDePellizcar,
} from '@/datos/zoomAsientos';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesMapaAsientos {
  alElegir: (numero: number) => void;
  configuracion: ConfiguracionBus;
  elegidos: readonly number[];
  estados: ReadonlyMap<number, EstadoAsiento>;
  /** asientos libres que quedan junto a los del grupo: se marcan con un borde ámbar */
  sugeridos?: readonly number[];
}

const LADO = 38;
const SEPARACION = 8;

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/** cada fila entra desde abajo un instante después de la anterior, como si el bus se armara de adelante hacia atrás */
function FilaAnimada({
  children,
  indice,
}: {
  children: ReactNode;
  indice: number;
}) {
  const reducido = useMovimientoReducido();
  const entrada = useRef(new Animated.Value(reducido ? 1 : 0)).current;

  useEffect(() => {
    if (reducido) return;
    Animated.spring(entrada, {
      delay: Math.min(indice, 14) * 45,
      friction: 8,
      tension: 80,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [entrada, indice, reducido]);

  return (
    <Animated.View
      style={[
        estilos.fila,
        {
          opacity: entrada,
          transform: [
            {
              translateY: entrada.interpolate({
                inputRange: [0, 1],
                outputRange: [22, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** el asiento que se elige salta, se agranda un instante y cae con rebote */
function AsientoQueSalta({
  children,
  elegido,
}: {
  children: ReactNode;
  elegido: boolean;
}) {
  const reducido = useMovimientoReducido();
  const salto = useRef(new Animated.Value(0)).current;
  const primera = useRef(true);

  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    if (!elegido || reducido) return;
    Animated.sequence([
      Animated.timing(salto, {
        duration: 110,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(salto, {
        friction: 3.2,
        tension: 170,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [elegido, reducido, salto]);

  return (
    <Animated.View
      style={{
        transform: [
          {
            translateY: salto.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -10],
            }),
          },
          {
            scale: salto.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.22],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

function etiquetaDe(asiento: Asiento, estado: EstadoAsiento, elegido: boolean) {
  const lugar =
    asiento.tipo === 'ventana'
      ? 'ventana'
      : asiento.tipo === 'pasillo'
        ? 'pasillo'
        : 'preferencial';
  const situacion = elegido
    ? t('asientos.tuyo').toLowerCase()
    : estado === 'libre'
      ? t('asientos.libre').toLowerCase()
      : estado === 'retenido'
        ? t('asientos.apartado').toLowerCase()
        : t('asientos.vendido').toLowerCase();
  return `${t('asientos.asiento')} ${asiento.numero}, ${lugar}, ${situacion}`;
}

/** el plano del bus visto desde arriba, dibujado desde la matriz de la configuración del dominio */
export function MapaAsientos({
  alElegir,
  configuracion,
  elegidos,
  estados,
  sugeridos = [],
}: PropiedadesMapaAsientos) {
  const { colores } = useTema();
  const sentir = useSensaciones();
  const [nivelZoom, establecerNivelZoom] = useState(0);
  const lado = LADO * NIVELES_DE_ZOOM[nivelZoom]!;
  const medida = { height: lado, width: lado };
  const nivelActual = useRef(0);
  nivelActual.current = nivelZoom;
  const distanciaInicial = useRef(0);

  // pellizcar con dos dedos acerca o aleja el plano, en pasos, y los asientos se reacomodan con resorte
  const pellizco = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (evento) =>
          evento.nativeEvent.touches.length === 2,
        onPanResponderMove: (evento) => {
          const distancia = distanciaEntreToques(
            evento.nativeEvent.touches as unknown as {
              pageX: number;
              pageY: number;
            }[],
          );
          if (distancia === 0) return;
          if (distanciaInicial.current === 0) {
            distanciaInicial.current = distancia;
            return;
          }
          const siguiente = nivelDespuesDePellizcar(
            nivelActual.current,
            distanciaInicial.current,
            distancia,
          );
          if (siguiente !== nivelActual.current) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
            establecerNivelZoom(siguiente);
            distanciaInicial.current = distancia;
          }
        },
        onPanResponderRelease: () => {
          distanciaInicial.current = 0;
        },
        onPanResponderTerminate: () => {
          distanciaInicial.current = 0;
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [],
  );
  const plano = PLANOS[configuracion];
  const asientos = new Map(
    asientosDe(configuracion).map((asiento) => [
      `${asiento.fila}:${asiento.columna}`,
      asiento,
    ]),
  );

  return (
    <View {...pellizco.panHandlers} style={estilos.carcasa}>
      <Bloque
        estilo={estilos.carcasa}
        estiloContenido={estilos.plano}
        radio="carcasa"
        testID="mapa-asientos"
      >
        {plano.map((celdas, fila) => (
          <FilaAnimada indice={fila} key={fila}>
            {celdas.map((celda, columna) => {
              const clave = `${fila}:${columna}`;
              const asiento = asientos.get(clave);

              if (celda === 'volante') {
                return (
                  <View key={clave} style={[estilos.celda, medida]}>
                    <Icono nombre="volante" tamano="ilustracion" />
                  </View>
                );
              }
              if (celda === 'puerta') {
                if (celdas[columna - 1] === 'puerta') return null;
                let ancho = 1;
                while (celdas[columna + ancho] === 'puerta') ancho += 1;
                return (
                  <View
                    key={clave}
                    style={[
                      estilos.puerta,
                      {
                        borderLeftColor: colores.linea,
                        width: ancho * lado + (ancho - 1) * SEPARACION,
                        height: lado,
                      },
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        tipografia.etiqueta,
                        { color: colores.tintaSuave },
                      ]}
                    >
                      {t('asientos.puerta')}
                    </Text>
                  </View>
                );
              }
              if (celda !== 'asiento' || !asiento) {
                return <View key={clave} style={[estilos.celda, medida]} />;
              }

              const estado = estados.get(asiento.numero) ?? 'libre';
              const elegido = elegidos.includes(asiento.numero);
              const ocupado = estado !== 'libre';
              const sugerido = !elegido && sugeridos.includes(asiento.numero);

              return (
                <Pressable
                  accessibilityLabel={`${etiquetaDe(asiento, estado, elegido)}${sugerido ? `, ${t('asientos.juntoAlGrupo')}` : ''}`}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: ocupado, selected: elegido }}
                  disabled={ocupado}
                  key={clave}
                  onPress={() => {
                    sentir('seleccion');
                    void reproducirSonido('toque');
                    alElegir(asiento.numero);
                  }}
                  style={[estilos.celda, medida]}
                >
                  <AsientoQueSalta elegido={elegido}>
                    {elegido ? (
                      <LinearGradient
                        colors={[colores.ambar, colores.ambarProfundo]}
                        end={{ x: 1, y: 1 }}
                        start={{ x: 0, y: 0 }}
                        style={[estilos.asiento, medida]}
                      >
                        <Text
                          style={[
                            tipografia.dato,
                            { color: colores.sobreAmbar },
                          ]}
                        >
                          {asiento.numero}
                        </Text>
                      </LinearGradient>
                    ) : ocupado ? (
                      <View
                        style={[
                          estilos.asiento,
                          medida,
                          estado === 'retenido'
                            ? {
                                borderColor: colores.tintaSuave,
                                borderStyle: 'dashed',
                                borderWidth: 1.5,
                              }
                            : {
                                backgroundColor: colores.barroOscuro,
                              },
                        ]}
                      >
                        <Text
                          style={[
                            tipografia.dato,
                            { color: colores.tintaSuave },
                            estado !== 'retenido' && estilos.vendido,
                          ]}
                        >
                          {asiento.numero}
                        </Text>
                      </View>
                    ) : (
                      <Bloque
                        estiloContenido={[
                          estilos.asiento,
                          medida,
                          sugerido && {
                            borderColor: colores.ambar,
                            borderRadius: radios.asiento,
                            borderWidth: 2,
                          },
                        ]}
                        radio="asiento"
                      >
                        <Text
                          style={[tipografia.dato, { color: colores.tinta }]}
                        >
                          {asiento.numero}
                        </Text>
                      </Bloque>
                    )}
                  </AsientoQueSalta>
                </Pressable>
              );
            })}
          </FilaAnimada>
        ))}
      </Bloque>
    </View>
  );
}

const estilos = StyleSheet.create({
  asiento: {
    alignItems: 'center',
    borderRadius: radios.asiento,
    height: LADO,
    justifyContent: 'center',
    width: LADO,
  },
  carcasa: { alignSelf: 'center' },
  celda: {
    alignItems: 'center',
    height: LADO,
    justifyContent: 'center',
    width: LADO,
  },
  fila: { flexDirection: 'row', gap: SEPARACION },
  puerta: {
    alignItems: 'center',
    borderLeftWidth: 2,
    height: LADO,
    justifyContent: 'center',
  },
  vendido: { textDecorationLine: 'line-through' },
  plano: {
    gap: SEPARACION,
    paddingBottom: 18,
    paddingHorizontal: 18,
    paddingTop: 30,
  },
});
