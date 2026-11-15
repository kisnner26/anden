import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Bloque } from '@/componentes/Bloque';
import { BloqueNegro } from '@/componentes/BloqueNegro';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { EscenaViaje } from '@/componentes/EscenaViaje';
import { EstimacionSalida } from '@/componentes/EstimacionSalida';
import { ResumenIA } from '@/componentes/ResumenIA';
import { lineaDeSalida } from '@/datos/contextoIA';
import { sincronizarViajes } from '@/datos/sincronizarViajes';
import {
  marcarLlegada,
  marcarSalida,
} from '@/servicios/supabase/viajesSupabase';
import { ControlSegmentado } from '@/componentes/ControlSegmentado';
import { EscanerDeBoletos } from '@/componentes/EscanerDeBoletos';
import { ReportarObjeto } from '@/componentes/ReportarObjeto';
import {
  resultadoDeLectura,
  type ResultadoDeLectura,
} from '@/datos/lecturaDeBoleto';
import { HojaPasajero } from '@/componentes/HojaPasajero';
import { ListaPasajeros } from '@/componentes/ListaPasajeros';
import { PlanoDeOcupacion } from '@/componentes/PlanoDeOcupacion';
import { useLlamar } from '@/datos/useLlamar';
import { AVISOS_RAPIDOS, type AvisoRapido } from '@/datos/comunicacion';
import { avisarAlViaje } from '@/servicios/supabase/comunicacionSupabase';
import { HojaCierreViaje } from '@/componentes/HojaCierreViaje';
import { Icono } from '@/componentes/Icono';
import { MapaConductor } from '@/componentes/MapaConductor';
import { PanelDeslizable } from '@/componentes/PanelDeslizable';
import { formatoDuracion, formatoHoraCompleta } from '@/datos/formato';
import {
  intercambiarPuntos,
  marcarPunto,
  resumenDelTramo,
  SIN_PUNTOS,
  type PuntosManuales,
} from '@/datos/rutaManual';
import { verificarConductor } from '@/datos/biometria';
import { progresoSobreTrazo } from '@/datos/progresoViaje';
import {
  detenerTransmision,
  iniciarTransmision,
  type ResultadoTransmision,
} from '@/datos/transmisor';
import { useAbordaje } from '@/datos/useAbordaje';
import { unirBoletos, useBoletosDelViaje } from '@/datos/useBoletosDelViaje';
import { useBoletos } from '@/datos/useBoletos';
import { useCierres } from '@/datos/useCierres';
import { useDetalleViaje } from '@/datos/useDetalleViaje';
import { usePagos } from '@/datos/usePagos';
import { useRecorrido } from '@/datos/useRecorrido';
import { useSesion } from '@/datos/useSesion';
import { obtenerMuestra } from '@/datos/useSalidas';
import { useSonidos } from '@/datos/useSonidos';
import { useTransmision } from '@/datos/useTransmision';
import { armarCierre } from '@/servicios/cierres';
import { resumenDeCobro } from '@/servicios/pagos';
import { espacios, radios, tamanosControl } from '@/tema/espacios';
import { conAlfa } from '@/tema/alfa';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesConductorViaje {
  alVolver: () => void;
  viajeId: string;
}

function mensajeDe(resultado: Exclude<ResultadoTransmision, 'ok'>): string {
  if (resultado === 'permiso-negado') return t('conductor.permisoNegado');
  if (resultado === 'desactivado') return t('conductor.desactivado');
  return t('conductor.errorGps');
}

/** el viaje en marcha: comparte la ubicación, muestra el avance y lleva el cobro en efectivo */
export function ConductorViaje({
  alVolver,
  viajeId,
}: PropiedadesConductorViaje) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { sesion } = useSesion();
  const detalle = useDetalleViaje(viajeId);
  const recorrido = useRecorrido(
    detalle?.origenCiudad ?? '',
    detalle?.salida.destino ?? '',
  );
  const transmision = useTransmision(viajeId);
  const { boletos: locales } = useBoletos();
  const { boletos: remotos, fallo: falloPasajeros } =
    useBoletosDelViaje(viajeId);
  const boletos = unirBoletos(locales, remotos);
  const { estadoDe, marcarPagado, registro, revertir } = usePagos();
  const { abordo, alternar: alternarAbordaje } = useAbordaje();
  const [resultadoAviso, establecerResultadoAviso] = useState<
    'fallo' | 'ok' | null
  >(null);
  const [vistaPasajeros, establecerVistaPasajeros] = useState<
    'lista' | 'plano'
  >('lista');
  const [fichaAbierta, establecerFichaAbierta] = useState<string | null>(null);
  const llamar = useLlamar();
  const [escaneando, establecerEscaneando] = useState(false);
  const [reportandoObjeto, establecerReportandoObjeto] = useState(false);
  const [iniciando, establecerIniciando] = useState(false);
  const [yaSalio, establecerYaSalio] = useState(false);
  const [problema, establecerProblema] = useState<string | null>(null);
  const [cerrando, establecerCerrando] = useState(false);
  const [centrar, establecerCentrar] = useState(0);
  // marcar a mano un tramo de A a B sobre el mapa
  const [marcando, establecerMarcando] = useState(false);
  const [puntos, establecerPuntos] = useState<PuntosManuales>(SIN_PUNTOS);
  const { height } = useWindowDimensions();
  const tramo = resumenDelTramo(puntos);
  // las tres alturas del panel: recogido con el estado y el botón principal a la vista, a medias y abierto
  const alturasPanel = [
    Math.min(380, height * 0.46),
    height * 0.64,
    height - margenes.top - espacios.cuarentaYOcho,
  ] as const;
  const [escena, establecerEscena] = useState<'llegada' | 'salida' | null>(
    null,
  );
  const sonar = useSonidos();
  const { cerrar: guardarCierreViaje, cierreDe } = useCierres();

  // si el viaje se cierra solo al llegar al destino con esta pantalla abierta, se muestra la escena de llegada
  const hayCierre = cierreDe(viajeId) !== undefined;
  const habiaCierre = useRef(hayCierre);
  useEffect(() => {
    if (hayCierre && !habiaCierre.current) establecerEscena('llegada');
    habiaCierre.current = hayCierre;
  }, [hayCierre]);

  if (!detalle || !sesion?.choferId) {
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
        <CabeceraPantalla alVolver={alVolver} titulo={t('detalle.titulo')} />
        <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
          {t('detalle.noExiste')}
        </Text>
      </View>
    );
  }

  const choferId = sesion.choferId;
  const { salida } = detalle;
  const progreso =
    transmision.posicion && recorrido
      ? progresoSobreTrazo(
          recorrido.trazo,
          transmision.posicion,
          detalle.duracionMin,
        )
      : null;
  const pasajeros = boletos
    .filter(
      ({ boleto }) =>
        boleto.viajeId === viajeId && boleto.estado !== 'cancelado',
    )
    // quienes tienen Plus van primero: tienen prioridad al abordar
    .sort(
      (a, b) =>
        Number(b.resumen.plus === true) - Number(a.resumen.plus === true) ||
        a.boleto.asiento - b.boleto.asiento,
    );
  const fichaPasajero = pasajeros.find(
    ({ boleto }) => boleto.id === fichaAbierta,
  );
  const bus = (() => {
    const muestra = obtenerMuestra();
    const viaje = muestra.viajes.find((v) => v.id === viajeId);
    return muestra.buses.find((b) => b.id === viaje?.busId);
  })();
  const cobro = resumenDeCobro(
    pasajeros.map(({ boleto }) => ({ id: boleto.id, precio: boleto.precio })),
    registro,
  );

  const cierre = cierreDe(viajeId);
  const resumenPrevio = armarCierre(
    pasajeros.map(({ boleto }) => ({
      asiento: boleto.asiento,
      boletoId: boleto.id,
      nombre: boleto.pasajero.nombre,
      precio: boleto.precio,
    })),
    registro,
    viajeId,
    choferId,
  );

  function leerBoleto(texto: string): ResultadoDeLectura {
    const lectura = resultadoDeLectura(texto, boletos, viajeId, abordo);
    if (lectura.tipo === 'ok') {
      sonar('abordo');
      void alternarAbordaje(lectura.boletoId);
    }
    return lectura;
  }

  async function avisar(clave: AvisoRapido) {
    establecerResultadoAviso(null);
    const bien = await avisarAlViaje(viajeId, t(`comunicacion.aviso.${clave}`));
    establecerResultadoAviso(bien ? 'ok' : 'fallo');
  }

  async function registrarSalida() {
    if (await marcarSalida(viajeId)) {
      establecerYaSalio(true);
      await sincronizarViajes();
    }
  }

  async function terminar() {
    // terminar un viaje también pide identificarse
    if (!(await verificarConductor(t('conductor.motivoTerminar'), true))) {
      establecerProblema(t('conductor.bloqueadoFallo'));
      return;
    }
    detenerTransmision(viajeId);
    establecerCerrando(true);
  }

  async function confirmarCierre() {
    await guardarCierreViaje(resumenPrevio);
    // los pasajeros ven el viaje como llegado
    void marcarLlegada(viajeId).then(() => sincronizarViajes());
    establecerCerrando(false);
    sonar('fin');
    establecerEscena('llegada');
  }

  async function iniciar() {
    establecerProblema(null);
    // empezar a compartir la ubicación exige confirmar la identidad en ese momento
    if (!(await verificarConductor(t('conductor.motivoIniciar'), true))) {
      establecerProblema(t('conductor.bloqueadoFallo'));
      return;
    }
    establecerIniciando(true);
    sonar('inicio');
    establecerEscena('salida');
    const resultado = await iniciarTransmision(viajeId, choferId);
    establecerIniciando(false);
    if (resultado !== 'ok') establecerProblema(mensajeDe(resultado));
    // al iniciar el viaje también sale: los boletos de los pasajeros pasan a "en ruta" sin que tenga que marcarlo aparte
    else if (!yaSalio) await registrarSalida();
  }

  return (
    <View style={[estilos.pantalla, { backgroundColor: colores.fondo }]}>
      {recorrido && (
        <MapaConductor
          bus={transmision.posicion}
          centrar={centrar}
          destino={{
            coordenadas: recorrido.destino.coordenadas,
            nombre: recorrido.destino.nombre,
          }}
          alMarcar={(punto) => establecerPuntos((p) => marcarPunto(p, punto))}
          alMoverPunto={(cual, punto) =>
            establecerPuntos((p) => ({ ...p, [cual]: punto }))
          }
          espacioInferior={alturasPanel[0]}
          marcando={marcando}
          puntos={puntos}
          origen={{
            coordenadas: recorrido.origen.coordenadas,
            nombre: recorrido.origen.nombre,
          }}
          trazo={recorrido.trazo}
        />
      )}

      <View
        pointerEvents="box-none"
        style={[estilos.controles, { top: margenes.top + espacios.ocho }]}
      >
        <Pressable
          accessibilityLabel={t('asientos.volver')}
          accessibilityRole="button"
          onPress={alVolver}
          style={[
            estilos.botonCircular,
            { backgroundColor: conAlfa(colores.bloqueNegro, 0.92) },
          ]}
        >
          <Icono color={colores.sobreNegro} nombre="volver" tamano="mediano" />
        </Pressable>
        <View
          style={[
            estilos.titulo,
            { backgroundColor: conAlfa(colores.bloqueNegro, 0.92) },
          ]}
        >
          <Text
            numberOfLines={1}
            style={[tipografia.etiqueta, { color: colores.sobreNegroSuave }]}
          >
            {`${formatoHoraCompleta(salida.salida)} · ${salida.placa}`}
          </Text>
          <Text
            numberOfLines={1}
            style={[tipografia.subtitulo, { color: colores.sobreNegro }]}
          >
            {`${detalle.paradas[0]?.nombre ?? ''} → ${salida.destino}`}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityLabel={t('conductor.marcarPuntos')}
        accessibilityRole="button"
        accessibilityState={{ selected: marcando }}
        onPress={() => {
          establecerMarcando((m) => !m);
        }}
        style={[
          estilos.botonCircular,
          estilos.marcar,
          {
            backgroundColor: marcando
              ? colores.ambar
              : conAlfa(colores.bloqueNegro, 0.92),
            bottom: alturasPanel[0] + espacios.doce + 52 + espacios.ocho,
          },
        ]}
      >
        <Svg height={22} viewBox="0 0 24 24" width={22}>
          <Path
            d="M12 21 C 12 21 5 14.5 5 9.5 a7 7 0 0 1 14 0 C 19 14.5 12 21 12 21 Z"
            fill="none"
            stroke={marcando ? colores.sobreAmbar : colores.sobreNegro}
            strokeLinejoin="round"
            strokeWidth={2}
          />
          <Circle
            cx={12}
            cy={9.5}
            fill={marcando ? colores.sobreAmbar : colores.sobreNegro}
            r={2.4}
          />
        </Svg>
      </Pressable>

      {marcando || puntos.a ? (
        <View
          style={[
            estilos.tramo,
            {
              backgroundColor: conAlfa(colores.bloqueNegro, 0.94),
              top: margenes.top + espacios.ocho + 52 + espacios.ocho,
            },
          ]}
          testID="tramo-manual"
        >
          <Text style={[tipografia.subtitulo, { color: colores.sobreNegro }]}>
            {tramo
              ? rellenar(t('conductor.tramoManual'), {
                  km: tramo.km,
                  tiempo: formatoDuracion(tramo.minutos),
                })
              : puntos.a
                ? t('conductor.marcaPuntoB')
                : t('conductor.marcaPuntoA')}
          </Text>
          {puntos.a ? (
            <View style={estilos.accionesTramo}>
              {tramo ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => establecerPuntos(intercambiarPuntos)}
                >
                  <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
                    {t('conductor.intercambiarPuntos')}
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={() => establecerPuntos(SIN_PUNTOS)}
              >
                <Text style={[tipografia.etiqueta, { color: colores.ambar }]}>
                  {t('conductor.limpiarPuntos')}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}

      <Pressable
        accessibilityLabel={t('conductor.centrarMapa')}
        accessibilityRole="button"
        onPress={() => establecerCentrar((n) => n + 1)}
        style={[
          estilos.botonCircular,
          estilos.centrar,
          {
            backgroundColor: conAlfa(colores.bloqueNegro, 0.92),
            bottom: alturasPanel[0] + espacios.doce,
          },
        ]}
      >
        <Svg height={22} viewBox="0 0 24 24" width={22}>
          <Path
            d="M3 11 L21 3 L13 21 L11 13 Z"
            fill="none"
            stroke={colores.sobreNegro}
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </Svg>
      </Pressable>

      <PanelDeslizable
        alturas={alturasPanel}
        cabecera={
          <View style={estilos.cabeceraPanel}>
            <BloqueNegro estiloContenido={estilos.estado}>
              <View style={estilos.filaEstado}>
                <View
                  style={[
                    estilos.punto,
                    {
                      backgroundColor: transmision.activa
                        ? colores.aTiempo
                        : colores.sobreNegroSuave,
                    },
                  ]}
                />
                <Text
                  accessibilityLiveRegion="polite"
                  style={[tipografia.subtitulo, { color: colores.sobreNegro }]}
                >
                  {transmision.activa
                    ? t('conductor.transmitiendo')
                    : t('conductor.detenido')}
                </Text>
              </View>
              {!transmision.activa && (
                <Text
                  style={[
                    tipografia.pequeno,
                    { color: colores.sobreNegroSuave },
                  ]}
                >
                  {t('conductor.explicacion')}
                </Text>
              )}
              {transmision.activa && transmision.sinSenal && (
                <Text style={[tipografia.cuerpo, { color: colores.ambar }]}>
                  {t('conductor.esperandoSenal')}
                </Text>
              )}
              {progreso && !transmision.sinSenal && (
                <View style={estilos.cifras}>
                  <Text style={[tipografia.display, { color: colores.ambar }]}>
                    {`${progreso.porcentaje} %`}
                  </Text>
                  <Text
                    style={[tipografia.cuerpo, { color: colores.sobreNegro }]}
                  >
                    {rellenar(t('conductor.llegadaEn'), {
                      minutos: progreso.minutosRestantes,
                    })}
                  </Text>
                  <Text
                    style={[
                      tipografia.pequeno,
                      { color: colores.sobreNegroSuave },
                    ]}
                  >
                    {`${rellenar(t('conductor.kmRecorridos'), { km: progreso.kmRecorridos })} · ${rellenar(t('conductor.kmRestantes'), { km: progreso.kmRestantes })}`}
                  </Text>
                  {progreso.fueraDeRuta && (
                    <Text
                      style={[tipografia.pequeno, { color: colores.ambar }]}
                    >
                      {t('conductor.fueraDeRuta')}
                    </Text>
                  )}
                </View>
              )}
            </BloqueNegro>
          </View>
        }
        espacioFinal={espacios.cuarentaYOcho}
      >
        {!cierre && (
          <BloqueNegro estiloContenido={estilos.pie}>
            <BotonAccion
              alPresionar={() =>
                transmision.activa ? void terminar() : void iniciar()
              }
              cargando={iniciando && !transmision.activa}
              etiqueta={
                transmision.activa
                  ? t('conductor.terminar')
                  : t('conductor.iniciar')
              }
            />
            {transmision.activa && (
              <Text
                style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
              >
                {rellenar(t('conductor.cierreAutomatico'), {
                  destino: salida.destino,
                })}
              </Text>
            )}
            {!transmision.activa && (
              <Pressable
                accessibilityRole="button"
                onPress={() => establecerCerrando(true)}
                style={estilos.cerrarSinCompartir}
              >
                <Text
                  style={[
                    tipografia.pequeno,
                    { color: colores.sobreNegroSuave },
                  ]}
                >
                  {t('conductor.cerrarSinCompartir')}
                </Text>
              </Pressable>
            )}
          </BloqueNegro>
        )}

        <EstimacionSalida viajeId={viajeId} />
        <ResumenIA
          contexto={[
            lineaDeSalida(salida),
            `Pasajeros: ${pasajeros.length}, a bordo: ${pasajeros.filter(({ boleto }) => abordo(boleto.id)).length}, con Plus: ${pasajeros.filter(({ resumen }) => resumen.plus === true).length}.`,
            `Cobrado C$ ${cobro.cobrado}, por cobrar C$ ${cobro.pendiente}.`,
          ].join('\n')}
          pedido={t('ia.pedidoResumenConductor')}
          titulo={t('ia.resumirConductor')}
        />
        {!yaSalio && (
          <Pressable
            accessibilityRole="button"
            onPress={() => void registrarSalida()}
            style={estilos.yaSalio}
          >
            <Bloque estiloContenido={estilos.yaSalioContenido}>
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {t('estimacion.yaSalio')}
              </Text>
              <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
                {t('estimacion.yaSalioDetalle')}
              </Text>
            </Bloque>
          </Pressable>
        )}
        {yaSalio && (
          <Text style={[tipografia.pequeno, { color: colores.aTiempo }]}>
            {t('estimacion.salidaMarcada')}
          </Text>
        )}

        {pasajeros.length > 0 && !cierre ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => establecerEscaneando(true)}
          >
            <Bloque estiloContenido={estilos.escanear} radio="pildora">
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {t('escaner.abrir')}
              </Text>
            </Bloque>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => establecerReportandoObjeto(true)}
        >
          <Bloque estiloContenido={estilos.escanear} radio="pildora">
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {t('objetosEncontrados.reportar')}
            </Text>
          </Bloque>
        </Pressable>
        <ReportarObjeto
          abierta={reportandoObjeto}
          alCerrar={() => establecerReportandoObjeto(false)}
          viajeId={viajeId}
        />
        <EscanerDeBoletos
          alCerrar={() => establecerEscaneando(false)}
          alLeer={leerBoleto}
          visible={escaneando}
        />

        {pasajeros.length > 0 && !cierre ? (
          <View style={estilos.avisos} testID="avisar-a-todos">
            <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
              {t('comunicacion.avisar')}
            </Text>
            <View style={estilos.avisosFila}>
              {AVISOS_RAPIDOS.map((clave) => (
                <Pressable
                  accessibilityRole="button"
                  key={clave}
                  onPress={() => void avisar(clave)}
                  style={[
                    estilos.aviso,
                    { borderColor: conAlfa(colores.tinta, 0.16) },
                  ]}
                >
                  <Text style={[tipografia.pequeno, { color: colores.tinta }]}>
                    {t(`comunicacion.aviso.${clave}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
            {resultadoAviso ? (
              <Text
                style={[
                  tipografia.pequeno,
                  {
                    color:
                      resultadoAviso === 'ok'
                        ? colores.aTiempo
                        : colores.cancelado,
                  },
                ]}
              >
                {resultadoAviso === 'ok'
                  ? t('comunicacion.avisarEnviado')
                  : t('comunicacion.avisarFallo')}
              </Text>
            ) : null}
          </View>
        ) : null}

        {pasajeros.length === 0 ? (
          <>
            <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
              {t('conductor.pasajeros')}
            </Text>
            <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
              {falloPasajeros
                ? t('conductor.falloPasajeros')
                : t('conductor.sinPasajeros')}
            </Text>
          </>
        ) : (
          <>
            <ControlSegmentado
              alCambiar={establecerVistaPasajeros}
              opciones={[
                { clave: 'lista', etiqueta: t('plano.lista') },
                { clave: 'plano', etiqueta: t('plano.plano') },
              ]}
              valor={vistaPasajeros}
            />
            {vistaPasajeros === 'plano' && bus ? (
              <>
                <PlanoDeOcupacion
                  abordo={abordo}
                  alAbrir={establecerFichaAbierta}
                  configuracion={bus.configuracion}
                  ocupantes={pasajeros.map(({ boleto }) => ({
                    asiento: boleto.asiento,
                    boletoId: boleto.id,
                    nombre: boleto.pasajero.nombre,
                  }))}
                />
                <HojaPasajero
                  abierta={fichaPasajero !== undefined}
                  abordo={
                    fichaPasajero ? abordo(fichaPasajero.boleto.id) : false
                  }
                  alAlternarAbordaje={(id) => {
                    if (!abordo(id)) sonar('abordo');
                    void alternarAbordaje(id);
                  }}
                  alAlternarPago={(id, pagado) => {
                    if (!pagado) sonar('pago');
                    void (pagado ? revertir(id) : marcarPagado(id, choferId));
                  }}
                  alCerrar={() => establecerFichaAbierta(null)}
                  alLlamar={(id) => void llamar.alPasajero(id)}
                  bloqueada={cierre !== undefined}
                  llamadaFallida={llamar.fallo}
                  pagado={
                    fichaPasajero
                      ? estadoDe(fichaPasajero.boleto.id) === 'pagado_efectivo'
                      : false
                  }
                  pasajero={
                    fichaPasajero
                      ? {
                          asiento: fichaPasajero.boleto.asiento,
                          boletoId: fichaPasajero.boleto.id,
                          cedula: fichaPasajero.boleto.pasajero.cedula,
                          codigo: fichaPasajero.boleto.codigo,
                          esMenorEnBrazos:
                            fichaPasajero.boleto.pasajero.esMenorEnBrazos,
                          fotoUrl: fichaPasajero.resumen.fotoPasajero,
                          nombre: fichaPasajero.boleto.pasajero.nombre,
                          plus: fichaPasajero.resumen.plus,
                          precio: fichaPasajero.boleto.precio,
                          unidadPlus: fichaPasajero.resumen.unidadPlus,
                        }
                      : null
                  }
                />
              </>
            ) : (
              <>
                <ListaPasajeros
                  abordo={abordo}
                  alAlternarAbordaje={(id) => {
                    if (!abordo(id)) sonar('abordo');
                    void alternarAbordaje(id);
                  }}
                  alAlternarPago={(id, pagado) => {
                    if (!pagado) sonar('pago');
                    void (pagado ? revertir(id) : marcarPagado(id, choferId));
                  }}
                  bloqueada={cierre !== undefined}
                  pagado={(id) => estadoDe(id) === 'pagado_efectivo'}
                  pasajeros={pasajeros.map(({ boleto, resumen }) => ({
                    asiento: boleto.asiento,
                    boletoId: boleto.id,
                    cedula: boleto.pasajero.cedula,
                    codigo: boleto.codigo,
                    esMenorEnBrazos: boleto.pasajero.esMenorEnBrazos,
                    fotoUrl: resumen.fotoPasajero,
                    nombre: boleto.pasajero.nombre,
                    plus: resumen.plus,
                    precio: boleto.precio,
                    unidadPlus: resumen.unidadPlus,
                  }))}
                />
              </>
            )}
            <Bloque estiloContenido={estilos.resumen} hundido radio="loseta">
              <Text
                style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
              >
                {rellenar(t('conductor.pagadosDe'), {
                  pagados: cobro.pagados,
                  total: pasajeros.length,
                })}
              </Text>
              <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
                {`${t('conductor.cobrado')} C$ ${cobro.cobrado} · ${t('conductor.pendiente')} C$ ${cobro.pendiente}`}
              </Text>
            </Bloque>
          </>
        )}

        {cierre && (
          <Bloque estiloContenido={estilos.cerrado} hundido radio="loseta">
            <Text style={[tipografia.etiqueta, { color: colores.aTiempo }]}>
              {t('conductor.cerrado')}
            </Text>
            <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
              {rellenar(t('conductor.cierrePagaron'), {
                pagados: cierre.pagados,
                total: cierre.pasajeros,
              })}
            </Text>
            <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
              {`${rellenar(t('conductor.cierreCobrado'), { cobrado: cierre.cobrado })} · ${rellenar(t('conductor.cierrePendiente'), { pendiente: cierre.pendiente })}`}
            </Text>
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {rellenar(t('conductor.cerradoEl'), {
                hora: formatoHoraCompleta(new Date(cierre.cerradoEn)),
              })}
            </Text>
          </Bloque>
        )}

        {problema && (
          <Text
            accessibilityLiveRegion="polite"
            style={[tipografia.pequeno, { color: colores.cancelado }]}
          >
            {problema}
          </Text>
        )}
      </PanelDeslizable>

      {escena && (
        <EscenaViaje
          alTerminar={() => establecerEscena(null)}
          destino={salida.destino}
          detalle={rellenar(
            escena === 'salida'
              ? t('conductor.escenaSalidaDetalle')
              : t('conductor.escenaLlegadaDetalle'),
            { destino: salida.destino },
          )}
          tipo={escena}
          titulo={
            escena === 'salida'
              ? t('conductor.escenaSalida')
              : t('conductor.escenaLlegada')
          }
        />
      )}

      <HojaCierreViaje
        alCerrarHoja={() => establecerCerrando(false)}
        alConfirmar={() => void confirmarCierre()}
        resumen={cerrando ? resumenPrevio : null}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  escanear: { alignItems: 'center', padding: espacios.dieciseis },
  aviso: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.ocho,
  },
  avisos: { gap: espacios.ocho },
  avisosFila: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
  accionesTramo: { flexDirection: 'row', gap: espacios.dieciseis },
  marcar: { position: 'absolute', right: espacios.dieciseis },
  tramo: {
    borderRadius: radios.loseta,
    gap: espacios.cuatro,
    left: espacios.dieciseis,
    padding: espacios.doce,
    position: 'absolute',
    right: espacios.dieciseis,
  },
  botonCircular: {
    alignItems: 'center',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  cabeceraPanel: { paddingBottom: espacios.doce },
  centrar: { position: 'absolute', right: espacios.dieciseis },
  controles: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    left: espacios.dieciseis,
    position: 'absolute',
    right: espacios.dieciseis,
  },
  titulo: {
    borderRadius: radios.loseta,
    flex: 1,
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.cuatro,
  },
  yaSalio: { minHeight: tamanosControl.toqueMinimo },
  yaSalioContenido: { gap: 2, padding: espacios.dieciseis },
  boton: {
    paddingHorizontal: espacios.dieciseis,
    paddingVertical: espacios.ocho,
  },
  cerrado: { gap: espacios.cuatro, padding: espacios.dieciseis },
  cerrarSinCompartir: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tamanosControl.toqueMinimo,
  },
  sinDatos: {
    flex: 1,
    gap: espacios.dieciseis,
    paddingHorizontal: espacios.lateral,
  },
  cifras: { gap: espacios.cuatro },
  contenido: { gap: espacios.doce, paddingHorizontal: espacios.lateral },
  estado: { gap: espacios.doce, padding: espacios.veinticuatro },
  filaEstado: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.ocho,
  },
  pantalla: { flex: 1 },
  pasajero: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    padding: espacios.dieciseis,
  },
  pie: {
    paddingHorizontal: espacios.veinticuatro,
    paddingVertical: espacios.dieciseis,
  },
  punto: {
    borderRadius: radios.pildora,
    height: espacios.doce,
    width: espacios.doce,
  },
  resumen: { gap: espacios.cuatro, padding: espacios.dieciseis },
  texto: { flex: 1, gap: 2 },
});
