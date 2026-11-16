import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path, Text as TextoSvg } from 'react-native-svg';

import { MAPA_PUNTOS } from '@/datos/mapaPuntos';
import { TERMINALES } from '@/datos/muestra';
import type { SelloDeCiudad } from '@/datos/pasaporte';
import { trazoEntre } from '@/datos/trazoCorredor';
import { conAlfa } from '@/tema/alfa';
import { paletaPasaporte as p } from '@/tema/colores';
import { espacios } from '@/tema/espacios';
import { movimiento } from '@/tema/movimiento';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesRecorridoPasaporte {
  ciudades: readonly SelloDeCiudad[];
  /** cuánto espera para empezar a dibujar las rutas */
  retardo?: number;
  activo?: boolean;
}

const ANCHO = 320;
/** el alto sale de la proporción del mapa para que los puntos no se estiren */
const ALTO = Math.round(
  (ANCHO * (MAPA_PUNTOS.lat1 - MAPA_PUNTOS.lat0)) /
    (MAPA_PUNTOS.lon1 - MAPA_PUNTOS.lon0),
);
/** un punto cada tantas casillas de la cuadrícula: más junto se ve pesado y gasta más en el dibujo */
const SALTO = 2;

const TrazoAnimado = Animated.createAnimatedComponent(Path);

interface Punto {
  x: number;
  y: number;
}

/** dónde cae una coordenada real en el dibujo */
function aPlano(lat: number, lng: number): Punto {
  return {
    x:
      ((lng - MAPA_PUNTOS.lon0) / (MAPA_PUNTOS.lon1 - MAPA_PUNTOS.lon0)) *
      ANCHO,
    y:
      ((MAPA_PUNTOS.lat1 - lat) / (MAPA_PUNTOS.lat1 - MAPA_PUNTOS.lat0)) * ALTO,
  };
}

/** los puntos de tierra del mapa como dos trazos (Nicaragua y sus vecinos): un solo Path por color, no un círculo por punto */
function puntosDelMapa(): { nicaragua: string; vecinos: string } {
  let nicaragua = '';
  let vecinos = '';
  MAPA_PUNTOS.filas.forEach((fila, f) => {
    if (f % SALTO !== 0) return;
    for (let c = 0; c < fila.length; c += SALTO) {
      const casilla = fila[c];
      if (casilla === '0') continue;
      const x = ((c + 0.5) / fila.length) * ANCHO;
      const y = ((f + 0.5) / MAPA_PUNTOS.filas.length) * ALTO;
      const punto = `M${x.toFixed(1)} ${y.toFixed(1)}h0`;
      if (casilla === '2') nicaragua += punto;
      else vecinos += punto;
    }
  });
  return { nicaragua, vecinos };
}

/** un arco que sale de Managua y se curva hacia el norte, como las rutas de un mapa de vuelos */
function arco(
  desde: Punto,
  hasta: Punto,
): { d: string; largo: number; medio: Punto } {
  const mx = (desde.x + hasta.x) / 2;
  const my = (desde.y + hasta.y) / 2;
  const distancia = Math.hypot(hasta.x - desde.x, hasta.y - desde.y);
  const control = { x: mx, y: my - Math.max(18, distancia * 0.45) };
  let largo = 0;
  let anterior = desde;
  for (let i = 1; i <= 24; i += 1) {
    const t = i / 24;
    const x =
      (1 - t) ** 2 * desde.x + 2 * (1 - t) * t * control.x + t ** 2 * hasta.x;
    const y =
      (1 - t) ** 2 * desde.y + 2 * (1 - t) * t * control.y + t ** 2 * hasta.y;
    largo += Math.hypot(x - anterior.x, y - anterior.y);
    anterior = { x, y };
  }
  return {
    d: `M${desde.x} ${desde.y}Q${control.x} ${control.y} ${hasta.x} ${hasta.y}`,
    largo,
    medio: {
      x: 0.25 * desde.x + 0.5 * control.x + 0.25 * hasta.x,
      y: 0.25 * desde.y + 0.5 * control.y + 0.25 * hasta.y,
    },
  };
}

/**
 * el mapa del recorrido sobre la hoja del pasaporte: las rutas que ya hiciste se dibujan con tinta, de a poco, hasta
 * su ciudad; las que faltan quedan punteadas. Cada tramo lleva sus kilómetros
 */
export function RecorridoPasaporte({
  ciudades,
  retardo = 0,
  activo = true,
}: PropiedadesRecorridoPasaporte) {
  const reducido = useMovimientoReducido();
  const trazo = useRef(new Animated.Value(reducido ? 1 : 0)).current;
  const mapa = useMemo(puntosDelMapa, []);
  const managua = useMemo(() => {
    const t = TERMINALES.find((x) => x.ciudad === 'Managua')!;
    return aPlano(t.coordenadas.lat, t.coordenadas.lng);
  }, []);
  const tramos = ciudades
    .filter((c) => c.ciudad !== 'Managua')
    .map((c) => {
      const terminal = TERMINALES.find((x) => x.ciudad === c.ciudad)!;
      const pos = aPlano(terminal.coordenadas.lat, terminal.coordenadas.lng);
      return {
        arco: arco(managua, pos),
        km: trazoEntre('Managua', c.ciudad)?.distanciaKm ?? 0,
        llegadas: c.llegadas,
        nombre: c.ciudad,
        pos,
      };
    });
  const algunaHecha = tramos.some((x) => x.llegadas > 0);

  useEffect(() => {
    if (reducido) {
      trazo.setValue(1);
      return;
    }
    if (!activo) return;
    const animacion = Animated.timing(trazo, {
      delay: retardo,
      duration: movimiento.trazoRecorrido,
      easing: Easing.inOut(Easing.cubic),
      toValue: 1,
      useNativeDriver: false,
    });
    animacion.start();
    return () => animacion.stop();
  }, [activo, reducido, retardo, trazo]);

  return (
    <View
      accessible
      accessibilityLabel={
        algunaHecha ? t('pasaporte.recorrido') : t('pasaporte.recorridoVacio')
      }
      style={estilos.contenedor}
      testID="recorrido-pasaporte"
    >
      <Svg height={ALTO} viewBox={`0 0 ${ANCHO} ${ALTO}`} width="100%">
        <Path
          d={mapa.vecinos}
          stroke={conAlfa(p.tintaHojaSuave, 0.22)}
          strokeLinecap="round"
          strokeWidth={3.2}
        />
        <Path
          d={mapa.nicaragua}
          stroke={conAlfa(p.tintaHoja, 0.42)}
          strokeLinecap="round"
          strokeWidth={3.6}
        />
        {tramos.map((tramo) => {
          const hecho = tramo.llegadas > 0;
          return (
            <G key={tramo.nombre}>
              <Path
                d={tramo.arco.d}
                fill="none"
                stroke={hecho ? conAlfa(p.tintaSello, 0.25) : p.tintaHojaSuave}
                strokeDasharray="2 5"
                strokeLinecap="round"
                strokeWidth={1.6}
              />
              {hecho ? (
                <TrazoAnimado
                  d={tramo.arco.d}
                  fill="none"
                  stroke={p.tintaSello}
                  strokeDasharray={`${tramo.arco.largo} ${tramo.arco.largo}`}
                  strokeDashoffset={trazo.interpolate({
                    inputRange: [0, 1],
                    outputRange: [tramo.arco.largo, 0],
                  })}
                  strokeLinecap="round"
                  strokeWidth={3}
                />
              ) : null}
            </G>
          );
        })}
        {[
          { nombre: 'Managua', hecho: true, llegadas: 0, pos: managua },
          ...tramos,
        ].map((c) => {
          const hecho = c.nombre === 'Managua' ? true : c.llegadas > 0;
          // el nombre va hacia afuera de la ruta para que no lo tapen los arcos ni los kilómetros
          const aLaIzquierda = c.pos.x <= managua.x;
          const arriba = c.pos.y < managua.y - 12;
          const sinLugarALaDerecha = c.pos.x > ANCHO - 90;
          const etiqueta = arriba
            ? { ancla: 'middle' as const, x: c.pos.x, y: c.pos.y - 15 }
            : sinLugarALaDerecha
              ? { ancla: 'middle' as const, x: c.pos.x, y: c.pos.y + 25 }
              : aLaIzquierda
                ? { ancla: 'end' as const, x: c.pos.x - 15, y: c.pos.y + 4 }
                : { ancla: 'start' as const, x: c.pos.x + 15, y: c.pos.y + 4 };
          return (
            <G key={c.nombre}>
              {hecho ? (
                <Circle
                  cx={c.pos.x}
                  cy={c.pos.y}
                  fill={conAlfa(p.tintaSello, 0.16)}
                  r={13}
                />
              ) : null}
              <Circle
                cx={c.pos.x}
                cy={c.pos.y}
                fill={hecho ? p.tintaSello : p.hoja}
                r={hecho ? 6.5 : 5.5}
                stroke={hecho ? p.hoja : p.tintaHojaSuave}
                strokeWidth={hecho ? 2.4 : 1.6}
              />
              <TextoSvg
                fill={p.tintaHoja}
                fontSize={10}
                fontWeight="800"
                letterSpacing={1.2}
                textAnchor={etiqueta.ancla}
                x={etiqueta.x}
                y={etiqueta.y}
              >
                {c.nombre.toUpperCase()}
              </TextoSvg>
              {'km' in c && c.km > 0 ? (
                <TextoSvg
                  fill={hecho ? p.tintaSello : p.tintaHojaSuave}
                  fontSize={8.5}
                  fontWeight="700"
                  letterSpacing={0.8}
                  textAnchor={etiqueta.ancla}
                  x={etiqueta.x}
                  y={etiqueta.y + 11}
                >
                  {rellenar(t('pasaporte.recorridoKm'), { km: c.km })}
                </TextoSvg>
              ) : null}
            </G>
          );
        })}
      </Svg>
      {!algunaHecha ? (
        <Text style={[tipografia.pequeno, estilos.vacio]}>
          {t('pasaporte.recorridoVacio')}
        </Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: espacios.ocho },
  vacio: { color: p.tintaHojaSuave, textAlign: 'center' },
});
