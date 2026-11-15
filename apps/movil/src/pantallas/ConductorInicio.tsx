import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aparece } from '@/componentes/Aparece';
import { Avatar } from '@/componentes/Avatar';
import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { Autobus } from '@/componentes/Autobus';
import { Icono } from '@/componentes/Icono';
import { GuiaConductor } from '@/componentes/GuiaConductor';
import { Loseta } from '@/componentes/Loseta';
import { pasosDeGuia } from '@/datos/guiaConductor';
import { useEncomiendas } from '@/datos/useEncomiendas';
import { formatoDiaCorto, formatoHora, sufijoHora } from '@/datos/formato';
import { iniciales, nombreCompleto, nombrePropio } from '@/datos/perfil';
import { usePerfil } from '@/datos/usePerfil';
import { inicioDelDia, nombreDelDia } from '@/datos/dias';
import { salidasDeChofer } from '@/datos/salidas';
import { sincronizarViajes } from '@/datos/sincronizarViajes';
import { retirarViaje } from '@/servicios/supabase/viajesSupabase';
import { useCierres } from '@/datos/useCierres';
import { useSesion } from '@/datos/useSesion';
import { obtenerMuestra, useAhora } from '@/datos/useSalidas';
import { useViajesEnVivo } from '@/datos/useTransmision';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';
import { etiquetaPunto } from '@/datos/puntoEncuentro';

export interface PropiedadesConductorInicio {
  /** abre el perfil del conductor al tocar su foto */
  alAbrirPerfil?: () => void;
  /** abre los pasajeros y encomiendas del día; la tarjeta solo se ofrece si hay viajes */
  alAbrirABordo?: () => void;
  alAbrirViaje: (viajeId: string) => void;
  /** abre el formulario para publicar un viaje nuevo */
  alNuevoViaje?: () => void;
  /** cierra la sesión y vuelve a la app de pasajero */
}

/** los viajes del día del chofer; desde acá empieza a compartir su ubicación */
export function ConductorInicio({
  alAbrirABordo,
  alAbrirPerfil,
  alAbrirViaje,
  alNuevoViaje,
}: PropiedadesConductorInicio) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { sesion } = useSesion();
  const ahora = useAhora();
  const enVivo = useViajesEnVivo();
  const { cierreDe } = useCierres();
  const { perfil } = usePerfil();
  const { encomiendas } = useEncomiendas();
  const { cierres } = useCierres();
  const nombre = nombrePropio(nombreCompleto(perfil) || (sesion?.nombre ?? ''));
  // todos sus viajes de hoy en adelante: los que él mismo publicó
  const viajes = sesion?.choferId
    ? salidasDeChofer(obtenerMuestra(), ahora, sesion.choferId).filter(
        (salida) => salida.salida.getTime() >= inicioDelDia(ahora).getTime(),
      )
    : [];
  const [retirando, establecerRetirando] = useState<string | null>(null);

  async function retirar(viajeId: string) {
    const conPasajeros = obtenerMuestra().ocupaciones.some(
      (ocupacion) =>
        ocupacion.viajeId === viajeId && ocupacion.estado === 'vendido',
    );
    establecerRetirando(null);
    if (await retirarViaje(viajeId, conPasajeros)) await sincronizarViajes();
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: 120,
          paddingTop: margenes.top + espacios.veinticuatro,
        },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <View style={estilos.saludo}>
        <Pressable
          accessibilityLabel={t('conductorAjustes.perfilTitulo')}
          accessibilityRole="button"
          disabled={!alAbrirPerfil}
          hitSlop={8}
          onPress={alAbrirPerfil}
        >
          <Avatar
            descripcion={t('conductorPerfil.fotoDescripcion')}
            iniciales={iniciales({
              apellido: perfil.apellido,
              nombre: perfil.nombre || (sesion?.nombre ?? ''),
            })}
            tamano={44}
            uri={perfil.fotoUri}
          />
        </Pressable>
        <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
          {rellenar(t('conductor.saludo'), { nombre })}
        </Text>
      </View>
      <Text style={[tipografia.titulo, { color: colores.tinta }]}>
        {t('conductor.titulo')}.
      </Text>
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('conductor.detalle')}
      </Text>

      <GuiaConductor
        pasos={pasosDeGuia({
          cerrados: cierres.filter((c) => c.choferId === sesion?.choferId)
            .length,
          conFoto: perfil.fotoUri !== null,
          nombreListo: nombre !== '',
          viajesPublicados: viajes.length,
          // con pasajeros o encomiendas reales, ya conoce esa pestaña
          vioPasajeros: encomiendas.some(
            (e) => e.choferId === sesion?.choferId,
          ),
        })}
      />

      {alNuevoViaje && (
        <BotonAccion
          alPresionar={alNuevoViaje}
          etiqueta={t('nuevoViaje.nuevo')}
        />
      )}

      {alAbrirABordo && viajes.length > 0 && (
        <Pressable
          accessibilityLabel={t('conductor.aBordoTitulo')}
          accessibilityRole="button"
          onPress={alAbrirABordo}
          testID="tarjeta-a-bordo"
        >
          <Bloque estiloContenido={estilos.fila}>
            <View style={estilos.texto}>
              <Text
                style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
              >
                {t('conductor.aBordoTitulo')}
              </Text>
              <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
                {t('conductor.aBordoDetalle')}
              </Text>
            </View>
            <Icono nombre="siguiente" tamano="mediano" />
          </Bloque>
        </Pressable>
      )}
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
                <Loseta variante="negra">
                  {viaje.servicio === 'expreso' ? (
                    <Icono nombre="rayo" tamano="ilustracion" />
                  ) : (
                    <Autobus ancho={tamanosControl.toqueMinimo} usarMiUnidad />
                  )}
                  {transmitiendo && (
                    <View
                      style={[
                        estilos.enVivo,
                        {
                          backgroundColor: colores.aTiempo,
                          borderColor: colores.bloqueNegro,
                        },
                      ]}
                    />
                  )}
                </Loseta>
                <View style={estilos.texto}>
                  <Text
                    style={[tipografia.subtitulo, { color: colores.tinta }]}
                  >
                    {`${viaje.origen} → ${viaje.destino}`}
                  </Text>
                  <Text
                    style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                  >
                    {`${t(`servicios.${viaje.servicio}`)} · ${etiquetaPunto(viaje.puntoEncuentro)} · ${viaje.placa}`}
                  </Text>
                  {cierreDe(viaje.viajeId) && (
                    <Text
                      style={[tipografia.etiqueta, { color: colores.aTiempo }]}
                    >
                      {rellenar(t('conductor.cerradoCorto'), {
                        cobrado: cierreDe(viaje.viajeId)?.cobrado ?? 0,
                      })}
                    </Text>
                  )}
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
                  {nombreDelDia(viaje.salida, ahora) !== 'hoy' && (
                    <Text
                      style={[
                        tipografia.pequeno,
                        { color: colores.tintaSuave },
                      ]}
                    >
                      {formatoDiaCorto(viaje.salida)}
                    </Text>
                  )}
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
            {!cierreDe(viaje.viajeId) && (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  retirando === viaje.viajeId
                    ? void retirar(viaje.viajeId)
                    : establecerRetirando(viaje.viajeId)
                }
                style={estilos.retirar}
              >
                <Text
                  style={[tipografia.pequeno, { color: colores.cancelado }]}
                >
                  {retirando === viaje.viajeId
                    ? t('nuevoViaje.retirarConfirmar')
                    : t('nuevoViaje.retirar')}
                </Text>
              </Pressable>
            )}
          </Aparece>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  enVivo: {
    borderRadius: 7,
    borderWidth: 2,
    height: 14,
    position: 'absolute',
    right: 4,
    top: 4,
    width: 14,
  },
  contenido: { gap: espacios.doce, paddingHorizontal: espacios.lateral },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    padding: espacios.doce,
  },
  hora: { alignItems: 'flex-end' },
  saludo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
  },
  retirar: {
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
    paddingHorizontal: espacios.doce,
  },
  texto: { flex: 1, gap: 2 },
});
