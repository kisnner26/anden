import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aparece } from '@/componentes/Aparece';
import { Bloque } from '@/componentes/Bloque';
import { formatoHora } from '@/datos/formato';
import { nombrePropio } from '@/datos/perfil';
import { salidasDeChofer, salidasDelDia, type Salida } from '@/datos/salidas';
import { unirBoletos, useBoletosDelViaje } from '@/datos/useBoletosDelViaje';
import { useAbordaje } from '@/datos/useAbordaje';
import { useBoletos } from '@/datos/useBoletos';
import { obtenerMuestra, useAhora } from '@/datos/useSalidas';
import { usePagos } from '@/datos/usePagos';
import { useSesion } from '@/datos/useSesion';
import { resumenDeCobro } from '@/servicios/pagos';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesConductorPasajeros {
  alAbrirViaje: (viajeId: string) => void;
}

/** la pestaña de pasajeros del conductor: por cada salida de hoy, quién viaja y cómo va su pago y su abordaje */
export function ConductorPasajeros({
  alAbrirViaje,
}: PropiedadesConductorPasajeros) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { sesion } = useSesion();
  const ahora = useAhora();
  const viajes = sesion?.choferId
    ? salidasDelDia(
        salidasDeChofer(obtenerMuestra(), ahora, sesion.choferId),
        ahora,
      )
    : [];

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
        {t('conductorPasajeros.titulo')}.
      </Text>
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('conductorPasajeros.detalle')}
      </Text>
      {viajes.length === 0 && (
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('conductorPasajeros.sinViajes')}
        </Text>
      )}
      {viajes.map((viaje, indice) => (
        <Aparece indice={indice} key={viaje.viajeId}>
          <SeccionViaje alAbrir={alAbrirViaje} viaje={viaje} />
        </Aparece>
      ))}
    </ScrollView>
  );
}

function SeccionViaje({
  alAbrir,
  viaje,
}: {
  alAbrir: (viajeId: string) => void;
  viaje: Salida;
}) {
  const { colores } = useTema();
  const { boletos: locales } = useBoletos();
  const { boletos: remotos, fallo } = useBoletosDelViaje(viaje.viajeId);
  const { estadoDe, registro } = usePagos();
  const { abordo } = useAbordaje();
  const pasajeros = unirBoletos(locales, remotos)
    .filter(
      ({ boleto }) =>
        boleto.viajeId === viaje.viajeId && boleto.estado !== 'cancelado',
    )
    .sort((a, b) => a.boleto.asiento - b.boleto.asiento);
  const cobro = resumenDeCobro(
    pasajeros.map(({ boleto }) => ({ id: boleto.id, precio: boleto.precio })),
    registro,
  );
  const abordaron = pasajeros.filter(({ boleto }) => abordo(boleto.id)).length;

  return (
    <Pressable
      accessibilityLabel={rellenar(t('conductor.abrirViaje'), {
        destino: viaje.destino,
      })}
      accessibilityRole="button"
      onPress={() => alAbrir(viaje.viajeId)}
    >
      <Bloque estiloContenido={estilos.seccion}>
        <View style={estilos.encabezado}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {`${viaje.origen} → ${viaje.destino}`}
          </Text>
          <Text style={[tipografia.dato, { color: colores.ambarTexto }]}>
            {formatoHora(viaje.salida)}
          </Text>
        </View>
        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {rellenar(t('conductorPasajeros.resumen'), {
            abordaron,
            cobrado: cobro.cobrado,
            pasajeros: pasajeros.length,
          })}
        </Text>
        {pasajeros.length === 0 && (
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('conductorPasajeros.sinPasajeros')}
          </Text>
        )}
        {pasajeros.map(({ boleto }) => (
          <View key={boleto.id} style={estilos.fila}>
            <View style={estilos.texto}>
              <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
                {nombrePropio(boleto.pasajero.nombre)}
              </Text>
              <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
                {rellenar(t('conductorPasajeros.asiento'), {
                  asiento: boleto.asiento,
                })}
              </Text>
            </View>
            <View style={estilos.estados}>
              <Text
                style={[
                  tipografia.etiqueta,
                  {
                    color:
                      estadoDe(boleto.id) === 'pagado_efectivo'
                        ? colores.aTiempo
                        : colores.ambarTexto,
                  },
                ]}
              >
                {estadoDe(boleto.id) === 'pagado_efectivo'
                  ? t('conductorPasajeros.pagado')
                  : t('conductorPasajeros.pendiente')}
              </Text>
              {abordo(boleto.id) && (
                <Text
                  style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
                >
                  {t('conductorPasajeros.abordo')}
                </Text>
              )}
            </View>
          </View>
        ))}
        {fallo && (
          <Text style={[tipografia.pequeno, { color: colores.cancelado }]}>
            {t('conductorPasajeros.sinConexion')}
          </Text>
        )}
      </Bloque>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  contenido: { gap: espacios.doce, paddingHorizontal: espacios.lateral },
  encabezado: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  estados: { alignItems: 'flex-end', gap: 2 },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    minHeight: tamanosControl.toqueMinimo,
  },
  seccion: { gap: espacios.ocho, padding: espacios.dieciseis },
  texto: { flex: 1, gap: 2 },
});
