import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { BloqueNegro } from '@/componentes/BloqueNegro';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { HojaCierreViaje } from '@/componentes/HojaCierreViaje';
import { MapaCorredor } from '@/componentes/MapaCorredor';
import { PieReserva } from '@/componentes/PieReserva';
import { nombrePropio } from '@/datos/perfil';
import { formatoHoraCompleta } from '@/datos/formato';
import { progresoSobreTrazo } from '@/datos/progresoViaje';
import {
  detenerTransmision,
  iniciarTransmision,
  type ResultadoTransmision,
} from '@/datos/transmisor';
import { useBoletos } from '@/datos/useBoletos';
import { useCierres } from '@/datos/useCierres';
import { useDetalleViaje } from '@/datos/useDetalleViaje';
import { usePagos } from '@/datos/usePagos';
import { useRecorrido } from '@/datos/useRecorrido';
import { useSesion } from '@/datos/useSesion';
import { useTransmision } from '@/datos/useTransmision';
import { armarCierre } from '@/servicios/cierres';
import { resumenDeCobro } from '@/servicios/pagos';
import {
  disposicionPantalla,
  espacios,
  radios,
  tamanosControl,
} from '@/tema/espacios';
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
  const { boletos } = useBoletos();
  const { estadoDe, marcarPagado, registro, revertir } = usePagos();
  const [iniciando, establecerIniciando] = useState(false);
  const [problema, establecerProblema] = useState<string | null>(null);
  const [cerrando, establecerCerrando] = useState(false);
  const { cerrar: guardarCierreViaje, cierreDe } = useCierres();

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
    .sort((a, b) => a.boleto.asiento - b.boleto.asiento);
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

  function terminar() {
    detenerTransmision(viajeId);
    establecerCerrando(true);
  }

  async function confirmarCierre() {
    await guardarCierreViaje(resumenPrevio);
    establecerCerrando(false);
  }

  async function iniciar() {
    establecerIniciando(true);
    establecerProblema(null);
    const resultado = await iniciarTransmision(viajeId, choferId);
    establecerIniciando(false);
    if (resultado !== 'ok') establecerProblema(mensajeDe(resultado));
  }

  return (
    <View style={[estilos.pantalla, { backgroundColor: colores.fondo }]}>
      <ScrollView
        contentContainerStyle={[
          estilos.contenido,
          {
            paddingBottom: margenes.bottom + disposicionPantalla.espacioPie,
            paddingTop: margenes.top + espacios.ocho,
          },
        ]}
      >
        <CabeceraPantalla alVolver={alVolver} titulo={salida.destino} />
        <Text style={[tipografia.etiqueta, { color: colores.tintaSuave }]}>
          {`${detalle.paradas[0]?.nombre ?? ''} → ${salida.destino} · ${formatoHoraCompleta(salida.salida)} · ${salida.placa}`}
        </Text>

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
              style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
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
              <Text style={[tipografia.cuerpo, { color: colores.sobreNegro }]}>
                {rellenar(t('conductor.llegadaEn'), {
                  minutos: progreso.minutosRestantes,
                })}
              </Text>
              <Text
                style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
              >
                {`${rellenar(t('conductor.kmRecorridos'), { km: progreso.kmRecorridos })} · ${rellenar(t('conductor.kmRestantes'), { km: progreso.kmRestantes })}`}
              </Text>
              {progreso.fueraDeRuta && (
                <Text style={[tipografia.pequeno, { color: colores.ambar }]}>
                  {t('conductor.fueraDeRuta')}
                </Text>
              )}
            </View>
          )}
        </BloqueNegro>

        {recorrido && (
          <MapaCorredor
            simulacion={{
              bus: transmision.posicion ?? undefined,
              destino: recorrido.destino,
              origen: recorrido.origen,
              trazo: recorrido.trazo,
            }}
          />
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

        <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
          {t('conductor.pasajeros')}
        </Text>
        {pasajeros.length === 0 ? (
          <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
            {t('conductor.sinPasajeros')}
          </Text>
        ) : (
          <>
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
            {pasajeros.map(({ boleto }) => {
              const pagado = estadoDe(boleto.id) === 'pagado_efectivo';
              return (
                <Bloque estiloContenido={estilos.pasajero} key={boleto.id}>
                  <View style={estilos.texto}>
                    <Text
                      style={[tipografia.subtitulo, { color: colores.tinta }]}
                    >
                      {rellenar(t('conductor.asientoPasajero'), {
                        asiento: boleto.asiento,
                        nombre: nombrePropio(boleto.pasajero.nombre),
                      })}
                    </Text>
                    <Text
                      style={[
                        tipografia.pequeno,
                        {
                          color: pagado ? colores.aTiempo : colores.tintaSuave,
                        },
                      ]}
                    >
                      {pagado
                        ? t('conductor.pagado')
                        : `${t('conductor.pendiente')} · C$ ${boleto.precio}`}
                    </Text>
                  </View>
                  <Pressable
                    disabled={cierre !== undefined}
                    accessibilityLabel={`${pagado ? t('conductor.quitarPago') : t('conductor.marcarPagado')}, ${nombrePropio(boleto.pasajero.nombre)}`}
                    accessibilityRole="button"
                    onPress={() =>
                      void (pagado
                        ? revertir(boleto.id)
                        : marcarPagado(boleto.id, choferId))
                    }
                  >
                    <Bloque estiloContenido={estilos.boton} radio="pildora">
                      <Text
                        style={[tipografia.etiqueta, { color: colores.tinta }]}
                      >
                        {pagado
                          ? t('conductor.quitarPago')
                          : t('conductor.marcarPagado')}
                      </Text>
                    </Bloque>
                  </Pressable>
                </Bloque>
              );
            })}
          </>
        )}

        {problema && (
          <Text
            accessibilityLiveRegion="polite"
            style={[tipografia.pequeno, { color: colores.cancelado }]}
          >
            {problema}
          </Text>
        )}
      </ScrollView>

      {!cierre && (
        <PieReserva estiloContenido={estilos.pie}>
          <BotonAccion
            alPresionar={() =>
              transmision.activa ? terminar() : void iniciar()
            }
            cargando={iniciando && !transmision.activa}
            etiqueta={
              transmision.activa
                ? t('conductor.terminar')
                : t('conductor.iniciar')
            }
          />
          {!transmision.activa && (
            <Pressable
              accessibilityRole="button"
              onPress={() => establecerCerrando(true)}
              style={estilos.cerrarSinCompartir}
            >
              <Text
                style={[tipografia.pequeno, { color: colores.sobreNegroSuave }]}
              >
                {t('conductor.cerrarSinCompartir')}
              </Text>
            </Pressable>
          )}
        </PieReserva>
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
