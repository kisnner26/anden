import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { formatoDuracion, formatoHoraCompleta } from '@/datos/formato';
import { armarRutas } from '@/datos/rutas';
import { obtenerMuestra, useAhora } from '@/datos/useSalidas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';
import { useMemo } from 'react';

export interface PropiedadesRutas {
  alAbrirRuta?: (id: string) => void;
}

/** mapa esquemático de las rutas y sus salidas desde la terminal elegida. */
export function Rutas({ alAbrirRuta }: PropiedadesRutas) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const ahora = useAhora();
  const rutas = useMemo(() => armarRutas(obtenerMuestra(), ahora), [ahora]);

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        { paddingBottom: 130, paddingTop: margenes.top + 8 },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <Text style={[estilos.titulo, { color: colores.tinta }]}>
        {t('rutas.titulo')}
        <Text style={{ color: colores.ambarTitular }}>.</Text>
      </Text>
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('rutas.detalle')}
      </Text>
      <View accessibilityLabel="Mapa esquemático de rutas" style={estilos.mapa}>
        <Svg height={190} width="100%" viewBox="0 0 320 190">
          {rutas.map((ruta, indice) => {
            const x = 55 + (indice % 3) * 105;
            const y = 40 + Math.floor(indice / 3) * 100;
            return (
              <Line
                key={ruta.id}
                stroke={colores.ambar}
                strokeWidth={5}
                x1={160}
                x2={x}
                y1={95}
                y2={y}
              />
            );
          })}
          <Circle cx={160} cy={95} fill={colores.bloqueNegro} r={16} />
          {rutas.map((ruta, indice) => (
            <Circle
              fill={colores.ambar}
              key={`nodo-${ruta.id}`}
              cx={55 + (indice % 3) * 105}
              cy={40 + Math.floor(indice / 3) * 100}
              r={11}
            />
          ))}
        </Svg>
        {rutas.map((ruta) => (
          <Pressable
            accessibilityLabel={`Abrir ruta a ${ruta.destino}`}
            accessibilityRole="button"
            key={`boton-${ruta.id}`}
            onPress={() => alAbrirRuta?.(ruta.id)}
          >
            <Text style={[tipografia.pequeno, { color: colores.tinta }]}>
              {ruta.destino}
            </Text>
          </Pressable>
        ))}
      </View>

      {rutas.map((ruta) => (
        <Pressable
          accessibilityLabel={`Abrir ruta a ${ruta.destino}`}
          accessibilityRole="button"
          key={ruta.id}
          onPress={() => alAbrirRuta?.(ruta.id)}
        >
          <Bloque estiloContenido={estilos.ruta}>
            <View style={estilos.cabecera}>
              <Text
                accessibilityRole="header"
                style={[estilos.destino, { color: colores.tinta }]}
              >
                {ruta.destino}
              </Text>
              <Text
                style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
              >
                {`${ruta.distanciaKm} ${t('rutas.km')} · ${formatoDuracion(ruta.duracionMin)}`}
              </Text>
            </View>

            <View style={estilos.servicios}>
              {ruta.servicios.map(({ servicio, tarifa }) => (
                <Bloque
                  estiloContenido={estilos.servicio}
                  hundido
                  key={servicio}
                  radio="pildora"
                >
                  <Text style={[tipografia.pequeno, { color: colores.tinta }]}>
                    {t(`servicios.${servicio}`)}
                  </Text>
                  <Text
                    style={[tipografia.dato, { color: colores.ambarTexto }]}
                  >
                    {tarifa === null ? t('rutas.sinTarifa') : `C$ ${tarifa}`}
                  </Text>
                </Bloque>
              ))}
            </View>

            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {ruta.proximaSalida
                ? `${t('rutas.proximaSalida')} ${formatoHoraCompleta(ruta.proximaSalida)}`
                : t('rutas.sinSalidas')}
            </Text>
          </Bloque>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  cabecera: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  destino: {
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 34,
    lineHeight: 36,
  },
  ruta: { gap: espacios.doce, padding: espacios.veinticuatro },
  mapa: { alignItems: 'center', gap: espacios.ocho },
  servicio: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.ocho,
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.ocho,
  },
  servicios: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
  titulo: {
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 46,
    lineHeight: 48,
  },
});
