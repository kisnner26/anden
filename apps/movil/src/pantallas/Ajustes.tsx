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
import { OpcionSeleccion } from '@/componentes/OpcionSeleccion';
import { iniciales, nombreCompleto } from '@/datos/perfil';
import { useBloqueo } from '@/datos/useBloqueo';
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
import { useModoUso } from '@/tema/useModoUso';
import { useTema, type PreferenciaTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesAjustes {
  /** abre el modo conductor, si ya hay una sesión de conductor */
  alAbrirConductor?: () => void;
  /** abre el ingreso de conductores */
  alAbrirIngreso?: () => void;
  alAbrirPerfil?: () => void;
  alVolver: () => void;
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
  alAbrirConductor,
  alAbrirIngreso,
  alAbrirPerfil,
  alVolver,
}: PropiedadesAjustes) {
  const { cerrar, rol, sesion } = useSesion();
  const { colores, establecerPreferencia, preferencia } = useTema();
  const { perfil } = usePerfil();
  const ubicacion = usePreferenciaUbicacion();
  const bloqueo = useBloqueo();
  const modoUso = useModoUso();
  const nombre = nombreCompleto(perfil);
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

      <Text style={[tipografia.display, { color: colores.tinta }]}>
        {t('ajustes.titulo')}
        <Text style={{ color: colores.ambarTitular }}>.</Text>
      </Text>
      <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
        {t('ajustes.detalle')}
      </Text>

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
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {t('perfil.entrada')}
            </Text>
          </View>
          <Icono nombre="siguiente" tamano="mediano" />
        </Bloque>
      </Pressable>

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
        {t('ajustes.cuentaSeccion')}
      </Text>
      {rol === 'conductor' ? (
        <>
          <Pressable accessibilityRole="button" onPress={alAbrirConductor}>
            <Bloque estiloContenido={estilos.filaOpcion}>
              <View style={estilos.texto}>
                <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                  {t('ajustes.abrirConductor')}
                </Text>
                <Text
                  style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                >
                  {rellenar(t('ajustes.sesionDe'), {
                    nombre: sesion?.nombre ?? '',
                  })}
                </Text>
              </View>
            </Bloque>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => void cerrar()}>
            <Bloque estiloContenido={estilos.filaOpcion}>
              <Text
                style={[tipografia.subtitulo, { color: colores.cancelado }]}
              >
                {t('ajustes.cerrarSesion')}
              </Text>
            </Bloque>
          </Pressable>
        </>
      ) : (
        <Pressable accessibilityRole="button" onPress={alAbrirIngreso}>
          <Bloque estiloContenido={estilos.filaOpcion}>
            <View style={estilos.texto}>
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {t('ajustes.conductorTitulo')}
              </Text>
              <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
                {t('ajustes.conductorDetalle')}
              </Text>
            </View>
          </Bloque>
        </Pressable>
      )}

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
