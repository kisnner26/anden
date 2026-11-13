import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aparece } from '@/componentes/Aparece';
import { Bloque } from '@/componentes/Bloque';
import { formatoFechaCorta, formatoHora } from '@/datos/formato';
import { useDetalleViaje } from '@/datos/useDetalleViaje';
import { useCierres } from '@/datos/useCierres';
import { useSesion } from '@/datos/useSesion';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

/** el destino del viaje cerrado; si ya no está en la muestra, queda el identificador */
function DestinoDelCierre({ viajeId }: { viajeId: string }) {
  const { colores } = useTema();
  const detalle = useDetalleViaje(viajeId);
  return (
    <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
      {detalle?.salida.destino ?? viajeId}
    </Text>
  );
}

/** la pestaña de historial del conductor: los viajes que cerró y lo que cobró */
export function ConductorHistorial() {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { sesion } = useSesion();
  const { cierres } = useCierres();
  const propios = cierres
    .filter((cierre) => cierre.choferId === sesion?.choferId)
    .sort((a, b) => b.cerradoEn.localeCompare(a.cerradoEn));
  const cobrado = propios.reduce((suma, cierre) => suma + cierre.cobrado, 0);
  const pasajeros = propios.reduce(
    (suma, cierre) => suma + cierre.pasajeros,
    0,
  );

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: espacios.cuarentaYOcho,
          paddingTop: margenes.top + espacios.veinticuatro,
        },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <Text style={[tipografia.display, { color: colores.tinta }]}>
        {t('conductorHistorial.titulo')}.
      </Text>
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('conductorHistorial.detalle')}
      </Text>

      <View style={estilos.cifras}>
        <Cifra
          etiqueta={t('conductorHistorial.totalCobrado')}
          valor={`C$ ${cobrado}`}
        />
        <Cifra
          etiqueta={t('conductorHistorial.viajesCerrados')}
          valor={String(propios.length)}
        />
        <Cifra
          etiqueta={t('conductorHistorial.pasajerosLlevados')}
          valor={String(pasajeros)}
        />
      </View>

      {propios.length === 0 && (
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('conductorHistorial.sinCierres')}
        </Text>
      )}
      {propios.map((cierre, indice) => {
        const fecha = new Date(cierre.cerradoEn);
        return (
          <Aparece indice={indice} key={cierre.viajeId}>
            <Bloque estiloContenido={estilos.fila}>
              <View style={estilos.texto}>
                <DestinoDelCierre viajeId={cierre.viajeId} />
                <Text
                  style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                >
                  {`${formatoFechaCorta(fecha)} · ${formatoHora(fecha)}`}
                </Text>
                <Text
                  style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                >
                  {rellenar(t('conductorHistorial.fila'), {
                    pagados: cierre.pagados,
                    pasajeros: cierre.pasajeros,
                  })}
                </Text>
                {cierre.sinPagar.length > 0 && (
                  <Text
                    style={[tipografia.etiqueta, { color: colores.cancelado }]}
                  >
                    {rellenar(t('conductorHistorial.sinPagar'), {
                      cantidad: cierre.sinPagar.length,
                    })}
                  </Text>
                )}
              </View>
              <Text style={[tipografia.dato, { color: colores.ambarTexto }]}>
                {rellenar(t('conductorHistorial.cobrado'), {
                  cobrado: cierre.cobrado,
                })}
              </Text>
            </Bloque>
          </Aparece>
        );
      })}
    </ScrollView>
  );
}

function Cifra({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const { colores } = useTema();
  return (
    <Bloque estilo={estilos.cifra} estiloContenido={estilos.contenidoCifra}>
      <Text style={[tipografia.datoGrande, { color: colores.tinta }]}>
        {valor}
      </Text>
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {etiqueta}
      </Text>
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  cifra: { flexBasis: '30%', flexGrow: 1 },
  cifras: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.doce },
  contenido: { gap: espacios.doce, paddingHorizontal: espacios.lateral },
  contenidoCifra: { gap: 2, padding: espacios.doce },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    padding: espacios.doce,
  },
  texto: { flex: 1, gap: 2 },
});
