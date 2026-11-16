import { useEffect, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Autobus, varianteDeClave } from '@/componentes/Autobus';
import { Avatar } from '@/componentes/Avatar';
import { ChatViaje } from '@/componentes/ChatViaje';
import { EstrellasDelViaje } from '@/componentes/EstrellasDelViaje';
import { Hoja } from '@/componentes/Hoja';
import { Icono } from '@/componentes/Icono';
import { MapaCorredor } from '@/componentes/MapaCorredor';
import { PanelSeguridadViaje } from '@/componentes/PanelSeguridadViaje';
import { Presionable } from '@/componentes/Presionable';
import {
  enlaceDeViaje,
  leerContacto,
  mensajeDeViaje,
  urlSms,
  type ContactoConfianza,
} from '@/datos/contactoConfianza';
import { NUMERO_EMERGENCIA } from '@/datos/deteccionChoque';
import { etaDelViaje } from '@/datos/etaDelViaje';
import { formatoHoraCompleta } from '@/datos/formato';
import { chatDisponible } from '@/datos/mensajesViaje';
import {
  guardarOpinionDelViaje,
  leerOpiniones,
  notaConOpiniones,
  type Opinion,
} from '@/datos/opiniones';
import { nombrePropio } from '@/datos/perfil';
import { useAvanceViaje } from '@/datos/useAvanceViaje';
import { useBoletos } from '@/datos/useBoletos';
import { useBusSimulado } from '@/datos/useBusSimulado';
import { useChoferPublico } from '@/datos/useChoferPublico';
import { usePerfilChofer } from '@/datos/useDetalleViaje';
import { useLlamar } from '@/datos/useLlamar';
import { useMensajesViaje } from '@/datos/useMensajesViaje';
import { useAhora, useSalidas } from '@/datos/useSalidas';
import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesViajeEnCurso {
  /** abre el perfil de quien conduce */
  alVerChofer?: (choferId: string) => void;
  alVerBoleto?: (boletoId: string) => void;
  alVolver: () => void;
  boletoId: string;
}

/** un escudo de un solo trazo para el botón de seguridad */
function Escudo({ color }: { color: string }) {
  return (
    <Svg height={26} viewBox="0 0 48 48" width={26}>
      <Path
        d="M24 6L38 11V23C38 32 32 39 24 42C16 39 10 32 10 23V11Z"
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={4}
      />
      <Path
        d="M17.500 24L22 28.500L30.500 19.500"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={4}
      />
    </Svg>
  );
}

/** una burbuja de mensaje de un solo trazo para el botón de hablar con el chofer */
function Burbuja({ color }: { color: string }) {
  return (
    <Svg height={26} viewBox="0 0 48 48" width={26}>
      <Path
        d="M9 12H39V32H21L13 40V32H9Z"
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={4}
      />
      <Path
        d="M17 20H31M17 26H26"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={4}
      />
    </Svg>
  );
}

/**
 * el viaje que el pasajero está haciendo: el mapa con el recorrido arriba, la hora a la que llega, la unidad y
 * su placa, quién conduce, hablar con el chofer, seguridad y calificar al chofer sin salir de aquí
 */
export function ViajeEnCurso({
  alVerBoleto,
  alVerChofer,
  alVolver,
  boletoId,
}: PropiedadesViajeEnCurso) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { boletos } = useBoletos();
  const { salidas } = useSalidas();
  const ahora = useAhora(15_000);
  const guardado = boletos.find(({ boleto }) => boleto.id === boletoId);
  const salida = salidas.find((s) => s.viajeId === guardado?.boleto.viajeId);
  const viajeId = guardado?.boleto.viajeId ?? '';
  const choferId = guardado?.resumen.choferId ?? '';
  const origen = salida?.origen ?? guardado?.resumen.origen ?? '';
  const destino = guardado?.resumen.destino ?? '';
  const simulacion = useBusSimulado(origen, destino);
  const { progreso, transmision } = useAvanceViaje(viajeId, origen, destino);
  const publico = useChoferPublico(choferId);
  const perfil = usePerfilChofer(choferId);
  const llamar = useLlamar();
  const conversacion = useMensajesViaje(
    viajeId,
    boletoId,
    'pasajero',
    salida !== undefined && chatDisponible(salida.estado, transmision.activa),
  );
  const [propias, establecerPropias] = useState<Opinion[]>([]);
  const [contacto, establecerContacto] = useState<ContactoConfianza | null>(
    null,
  );
  const [hablando, establecerHablando] = useState(false);
  const [seguridad, establecerSeguridad] = useState(false);
  const [estrellas, establecerEstrellas] = useState(0);
  const [guardada, establecerGuardada] = useState(false);

  useEffect(() => {
    void leerContacto().then(establecerContacto);
    void leerOpiniones().then((lista) => {
      establecerPropias(lista);
      const mia = lista.find((opinion) => opinion.boletoId === boletoId);
      if (mia) establecerEstrellas(mia.estrellas);
    });
  }, [boletoId]);

  if (!guardado || !salida) {
    return (
      <View
        style={[
          estilos.sinDatos,
          { backgroundColor: colores.fondo, paddingTop: margenes.top },
        ]}
      >
        <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
          {t('boleto.noExiste')}
        </Text>
        <Pressable accessibilityRole="button" onPress={alVolver}>
          <Text style={[tipografia.subtitulo, { color: colores.ambarTexto }]}>
            {t('viajeEnCurso.volver')}
          </Text>
        </Pressable>
      </View>
    );
  }

  const eta = etaDelViaje(
    ahora,
    salida,
    simulacion?.duracionMin ?? 60,
    progreso,
  );
  const nota = notaConOpiniones(
    {
      promedio: perfil?.promedio ?? null,
      total: perfil?.totalCalificaciones ?? 0,
    },
    propias.filter((opinion) => opinion.choferId === choferId),
  );
  const nombre = nombrePropio(guardado.resumen.choferNombre);
  const primerNombre = nombre.split(' ')[0] ?? nombre;
  const posicion = transmision.posicion
    ? { lat: transmision.posicion.lat, lng: transmision.posicion.lng }
    : undefined;
  const modelo = varianteDeClave(
    `${simulacion?.origen.codigo ?? origen}-${simulacion?.destino.codigo ?? destino}`,
  );

  async function calificar(n: number) {
    establecerEstrellas(n);
    establecerGuardada(false);
    const lista = await guardarOpinionDelViaje({
      boletoId,
      choferId,
      estrellas: n as Opinion['estrellas'],
    });
    establecerPropias(lista);
    establecerGuardada(true);
  }

  async function avisarAlContacto() {
    if (!contacto || !guardado) return;
    const mensaje = mensajeDeViaje({
      chofer: primerNombre,
      destino,
      enlace: enlaceDeViaje(viajeId),
      llegada: formatoHoraCompleta(eta.llegada),
      placa: guardado.resumen.placa,
      salida: formatoHoraCompleta(new Date(guardado.resumen.salida)),
    });
    await Linking.openURL(urlSms(contacto, mensaje)).catch(() => undefined);
  }

  function abrirChat() {
    conversacion.marcarVisto();
    establecerHablando(true);
  }

  return (
    <View style={[estilos.pantalla, { backgroundColor: colores.fondo }]}>
      <View
        accessibilityLabel={rellenar(t('viajeEnCurso.mapaDescripcion'), {
          destino,
        })}
        accessibilityRole="image"
        accessible
        style={estilos.mapa}
      >
        {simulacion && (
          <MapaCorredor
            alto={height * 0.52}
            simulacion={{
              bus: posicion,
              destino: simulacion.destino,
              origen: simulacion.origen,
              trazo: simulacion.trazo,
            }}
            sinMarco
            variante={modelo}
          />
        )}
        <Pressable
          accessibilityLabel={t('viajeEnCurso.volver')}
          accessibilityRole="button"
          onPress={alVolver}
          style={[
            estilos.flotante,
            estilos.volver,
            {
              backgroundColor: colores.fondo,
              top: margenes.top + espacios.ocho,
            },
          ]}
        >
          <Icono nombre="volver" tamano="mediano" />
        </Pressable>
        <Pressable
          accessibilityLabel={t('viajeEnCurso.seguridad')}
          accessibilityRole="button"
          onPress={() => establecerSeguridad(true)}
          style={[estilos.pildoraSeguridad, { backgroundColor: colores.fondo }]}
        >
          <Escudo color={colores.ambarTexto} />
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {t('viajeEnCurso.seguridad')}
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          estilos.hoja,
          { backgroundColor: colores.fondo, borderColor: colores.linea },
        ]}
      >
        <View style={[estilos.asa, { backgroundColor: colores.linea }]} />
        <ScrollView
          contentContainerStyle={[
            estilos.contenido,
            { paddingBottom: margenes.bottom + espacios.veinticuatro },
          ]}
        >
          <View style={estilos.bloque}>
            <Text
              accessibilityRole="header"
              style={[tipografia.display, { color: colores.tinta }]}
            >
              {rellenar(t('viajeEnCurso.llegasA'), {
                hora: formatoHoraCompleta(eta.llegada),
              })}
            </Text>
            <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
              {eta.kmRestantes === null
                ? t('viajeEnCurso.sinSenal')
                : rellenar(t('viajeEnCurso.faltan'), {
                    km: eta.kmRestantes,
                    minutos: eta.minutosRestantes,
                  })}
            </Text>
          </View>

          <View style={[estilos.unidad, { borderColor: colores.linea }]}>
            <View style={estilos.unidadTexto}>
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {rellenar(t('viajeEnCurso.unidad'), {
                  cooperativa: guardado.resumen.cooperativa,
                  servicio: t(`servicios.${guardado.resumen.servicio}`),
                })}
              </Text>
              <View style={[estilos.placa, { backgroundColor: colores.papel }]}>
                <Text style={[tipografia.dato, { color: colores.tinta }]}>
                  {guardado.resumen.placa}
                </Text>
              </View>
            </View>
            <Autobus ancho={132} usarMiUnidad variante={modelo} />
          </View>

          <View style={[estilos.acciones, { borderColor: colores.linea }]}>
            <Presionable
              accessibilityLabel={`${nombre}${nota.promedio === null ? '' : `, ${nota.promedio}`}`}
              accessibilityRole="button"
              onPress={() => alVerChofer?.(choferId)}
            >
              <View style={estilos.accion}>
                <View>
                  <Avatar
                    descripcion={nombre}
                    iniciales={nombre.slice(0, 2).toUpperCase()}
                    tamano={64}
                    uri={publico?.fotoUrl ?? null}
                  />
                  {nota.promedio !== null && (
                    <View
                      style={[
                        estilos.nota,
                        {
                          backgroundColor: colores.fondo,
                          borderColor: colores.linea,
                        },
                      ]}
                    >
                      <Text
                        style={[tipografia.etiqueta, { color: colores.tinta }]}
                      >
                        {`★ ${nota.promedio}`}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[tipografia.pequeno, { color: colores.tinta }]}>
                  {primerNombre}
                </Text>
              </View>
            </Presionable>
            <Presionable
              accessibilityLabel={t('viajeEnCurso.hablar')}
              accessibilityRole="button"
              onPress={abrirChat}
            >
              <View style={estilos.accion}>
                <View
                  style={[estilos.circulo, { backgroundColor: colores.ambar }]}
                >
                  <Burbuja color={colores.sobreAmbar} />
                  {conversacion.sinLeer > 0 && (
                    <View
                      style={[
                        estilos.punto,
                        {
                          backgroundColor: colores.cancelado,
                          borderColor: colores.fondo,
                        },
                      ]}
                      testID="mensajes-sin-leer"
                    />
                  )}
                </View>
                <Text style={[tipografia.pequeno, { color: colores.tinta }]}>
                  {t('viajeEnCurso.hablar')}
                </Text>
              </View>
            </Presionable>
            <Presionable
              accessibilityLabel={t('viajeEnCurso.seguridad')}
              accessibilityRole="button"
              onPress={() => establecerSeguridad(true)}
            >
              <View style={estilos.accion}>
                <View
                  style={[estilos.circulo, { backgroundColor: colores.ambar }]}
                >
                  <Escudo color={colores.sobreAmbar} />
                </View>
                <Text style={[tipografia.pequeno, { color: colores.tinta }]}>
                  {t('viajeEnCurso.seguridad')}
                </Text>
              </View>
            </Presionable>
          </View>

          <View style={[estilos.calificar, { borderColor: colores.linea }]}>
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {t('viajeEnCurso.calificaTitulo')}
            </Text>
            <EstrellasDelViaje
              alElegir={(n) => void calificar(n)}
              valor={estrellas}
            />
            <Text
              accessibilityLiveRegion="polite"
              style={[
                tipografia.pequeno,
                estilos.centrado,
                { color: colores.tintaSuave },
              ]}
            >
              {guardada
                ? t('viajeEnCurso.calificaGuardada')
                : t('viajeEnCurso.calificaAnonima')}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => alVerBoleto?.(boletoId)}
            style={estilos.verBoleto}
          >
            <Text style={[tipografia.subtitulo, { color: colores.ambarTexto }]}>
              {t('viajeEnCurso.verBoleto')}
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      <Hoja
        abierta={hablando}
        alCerrar={() => {
          conversacion.marcarVisto();
          establecerHablando(false);
        }}
        etiquetaCerrar={t('chatViaje.cerrar')}
      >
        <View style={estilos.hojaContenido}>
          <ChatViaje
            alEnviar={conversacion.enviar}
            disponible={chatDisponible(salida.estado, transmision.activa)}
            mensajes={conversacion.mensajes}
            nombre={primerNombre}
            razonFallo={conversacion.fallo}
            rapidas={[
              t('chatViaje.rapidas.parada'),
              t('chatViaje.rapidas.llegando'),
              t('chatViaje.rapidas.cuanto'),
            ]}
            yo="pasajero"
          />
        </View>
      </Hoja>

      <Hoja
        abierta={seguridad}
        alCerrar={() => establecerSeguridad(false)}
        etiquetaCerrar={t('seguridadViaje.cerrar')}
      >
        <View style={estilos.hojaContenido}>
          <PanelSeguridadViaje
            alAvisar={() => void avisarAlContacto()}
            alLlamarAlChofer={() => void llamar.alChofer(viajeId)}
            alLlamarEmergencias={() =>
              void Linking.openURL(`tel:${NUMERO_EMERGENCIA}`).catch(
                () => undefined,
              )
            }
            conContacto={contacto !== null}
            falloLlamada={llamar.fallo}
          />
        </View>
      </Hoja>
    </View>
  );
}

const estilos = StyleSheet.create({
  accion: { alignItems: 'center', gap: espacios.ocho, minWidth: 96 },
  acciones: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: espacios.dieciseis,
  },
  asa: {
    alignSelf: 'center',
    borderRadius: radios.pildora,
    height: 5,
    marginTop: espacios.ocho,
    width: 40,
  },
  bloque: { gap: espacios.cuatro },
  calificar: {
    alignItems: 'center',
    borderBottomWidth: 1,
    gap: espacios.doce,
    paddingBottom: espacios.dieciseis,
  },
  centrado: { textAlign: 'center' },
  circulo: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  contenido: { gap: espacios.dieciseis, padding: espacios.veinticuatro },
  flotante: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    height: tamanosControl.toqueMinimo,
    justifyContent: 'center',
    position: 'absolute',
    width: tamanosControl.toqueMinimo,
  },
  hoja: {
    borderTopLeftRadius: radios.bloqueNegro,
    borderTopRightRadius: radios.bloqueNegro,
    borderWidth: 1,
    flex: 1,
    marginTop: -espacios.veinticuatro,
    overflow: 'hidden',
  },
  hojaContenido: {
    paddingBottom: espacios.cuarentaYOcho,
    paddingHorizontal: espacios.lateral,
  },
  mapa: { overflow: 'hidden' },
  nota: {
    borderRadius: radios.pildora,
    borderWidth: 1,
    bottom: -4,
    paddingHorizontal: espacios.ocho,
    position: 'absolute',
    right: -6,
  },
  pantalla: { flex: 1 },
  pildoraSeguridad: {
    alignItems: 'center',
    borderRadius: radios.pildora,
    bottom: espacios.cuarentaYOcho,
    flexDirection: 'row',
    gap: espacios.ocho,
    paddingHorizontal: espacios.dieciseis,
    paddingVertical: espacios.ocho,
    position: 'absolute',
    right: espacios.dieciseis,
  },
  placa: {
    alignSelf: 'flex-start',
    borderRadius: radios.loseta,
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.cuatro,
  },
  punto: {
    borderRadius: radios.pildora,
    borderWidth: 2,
    height: 16,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 16,
  },
  sinDatos: {
    alignItems: 'center',
    flex: 1,
    gap: espacios.dieciseis,
    justifyContent: 'center',
    padding: espacios.veinticuatro,
  },
  unidad: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
    justifyContent: 'space-between',
  },
  unidadTexto: { flex: 1, gap: espacios.ocho },
  verBoleto: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
  },
  volver: { left: espacios.dieciseis },
});
