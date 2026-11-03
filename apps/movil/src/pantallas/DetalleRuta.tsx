import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { BloqueNegro } from '@/componentes/BloqueNegro';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { EtiquetaMuestra } from '@/componentes/EtiquetaMuestra';
import { formatoDuracion, formatoHoraCompleta } from '@/datos/formato';
import { armarRutas } from '@/datos/rutas';
import { obtenerMuestra, useAhora } from '@/datos/useSalidas';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesDetalleRuta {
  alVolver: () => void;
  rutaId: string;
}

/** recorrido y tarifas de una ruta de muestra, con sus paradas como una línea de andén. */
export function DetalleRuta({ alVolver, rutaId }: PropiedadesDetalleRuta) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const ahora = useAhora();
  const datos = obtenerMuestra();
  const ruta = datos.rutas.find((candidata) => candidata.id === rutaId);
  const vista = armarRutas(datos, ahora).find(
    (candidata) => candidata.id === rutaId,
  );
  const destino = datos.terminales.find(
    (terminal) => terminal.id === ruta?.destinoId,
  );

  if (!ruta || !vista || !destino) {
    return (
      <View style={[estilos.vacio, { backgroundColor: colores.fondo }]}>
        <CabeceraPantalla alVolver={alVolver} titulo={t('rutas.titulo')} />
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('rutas.sinRuta')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: espacios.cuarentaYOcho,
          paddingTop: margenes.top + espacios.ocho,
        },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <CabeceraPantalla alVolver={alVolver} titulo={t('rutas.titulo')} />
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('rutas.detalleTitulo')}
      </Text>
      <Text
        accessibilityRole="header"
        style={[tipografia.display, { color: colores.tinta }]}
      >
        {destino.ciudad}
      </Text>

      <BloqueNegro estiloContenido={estilos.resumen}>
        <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
          {t('rutas.siguienteSalida')}
        </Text>
        <Text style={[tipografia.datoGrande, { color: colores.sobreNegro }]}>
          {vista.proximaSalida
            ? formatoHoraCompleta(vista.proximaSalida)
            : t('rutas.sinSalidas')}
        </Text>
        <Text style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}>
          {`${vista.distanciaKm} ${t('rutas.km')} · ${formatoDuracion(vista.duracionMin)}`}
        </Text>
      </BloqueNegro>

      <View style={estilos.cabeceraSeccion}>
        <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
          {t('rutas.paradas')}
        </Text>
        <EtiquetaMuestra />
      </View>
      <Bloque estiloContenido={estilos.paradas}>
        {ruta.paradas.map((parada, indice) => {
          const nombre =
            parada.tipo === 'terminal'
              ? datos.terminales.find(
                  (candidata) => candidata.id === parada.terminalId,
                )?.nombre
              : parada.nombre;
          return (
            <View
              accessibilityLabel={`${nombre}, ${parada.minutosDesdeOrigen} ${t('rutas.minutos')}`}
              key={parada.minutosDesdeOrigen}
              style={estilos.parada}
            >
              <View
                style={[
                  estilos.punto,
                  {
                    backgroundColor:
                      indice === 0 ? colores.ambar : colores.bloqueNegro,
                  },
                ]}
              />
              <View style={estilos.nombreParada}>
                <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
                  {nombre}
                </Text>
                <Text
                  style={[tipografia.dato, { color: colores.tintaSuave }]}
                >{`${parada.minutosDesdeOrigen} ${t('rutas.minutos')}`}</Text>
              </View>
            </View>
          );
        })}
      </Bloque>

      <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
        {t('rutas.tarifaMuestra')}
      </Text>
      <View style={estilos.tarifas}>
        {vista.servicios.map(({ servicio, tarifa }) => (
          <Bloque
            estiloContenido={estilos.tarifa}
            hundido
            key={servicio}
            radio="loseta"
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
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  cabeceraSeccion: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  nombreParada: { flex: 1, gap: espacios.cuatro },
  parada: { alignItems: 'center', flexDirection: 'row', gap: espacios.doce },
  paradas: { gap: espacios.dieciseis, padding: espacios.veinticuatro },
  punto: {
    borderRadius: espacios.ocho,
    height: espacios.dieciseis,
    width: espacios.dieciseis,
  },
  resumen: { gap: espacios.ocho, padding: espacios.veinticuatro },
  tarifa: { gap: espacios.cuatro, padding: espacios.dieciseis },
  tarifas: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
  vacio: { flex: 1, gap: espacios.dieciseis, padding: espacios.lateral },
});
