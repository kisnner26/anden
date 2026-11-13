import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aparece } from '@/componentes/Aparece';
import { Avatar } from '@/componentes/Avatar';
import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { Icono } from '@/componentes/Icono';
import { Loseta } from '@/componentes/Loseta';
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

export interface PropiedadesConductorInicio {
  alAbrirViaje: (viajeId: string) => void;
  /** abre el formulario para publicar un viaje nuevo */
  alNuevoViaje?: () => void;
  /** cierra la sesión y vuelve a la app de pasajero */
  alSalir: () => void;
}

/** los viajes del día del chofer; desde acá empieza a compartir su ubicación */
export function ConductorInicio({
  alAbrirViaje,
  alNuevoViaje,
  alSalir,
}: PropiedadesConductorInicio) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { cerrar, sesion } = useSesion();
  const ahora = useAhora();
  const enVivo = useViajesEnVivo();
  const { cierreDe } = useCierres();
  const { perfil } = usePerfil();
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
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: espacios.cuarentaYOcho,
          paddingTop: margenes.top + espacios.veinticuatro,
        },
      ]}
      style={{ backgroundColor: colores.fondo }}
    >
      <View style={estilos.saludo}>
        <Avatar
          descripcion={t('conductorPerfil.fotoDescripcion')}
          iniciales={iniciales({
            apellido: perfil.apellido,
            nombre: perfil.nombre || (sesion?.nombre ?? ''),
          })}
          tamano={44}
          uri={perfil.fotoUri}
        />
        <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
          {rellenar(t('conductor.saludo'), { nombre })}
        </Text>
      </View>
      <Text style={[tipografia.display, { color: colores.tinta }]}>
        {t('conductor.titulo')}.
      </Text>
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('conductor.detalle')}
      </Text>

      {alNuevoViaje && (
        <BotonAccion
          alPresionar={alNuevoViaje}
          etiqueta={t('nuevoViaje.nuevo')}
        />
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
                    {`${viaje.origen} → ${viaje.destino}`}
                  </Text>
                  <Text
                    style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                  >
                    {`${t(`servicios.${viaje.servicio}`)} · ${t('viajar.andenMayusculas').toLowerCase()} ${viaje.anden} · ${viaje.placa}`}
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
  salir: {
    alignItems: 'center',
    marginTop: espacios.veinticuatro,
    minHeight: tamanosControl.toqueMinimo,
    justifyContent: 'center',
  },
  texto: { flex: 1, gap: 2 },
});
