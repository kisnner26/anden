import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { formatoHoraCompleta } from '@/datos/formato';
import { TERMINALES } from '@/datos/muestra';
import type { ResumenDeTramo } from '@/datos/resumenDeLaRed';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesRedViva {
  alElegir: (ciudad: 'Boaco' | 'Juigalpa') => void;
  ciudad: 'Boaco' | 'Juigalpa';
  tramos: readonly ResumenDeTramo[];
}

const ANCHO = 320;
const ALTO = 190;
const MARGEN_X = 46;
const MARGEN_Y = 34;

/** la posición de cada ciudad en el dibujo, a partir de sus coordenadas reales: se ve la geografía y no un esquema inventado */
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
 * la red de Managua, Boaco y Juigalpa dibujada donde de verdad están, con el próximo bus de cada tramo sobre su línea: se
 * ve a qué ciudad sale algo pronto y se toca para planear ese viaje
 */
export function RedViva({ alElegir, ciudad, tramos }: PropiedadesRedViva) {
  const { colores } = useTema();
  const lugar = posiciones();
  const managua = lugar.Managua!;

  return (
    <View style={estilos.contenedor} testID="red-viva">
      <View style={{ height: ALTO, width: ANCHO }}>
        <Svg height={ALTO} width={ANCHO}>
          {tramos.map((tramo) => {
            const fin = lugar[tramo.ciudad]!;
            const elegido = tramo.ciudad === ciudad;
            return (
              <Line
                key={tramo.ciudad}
                stroke={elegido ? colores.ambar : conAlfa(colores.tinta, 0.25)}
                strokeLinecap="round"
                strokeWidth={elegido ? 4 : 2}
                x1={managua.x}
                x2={fin.x}
                y1={managua.y}
                y2={fin.y}
              />
            );
          })}
          {Object.entries(lugar).map(([nombre, p]) => (
            <Circle
              cx={p.x}
              cy={p.y}
              fill={nombre === ciudad ? colores.ambar : colores.fondo}
              key={nombre}
              r={nombre === 'Managua' ? 9 : 8}
              stroke={
                nombre === ciudad || nombre === 'Managua'
                  ? colores.ambar
                  : conAlfa(colores.tinta, 0.5)
              }
              strokeWidth={2.5}
            />
          ))}
        </Svg>

        <Text
          style={[
            tipografia.etiqueta,
            estilos.nombre,
            { color: colores.tinta, left: managua.x - 30, top: managua.y + 12 },
          ]}
        >
          Managua
        </Text>

        {tramos.map((tramo) => {
          const p = lugar[tramo.ciudad]!;
          const mitad = { x: (managua.x + p.x) / 2, y: (managua.y + p.y) / 2 };
          const elegido = tramo.ciudad === ciudad;
          const descripcion = tramo.proxima
            ? rellenar(t('red.accesible'), {
                ciudad: tramo.ciudad,
                hora: formatoHoraCompleta(tramo.proxima),
                libres: tramo.libresEnLaProxima ?? 0,
              })
            : rellenar(t('red.sinSalidas'), { ciudad: tramo.ciudad });
          return (
            <View key={tramo.ciudad}>
              <Pressable
                accessibilityLabel={descripcion}
                accessibilityRole="button"
                accessibilityState={{ selected: elegido }}
                hitSlop={10}
                onPress={() => alElegir(tramo.ciudad)}
                style={[
                  estilos.etiquetaTramo,
                  {
                    backgroundColor: colores.fondo,
                    borderColor: elegido
                      ? colores.ambar
                      : conAlfa(colores.tinta, 0.2),
                    left: mitad.x - 38,
                    top: mitad.y - 15,
                  },
                ]}
              >
                <Text style={[tipografia.dato, { color: colores.tinta }]}>
                  {tramo.proxima
                    ? formatoHoraCompleta(tramo.proxima)
                    : t('red.nada')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel={tramo.ciudad}
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => alElegir(tramo.ciudad)}
                style={[estilos.nombre, { left: p.x - 36, top: p.y - 32 }]}
              >
                <Text
                  style={[
                    tipografia.etiqueta,
                    { color: elegido ? colores.ambarTexto : colores.tinta },
                  ]}
                >
                  {tramo.ciudad}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { alignItems: 'center' },
  etiquetaTramo: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    borderWidth: 1.5,
    height: 30,
    justifyContent: 'center',
    paddingHorizontal: espacios.ocho,
    position: 'absolute',
    width: 76,
  },
  nombre: { position: 'absolute', width: 72 },
});
