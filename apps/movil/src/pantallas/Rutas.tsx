import { ScrollView, StyleSheet, Text, View } from 'react-native';
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

/** las rutas de la terminal: kilómetros, duración, servicios con su tarifa de muestra y la próxima salida */
export function Rutas() {
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

      {rutas.map((ruta) => (
        <Bloque estiloContenido={estilos.ruta} key={ruta.id}>
          <View style={estilos.cabecera}>
            <Text
              accessibilityRole="header"
              style={[estilos.destino, { color: colores.tinta }]}
            >
              {ruta.destino}
            </Text>
            <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
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
                <Text style={[tipografia.dato, { color: colores.ambarTexto }]}>
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
      ))}
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {t('rutas.mapaPronto')}
      </Text>
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
