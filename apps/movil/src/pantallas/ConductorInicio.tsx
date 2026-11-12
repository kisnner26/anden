import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aparece } from '@/componentes/Aparece';
import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
import { formatoHora, sufijoHora } from '@/datos/formato';
import { salidasDeChofer } from '@/datos/salidas';
import { useSesion } from '@/datos/useSesion';
import { obtenerMuestra, useAhora } from '@/datos/useSalidas';
import { useViajesEnVivo } from '@/datos/useTransmision';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesConductorInicio {
  alAbrirViaje: (viajeId: string) => void;
  /** cierra la sesión y vuelve a la app de pasajero */
  alSalir: () => void;
}

/** los viajes del día del chofer; desde acá empieza a compartir su ubicación */
export function ConductorInicio({
  alAbrirViaje,
  alSalir,
}: PropiedadesConductorInicio) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { cerrar, sesion } = useSesion();
  const ahora = useAhora();
  const enVivo = useViajesEnVivo();
  const viajes = sesion?.choferId
    ? salidasDeChofer(obtenerMuestra(), ahora, sesion.choferId)
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
      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {rellenar(t('conductor.saludo'), { nombre: sesion?.nombre ?? '' })}
      </Text>
      <Text style={[tipografia.display, { color: colores.tinta }]}>
        {t('conductor.titulo')}
        <Text style={{ color: colores.ambarTitular }}>.</Text>
      </Text>
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('conductor.detalle')}
      </Text>

      {viajes.length === 0 && (
        <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
          {t('conductor.sinViajes')}
        </Text>
      )}
      {viajes.map((viaje, indice) => {
        const transmitiendo = enVivo.includes(viaje.viajeId);
        return (
          <Aparece indice={indice} key={viaje.viajeId}>
            <Pressable
              accessibilityLabel={rellenar(t('conductor.abrirViaje'), {
                destino: viaje.destino,
              })}
              accessibilityRole="button"
              onPress={() => alAbrirViaje(viaje.viajeId)}
            >
              <Bloque estiloContenido={estilos.fila}>
                <Loseta variante={transmitiendo ? 'ambar' : 'negra'}>
                  <Icono
                    color={
                      transmitiendo ? colores.sobreAmbar : colores.sobreNegro
                    }
                    nombre="pestanaViajar"
                    tamano="grande"
                  />
                </Loseta>
                <View style={estilos.texto}>
                  <Text
                    style={[tipografia.subtitulo, { color: colores.tinta }]}
                  >
                    {viaje.destino}
                  </Text>
                  <Text
                    style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                  >
                    {`${t(`servicios.${viaje.servicio}`)} · ${t('viajar.andenMayusculas').toLowerCase()} ${viaje.anden} · ${viaje.placa}`}
                  </Text>
                  {transmitiendo && (
                    <Text
                      style={[
                        tipografia.etiqueta,
                        { color: colores.ambarTexto },
                      ]}
                    >
                      {t('conductor.enVivo')}
                    </Text>
                  )}
                </View>
                <View style={estilos.hora}>
                  <Text
                    style={[tipografia.dato, { color: colores.ambarTexto }]}
                  >
                    {formatoHora(viaje.salida)}
                  </Text>
                  <Text
                    style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                  >
                    {sufijoHora(viaje.salida)}
                  </Text>
                </View>
              </Bloque>
            </Pressable>
          </Aparece>
        );
      })}

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void cerrar().then(alSalir);
        }}
        style={estilos.salir}
      >
        <Text style={[tipografia.subtitulo, { color: colores.cancelado }]}>
          {t('conductor.cerrarSesion')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { gap: espacios.doce, paddingHorizontal: espacios.lateral },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    padding: espacios.doce,
  },
  hora: { alignItems: 'flex-end' },
  salir: {
    alignItems: 'center',
    marginTop: espacios.veinticuatro,
    minHeight: tamanosControl.toqueMinimo,
    justifyContent: 'center',
  },
  texto: { flex: 1, gap: 2 },
});
