import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccionDeBoleto } from '@/componentes/AccionDeBoleto';
import { Bloque } from '@/componentes/Bloque';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { HojaContacto } from '@/componentes/HojaContacto';
import { HojaObjetoOlvidado } from '@/componentes/HojaObjetoOlvidado';
import { PuntoDeEncuentro } from '@/componentes/PuntoDeEncuentro';
import { CalificarViaje } from '@/componentes/CalificarViaje';
import { OverlayBoleto, TalonAmpliable } from '@/componentes/TalonAmpliable';
import { TalonBoleto } from '@/componentes/TalonBoleto';
import { TalonRasgado } from '@/componentes/TalonRasgado';
import { estadoVisibleBoleto } from '@/datos/estadoBoleto';
import { faseDeActividad } from '@/datos/faseDelViaje';
import { useBoletos } from '@/datos/useBoletos';
import {
  actividadesDisponibles,
  actualizarActividad,
  iniciarActividad,
  terminarActividad,
} from '../../modules/anden-actividad';
import { useEstadoRemotoBoletos } from '@/datos/useEstadoRemotoBoletos';
import { useBusPropio } from '@/datos/useBusPropio';
import { usePreferenciaActividad } from '@/datos/preferenciaActividad';
import { HojaRecordatorio } from '@/componentes/HojaRecordatorio';
import { ResumenIA } from '@/componentes/ResumenIA';
import { lineaDeBoleto } from '@/datos/contextoIA';
import { motivoDeCancelacion, viajeCancelado } from '@/datos/historialSalidas';
import { esMotivoCancelacion } from '@/datos/motivoCancelacion';
import { enVentanaDeLlamada } from '@/datos/comunicacion';
import { useAvisoDelViaje } from '@/datos/useAvisosDelViaje';
import { useLlamar } from '@/datos/useLlamar';
import { ObjetosDelViaje } from '@/componentes/ObjetosDelViaje';
import { useObjetosDelViaje } from '@/datos/useObjetosDelViaje';
import type { MinutosAntes } from '@/datos/recordatorios';
import type { Salida } from '@/datos/salidas';
import { useRecordatorios } from '@/datos/useRecordatorios';
import { usePagos } from '@/datos/usePagos';
import { obtenerMuestra, useAhora, useSalidas } from '@/datos/useSalidas';
import { useSonidos } from '@/datos/useSonidos';
import { useSuscripcion } from '@/datos/useSuscripcion';
import { puedeGuardarHabitual } from '@/servicios/beneficios';
import {
  guardarContacto,
  leerContacto,
  enlaceDeViaje,
  mensajeDeViaje,
  urlSms,
  type ContactoConfianza,
} from '@/datos/contactoConfianza';
import { armarDetalle } from '@/datos/detalle';
import { formatoHoraCompleta } from '@/datos/formato';
import { nombreCompleto, nombrePropio } from '@/datos/perfil';
import { usePerfil } from '@/datos/usePerfil';
import {
  enlaceDeSeguimiento,
  mensajeDeSeguimiento,
} from '@/datos/viajeCompartido';
import { crearCompartido } from '@/servicios/supabase/compartidosSupabase';
import { leerUrlDeSeguimiento } from '@/servicios/supabase/configuracion';
import {
  guardarObjeto,
  leerObjetos,
  nuevoObjeto,
  objetosDeBoleto,
  type ObjetoOlvidado,
} from '@/datos/objetosOlvidados';
import { AlternativasDeViaje } from '@/componentes/AlternativasDeViaje';
import {
  alternativasParaBoleto,
  pasajeroParaReubicar,
  primerAsientoLibre,
} from '@/datos/reubicarBoleto';
import { habitualDeSalida, horaTexto, idHabitual } from '@/datos/habituales';
import { useHabituales } from '@/datos/useHabituales';
import { espacios, tamanosControl } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesVerBoleto {
  alCancelado: () => void;
  /** abre el boleto nuevo cuando se pasó a otra salida porque el viaje se canceló */
  alReubicado?: (boletoId: string) => void;
  /** abre la búsqueda con el destino de este boleto, para volver a viajar */
  alReservarOtra?: (destino: string) => void;
  /** abre la pantalla para pasar este boleto a otra persona */
  alTransferir?: (boletoId: string) => void;
  alVerChofer: (choferId: string) => void;
  alVolver: () => void;
  boletoId: string;
}

/** un boleto reservado con pago en efectivo: el talón con su código y QR y lo que hay que pagar al subir */
export function VerBoleto({
  alCancelado,
  alReubicado,
  alReservarOtra,
  alTransferir,
  alVerChofer,
  alVolver,
  boletoId,
}: PropiedadesVerBoleto) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const ahora = useAhora();
  const { boletos, cancelar, reservar } = useBoletos();
  const [pasandoA, establecerPasandoA] = useState<string | null>(null);
  const [falloReubicar, establecerFalloReubicar] = useState(false);
  const llamar = useLlamar();
  const recordatorios = useRecordatorios();
  const [actividadDisponible, establecerActividadDisponible] = useState(false);
  const [actividadId, establecerActividadId] = useState<string | null>(null);
  const preferenciaActividad = usePreferenciaActividad();
  const { efectivo: unidadElegida } = useBusPropio();
  // si la persona apaga la actividad en los ajustes, la que esté puesta se retira
  useEffect(() => {
    if (preferenciaActividad.activa === false && actividadId) {
      void terminarActividad(actividadId);
      establecerActividadId(null);
    }
  }, [actividadId, preferenciaActividad.activa]);

  useEffect(() => {
    let activo = true;
    void actividadesDisponibles().then((si) => {
      if (activo) establecerActividadDisponible(si);
    });
    return () => {
      activo = false;
    };
  }, []);
  const { salidas } = useSalidas();
  async function pasarmeA(destino: Salida) {
    if (!guardado || pasandoA) return;
    establecerPasandoA(destino.viajeId);
    establecerFalloReubicar(false);
    const asiento = primerAsientoLibre(
      obtenerMuestra(),
      destino.viajeId,
      new Date(),
    );
    const resultado =
      asiento === null
        ? null
        : await reservar(destino.viajeId, [
            pasajeroParaReubicar(guardado, asiento),
          ]);
    if (resultado?.ok) {
      // el boleto del viaje cancelado ya no sirve: se cancela para soltar su asiento
      await cancelar(guardado.boleto.id);
      const nuevo = resultado.valor[0];
      if (nuevo) alReubicado?.(nuevo.boleto.id);
      else alCancelado();
    } else {
      establecerFalloReubicar(true);
    }
    establecerPasandoA(null);
  }
  const [eligiendoRecordatorio, establecerEligiendoRecordatorio] =
    useState(false);
  const [errorRecordatorio, establecerErrorRecordatorio] = useState<
    'fallo' | 'permiso-negado' | 'ya-paso' | null
  >(null);
  const { estadoDe } = usePagos();
  const remoto = useEstadoRemotoBoletos();
  const { agregar: agregarHabitual, habituales } = useHabituales();
  const [confirmando, establecerConfirmando] = useState(false);
  const [objetos, establecerObjetos] = useState<ObjetoOlvidado[]>([]);
  const [reportando, establecerReportando] = useState(false);
  const [contacto, establecerContacto] = useState<ContactoConfianza | null>(
    null,
  );
  const [pidiendoContacto, establecerPidiendoContacto] = useState(false);

  const { perfil } = usePerfil();
  const sonar = useSonidos();
  const progresoAmpliado = useRef(new Animated.Value(0)).current;
  const { plus } = useSuscripcion();

  useEffect(() => {
    void leerObjetos().then(establecerObjetos);
    void leerContacto().then(establecerContacto);
  }, []);

  // el talón se desprende con su sonido al abrir el boleto
  useEffect(() => {
    sonar('boleto');
  }, [sonar]);
  const guardado = boletos.find(({ boleto }) => boleto.id === boletoId);
  const motivoGuardado = guardado
    ? motivoDeCancelacion(guardado.boleto.viajeId)
    : null;
  const motivoCancelado = esMotivoCancelacion(motivoGuardado)
    ? motivoGuardado
    : null;
  const avisoDelChofer = useAvisoDelViaje(guardado?.boleto.viajeId ?? null);
  const objetosDelChofer = useObjetosDelViaje(guardado?.boleto.viajeId ?? null);

  // mientras la actividad en vivo está abierta, sigue el estado del viaje: cambia de color y de texto sola
  useEffect(() => {
    if (!actividadId || !guardado) return;
    const vigente = salidas.find(
      (candidata) => candidata.viajeId === guardado.boleto.viajeId,
    );
    void actualizarActividad(
      actividadId,
      guardado.resumen.puntoEncuentro,
      rellenar(t('boleto.actividadEstado'), {
        puntoEncuentro: guardado.resumen.puntoEncuentro,
        hora: horaTexto(new Date(guardado.resumen.salida)),
      }),
      faseDeActividad(vigente?.estado),
    );
  }, [actividadId, guardado, salidas]);

  if (!guardado) {
    return (
      <View
        style={[
          estilos.sinDatos,
          {
            backgroundColor: colores.fondo,
            paddingTop: margenes.top + espacios.ocho,
          },
        ]}
      >
        <CabeceraPantalla alVolver={alVolver} titulo={t('boleto.titulo')} />
        <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
          {t('boleto.noExiste')}
        </Text>
      </View>
    );
  }

  const minutos = Math.round(
    (new Date(guardado.resumen.salida).getTime() - ahora.getTime()) / 60_000,
  );
  const estado = estadoVisibleBoleto(guardado, ahora);
  const puedeOperar = estado === 'vigente';
  // el boleto guarda el nombre de la terminal de origen; el viaje habitual usa la ciudad
  const ciudadOrigen = obtenerMuestra().terminales.find(
    (terminal) => terminal.nombre === guardado.resumen.origen,
  )?.ciudad;
  const salidaGuardada = new Date(guardado.resumen.salida);
  const yaEsHabitual =
    ciudadOrigen !== undefined &&
    habituales.some(
      (habitual) =>
        habitual.id ===
          idHabitual(
            ciudadOrigen,
            guardado.resumen.destino,
            horaTexto(salidaGuardada),
          ) && habitual.dias.includes(salidaGuardada.getDay()),
    );
  const cabeHabitual = puedeGuardarHabitual(plus, habituales.length);
  // la hoja de recordatorio trabaja con una salida; la del boleto se arma con lo que el boleto guarda
  const salidaVigente = salidas.find(
    (candidata) => candidata.viajeId === guardado.boleto.viajeId,
  );
  const salidaDelBoleto = {
    puntoEncuentro: guardado.resumen.puntoEncuentro,
    destino: guardado.resumen.destino,
    // el atraso lo trae la salida en vivo; la hora, la del boleto, que es la que la persona reservó
    minutosAtraso: salidaVigente?.minutosAtraso ?? 0,
    salida: salidaGuardada,
    viajeId: guardado.boleto.viajeId,
  } as unknown as Salida;
  const recordatorioActivo = recordatorios.de(guardado.boleto.viajeId);

  async function alternarActividad() {
    if (actividadId) {
      await terminarActividad(actividadId);
      establecerActividadId(null);
      return;
    }
    establecerActividadId(
      await iniciarActividad({
        fase: faseDeActividad(salidaVigente?.estado),
        // la ciudad y no el nombre largo de la terminal: en la isla no cabe
        origen:
          obtenerMuestra().terminales.find(
            (terminal) => terminal.nombre === guardado!.resumen.origen,
          )?.ciudad ??
          guardado!.resumen.origen ??
          '',
        puntoEncuentro: guardado!.resumen.puntoEncuentro,
        destino: guardado!.resumen.destino,
        estado: rellenar(t('boleto.actividadEstado'), {
          puntoEncuentro: guardado!.resumen.puntoEncuentro,
          hora: horaTexto(salidaGuardada),
        }),
        salida: salidaGuardada,
        // la hora a la que se espera que llegue y el vehículo que eligió la persona (su bus o su vehículo Plus)
        llegada: armarDetalle(obtenerMuestra(), guardado!.boleto.viajeId, ahora)
          ?.llegada,
        vehiculo: unidadElegida ?? undefined,
      }),
    );
  }

  async function elegirRecordatorio(minutos: MinutosAntes) {
    const resultado = await recordatorios.programar(salidaDelBoleto, minutos);
    if (resultado === 'listo') {
      establecerEligiendoRecordatorio(false);
      establecerErrorRecordatorio(null);
    } else establecerErrorRecordatorio(resultado);
  }

  async function quitarRecordatorio() {
    await recordatorios.quitar(salidaDelBoleto.viajeId);
    establecerEligiendoRecordatorio(false);
  }
  const etiquetaEstado = {
    cancelado: t('boleto.cancelado'),
    usado: t('boleto.usado'),
    vencido: t('boleto.vencido'),
    vigente: t('boleto.estadoVigente'),
  }[estado];
  async function avisarContacto(destinatario: ContactoConfianza) {
    const detalle = armarDetalle(
      obtenerMuestra(),
      guardado!.boleto.viajeId,
      ahora,
    );
    const mensaje = mensajeDeViaje({
      chofer: nombrePropio(guardado!.resumen.choferNombre),
      destino: guardado!.resumen.destino,
      enlace: enlaceDeViaje(guardado!.boleto.viajeId),
      llegada: detalle ? formatoHoraCompleta(detalle.llegada) : '',
      placa: guardado!.resumen.placa,
      salida: formatoHoraCompleta(new Date(guardado!.resumen.salida)),
    });
    await Linking.openURL(urlSms(destinatario, mensaje)).catch(() => undefined);
  }

  const compartir = async () => {
    // con servidor y página de seguimiento se arma un enlace que cualquiera abre en el navegador, sin la app
    const nombre =
      nombrePropio(nombreCompleto(perfil)).split(' ')[0] || 'Un pasajero';
    const token = await crearCompartido({
      destino: guardado.resumen.destino,
      nombre,
      origen: guardado.resumen.origen ?? '',
      viajeId: guardado.boleto.viajeId,
    });
    const enlaceWeb = token
      ? enlaceDeSeguimiento(leerUrlDeSeguimiento(), token)
      : null;
    await Share.share({
      message: mensajeDeSeguimiento({
        destino: guardado.resumen.destino,
        enlaceWeb,
        placa: guardado.resumen.placa,
        salida: formatoHoraCompleta(new Date(guardado.resumen.salida)),
        viajeId: guardado.boleto.viajeId,
      }),
    });
  };

  return (
    <View style={estilos.raiz}>
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
        <CabeceraPantalla alVolver={alVolver} titulo={t('boleto.titulo')} />

        {minutos > 0 && (
          <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
            {`${t('viajar.saleEn')} ${minutos} ${t('viajar.minutos')}`}
          </Text>
        )}

        <TalonAmpliable habilitado={puedeOperar} progreso={progresoAmpliado}>
          <TalonRasgado rasgado={guardado.boleto.estado === 'usado'}>
            <TalonBoleto guardado={guardado} />
          </TalonRasgado>
        </TalonAmpliable>
        {(estado === 'usado' || estado === 'vencido') && (
          <CalificarViaje guardado={guardado} />
        )}
        <PuntoDeEncuentro codigo={guardado.resumen.puntoEncuentro} />

        {puedeOperar && (
          <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
            {t('boleto.muestra')}
          </Text>
        )}
        <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
          {`${t('boletos.estado')}: ${etiquetaEstado}`}
        </Text>
        {(estadoDe(guardado.boleto.id) === 'pagado_efectivo' ||
          remoto.pagados.has(guardado.boleto.id)) && (
          <Text
            accessibilityLiveRegion="polite"
            style={[tipografia.etiqueta, { color: colores.aTiempo }]}
          >
            {t('boleto.pagadoEfectivo')}
          </Text>
        )}

        {puedeOperar && (
          <Bloque estiloContenido={estilos.pago} hundido radio="loseta">
            <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
              {t('boleto.totalAbordar')}
            </Text>
            <Text
              style={[tipografia.datoGrande, { color: colores.tinta }]}
            >{`C$ ${guardado.boleto.precio}`}</Text>
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {t('boleto.exacto')}
            </Text>
          </Bloque>
        )}

        {puedeOperar && (
          <Bloque estiloContenido={estilos.verificar} hundido radio="loseta">
            <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
              {t('boleto.verificarTitulo')}
            </Text>
            <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
              {rellenar(t('boleto.verificarPlaca'), {
                placa: guardado.resumen.placa,
              })}
            </Text>
            <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
              {rellenar(t('boleto.verificarChofer'), {
                chofer: guardado.resumen.choferNombre,
              })}
            </Text>
            <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
              {rellenar(t('boleto.verificarAnden'), {
                puntoEncuentro: guardado.resumen.puntoEncuentro,
              })}
            </Text>
          </Bloque>
        )}

        <Pressable
          accessibilityLabel={`${t('boleto.verChofer')} ${guardado.resumen.choferNombre}`}
          accessibilityRole="button"
          onPress={() => alVerChofer(guardado.resumen.choferId)}
        >
          <Bloque estiloContenido={estilos.boton} radio="pildora">
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {`${t('boleto.verChofer')} · ${guardado.resumen.choferNombre}`}
            </Text>
          </Bloque>
        </Pressable>

        {ciudadOrigen && guardado.boleto.estado !== 'cancelado' && (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: yaEsHabitual || !cabeHabitual }}
            disabled={yaEsHabitual || !cabeHabitual}
            onPress={() =>
              void agregarHabitual(
                habitualDeSalida(
                  ciudadOrigen,
                  guardado.resumen.destino,
                  new Date(guardado.resumen.salida),
                ),
              )
            }
          >
            <Bloque estiloContenido={estilos.boton} radio="pildora">
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {yaEsHabitual
                  ? t('habitual.guardado')
                  : cabeHabitual
                    ? t('habitual.guardar')
                    : t('plus.habitualesLleno')}
              </Text>
            </Bloque>
          </Pressable>
        )}

        {(estado === 'usado' || estado === 'vencido') && (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={() => establecerReportando(true)}
            >
              <Bloque estiloContenido={estilos.boton} radio="pildora">
                <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                  {t('objetos.reportar')}
                </Text>
              </Bloque>
            </Pressable>
            {objetosDeBoleto(objetos, guardado.boleto.id).length > 0 && (
              <View style={estilos.verificar}>
                <Text
                  style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
                >
                  {t('objetos.previos')}
                </Text>
                {objetosDeBoleto(objetos, guardado.boleto.id).map((objeto) => (
                  <Text
                    key={objeto.id}
                    style={[tipografia.cuerpo, { color: colores.tinta }]}
                  >
                    {objeto.descripcion}
                  </Text>
                ))}
                <Text
                  style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                >
                  {t('objetos.enviado')}
                </Text>
              </View>
            )}
          </>
        )}

        {!puedeOperar && alReservarOtra && (
          <Pressable
            accessibilityRole="button"
            onPress={() => alReservarOtra(guardado.resumen.destino)}
          >
            <Bloque estiloContenido={estilos.boton} radio="pildora">
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {rellenar(t('boleto.reservarOtra'), {
                  destino: guardado.resumen.destino,
                })}
              </Text>
            </Bloque>
          </Pressable>
        )}

        {puedeOperar && (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (contacto) void avisarContacto(contacto);
              else establecerPidiendoContacto(true);
            }}
          >
            <Bloque estiloContenido={estilos.boton} radio="pildora">
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {contacto
                  ? rellenar(t('contacto.avisarA'), { nombre: contacto.nombre })
                  : t('contacto.avisar')}
              </Text>
            </Bloque>
          </Pressable>
        )}
        {puedeOperar && guardado?.resumen.paraOtro && (
          <Text style={[tipografia.cuerpo, { color: colores.ambarTexto }]}>
            {rellenar(t('boletos.paraOtroSinEnviar'), {
              nombre: nombrePropio(guardado.boleto.pasajero.nombre),
            })}
          </Text>
        )}
        {puedeOperar && (alTransferir || contacto) && (
          <View style={estilos.enlaces}>
            {alTransferir && (
              <Pressable
                accessibilityRole="button"
                onPress={() => alTransferir(boletoId)}
              >
                <Text
                  style={[
                    tipografia.pequeno,
                    estilos.cambiarContacto,
                    { color: colores.tintaSuave },
                  ]}
                >
                  {t('transferir.accion')}
                </Text>
              </Pressable>
            )}
            {alTransferir && contacto ? (
              <View
                style={[estilos.separador, { backgroundColor: colores.linea }]}
              />
            ) : null}
            {contacto && (
              <Pressable
                accessibilityRole="button"
                onPress={() => establecerPidiendoContacto(true)}
              >
                <Text
                  style={[
                    tipografia.pequeno,
                    estilos.cambiarContacto,
                    { color: colores.tintaSuave },
                  ]}
                >
                  {t('contacto.cambiar')}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {puedeOperar && (
          <View style={estilos.acciones}>
            <AccionDeBoleto
              alPresionar={() => void compartir()}
              etiqueta={t('boleto.compartirCorto')}
              etiquetaAccesible={t('boleto.compartir')}
              tipo="compartir"
            />
            <AccionDeBoleto
              activa={recordatorioActivo !== undefined}
              alPresionar={() => establecerEligiendoRecordatorio(true)}
              etiqueta={
                recordatorioActivo
                  ? rellenar(t('boleto.recordatorioCortoPuesto'), {
                      minutos: recordatorioActivo.minutosAntes,
                    })
                  : t('boleto.recordatorioCorto')
              }
              etiquetaAccesible={
                recordatorioActivo
                  ? t('boleto.recordatorioActivo')
                  : t('boleto.recordatorio')
              }
              tipo="recordatorio"
            />
            {actividadDisponible && preferenciaActividad.activa !== false ? (
              <AccionDeBoleto
                activa={actividadId !== null}
                alPresionar={() => void alternarActividad()}
                etiqueta={t('boleto.actividadCorto')}
                etiquetaAccesible={
                  actividadId
                    ? t('boleto.actividadActiva')
                    : t('boleto.actividad')
                }
                tipo="pantalla"
              />
            ) : null}
          </View>
        )}

        <ObjetosDelViaje
          alReclamar={objetosDelChofer.reclamar}
          objetos={objetosDelChofer.objetos}
        />

        {puedeOperar && avisoDelChofer ? (
          <Bloque estiloContenido={estilos.cancelado} testID="aviso-del-chofer">
            <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
              {rellenar(t('comunicacion.avisoDelChofer'), {
                texto: avisoDelChofer.texto,
              })}
            </Text>
          </Bloque>
        ) : null}

        {puedeOperar &&
        enVentanaDeLlamada(new Date(guardado.resumen.salida), ahora) ? (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={() => void llamar.alChofer(guardado.boleto.viajeId)}
            >
              <Bloque estiloContenido={estilos.boton} radio="pildora">
                <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                  {t('comunicacion.llamarChofer')}
                </Text>
              </Bloque>
            </Pressable>
            {llamar.fallo ? (
              <Text style={[tipografia.pequeno, { color: colores.cancelado }]}>
                {t('comunicacion.sinNumero')}
              </Text>
            ) : null}
          </>
        ) : null}

        {viajeCancelado(guardado.boleto.viajeId) && (
          <Bloque estiloContenido={estilos.cancelado}>
            <Text style={[tipografia.subtitulo, { color: colores.cancelado }]}>
              {t('boleto.viajeCancelado')}
            </Text>
            {motivoCancelado !== null && (
              <Text style={[tipografia.pequeno, { color: colores.tinta }]}>
                {rellenar(t('boleto.motivoCancelado'), {
                  motivo: t(
                    `motivoCancelacion.${motivoCancelado}`,
                  ).toLowerCase(),
                })}
              </Text>
            )}
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {t('boleto.viajeCanceladoDetalle')}
            </Text>
          </Bloque>
        )}

        {puedeOperar && viajeCancelado(guardado.boleto.viajeId) && (
          <AlternativasDeViaje
            alElegir={(destino) => void pasarmeA(destino)}
            eligiendo={pasandoA}
            error={falloReubicar ? t('alternativas.error') : null}
            salidas={alternativasParaBoleto(salidas, guardado, ahora)}
          />
        )}

        <ResumenIA
          contexto={lineaDeBoleto(guardado)}
          pedido={t('ia.pedidoResumenBoleto')}
          titulo={t('ia.resumirBoleto')}
        />

        {puedeOperar && confirmando ? (
          <Bloque estiloContenido={estilos.confirmar} hundido radio="loseta">
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {t('boleto.confirmarCancelar')}
            </Text>
            <View style={estilos.botones}>
              <Pressable
                accessibilityRole="button"
                onPress={() => establecerConfirmando(false)}
                style={estilos.opcion}
              >
                <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                  {t('boleto.noCancelar')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void cancelar(boletoId).then(alCancelado);
                }}
                style={estilos.opcion}
              >
                <Text
                  style={[tipografia.subtitulo, { color: colores.cancelado }]}
                >
                  {t('boleto.siCancelar')}
                </Text>
              </Pressable>
            </View>
          </Bloque>
        ) : puedeOperar ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => establecerConfirmando(true)}
            style={estilos.cancelar}
          >
            <Text style={[tipografia.subtitulo, { color: colores.cancelado }]}>
              {t('boleto.cancelar')}
            </Text>
          </Pressable>
        ) : null}
        <HojaContacto
          abierta={pidiendoContacto}
          alCerrar={() => establecerPidiendoContacto(false)}
          alGuardar={(nuevo) => {
            void guardarContacto(nuevo);
            establecerContacto(nuevo);
            establecerPidiendoContacto(false);
            void avisarContacto(nuevo);
          }}
        />
        <HojaObjetoOlvidado
          abierta={reportando}
          alCerrar={() => establecerReportando(false)}
          alEnviar={(descripcion) => {
            void guardarObjeto(
              nuevoObjeto(
                {
                  boletoId: guardado.boleto.id,
                  destino: guardado.resumen.destino,
                  viajeId: guardado.boleto.viajeId,
                },
                descripcion,
              ),
            ).then(establecerObjetos);
            establecerReportando(false);
          }}
        />
        <HojaRecordatorio
          actual={recordatorioActivo}
          ahora={ahora}
          alCerrar={() => {
            establecerEligiendoRecordatorio(false);
            establecerErrorRecordatorio(null);
          }}
          alElegir={(minutos) => void elegirRecordatorio(minutos)}
          alQuitar={() => void quitarRecordatorio()}
          error={errorRecordatorio}
          plus={plus}
          salida={eligiendoRecordatorio ? salidaDelBoleto : null}
        />
      </ScrollView>
      <OverlayBoleto guardado={guardado} progreso={progresoAmpliado} />
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1 },
  cancelado: { gap: 4, padding: espacios.dieciseis },
  cambiarContacto: { textAlign: 'center', textDecorationLine: 'underline' },
  verificar: { gap: espacios.cuatro, padding: espacios.dieciseis },
  acciones: { flexDirection: 'row', gap: espacios.doce },
  enlaces: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
    justifyContent: 'center',
  },
  separador: { height: 16, width: 1 },
  accion: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    minHeight: tamanosControl.toqueMinimo,
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.ocho,
  },
  accionEnFila: { flex: 1 },
  boton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: espacios.dieciseis,
  },
  botones: {
    flexDirection: 'row',
    gap: espacios.dieciseis,
    justifyContent: 'space-between',
  },
  cancelar: { alignItems: 'center', paddingVertical: espacios.dieciseis },
  sinDatos: {
    flex: 1,
    gap: espacios.dieciseis,
    paddingHorizontal: espacios.lateral,
  },
  confirmar: { gap: espacios.dieciseis, padding: espacios.veinticuatro },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  opcion: { flex: 1, paddingVertical: espacios.doce },
  pago: { gap: 4, padding: espacios.dieciseis },
});
