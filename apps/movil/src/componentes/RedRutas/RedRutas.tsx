import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Svg, { Circle, G, Path, Text as TextoSvg } from 'react-native-svg';

import { Autobus, varianteDeClave } from '@/componentes/Autobus';
import {
  CIUDADES_RED,
  type CiudadRed,
  type SeleccionRed,
} from '@/datos/redRutas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

const ANCHO = 360;
const ALTO = 190;
const RADIO_NODO = 30;
const NODOS = {
  Boaco: { x: 46, y: 140 },
  Juigalpa: { x: 314, y: 140 },
  Managua: { x: 180, y: 140 },
} as const;
/** punto de control de cada arco: los dos suben la misma altura, así la red es simétrica */
const CONTROL = {
  Boaco: { x: 113, y: 8 },
  Juigalpa: { x: 247, y: 8 },
} as const;
const CODIGOS = { Boaco: 'BOA', Juigalpa: 'JUI', Managua: 'MAN' } as const;
const MUESTRAS = 12;
const SEGUNDOS_POR_TRAMO = 9000;

/**
 * los trazos y los anillos se animan por JavaScript (las propiedades del dibujo no admiten el
 * controlador nativo); en las pruebas esas actualizaciones continuas no se envuelven en act, así que se apagan
 */
const ANIMAR_DIBUJO = process.env.NODE_ENV !== 'test';

const CirculoAnimado = Animated.createAnimatedComponent(Circle);
const TrazoAnimado = Animated.createAnimatedComponent(Path);

function bezier(ciudad: CiudadRed, t: number) {
  const a = NODOS.Managua;
  const c = CONTROL[ciudad];
  const b = NODOS[ciudad];
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
  };
}

function trazoDe(ciudad: CiudadRed): string {
  const a = NODOS.Managua;
  const c = CONTROL[ciudad];
  const b = NODOS[ciudad];
  return `M${a.x} ${a.y} Q${c.x} ${c.y} ${b.x} ${b.y}`;
}

interface Recorrido {
  grados: number[];
  progresos: number[];
  xs: number[];
  ys: number[];
}

/** muestras del recorrido de un bus: posición y cuánto se inclina según la pendiente; la vuelta recorre el arco al revés */
function recorrido(ciudad: CiudadRed, ida: boolean): Recorrido {
  const progresos: number[] = [];
  const xs: number[] = [];
  const ys: number[] = [];
  const grados: number[] = [];
  for (let i = 0; i <= MUESTRAS; i += 1) {
    const avance = i / MUESTRAS;
    const parametro = ida ? avance : 1 - avance;
    const p = bezier(ciudad, parametro);
    const siguiente = bezier(
      ciudad,
      Math.min(1, Math.max(0, parametro + (ida ? 0.02 : -0.02))),
    );
    const vx = siguiente.x - p.x;
    const vy = siguiente.y - p.y;
    // de perfil: hacia la derecha el frente sube girando en sentido antihorario; hacia la izquierda, al revés
    const inclinacion =
      vx >= 0
        ? (Math.atan2(vy, vx) * 180) / Math.PI
        : (-Math.atan2(vy, -vx) * 180) / Math.PI;
    progresos.push(avance);
    xs.push(p.x);
    ys.push(p.y);
    grados.push(Math.max(-30, Math.min(30, inclinacion)));
  }
  return { grados, progresos, xs, ys };
}

export interface PropiedadesRedRutas {
  alElegirCiudad: (ciudad: CiudadRed) => void;
  /** tocar Managua invierte el sentido */
  alInvertir: () => void;
  seleccion: SeleccionRed;
}

function BusDeLaRed({
  ancho,
  ciudad,
  escala,
  fase,
  ida,
  quieto,
  resaltado,
}: {
  ancho: number;
  ciudad: CiudadRed;
  escala: number;
  fase: number;
  ida: boolean;
  quieto: boolean;
  resaltado: boolean;
}) {
  const avance = useRef(new Animated.Value(quieto ? 0.5 : fase)).current;
  const muestras = useMemo(() => recorrido(ciudad, ida), [ciudad, ida]);
  const alto = (ancho * 300) / 520;

  useEffect(() => {
    if (quieto) {
      avance.setValue(0.5);
      return;
    }
    const vuelta = Animated.loop(
      Animated.timing(avance, {
        duration: SEGUNDOS_POR_TRAMO,
        easing: Easing.inOut(Easing.sin),
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    // arranca desde su fase para que los buses no salgan todos juntos
    avance.setValue(fase);
    Animated.timing(avance, {
      duration: SEGUNDOS_POR_TRAMO * (1 - fase),
      easing: Easing.linear,
      toValue: 1,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        avance.setValue(0);
        vuelta.start();
      }
    });
    return () => {
      avance.stopAnimation();
      vuelta.stop();
    };
  }, [avance, fase, quieto]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        estilos.bus,
        {
          height: alto,
          opacity: resaltado ? 1 : 0.55,
          transform: [
            {
              translateX: avance.interpolate({
                inputRange: muestras.progresos,
                outputRange: muestras.xs.map((x) => x * escala - ancho / 2),
              }),
            },
            {
              translateY: avance.interpolate({
                inputRange: muestras.progresos,
                outputRange: muestras.ys.map((y) => y * escala - alto * 0.85),
              }),
            },
            {
              rotate: avance.interpolate({
                inputRange: muestras.progresos,
                outputRange: muestras.grados.map((g) => `${g}deg`),
              }),
            },
          ],
          width: ancho,
        },
      ]}
    >
      <Autobus
        ancho={ancho}
        espejo={ciudad === 'Boaco' ? ida : !ida}
        letrero={CODIGOS[ciudad]}
        variante={varianteDeClave(`${ciudad}${ida ? 'ida' : 'vuelta'}`)}
      />
    </Animated.View>
  );
}

/**
 * mapa simbólico de la red: Managua al centro y las dos ciudades a los lados, unidas por arcos
 * iguales. Por cada arco viajan dos buses, uno en cada sentido, mirando hacia donde van. Se toca
 * una ciudad para elegirla y Managua para invertir el sentido.
 */
export function RedRutas({
  alElegirCiudad,
  alInvertir,
  seleccion,
}: PropiedadesRedRutas) {
  const { colores } = useTema();
  const reducido = useMovimientoReducido();
  const flujo = useRef(new Animated.Value(0)).current;
  const pulso = useRef(new Animated.Value(0)).current;
  const entrada = useRef(
    new Animated.Value(reducido || !ANIMAR_DIBUJO ? 1 : 0),
  ).current;
  const [anchoReal, establecerAncho] = useState(0);
  const escala = anchoReal / ANCHO;

  function tocar(nombre: keyof typeof NODOS) {
    void Haptics.selectionAsync().catch(() => undefined);
    if (nombre === 'Managua') alInvertir();
    else alElegirCiudad(nombre);
  }

  useEffect(() => {
    if (reducido || !ANIMAR_DIBUJO) return;
    Animated.spring(entrada, {
      bounciness: 8,
      toValue: 1,
      useNativeDriver: true,
    }).start();
    const flujoContinuo = Animated.loop(
      Animated.timing(flujo, {
        duration: 1400,
        easing: Easing.linear,
        toValue: -24,
        useNativeDriver: false,
      }),
    );
    const latido = Animated.loop(
      Animated.timing(pulso, {
        duration: 1800,
        easing: Easing.out(Easing.quad),
        toValue: 1,
        useNativeDriver: false,
      }),
    );
    flujoContinuo.start();
    latido.start();
    return () => {
      flujoContinuo.stop();
      latido.stop();
    };
  }, [entrada, flujo, pulso, reducido]);

  return (
    <Animated.View
      accessibilityLabel={t('rutas.redDescripcion')}
      style={[
        estilos.marco,
        {
          opacity: entrada,
          transform: [
            {
              scale: entrada.interpolate({
                inputRange: [0, 1],
                outputRange: [0.92, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View
        onLayout={(evento: LayoutChangeEvent) =>
          establecerAncho(evento.nativeEvent.layout.width)
        }
        style={estilos.lienzo}
        testID="red-rutas"
      >
        <Svg
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          viewBox={`0 0 ${ANCHO} ${ALTO}`}
          width="100%"
        >
          {CIUDADES_RED.map((ciudad) => {
            const elegida = seleccion.ciudad === ciudad;
            return (
              <TrazoAnimado
                d={trazoDe(ciudad)}
                fill="none"
                key={ciudad}
                stroke={elegida ? colores.ambar : colores.linea}
                strokeDasharray="2 10"
                strokeDashoffset={flujo}
                strokeLinecap="round"
                strokeWidth={elegida ? 5 : 3}
              />
            );
          })}
          {(Object.keys(NODOS) as (keyof typeof NODOS)[]).map((nombre) => {
            const nodo = NODOS[nombre];
            const elegida = nombre !== 'Managua' && seleccion.ciudad === nombre;
            return (
              <G key={nombre}>
                {elegida && (
                  <CirculoAnimado
                    cx={nodo.x}
                    cy={nodo.y}
                    fill="none"
                    opacity={pulso.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 0],
                    })}
                    r={pulso.interpolate({
                      inputRange: [0, 1],
                      outputRange: [RADIO_NODO, RADIO_NODO + 22],
                    })}
                    stroke={colores.ambar}
                    strokeWidth={3}
                  />
                )}
                <Circle
                  cx={nodo.x}
                  cy={nodo.y}
                  fill={colores.bloqueNegro}
                  r={RADIO_NODO}
                  stroke={
                    elegida || nombre === 'Managua'
                      ? colores.ambar
                      : colores.linea
                  }
                  strokeWidth={elegida ? 4 : 2.5}
                />
                <TextoSvg
                  fill={colores.ambar}
                  fontFamily="JetBrainsMono_600SemiBold"
                  fontSize={15}
                  textAnchor="middle"
                  x={nodo.x}
                  y={nodo.y + 5}
                >
                  {CODIGOS[nombre]}
                </TextoSvg>
              </G>
            );
          })}
        </Svg>

        {/* los buses y los toques se dibujan encima con la misma escala del dibujo */}
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          {(Object.keys(NODOS) as (keyof typeof NODOS)[]).map((nombre) => (
            <Pressable
              accessibilityLabel={nombre}
              accessibilityRole="button"
              accessibilityState={{
                selected: nombre !== 'Managua' && seleccion.ciudad === nombre,
              }}
              key={nombre}
              onPress={() => tocar(nombre)}
              style={{
                height: RADIO_NODO * 2 * escala + 8,
                left: (NODOS[nombre].x - RADIO_NODO) * escala - 4,
                position: 'absolute',
                top: (NODOS[nombre].y - RADIO_NODO) * escala - 4,
                width: RADIO_NODO * 2 * escala + 8,
              }}
            />
          ))}
          {escala > 0 &&
            CIUDADES_RED.flatMap((ciudad) =>
              [true, false].map((ida) => (
                <BusDeLaRed
                  ancho={Math.max(34, 48 * escala)}
                  ciudad={ciudad}
                  escala={escala}
                  fase={ida ? 0 : 0.5}
                  ida={ida}
                  key={`${ciudad}${ida}`}
                  quieto={reducido}
                  resaltado={seleccion.ciudad === ciudad}
                />
              )),
            )}
        </View>
      </View>

      <View style={estilos.nombres}>
        {(['Boaco', 'Managua', 'Juigalpa'] as const).map((nombre) => (
          <Text
            key={nombre}
            style={[
              tipografia.nombreFila,
              estilos.nombre,
              {
                color:
                  nombre === 'Managua' || seleccion.ciudad === nombre
                    ? colores.tinta
                    : colores.tintaSuave,
                left: NODOS[nombre].x * escala - 48,
              },
            ]}
          >
            {nombre}
          </Text>
        ))}
      </View>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  bus: { left: 0, position: 'absolute', top: 0 },
  lienzo: { aspectRatio: ANCHO / ALTO, width: '100%' },
  marco: { gap: espacios.cuatro },
  nombre: { position: 'absolute', textAlign: 'center', top: 0, width: 96 },
  nombres: { height: 28 },
});
