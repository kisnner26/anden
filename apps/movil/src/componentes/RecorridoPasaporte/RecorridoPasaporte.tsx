import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Rect, Text as TextoSvg } from 'react-native-svg';

import { TERMINALES } from '@/datos/muestra';
import type { SelloDeCiudad } from '@/datos/pasaporte';
import { trazoEntre } from '@/datos/trazoCorredor';
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

const ANCHO = 300;
const ALTO = 170;
const MARGEN_X = 52;
const MARGEN_Y = 36;

const LineaAnimada = Animated.createAnimatedComponent(Line);

/** dónde cae cada ciudad en el dibujo, a partir de sus coordenadas reales */
function posiciones(): Record<string, { x: number; y: number }> {
  const lats = TERMINALES.map((x) => x.coordenadas.lat);
  const lngs = TERMINALES.map((x) => x.coordenadas.lng);
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
  const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];
  return Object.fromEntries(
    TERMINALES.map((terminal) => [
      terminal.ciudad,
      {
        x:
          MARGEN_X +
          ((terminal.coordenadas.lng - minLng) / (maxLng - minLng)) *
            (ANCHO - 2 * MARGEN_X),
        y:
          MARGEN_Y +
          (1 - (terminal.coordenadas.lat - minLat) / (maxLat - minLat)) *
            (ALTO - 2 * MARGEN_Y),
      },
    ]),
  );
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
  const lugar = posiciones();
  const managua = lugar.Managua!;
  const tramos = ciudades
    .filter((c) => c.ciudad !== 'Managua')
    .map((c) => ({
      km: trazoEntre('Managua', c.ciudad)?.distanciaKm ?? 0,
      llegadas: c.llegadas,
      nombre: c.ciudad,
      pos: lugar[c.ciudad]!,
    }));
  const algunaHecha = tramos.some((x) => x.llegadas > 0);

  useEffect(() => {
    if (reducido) {
      trazo.setValue(1);
      return;
    }
    if (!activo) return;
    Animated.timing(trazo, {
      delay: retardo,
      duration: movimiento.trazoRecorrido,
      easing: Easing.inOut(Easing.cubic),
      toValue: 1,
      useNativeDriver: false,
    }).start();
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
        {tramos.map((tramo) => {
          const largo = Math.hypot(
            tramo.pos.x - managua.x,
            tramo.pos.y - managua.y,
          );
          const hecho = tramo.llegadas > 0;
          return (
            <G key={tramo.nombre}>
              <Line
                stroke={p.guilloche}
                strokeDasharray="3 6"
                strokeLinecap="round"
                strokeWidth={2}
                x1={managua.x}
                x2={tramo.pos.x}
                y1={managua.y}
                y2={tramo.pos.y}
              />
              {hecho ? (
                <LineaAnimada
                  stroke={p.tintaSello}
                  strokeDasharray={`${largo} ${largo}`}
                  strokeDashoffset={trazo.interpolate({
                    inputRange: [0, 1],
                    outputRange: [largo, 0],
                  })}
                  strokeLinecap="round"
                  strokeWidth={3}
                  x1={managua.x}
                  x2={tramo.pos.x}
                  y1={managua.y}
                  y2={tramo.pos.y}
                />
              ) : null}
              <Rect
                fill={p.hoja}
                height={15}
                rx={4}
                width={52}
                x={(managua.x + tramo.pos.x) / 2 - 26}
                y={(managua.y + tramo.pos.y) / 2 - 8}
              />
              <TextoSvg
                fill={p.tintaHojaSuave}
                fontSize={9}
                fontWeight="700"
                letterSpacing={1}
                textAnchor="middle"
                x={(managua.x + tramo.pos.x) / 2}
                y={(managua.y + tramo.pos.y) / 2 + 3}
              >
                {rellenar(t('pasaporte.recorridoKm'), { km: tramo.km })}
              </TextoSvg>
            </G>
          );
        })}
        {[{ nombre: 'Managua', hecho: true, pos: managua }, ...tramos].map(
          (c) => {
            const hecho = 'llegadas' in c ? c.llegadas > 0 : true;
            return (
              <G key={c.nombre}>
                <Circle
                  cx={c.pos.x}
                  cy={c.pos.y}
                  fill={hecho ? p.tintaSello : p.hoja}
                  r={hecho ? 8 : 7}
                  stroke={hecho ? p.hoja : p.tintaHojaSuave}
                  strokeWidth={hecho ? 3 : 1.6}
                />
                <TextoSvg
                  fill={p.tintaHoja}
                  fontSize={10}
                  fontWeight="800"
                  letterSpacing={1.2}
                  textAnchor="middle"
                  x={c.pos.x}
                  y={c.pos.y + 24}
                >
                  {c.nombre.toUpperCase()}
                </TextoSvg>
              </G>
            );
          },
        )}
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
