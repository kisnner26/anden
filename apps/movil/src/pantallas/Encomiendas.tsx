import { useEffect, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimacionEnvio } from '@/componentes/AnimacionEnvio';
import { Aparece } from '@/componentes/Aparece';
import { AsistenteEncomienda } from '@/componentes/AsistenteEncomienda';
import { BarraPreguntaIA } from '@/componentes/BarraPreguntaIA';
import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Chip } from '@/componentes/Chip';
import { ControlSegmentado } from '@/componentes/ControlSegmentado';
import { FormaPaquete } from '@/componentes/FormaPaquete';
import { LineaEstadoEncomienda } from '@/componentes/LineaEstadoEncomienda';
import {
  erroresDeEncomienda,
  etapasCumplidas,
  mensajeComprobante,
  TAMANOS,
  urlSmsDestinatario,
  type Encomienda,
  type ErrorEncomienda,
  type TamanoEncomienda,
} from '@/datos/encomiendas';
import { nombreCompleto, nombrePropio } from '@/datos/perfil';
import {
  CIUDADES_RED,
  corredorDe,
  invertirSentido,
  type CiudadRed,
  type SentidoRed,
} from '@/datos/redRutas';
import { useEncomiendas } from '@/datos/useEncomiendas';
import { usePerfil } from '@/datos/usePerfil';
import { useSalidas } from '@/datos/useSalidas';
import type { SugerenciaEncomienda } from '@/datos/sugerenciaEncomienda';
import { formatoHoraCompleta } from '@/datos/formato';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesEncomiendas {
  alVolver: () => void;
  /** abre el asistente con una pregunta sobre las encomiendas; solo se ofrece con la IA lista */
  alPreguntar?: (pregunta: string) => void;
}

const MENSAJES: Record<ErrorEncomienda, () => string> = {
  descripcion: () => t('encomiendas.errorDescripcion'),
  destinatario: () => t('encomiendas.errorDestinatario'),
  remitente: () => t('encomiendas.errorRemitente'),
  telefono: () => t('encomiendas.errorTelefono'),
};

/**
 * pedir que un paquete viaje en el bus, en tres pasos: trayecto y paquete, las dos personas y el
 * detalle con la confirmación. Al enviar queda un comprobante con código, QR y las etapas del envío
 */
export function Encomiendas({ alPreguntar, alVolver }: PropiedadesEncomiendas) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { perfil } = usePerfil();
  const [ciudad, establecerCiudad] = useState<CiudadRed>('Boaco');
  const [sentido, establecerSentido] = useState<SentidoRed>('ida');
  const [tamano, establecerTamano] = useState<TamanoEncomienda>('pequeno');
  const [fragil, establecerFragil] = useState(false);
  const [remitente, establecerRemitente] = useState('');
  const [destinatario, establecerDestinatario] = useState('');
  const [telefono, establecerTelefono] = useState('');
  const [textoLibre, establecerTextoLibre] = useState('');
  const [entendido, establecerEntendido] = useState<{
    sugerencia: SugerenciaEncomienda;
    texto: string;
  } | null>(null);
  const [errores, establecerErrores] = useState<ErrorEncomienda[]>([]);
  const { cambiarEstado, encomiendas: solicitudes, enviar } = useEncomiendas();
  const { ahora, datos: muestra, salidas } = useSalidas();
  const [viajeId, establecerViajeId] = useState<string | null>(null);
  const [falloEnvio, establecerFalloEnvio] = useState(false);
  const [sinViaje, establecerSinViaje] = useState(false);
  const [recienEnviada, establecerRecienEnviada] = useState<Encomienda | null>(
    null,
  );
  const [enviando, establecerEnviando] = useState(false);
  const corredor = corredorDe({ ciudad, sentido });

  // los viajes publicados en este trayecto que todavía no salieron: la encomienda viaja en uno de ellos
  const viajes = salidas
    .filter(
      (salida) =>
        salida.origen === corredor.origen &&
        salida.destino === corredor.destino &&
        salida.salida.getTime() >= ahora.getTime() - 5 * 60_000,
    )
    .sort((a, b) => a.salida.getTime() - b.salida.getTime());
  // sin elegir otro, el paquete va en el primer bus que sale: la persona solo lo cambia si quiere
  const elegido =
    viajes.find((viaje) => viaje.viajeId === viajeId) ?? viajes[0] ?? null;
  // la descripción: lo que entendió la IA mientras el texto no haya cambiado, y si no lo que escribió
  const descripcion =
    entendido && entendido.texto === textoLibre.trim()
      ? entendido.sugerencia.descripcion
      : textoLibre.trim().slice(0, 80);

  // el nombre de quien envía sale del perfil, para que no haya que escribirlo cada vez
  useEffect(() => {
    if (remitente === '' && nombreCompleto(perfil) !== '') {
      establecerRemitente(nombrePropio(nombreCompleto(perfil)));
    }
  }, [perfil, remitente]);

  /** lo que se entendió del texto llena el formulario; solo se pisa lo que la persona todavía no escribió */
  function aplicarSugerencia(sugerencia: SugerenciaEncomienda, texto: string) {
    establecerEntendido({ sugerencia, texto });
    establecerTamano(sugerencia.tamano);
    establecerFragil(sugerencia.fragil);
    if (sugerencia.ciudad) {
      establecerCiudad(sugerencia.ciudad);
      establecerSentido(sugerencia.sentido ?? 'ida');
    }
    if (sugerencia.destinatario && destinatario === '') {
      establecerDestinatario(sugerencia.destinatario);
    }
    if (sugerencia.telefono && telefono === '') {
      establecerTelefono(sugerencia.telefono);
    }
  }

  function datos() {
    return {
      choferId: elegido?.choferId,
      viajeId: elegido?.viajeId,
      descripcion,
      destinatario,
      destino: corredor.destino,
      fragil,
      origen: corredor.origen,
      remitente,
      tamano,
      telefonoDestinatario: telefono,
    };
  }

  async function solicitar() {
    const fallos = erroresDeEncomienda(datos());
    establecerErrores(fallos);
    if (!elegido) {
      establecerSinViaje(true);
      return;
    }
    establecerSinViaje(false);
    if (fallos.length > 0) return;
    establecerFalloEnvio(false);
    const nueva = await enviar(datos());
    if (!nueva) {
      establecerFalloEnvio(true);
      return;
    }
    establecerRecienEnviada(nueva);
    establecerEnviando(true);
  }

  function otro() {
    establecerRecienEnviada(null);
    establecerTextoLibre('');
    establecerEntendido(null);
    establecerDestinatario('');
    establecerTelefono('');
    establecerFragil(false);
    establecerErrores([]);
    establecerViajeId(null);
  }

  const error = (campo: ErrorEncomienda) =>
    errores.includes(campo) ? MENSAJES[campo]() : undefined;

  return (
    <View style={estilos.pantalla}>
      <ScrollView
        contentContainerStyle={[
          estilos.contenido,
          {
            paddingBottom: espacios.cuarentaYOcho,
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
          titulo={t('encomiendas.titulo')}
        />

        {recienEnviada ? (
          <Aparece>
            <Bloque estiloContenido={estilos.comprobante}>
              <Text
                style={[
                  tipografia.titulo,
                  estilos.centrado,
                  { color: colores.tinta },
                ]}
              >
                {t('encomiendas.comprobante')}
              </Text>
              <Text
                style={[
                  tipografia.pequeno,
                  estilos.centrado,
                  { color: colores.tintaSuave },
                ]}
              >
                {t('encomiendas.comprobanteDetalle')}
              </Text>
              <View style={[estilos.qr, { backgroundColor: colores.papel }]}>
                <QRCode
                  backgroundColor={colores.papel}
                  color={colores.tinta}
                  size={132}
                  value={recienEnviada.codigo}
                />
              </View>
              <View style={estilos.centrado}>
                <Text
                  style={[
                    tipografia.etiqueta,
                    estilos.centrado,
                    { color: colores.tintaSuave },
                  ]}
                >
                  {t('encomiendas.codigo')}
                </Text>
                <Text
                  style={[
                    tipografia.display,
                    estilos.centrado,
                    { color: colores.tinta },
                  ]}
                >
                  {recienEnviada.codigo}
                </Text>
              </View>
              <Text
                style={[
                  tipografia.nombreFila,
                  estilos.centrado,
                  { color: colores.tinta },
                ]}
              >
                {`${recienEnviada.origen} → ${recienEnviada.destino}`}
              </Text>
              <LineaEstadoEncomienda cumplidas={1} />
              <View style={estilos.acciones}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    void Share.share({
                      message: mensajeComprobante(recienEnviada),
                    })
                  }
                  style={estilos.accion}
                >
                  <Bloque estiloContenido={estilos.botonAccion} radio="pildora">
                    <Text
                      style={[tipografia.subtitulo, { color: colores.tinta }]}
                    >
                      {t('encomiendas.compartir')}
                    </Text>
                  </Bloque>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    void Linking.openURL(
                      urlSmsDestinatario(recienEnviada),
                    ).catch(() => undefined)
                  }
                  style={estilos.accion}
                >
                  <Bloque estiloContenido={estilos.botonAccion} radio="pildora">
                    <Text
                      style={[tipografia.subtitulo, { color: colores.tinta }]}
                    >
                      {t('encomiendas.avisarDestinatario')}
                    </Text>
                  </Bloque>
                </Pressable>
              </View>
              <BotonAccion
                alPresionar={otro}
                etiqueta={t('encomiendas.nuevo')}
              />
            </Bloque>
          </Aparece>
        ) : (
          <>
            <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
              {t('encomiendas.detalle')}
            </Text>

            <AsistenteEncomienda
              alAplicar={aplicarSugerencia}
              alEscribir={establecerTextoLibre}
            />
            {errores.includes('descripcion') && (
              <Text style={[tipografia.pequeno, { color: colores.cancelado }]}>
                {t('encomiendas.errorDescripcion')}
              </Text>
            )}

            <Bloque estiloContenido={estilos.formulario}>
              <ControlSegmentado
                alCambiar={establecerCiudad}
                opciones={CIUDADES_RED.map((nombre) => ({
                  clave: nombre,
                  etiqueta: nombre,
                }))}
                valor={ciudad}
              />
              <Pressable
                accessibilityHint={t('encomiendas.invertir')}
                accessibilityLabel={`${corredor.origen} → ${corredor.destino}`}
                accessibilityRole="button"
                onPress={() =>
                  establecerSentido(
                    invertirSentido({ ciudad, sentido }).sentido,
                  )
                }
                style={estilos.ruta}
              >
                <Text style={[tipografia.titulo, { color: colores.tinta }]}>
                  {`${corredor.origen} → ${corredor.destino}`}
                </Text>
                <Text
                  style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
                >
                  {t('encomiendas.invertir')}
                </Text>
              </Pressable>

              <View style={estilos.tamanos}>
                {TAMANOS.map((opcion) => {
                  const activa = tamano === opcion;
                  return (
                    <Pressable
                      accessibilityLabel={t(`encomiendas.${opcion}`)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: activa }}
                      key={opcion}
                      onPress={() => establecerTamano(opcion)}
                      style={[
                        estilos.tamano,
                        {
                          backgroundColor: activa
                            ? colores.fichaActiva
                            : conAlfa(colores.tinta, 0.06),
                          borderColor: activa
                            ? colores.fichaActiva
                            : colores.linea,
                        },
                      ]}
                    >
                      <View style={estilos.dibujoTamano}>
                        <FormaPaquete
                          color={
                            activa ? colores.sobreFichaActiva : colores.tinta
                          }
                          tamano={opcion}
                        />
                      </View>
                      <Text
                        numberOfLines={1}
                        style={[
                          tipografia.etiqueta,
                          estilos.textoTamano,
                          {
                            color: activa
                              ? colores.sobreFichaActiva
                              : colores.tinta,
                          },
                        ]}
                      >
                        {t(`encomiendas.${opcion}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={estilos.filaOpciones}>
                <Chip
                  alCambiar={establecerFragil}
                  etiqueta={t('encomiendas.fragil')}
                  seleccionado={fragil}
                />
              </View>

              {viajes.length === 0 ? (
                <Text
                  style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                >
                  {t('encomiendas.sinViajes')}
                </Text>
              ) : (
                <View style={estilos.buses}>
                  <Text
                    style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
                  >
                    {t('encomiendas.enQueBus')}
                  </Text>
                  <ScrollView
                    contentContainerStyle={estilos.horas}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  >
                    {viajes.slice(0, 6).map((viaje) => (
                      <Chip
                        alCambiar={() => {
                          establecerViajeId(viaje.viajeId);
                          establecerSinViaje(false);
                        }}
                        etiqueta={formatoHoraCompleta(viaje.salida)}
                        key={viaje.viajeId}
                        seleccionado={viaje.viajeId === elegido?.viajeId}
                      />
                    ))}
                  </ScrollView>
                  {elegido && (
                    <Text
                      style={[
                        tipografia.pequeno,
                        { color: colores.tintaSuave },
                      ]}
                    >
                      {rellenar(t('encomiendas.viajeDetalle'), {
                        chofer:
                          muestra.choferes.find(
                            (c) => c.id === elegido.choferId,
                          )?.nombre ?? '',
                        placa: elegido.placa,
                      })}
                    </Text>
                  )}
                </View>
              )}
              {sinViaje && (
                <Text
                  style={[tipografia.pequeno, { color: colores.cancelado }]}
                >
                  {t('encomiendas.errorViaje')}
                </Text>
              )}
            </Bloque>

            <Bloque estiloContenido={estilos.formulario}>
              <CampoTexto
                alCambiar={establecerRemitente}
                error={error('remitente')}
                etiqueta={t('encomiendas.remitente')}
                valor={remitente}
              />
              <CampoTexto
                alCambiar={establecerDestinatario}
                error={error('destinatario')}
                etiqueta={t('encomiendas.destinatario')}
                valor={destinatario}
              />
              <CampoTexto
                alCambiar={establecerTelefono}
                error={error('telefono')}
                etiqueta={t('encomiendas.telefono')}
                teclado="phone-pad"
                valor={telefono}
              />
            </Bloque>

            {falloEnvio && (
              <Text
                accessibilityLiveRegion="polite"
                style={[tipografia.cuerpo, { color: colores.cancelado }]}
              >
                {t('encomiendas.falloEnvio')}
              </Text>
            )}
            <BotonAccion
              alPresionar={() => void solicitar()}
              etiqueta={t('encomiendas.solicitar')}
              icono="boleto"
            />
          </>
        )}

        {solicitudes.length > 0 && alPreguntar && (
          <BarraPreguntaIA
            alPreguntar={alPreguntar}
            sugerencias={[
              t('encomiendasIA.preguntas.estado'),
              t('encomiendasIA.preguntas.salio'),
            ]}
          />
        )}

        {solicitudes.length > 0 && (
          <View style={estilos.grupo}>
            <Text style={[tipografia.titulo, { color: colores.tinta }]}>
              {t('encomiendas.solicitadas')}
            </Text>
            {solicitudes.map((solicitud, indice) => (
              <Aparece indice={indice} key={solicitud.id}>
                <Bloque estiloContenido={estilos.solicitud}>
                  <View style={estilos.filaSolicitud}>
                    <Text style={[tipografia.dato, { color: colores.tinta }]}>
                      {solicitud.codigo}
                    </Text>
                    <Text
                      style={[
                        tipografia.etiqueta,
                        { color: colores.tintaSuave },
                      ]}
                    >
                      {`${t(`encomiendas.${solicitud.tamano}`)}${solicitud.fragil ? ` · ${t('encomiendas.fragil')}` : ''}`}
                    </Text>
                  </View>
                  <Text
                    style={[tipografia.nombreFila, { color: colores.tinta }]}
                  >
                    {`${solicitud.origen} → ${solicitud.destino}`}
                  </Text>
                  <Text
                    style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                  >
                    {`${solicitud.descripcion} · ${t('encomiendas.para')} ${nombrePropio(solicitud.destinatario)}`}
                  </Text>
                  {solicitud.estado === 'rechazada' ? (
                    <View style={estilos.rechazo}>
                      <Text
                        style={[
                          tipografia.subtitulo,
                          { color: colores.cancelado },
                        ]}
                      >
                        {t('encomiendas.rechazada')}
                      </Text>
                      {solicitud.motivoRechazo ? (
                        <Text
                          style={[tipografia.cuerpo, { color: colores.tinta }]}
                        >
                          {rellenar(t('encomiendas.motivo'), {
                            motivo: solicitud.motivoRechazo,
                          })}
                        </Text>
                      ) : null}
                    </View>
                  ) : solicitud.estado === 'cancelada' ? (
                    <Text
                      style={[
                        tipografia.subtitulo,
                        { color: colores.tintaSuave },
                      ]}
                    >
                      {t('encomiendas.cancelada')}
                    </Text>
                  ) : (
                    <LineaEstadoEncomienda
                      cumplidas={etapasCumplidas(solicitud.estado)}
                    />
                  )}
                  {solicitud.estado === 'solicitada' && (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        void cambiarEstado(solicitud.id, 'cancelada')
                      }
                      style={estilos.cancelar}
                    >
                      <Text
                        style={[
                          tipografia.pequeno,
                          { color: colores.cancelado },
                        ]}
                      >
                        {t('encomiendas.cancelar')}
                      </Text>
                    </Pressable>
                  )}
                </Bloque>
              </Aparece>
            ))}
          </View>
        )}
      </ScrollView>
      {enviando && (
        <AnimacionEnvio
          alTerminar={() => establecerEnviando(false)}
          destino={recienEnviada?.destino ?? corredor.destino}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  buses: { gap: espacios.ocho },
  filaOpciones: { flexDirection: 'row' },
  formulario: { gap: espacios.doce, padding: espacios.dieciseis },
  horas: { gap: espacios.ocho },
  ruta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  cancelar: { justifyContent: 'center', minHeight: 44 },
  celdaTamano: { flex: 1 },
  detalleTamano: { minHeight: 32 },
  dibujoTamano: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    transform: [{ scale: 0.8 }],
  },
  rechazo: { gap: espacios.cuatro },
  sinViajes: { padding: espacios.dieciseis },
  textoTamano: { alignSelf: 'stretch', textAlign: 'center' },
  accion: { flex: 1 },
  acciones: { flexDirection: 'row', gap: espacios.doce },
  atras: {
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: espacios.dieciseis,
  },
  botonAccion: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: espacios.doce,
  },
  centrado: { alignItems: 'center', textAlign: 'center' },
  comprobante: { gap: espacios.dieciseis, padding: espacios.veinticuatro },
  contenido: {
    gap: espacios.veinticuatro,
    paddingHorizontal: espacios.lateral,
  },
  filaProgreso: { flexDirection: 'row', gap: espacios.ocho },
  filaSolicitud: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fragil: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
    padding: espacios.dieciseis,
  },
  grupo: { gap: espacios.doce },
  navegacion: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
  },
  pantalla: { flex: 1 },
  persona: { gap: espacios.dieciseis, padding: espacios.veinticuatro },
  principal: { flex: 1 },
  progreso: { gap: espacios.ocho },
  qr: {
    alignSelf: 'center',
    borderRadius: radios.loseta,
    padding: espacios.doce,
  },
  resumen: { gap: espacios.doce, padding: espacios.veinticuatro },
  resumenFila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
  },
  resumenTexto: { flex: 1, gap: espacios.cuatro },
  segmento: { borderRadius: radios.pildora, flex: 1, height: 6 },
  segmentos: { flexDirection: 'row', gap: espacios.ocho },
  solicitud: { gap: espacios.ocho, padding: espacios.dieciseis },
  tamano: {
    alignItems: 'center',
    borderRadius: radios.casilla,
    borderWidth: 2,
    flex: 1,
    gap: espacios.cuatro,
    padding: espacios.ocho,
  },
  tamanos: { flexDirection: 'row', gap: espacios.ocho },
  textoFragil: { flex: 1, gap: espacios.cuatro },
});
