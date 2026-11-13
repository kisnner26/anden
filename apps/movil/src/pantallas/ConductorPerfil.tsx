import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/componentes/Avatar';
import { Bloque } from '@/componentes/Bloque';
import { Boton } from '@/componentes/Boton';
import { borrarFoto } from '@/datos/almacenFotos';
import { elegirFotoDeGaleria } from '@/datos/fotos';
import { iniciales, nombreCompleto, nombrePropio } from '@/datos/perfil';
import { salidasDeChofer, salidasDelDia } from '@/datos/salidas';
import { usePerfil } from '@/datos/usePerfil';
import { usePerfilChofer } from '@/datos/useDetalleViaje';
import { obtenerMuestra, useAhora } from '@/datos/useSalidas';
import { useSesion } from '@/datos/useSesion';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesConductorPerfil {
  /** abre el formulario para editar nombre y datos personales */
  alEditar: () => void;
  /** abre el perfil público del chofer, como lo ven los pasajeros */
  alVerPerfilPublico: (choferId: string) => void;
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const { colores } = useTema();
  return (
    <View style={estilos.dato}>
      <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
        {etiqueta}
      </Text>
      <Text
        style={[
          tipografia.cuerpo,
          { color: valor === '' ? colores.tintaSuave : colores.tinta },
        ]}
      >
        {valor === '' ? t('conductorPerfil.vacio') : valor}
      </Text>
    </View>
  );
}

/** la pestaña de perfil del conductor: su foto, sus datos personales y los de su servicio */
export function ConductorPerfil({
  alEditar,
  alVerPerfilPublico,
}: PropiedadesConductorPerfil) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { sesion } = useSesion();
  const { guardar, perfil } = usePerfil();
  const ahora = useAhora();
  const choferId = sesion?.choferId ?? '';
  const publico = usePerfilChofer(choferId);
  const unidad = choferId
    ? salidasDelDia(
        salidasDeChofer(obtenerMuestra(), ahora, choferId),
        ahora,
      )[0]
    : undefined;
  const [sinPermiso, establecerSinPermiso] = useState(false);

  const nombre = nombrePropio(nombreCompleto(perfil) || (sesion?.nombre ?? ''));

  async function elegirFoto() {
    const resultado = await elegirFotoDeGaleria();
    establecerSinPermiso(resultado.tipo === 'sin-permiso');
    if (resultado.tipo === 'elegida') {
      const anterior = perfil.fotoUri;
      await guardar({ fotoUri: resultado.uri });
      if (anterior !== null) borrarFoto(anterior);
    }
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
      <Text style={[tipografia.titulo, { color: colores.tinta }]}>
        {t('conductorPerfil.titulo')}.
      </Text>
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('conductorPerfil.detalle')}
      </Text>

      <View style={estilos.cabecera}>
        <Avatar
          descripcion={t('conductorPerfil.fotoDescripcion')}
          iniciales={iniciales({
            apellido: perfil.apellido,
            nombre: perfil.nombre || (sesion?.nombre ?? ''),
          })}
          tamano={72}
          uri={perfil.fotoUri}
        />
        <View style={estilos.texto}>
          <Text style={[tipografia.titulo, { color: colores.tinta }]}>
            {nombre}
          </Text>
          <View style={estilos.acciones}>
            <Boton
              alPresionar={() => void elegirFoto()}
              etiqueta={t('conductorPerfil.cambiarFoto')}
            />
            {perfil.fotoUri !== null && (
              <Boton
                alPresionar={() => {
                  const anterior = perfil.fotoUri;
                  void guardar({ fotoUri: null }).then(() => {
                    if (anterior !== null) borrarFoto(anterior);
                  });
                }}
                etiqueta={t('conductorPerfil.quitarFoto')}
                variante="secundario"
              />
            )}
          </View>
        </View>
      </View>
      {sinPermiso && (
        <Text style={[tipografia.pequeno, { color: colores.cancelado }]}>
          {t('conductorPerfil.sinPermisoFoto')}
        </Text>
      )}

      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('conductorPerfil.personalesSeccion')}
      </Text>
      <Bloque estiloContenido={estilos.bloque}>
        <Dato
          etiqueta={t('conductorPerfil.telefono')}
          valor={perfil.telefono}
        />
        <Dato etiqueta={t('conductorPerfil.cedula')} valor={perfil.cedula} />
        <Dato etiqueta={t('conductorPerfil.correo')} valor={perfil.correo} />
        <Dato
          etiqueta={t('conductorPerfil.edad')}
          valor={
            perfil.edad === null
              ? ''
              : rellenar(t('conductorPerfil.anios'), { anios: perfil.edad })
          }
        />
      </Bloque>
      <Boton
        alPresionar={alEditar}
        etiqueta={t('conductorPerfil.editar')}
        variante="secundario"
      />

      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('conductorPerfil.servicioSeccion')}
      </Text>
      <Bloque estiloContenido={estilos.bloque}>
        <Dato
          etiqueta={t('conductorPerfil.usuario')}
          valor={sesion?.usuario ?? ''}
        />
        <Dato
          etiqueta={t('conductorPerfil.unidad')}
          valor={unidad?.placa ?? t('conductorPerfil.sinUnidad')}
        />
        {publico && (
          <>
            <Dato
              etiqueta={t('conductorPerfil.licencia')}
              valor={
                publico.licenciaVerificada
                  ? t('conductorPerfil.licenciaVerificada')
                  : t('conductorPerfil.licenciaPendiente')
              }
            />
            <Dato
              etiqueta={t('conductorPerfil.aniosManejando')}
              valor={String(publico.aniosManejando)}
            />
            <Dato
              etiqueta={t('conductorPerfil.viajesRealizados')}
              valor={String(publico.viajesRealizados)}
            />
            <Dato
              etiqueta={t('conductorPerfil.calificacion')}
              valor={
                publico.promedio === null
                  ? t('conductorPerfil.sinCalificaciones')
                  : `${publico.promedio.toFixed(1)} (${publico.totalCalificaciones})`
              }
            />
          </>
        )}
      </Bloque>
      {publico && (
        <Pressable
          accessibilityRole="button"
          onPress={() => alVerPerfilPublico(choferId)}
          style={estilos.enlace}
        >
          <Text style={[tipografia.subtitulo, { color: colores.ambarTexto }]}>
            {t('conductorPerfil.verComoPasajero')}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  acciones: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
  bloque: { gap: espacios.doce, padding: espacios.dieciseis },
  cabecera: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
  },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  dato: { gap: 2 },
  enlace: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
  },
  texto: { flex: 1, gap: espacios.ocho },
});
