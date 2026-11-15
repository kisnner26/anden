import { useEffect, useState, type ReactNode } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/componentes/Avatar';
import { Bloque } from '@/componentes/Bloque';
import { Icono } from '@/componentes/Icono';
import { Interruptor } from '@/componentes/Interruptor';
import { actividadesDisponibles } from '../../modules/anden-actividad';
import { usePreferenciaActividad } from '@/datos/preferenciaActividad';
import { useInicioAutomatico } from '@/datos/inicioAutomatico';
import { MascotaRumbo } from '@/componentes/MascotaRumbo';
import { useMascota } from '@/datos/useMascota';
import { OpcionSeleccion } from '@/componentes/OpcionSeleccion';
import { iniciales, nombreCompleto, nombrePropio } from '@/datos/perfil';
import { useBloqueo } from '@/datos/useBloqueo';
import { useIA } from '@/datos/useIA';
import { useSeguridad } from '@/datos/useSeguridad';
import { useMemoriaIA } from '@/datos/useMemoriaIA';
import { motivoNoDisponible } from '@/servicios/ia';
import { usePerfil } from '@/datos/usePerfil';
import { usePreferenciaUbicacion } from '@/datos/ProveedorUbicacion';
import {
  espacios,
  radios,
  tamanosControl,
  tamanosIlustracion,
} from '@/tema/espacios';
import { MODOS_USO, type ModoUso } from '@/tema/modoUso';
import { tipografia } from '@/tema/tipografia';
import { useSesion } from '@/datos/useSesion';
import { useSuscripcion } from '@/datos/useSuscripcion';
import { useModoUso } from '@/tema/useModoUso';
import { useTema, type PreferenciaTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesAjustes {
  /** abre el ingreso, para quien usa la app sin cuenta */
  /** se llama al cerrar la sesión, para volver al ingreso */
  alSalir?: () => void;
  alAbrirPerfil?: () => void;
  alAbrirPlus?: () => void;
  /** con sesión de conductor, abre su perfil: es la primera opción */
  alAbrirPerfilConductor?: () => void;
  /** sin esto no se dibuja la flecha: la pantalla es una pestaña */
  alVolver?: () => void;
  /** secciones propias de quien usa la pantalla, antes de la sesión: las del conductor */
  extra?: ReactNode;
}

const NOMBRES_MODO: Record<
  ModoUso,
  { detalle: () => string; nombre: () => string }
> = {
  completo: {
    detalle: () => t('ajustes.modoCompletoDetalle'),
    nombre: () => t('ajustes.modoCompleto'),
  },
  rapido: {
    detalle: () => t('ajustes.modoRapidoDetalle'),
    nombre: () => t('ajustes.modoRapido'),
  },
  sencillo: {
    detalle: () => t('ajustes.modoSencilloDetalle'),
    nombre: () => t('ajustes.modoSencillo'),
  },
};

const OPCIONES: readonly {
  clave: PreferenciaTema;
  detalle: () => string;
  nombre: () => string;
}[] = [
  {
    clave: 'claro',
    detalle: () => t('ajustes.claroDetalle'),
    nombre: () => t('ajustes.claro'),
  },
  {
    clave: 'oscuro',
    detalle: () => t('ajustes.oscuroDetalle'),
    nombre: () => t('ajustes.oscuro'),
  },
  {
    clave: 'automatico',
    detalle: () => t('ajustes.automaticoDetalle'),
    nombre: () => t('ajustes.automatico'),
  },
];

/** apariencia: claro, oscuro o automático según la hora */
export function Ajustes({
  alSalir,
  alAbrirPerfil,
  alAbrirPlus,
  alAbrirPerfilConductor,
  alVolver,
  extra,
}: PropiedadesAjustes) {
  const { cerrar, sesion } = useSesion();
  const { plus } = useSuscripcion();
  const { colores, establecerPreferencia, preferencia } = useTema();
  const { perfil } = usePerfil();
  const ubicacion = usePreferenciaUbicacion();
  const bloqueo = useBloqueo();
  const ia = useIA();
  const mascota = useMascota();
  const inicioAutomatico = useInicioAutomatico();
  const preferenciaActividad = usePreferenciaActividad();
  const [actividadSoportada, establecerActividadSoportada] = useState(false);
  useEffect(() => {
    let vigente = true;
    void actividadesDisponibles().then((si) => {
      if (vigente) establecerActividadSoportada(si);
    });
    return () => {
      vigente = false;
    };
  }, []);
  const seguridad = useSeguridad();
  const memoriaIA = useMemoriaIA();
  const [memoriaBorrada, establecerMemoriaBorrada] = useState(false);
  // lo que no tiene arreglo desde la app (teléfono sin soporte, sistema viejo, sin módulo) no se puede encender
  const iaImposible = [
    'idioma-no-soportado',
    'no-compatible',
    'sin-modulo',
    'sistema-antiguo',
  ].includes(ia.disponibilidad);
  const motivoIA = ia.cargando
    ? null
    : motivoNoDisponible(ia.disponibilidad, ia.nombre);
  const modoUso = useModoUso();
  const nombre = nombrePropio(nombreCompleto(perfil));
  const margenes = useSafeAreaInsets();
  const ubicacionOcupada =
    ubicacion.estado === 'cargando' || ubicacion.estado === 'consultando';
  const estadoUbicacion =
    ubicacion.estado === 'otorgado'
      ? t('ajustes.ubicacionLista')
      : ubicacion.estado === 'denegado'
        ? t('ajustes.ubicacionDenegada')
        : ubicacion.estado === 'desactivado'
          ? t('ajustes.ubicacionDesactivada')
          : ubicacion.estado === 'error'
            ? t('ajustes.ubicacionError')
            : ubicacionOcupada
              ? t('ajustes.ubicacionConsultando')
              : t('ajustes.ubicacionPendiente');
  const opcionActiva = OPCIONES.find(({ clave }) => clave === preferencia);

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
      {alVolver ? (
        <Pressable
          accessibilityLabel={t('ajustes.volver')}
          accessibilityRole="button"
          onPress={alVolver}
          style={estilos.volver}
        >
          <Bloque estiloContenido={estilos.circulo} radio="pildora">
            <Icono nombre="volver" tamano="grande" />
          </Bloque>
        </Pressable>
      ) : null}

      <Text style={[tipografia.display, { color: colores.tinta }]}>
        {t('ajustes.titulo')}.
      </Text>
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('ajustes.detalle')}
      </Text>

      {/* el conductor abre su perfil desde acá; Plus es de la cuenta de pasajero */}
      {sesion?.rol === 'conductor' && alAbrirPerfilConductor && (
        <Pressable
          accessibilityLabel={t('conductorAjustes.perfilTitulo')}
          accessibilityRole="button"
          onPress={alAbrirPerfilConductor}
        >
          <Bloque estiloContenido={estilos.filaOpcion}>
            <Avatar
              descripcion={t('conductorPerfil.fotoDescripcion')}
              iniciales={iniciales({
                apellido: perfil.apellido,
                nombre: perfil.nombre || (sesion.nombre ?? ''),
              })}
              tamano={tamanosIlustracion.avatarAjustes}
              uri={perfil.fotoUri}
            />
            <View style={estilos.texto}>
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {t('conductorAjustes.perfilTitulo')}
              </Text>
              <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
                {t('conductorAjustes.perfilDetalle')}
              </Text>
            </View>
            <Icono nombre="siguiente" tamano="mediano" />
          </Bloque>
        </Pressable>
      )}
      {sesion?.rol !== 'conductor' && (
        <>
          <Pressable
            accessibilityLabel={t('perfil.entrada')}
            accessibilityRole="button"
            onPress={alAbrirPerfil}
          >
            <Bloque estiloContenido={estilos.filaOpcion}>
              <Avatar
                descripcion={t('perfil.fotoDescripcion')}
                iniciales={iniciales(perfil)}
                tamano={tamanosIlustracion.avatarAjustes}
                uri={perfil.fotoUri}
              />
              <View style={estilos.texto}>
                <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                  {nombre === '' ? t('perfil.sinNombre') : nombre}
                </Text>
                <Text
                  style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                >
                  {t('perfil.entrada')}
                </Text>
              </View>
              <Icono nombre="siguiente" tamano="mediano" />
            </Bloque>
          </Pressable>

          <Pressable
            accessibilityLabel={t('plus.entrada')}
            accessibilityRole="button"
            onPress={alAbrirPlus}
          >
            <Bloque estiloContenido={estilos.filaOpcion}>
              <View style={estilos.texto}>
                <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                  {plus ? t('plus.entradaActivo') : t('plus.entrada')}
                </Text>
                <Text
                  style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                >
                  {t('plus.entradaDetalle')}
                </Text>
              </View>
              <Icono nombre="siguiente" tamano="mediano" />
            </Bloque>
          </Pressable>
        </>
      )}

      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('ajustes.modoSeccion')}
      </Text>
      {MODOS_USO.map((modo) => (
        <OpcionSeleccion
          alElegir={() => void modoUso.establecerModo(modo)}
          detalle={NOMBRES_MODO[modo].detalle()}
          elegida={modoUso.modo === modo}
          key={modo}
          nombre={NOMBRES_MODO[modo].nombre()}
        />
      ))}

      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('ajustes.seguridadSeccion')}
      </Text>
      <Bloque estiloContenido={estilos.filaOpcion}>
        <View style={estilos.texto}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {t('ajustes.bloqueoTitulo')}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {bloqueo.biometria.disponible || bloqueo.activo
              ? t('ajustes.bloqueoDetalle')
              : t('ajustes.bloqueoNoDisponible')}
          </Text>
        </View>
        <Interruptor
          activo={bloqueo.activo}
          alCambiar={(encender) =>
            void (encender ? bloqueo.activar() : bloqueo.desactivar())
          }
          deshabilitado={!bloqueo.biometria.disponible && !bloqueo.activo}
          etiqueta={t('ajustes.bloqueoTitulo')}
        />
      </Bloque>

      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('mascota.titulo')}
      </Text>
      <Bloque estiloContenido={estilos.filaOpcion}>
        <MascotaRumbo
          humor={mascota.activa ? 'saludando' : 'dormido'}
          tamano={64}
        />
        <View style={estilos.texto}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {t('mascota.activar')}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('mascota.detalle')}
          </Text>
        </View>
        <Interruptor
          activo={mascota.activa}
          alCambiar={(encender) => void mascota.cambiar(encender)}
          etiqueta={t('mascota.activar')}
        />
      </Bloque>

      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('inicioAutomatico.seccion')}
      </Text>
      <Bloque estiloContenido={estilos.filaOpcion}>
        <View style={estilos.texto}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {t('inicioAutomatico.titulo')}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('inicioAutomatico.detalle')}
          </Text>
        </View>
        <Interruptor
          activo={inicioAutomatico.activo === true}
          alCambiar={(encender) => void inicioAutomatico.cambiar(encender)}
          deshabilitado={inicioAutomatico.activo === null}
          etiqueta={t('inicioAutomatico.titulo')}
        />
      </Bloque>

      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('actividadEnVivo.seccion')}
      </Text>
      <Bloque estiloContenido={estilos.filaOpcion}>
        <View style={estilos.texto}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {t('actividadEnVivo.titulo')}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {actividadSoportada
              ? t('actividadEnVivo.detalle')
              : t('actividadEnVivo.noDisponible')}
          </Text>
        </View>
        <Interruptor
          activo={preferenciaActividad.activa !== false}
          alCambiar={(activa) => void preferenciaActividad.cambiar(activa)}
          deshabilitado={
            preferenciaActividad.activa === null || !actividadSoportada
          }
          etiqueta={t('actividadEnVivo.titulo')}
        />
      </Bloque>

      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('ia.seccion')}
      </Text>
      <Bloque estiloContenido={estilos.filaOpcion}>
        <View style={estilos.texto}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {rellenar(t('ia.titulo'), { nombre: ia.nombre })}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('ia.detalle')}
          </Text>
          {motivoIA !== null && (
            <Text
              accessibilityLiveRegion="polite"
              style={[tipografia.pequeno, { color: colores.ambarTexto }]}
            >
              {motivoIA}
            </Text>
          )}
        </View>
        <Interruptor
          activo={ia.activada}
          alCambiar={(encender) => void ia.cambiar(encender)}
          deshabilitado={iaImposible && !ia.activada}
          etiqueta={rellenar(t('ia.titulo'), { nombre: ia.nombre })}
        />
      </Bloque>
      {ia.usable && (
        <>
          <Bloque estiloContenido={estilos.filaOpcion}>
            <View style={estilos.texto}>
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {t('ia.memoriaTitulo')}
              </Text>
              <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
                {t('ia.memoriaDetalle')}
              </Text>
            </View>
            <Interruptor
              activo={memoriaIA.permitida}
              alCambiar={(permitir) => void memoriaIA.cambiarPermiso(permitir)}
              etiqueta={t('ia.memoriaTitulo')}
            />
          </Bloque>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void memoriaIA
                .olvidar()
                .then(() => establecerMemoriaBorrada(true));
            }}
          >
            <Bloque estiloContenido={estilos.filaOpcion}>
              <Text
                style={[tipografia.subtitulo, { color: colores.cancelado }]}
              >
                {memoriaBorrada
                  ? t('ia.memoriaBorrada')
                  : t('ia.memoriaBorrar')}
              </Text>
            </Bloque>
          </Pressable>
        </>
      )}

      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('seguridad.titulo')}
      </Text>
      <Bloque estiloContenido={estilos.filaOpcion}>
        <View style={estilos.texto}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {t('seguridad.titulo')}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('seguridad.detalle')}
          </Text>
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('seguridad.notaAjuste')}
          </Text>
        </View>
        <Interruptor
          activo={seguridad.activa}
          alCambiar={(activa) => void seguridad.cambiar(activa)}
          etiqueta={t('seguridad.titulo')}
        />
      </Bloque>

      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('ajustes.ubicacionSeccion')}
      </Text>
      <Pressable
        accessibilityLabel={t('ajustes.ubicacionAutomatica')}
        accessibilityRole="switch"
        accessibilityState={{
          checked: ubicacion.activada,
          disabled: ubicacionOcupada,
        }}
        disabled={ubicacionOcupada}
        onPress={() =>
          void (ubicacion.activada
            ? ubicacion.desactivar()
            : ubicacion.activar())
        }
      >
        <Bloque estiloContenido={estilos.filaOpcion}>
          <View style={estilos.texto}>
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {t('ajustes.ubicacionAutomatica')}
            </Text>
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {t('ajustes.ubicacionDetalle')}
            </Text>
            <Text
              accessibilityLiveRegion="polite"
              style={[tipografia.pequeno, { color: colores.ambarTexto }]}
            >
              {estadoUbicacion}
            </Text>
          </View>
          <View
            style={[
              estilos.pista,
              {
                backgroundColor: ubicacion.activada
                  ? colores.ambar
                  : colores.linea,
              },
            ]}
          >
            <View
              style={[
                estilos.perilla,
                {
                  alignSelf: ubicacion.activada ? 'flex-end' : 'flex-start',
                  backgroundColor: ubicacion.activada
                    ? colores.sobreAmbar
                    : colores.fondo,
                },
              ]}
            />
          </View>
        </Bloque>
      </Pressable>
      {ubicacion.activada && ubicacion.estado === 'error' && (
        <Pressable
          accessibilityLabel={t('ajustes.reintentarUbicacion')}
          accessibilityRole="button"
          onPress={() => void ubicacion.reintentar()}
        >
          <Text style={[tipografia.pequeno, { color: colores.ambarTexto }]}>
            {t('ajustes.reintentarUbicacion')}
          </Text>
        </Pressable>
      )}
      {ubicacion.activada &&
        (ubicacion.estado === 'denegado' ||
          ubicacion.estado === 'desactivado') && (
          <Pressable
            accessibilityLabel={t('ajustes.abrirAjustes')}
            accessibilityRole="button"
            onPress={() => Linking.openSettings()}
          >
            <Text style={[tipografia.pequeno, { color: colores.ambarTexto }]}>
              {t('ajustes.abrirAjustes')}
            </Text>
          </Pressable>
        )}

      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('perfil.apariencia')}
      </Text>
      <Bloque estiloContenido={estilos.selectorTema} hundido radio="pildora">
        {OPCIONES.map(({ clave, nombre }) => {
          const elegida = preferencia === clave;
          return (
            <Pressable
              accessibilityLabel={nombre()}
              accessibilityRole="radio"
              accessibilityState={{ checked: elegida }}
              key={clave}
              onPress={() => void establecerPreferencia(clave)}
              style={estilos.opcionTema}
            >
              <View
                style={[
                  estilos.contenidoOpcionTema,
                  elegida && { backgroundColor: colores.ambar },
                ]}
              >
                {elegida && (
                  <Icono
                    color={colores.sobreAmbar}
                    nombre="confirmar"
                    tamano="pequeno"
                  />
                )}
                <Text
                  style={[
                    tipografia.pequeno,
                    {
                      color: elegida ? colores.sobreAmbar : colores.tinta,
                    },
                  ]}
                >
                  {nombre()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </Bloque>
      {opcionActiva && (
        <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
          {opcionActiva.detalle()}
        </Text>
      )}

      {extra}

      <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
        {t('ajustes.sesionSeccion')}
      </Text>
      {sesion && (
        <>
          <Bloque estiloContenido={estilos.filaOpcion}>
            <View style={estilos.texto}>
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {nombrePropio(sesion.nombre)}
              </Text>
              <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
                {t('ajustes.sesionIniciada')}
              </Text>
            </View>
          </Bloque>
          <Pressable
            accessibilityRole="button"
            onPress={() => void cerrar().then(() => alSalir?.())}
          >
            <Bloque estiloContenido={estilos.filaOpcion}>
              <Text
                style={[tipografia.subtitulo, { color: colores.cancelado }]}
              >
                {t('ajustes.cerrarSesion')}
              </Text>
            </Bloque>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  circulo: {
    alignItems: 'center',
    height: tamanosControl.toqueMinimo,
    justifyContent: 'center',
    width: tamanosControl.toqueMinimo,
  },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  contenidoOpcionTema: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    flexDirection: 'row',
    gap: espacios.cuatro,
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
    paddingHorizontal: espacios.ocho,
  },
  filaOpcion: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
    padding: espacios.dieciseis,
  },
  opcionTema: { flex: 1 },
  perilla: {
    borderRadius: radios.pildora,
    height: espacios.veinticuatro,
    width: espacios.veinticuatro,
  },
  pista: {
    borderRadius: radios.pildora,
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
    padding: espacios.cuatro,
    width: espacios.cuarentaYOcho,
  },
  selectorTema: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: espacios.cuatro,
  },
  texto: { flex: 1, gap: espacios.cuatro },
  volver: { alignSelf: 'flex-start' },
});
