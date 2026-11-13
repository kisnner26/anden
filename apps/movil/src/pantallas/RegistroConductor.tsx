import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  claveValida,
  formatearCedula,
  formatearTelefonoNi,
  usuarioValido,
} from '@anden/dominio';

import { Aparece } from '@/componentes/Aparece';
import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { CampoTexto } from '@/componentes/CampoTexto';
import { ExplosionConfirmacion } from '@/componentes/ExplosionConfirmacion';
import { Icono } from '@/componentes/Icono';
import { Rebote } from '@/componentes/Rebote';
import { autenticar, consultarBiometria } from '@/datos/biometria';
import { useSesion } from '@/datos/useSesion';
import type { ErrorRegistro } from '@/servicios/sesion';
import { servicioSolicitud } from '@/datos/servicioSolicitud';
import { resolverFoto } from '@/datos/almacenFotos';
import { elegirFotoDeCedula } from '@/datos/fotos';
import {
  cedulaOculta,
  erroresDeSolicitud,
  nuevaSolicitud,
  type ErrorSolicitud,
  type SolicitudConductor,
} from '@/servicios/solicitudConductor';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesRegistroConductor {
  alVolver: () => void;
}

type Paso = 1 | 2 | 3;

const MENSAJES: Record<ErrorSolicitud, () => string> = {
  apellido: () => t('registroConductor.errorApellido'),
  cedula: () => t('registroConductor.errorCedula'),
  dorso: () => t('registroConductor.errorDorso'),
  frente: () => t('registroConductor.errorFrente'),
  nombre: () => t('registroConductor.errorNombre'),
  telefono: () => t('registroConductor.errorTelefono'),
};

const CAMPOS_DEL_PASO: Record<Paso, readonly ErrorSolicitud[]> = {
  1: ['nombre', 'apellido', 'telefono'],
  2: ['cedula', 'frente', 'dorso'],
  3: [],
};

/**
 * registro de conductor en tres pasos: los datos, la cédula con las fotos de sus dos lados (de la
 * galería; la app no abre la cámara) y la confirmación con Face ID o huella. Termina en una solicitud
 * en revisión: la cuenta no se puede usar hasta que la cooperativa la apruebe
 */
export function RegistroConductor({ alVolver }: PropiedadesRegistroConductor) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { registrar, sesion } = useSesion();
  // sin cuenta, el registro la crea: no hace falta dar vueltas por otra pantalla
  const crearCuentaAqui = sesion === null;
  const [usuario, establecerUsuario] = useState('');
  const [clave, establecerClave] = useState('');
  const [fallaCuenta, establecerFallaCuenta] = useState<ErrorRegistro | null>(
    null,
  );
  const [paso, establecerPaso] = useState<Paso>(1);
  const [nombre, establecerNombre] = useState('');
  const [apellido, establecerApellido] = useState('');
  const [telefono, establecerTelefono] = useState('');
  const [cedula, establecerCedula] = useState('');
  const [frente, establecerFrente] = useState<string | null>(null);
  const [dorso, establecerDorso] = useState<string | null>(null);
  const [errores, establecerErrores] = useState<ErrorSolicitud[]>([]);
  const [sinPermiso, establecerSinPermiso] = useState(false);
  const [confirmada, establecerConfirmada] = useState(false);
  const [falloBiometria, establecerFalloBiometria] = useState(false);
  const [conBiometria, establecerConBiometria] = useState(true);
  const [solicitud, establecerSolicitud] = useState<SolicitudConductor | null>(
    null,
  );
  const [cargando, establecerCargando] = useState(true);
  const [falloEnvio, establecerFalloEnvio] = useState<
    'conexion' | 'sin-sesion' | null
  >(null);

  useEffect(() => {
    void servicioSolicitud()
      .leer()
      .then((guardada) => {
        establecerSolicitud(guardada);
        establecerCargando(false);
      });
    void consultarBiometria().then((estado) =>
      establecerConBiometria(estado.disponible),
    );
  }, []);

  const datos = {
    apellido,
    cedula,
    cedulaDorsoUri: dorso,
    cedulaFrenteUri: frente,
    nombre,
    telefono,
  };
  const error = (campo: ErrorSolicitud) =>
    errores.includes(campo) ? MENSAJES[campo]() : undefined;

  const usuarioOk = usuarioValido(usuario);
  const claveOk = claveValida(clave);
  const [validarCuenta, establecerValidarCuenta] = useState(false);

  function seguir() {
    const fallos = erroresDeSolicitud(datos).filter((e) =>
      CAMPOS_DEL_PASO[paso].includes(e),
    );
    establecerErrores(fallos);
    if (paso === 1 && crearCuentaAqui) {
      establecerValidarCuenta(true);
      if (!usuarioOk || !claveOk) return;
    }
    if (fallos.length === 0 && paso < 3) establecerPaso((paso + 1) as Paso);
  }

  async function elegir(lado: 'dorso' | 'frente') {
    establecerSinPermiso(false);
    const foto = await elegirFotoDeCedula();
    if (foto.tipo === 'sin-permiso') establecerSinPermiso(true);
    if (foto.tipo !== 'elegida') return;
    if (lado === 'frente') establecerFrente(foto.uri);
    else establecerDorso(foto.uri);
  }

  async function confirmar() {
    establecerFalloBiometria(false);
    const ok = await autenticar(t('registroConductor.motivo'));
    establecerConfirmada(ok);
    establecerFalloBiometria(!ok);
  }

  async function enviar() {
    const fallos = erroresDeSolicitud(datos);
    establecerErrores(fallos);
    if (fallos.length > 0) {
      establecerPaso(
        fallos.some((f) => CAMPOS_DEL_PASO[1].includes(f)) ? 1 : 2,
      );
      return;
    }
    if (!confirmada) {
      establecerFalloBiometria(true);
      return;
    }
    // si todavía no hay cuenta se crea acá mismo, con los datos del primer paso
    if (crearCuentaAqui) {
      const cuenta = await registrar({
        apellido: apellido.trim(),
        clave,
        nombre: nombre.trim(),
        telefono: formatearTelefonoNi(telefono) ?? telefono,
        usuario: usuario.trim().toLowerCase(),
      });
      if (!cuenta.ok) {
        establecerFallaCuenta(cuenta.error);
        establecerPaso(1);
        return;
      }
      establecerFallaCuenta(null);
    }
    const nueva = nuevaSolicitud(datos);
    try {
      await servicioSolicitud().guardar(nueva);
    } catch (falla) {
      establecerFalloEnvio(
        falla instanceof Error && falla.message === 'sin-sesion'
          ? 'sin-sesion'
          : 'conexion',
      );
      return;
    }
    establecerFalloEnvio(null);
    establecerSolicitud(nueva);
  }

  async function descartar() {
    await servicioSolicitud().descartar();
    establecerSolicitud(null);
    establecerPaso(1);
    establecerConfirmada(false);
  }

  const ranura = (lado: 'dorso' | 'frente', uri: string | null) => (
    <View style={estilos.ranuraContenedor}>
      <Pressable
        accessibilityLabel={`${t(`registroConductor.${lado}`)}. ${uri ? t('registroConductor.cambiarFoto') : t('registroConductor.elegirFoto')}`}
        accessibilityRole="button"
        onPress={() => void elegir(lado)}
        style={[
          estilos.ranura,
          {
            backgroundColor: conAlfa(colores.tinta, 0.06),
            borderColor: error(lado) ? colores.cancelado : colores.linea,
          },
        ]}
      >
        {uri ? (
          <Image
            accessibilityIgnoresInvertColors
            source={{ uri: resolverFoto(uri) }}
            style={estilos.foto}
          />
        ) : (
          <Text style={[tipografia.subtitulo, { color: colores.ambarTexto }]}>
            {t('registroConductor.elegirFoto')}
          </Text>
        )}
      </Pressable>
      <Text
        style={[
          tipografia.etiqueta,
          estilos.centrado,
          { color: colores.tintaSuave },
        ]}
      >
        {t(`registroConductor.${lado}`)}
      </Text>
      {error(lado) && (
        <Text
          style={[
            tipografia.pequeno,
            estilos.centrado,
            { color: colores.cancelado },
          ]}
        >
          {error(lado)}
        </Text>
      )}
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: margenes.bottom + espacios.cuarentaYOcho,
          paddingTop: margenes.top + espacios.ocho,
        },
      ]}
      automaticallyAdjustKeyboardInsets
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colores.fondo }}
    >
      <CabeceraPantalla
        alVolver={alVolver}
        titulo={t('registroConductor.titulo')}
      />

      {cargando ? null : solicitud ? (
        <Aparece>
          <Bloque estiloContenido={estilos.enviada}>
            <Text
              style={[
                tipografia.titulo,
                estilos.centrado,
                { color: colores.tinta },
              ]}
            >
              {t('registroConductor.enviadaTitulo')}
            </Text>
            <View style={[estilos.sello, { backgroundColor: colores.ambar }]}>
              <Text
                style={[tipografia.etiqueta, { color: colores.sobreAmbar }]}
              >
                {t('registroConductor.estado')}
              </Text>
            </View>
            <Text
              style={[
                tipografia.cuerpo,
                estilos.centrado,
                { color: colores.tintaSuave },
              ]}
            >
              {t('registroConductor.enviadaDetalle')}
            </Text>
            <Text
              style={[
                tipografia.nombreFila,
                estilos.centrado,
                { color: colores.tinta },
              ]}
            >
              {`${solicitud.nombre} ${solicitud.apellido}`}
            </Text>
            <Text
              style={[
                tipografia.etiqueta,
                estilos.centrado,
                { color: colores.tintaSuave },
              ]}
            >
              {`${t('registroConductor.cedulaGuardada')} ${cedulaOculta(solicitud.cedula)}`}
            </Text>
            <Text
              style={[
                tipografia.pequeno,
                estilos.centrado,
                { color: colores.tintaSuave },
              ]}
            >
              {t('registroConductor.notaLocal')}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void descartar()}
            >
              <Text
                style={[
                  tipografia.subtitulo,
                  estilos.centrado,
                  { color: colores.cancelado },
                ]}
              >
                {t('registroConductor.cancelar')}
              </Text>
            </Pressable>
          </Bloque>
        </Aparece>
      ) : (
        <>
          <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
            {t('registroConductor.detalle')}
          </Text>

          <View
            accessibilityLabel={rellenar(t('registroConductor.progreso'), {
              paso,
            })}
            accessibilityRole="progressbar"
            accessibilityValue={{ max: 3, min: 1, now: paso }}
            accessible
            style={estilos.progreso}
          >
            <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
              {`${paso}/3 · ${t(`registroConductor.paso${paso}`)}`}
            </Text>
            <View style={estilos.segmentos}>
              {([1, 2, 3] as const).map((n) => (
                <View
                  key={n}
                  style={[
                    estilos.segmento,
                    {
                      backgroundColor:
                        n <= paso ? colores.ambar : colores.linea,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {paso === 1 && (
            <Aparece>
              <Bloque estiloContenido={estilos.formulario}>
                <CampoTexto
                  alCambiar={establecerNombre}
                  error={error('nombre')}
                  etiqueta={t('registroConductor.nombre')}
                  valor={nombre}
                />
                <CampoTexto
                  alCambiar={establecerApellido}
                  error={error('apellido')}
                  etiqueta={t('registroConductor.apellido')}
                  valor={apellido}
                />
                <CampoTexto
                  alCambiar={establecerTelefono}
                  error={error('telefono')}
                  etiqueta={t('registroConductor.telefono')}
                  teclado="phone-pad"
                  valor={telefono}
                />
                {crearCuentaAqui && (
                  <>
                    <Text
                      style={[
                        tipografia.etiqueta,
                        { color: colores.ambarTexto },
                      ]}
                    >
                      {t('registroConductor.cuentaTitulo')}
                    </Text>
                    <CampoTexto
                      alCambiar={(valor) => {
                        establecerUsuario(valor);
                        establecerFallaCuenta(null);
                      }}
                      error={
                        validarCuenta && !usuarioOk
                          ? t('cuenta.usuarioInvalido')
                          : fallaCuenta === 'usuario-tomado'
                            ? t('cuenta.usuarioTomado')
                            : fallaCuenta === 'telefono-tomado'
                              ? t('cuenta.telefonoTomado')
                              : undefined
                      }
                      etiqueta={t('cuenta.usuario')}
                      marcador={t('cuenta.marcadorUsuario')}
                      valor={usuario}
                    />
                    <CampoTexto
                      alCambiar={establecerClave}
                      error={
                        validarCuenta && !claveOk
                          ? t('cuenta.claveInvalida')
                          : undefined
                      }
                      etiqueta={t('cuenta.clave')}
                      oculto
                      valor={clave}
                    />
                    {(fallaCuenta === 'conexion' ||
                      fallaCuenta === 'confirmacion-pendiente') && (
                      <Text
                        accessibilityLiveRegion="polite"
                        style={[
                          tipografia.pequeno,
                          { color: colores.cancelado },
                        ]}
                      >
                        {fallaCuenta === 'conexion'
                          ? t('cuenta.sinConexion')
                          : t('cuenta.confirmacionPendiente')}
                      </Text>
                    )}
                  </>
                )}
              </Bloque>
            </Aparece>
          )}

          {paso === 2 && (
            <Aparece>
              <View style={estilos.grupo}>
                <Bloque estiloContenido={estilos.formulario}>
                  <CampoTexto
                    alCambiar={(texto) =>
                      establecerCedula(formatearCedula(texto))
                    }
                    error={error('cedula')}
                    etiqueta={t('registroConductor.cedula')}
                    marcador={t('registroConductor.marcadorCedula')}
                    valor={cedula}
                  />
                </Bloque>
                <View style={estilos.ranuras}>
                  {ranura('frente', frente)}
                  {ranura('dorso', dorso)}
                </View>
                <Text
                  style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                >
                  {t('registroConductor.ayudaFoto')}
                </Text>
                {sinPermiso && (
                  <Text
                    style={[tipografia.pequeno, { color: colores.cancelado }]}
                  >
                    {t('registroConductor.sinPermisoFoto')}
                  </Text>
                )}
              </View>
            </Aparece>
          )}

          {paso === 3 && (
            <Aparece>
              <View style={estilos.grupo}>
                <Bloque estiloContenido={estilos.seguridad}>
                  <View style={estilos.contenedorSello}>
                    {confirmada && <ExplosionConfirmacion />}
                    <Rebote activo={confirmada}>
                      <View
                        style={[
                          estilos.sello3,
                          {
                            backgroundColor: confirmada
                              ? conAlfa(colores.aTiempo, 0.16)
                              : conAlfa(colores.ambar, 0.16),
                            borderColor: confirmada
                              ? colores.aTiempo
                              : colores.ambar,
                          },
                        ]}
                      >
                        <Icono
                          color={
                            confirmada ? colores.aTiempo : colores.ambarTexto
                          }
                          nombre="confirmar"
                          tamano="grande"
                        />
                      </View>
                    </Rebote>
                  </View>
                  <Text
                    style={[
                      tipografia.titulo,
                      estilos.centrado,
                      { color: colores.tinta },
                    ]}
                  >
                    {confirmada
                      ? t('registroConductor.confirmado')
                      : t('registroConductor.seguridadTitulo')}
                  </Text>
                  <Text
                    style={[
                      tipografia.cuerpo,
                      estilos.centrado,
                      { color: colores.tintaSuave },
                    ]}
                  >
                    {t('registroConductor.seguridadDetalle')}
                  </Text>
                  {!conBiometria && (
                    <Text
                      style={[
                        tipografia.pequeno,
                        estilos.centrado,
                        { color: colores.ambarTexto },
                      ]}
                    >
                      {t('registroConductor.sinBiometria')}
                    </Text>
                  )}
                  {!confirmada && (
                    <BotonAccion
                      alPresionar={() => void confirmar()}
                      etiqueta={t('registroConductor.confirmar')}
                    />
                  )}
                  {falloBiometria && (
                    <Text
                      accessibilityLiveRegion="polite"
                      style={[
                        tipografia.pequeno,
                        estilos.centrado,
                        { color: colores.cancelado },
                      ]}
                    >
                      {t('registroConductor.falloBiometria')}
                    </Text>
                  )}
                </Bloque>

                <Bloque estiloContenido={estilos.pasosSeguridad}>
                  <Text
                    style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
                  >
                    {t('registroConductor.seguridadPasos')}
                  </Text>
                  {(['Paso1', 'Paso2', 'Paso3'] as const).map((clave, i) => (
                    <View key={clave} style={estilos.filaPaso}>
                      <View
                        style={[
                          estilos.numero,
                          { backgroundColor: colores.bloqueNegro },
                        ]}
                      >
                        <Text
                          style={[
                            tipografia.etiqueta,
                            { color: colores.ambar },
                          ]}
                        >
                          {i + 1}
                        </Text>
                      </View>
                      <Text
                        style={[
                          tipografia.cuerpo,
                          estilos.textoPaso,
                          { color: colores.tinta },
                        ]}
                      >
                        {t(`registroConductor.seguridad${clave}`)}
                      </Text>
                    </View>
                  ))}
                  <Text
                    style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                  >
                    {t('registroConductor.seguridadCifrado')}
                  </Text>
                </Bloque>
              </View>
            </Aparece>
          )}

          <View style={estilos.navegacion}>
            {paso > 1 && (
              <Pressable
                accessibilityRole="button"
                onPress={() => establecerPaso((paso - 1) as Paso)}
                style={estilos.atras}
              >
                <Text
                  style={[tipografia.subtitulo, { color: colores.ambarTexto }]}
                >
                  {t('registroConductor.atras')}
                </Text>
              </Pressable>
            )}
            {falloEnvio !== null && (
              <Text
                accessibilityLiveRegion="polite"
                style={[tipografia.cuerpo, { color: colores.cancelado }]}
              >
                {falloEnvio === 'sin-sesion'
                  ? t('registroConductor.necesitaCuenta')
                  : t('registroConductor.falloEnvio')}
              </Text>
            )}
            <View style={estilos.principal}>
              {paso < 3 ? (
                <BotonAccion
                  alPresionar={seguir}
                  etiqueta={t('registroConductor.seguir')}
                />
              ) : (
                <BotonAccion
                  alPresionar={() => void enviar()}
                  deshabilitado={!confirmada}
                  etiqueta={t('registroConductor.enviar')}
                />
              )}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedorSello: { alignItems: 'center', justifyContent: 'center' },
  filaPaso: { alignItems: 'center', flexDirection: 'row', gap: espacios.doce },
  numero: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  pasosSeguridad: { gap: espacios.doce, padding: espacios.dieciseis },
  seguridad: {
    alignItems: 'center',
    gap: espacios.doce,
    padding: espacios.veinticuatro,
  },
  sello3: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    borderWidth: 2,
    height: 84,
    justifyContent: 'center',
    width: 84,
  },
  textoPaso: { flex: 1 },
  atras: {
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: espacios.dieciseis,
  },
  centrado: { textAlign: 'center' },
  contenido: {
    gap: espacios.veinticuatro,
    paddingHorizontal: espacios.lateral,
  },
  enviada: {
    alignItems: 'center',
    gap: espacios.dieciseis,
    padding: espacios.veinticuatro,
  },
  foto: { height: '100%', width: '100%' },
  formulario: { gap: espacios.dieciseis, padding: espacios.veinticuatro },
  grupo: { gap: espacios.doce },
  navegacion: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
  },
  principal: { flex: 1 },
  progreso: { gap: espacios.ocho },
  ranura: {
    alignItems: 'center',
    aspectRatio: 86 / 54,
    borderRadius: radios.loseta,
    borderWidth: 2,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  ranuraContenedor: { flex: 1, gap: espacios.ocho },
  ranuras: { flexDirection: 'row', gap: espacios.doce },
  segmento: { borderRadius: radios.pildora, flex: 1, height: 6 },
  segmentos: { flexDirection: 'row', gap: espacios.ocho },
  sello: {
    borderRadius: radios.pildora,
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.cuatro,
  },
});
