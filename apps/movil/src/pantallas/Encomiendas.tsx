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
import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { CampoTexto } from '@/componentes/CampoTexto';
import { ControlSegmentado } from '@/componentes/ControlSegmentado';
import { FormaPaquete } from '@/componentes/FormaPaquete';
import { Interruptor } from '@/componentes/Interruptor';
import { LineaEstadoEncomienda } from '@/componentes/LineaEstadoEncomienda';
import {
  erroresDeEncomienda,
  guardarEncomienda,
  leerEncomiendas,
  mensajeComprobante,
  nuevaEncomienda,
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
  type CiudadRed,
  type SentidoRed,
} from '@/datos/redRutas';
import { usePerfil } from '@/datos/usePerfil';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesEncomiendas {
  alVolver: () => void;
}

const MENSAJES: Record<ErrorEncomienda, () => string> = {
  descripcion: () => t('encomiendas.errorDescripcion'),
  destinatario: () => t('encomiendas.errorDestinatario'),
  remitente: () => t('encomiendas.errorRemitente'),
  telefono: () => t('encomiendas.errorTelefono'),
};

const NOMBRES_PASO = {
  1: () => t('encomiendas.paso1'),
  2: () => t('encomiendas.paso2'),
  3: () => t('encomiendas.paso3'),
} as const;

/** campos que se revisan al salir de cada paso */
const CAMPOS_DEL_PASO: Record<1 | 2 | 3, readonly ErrorEncomienda[]> = {
  1: [],
  2: ['remitente', 'destinatario', 'telefono'],
  3: ['descripcion'],
};

/**
 * pedir que un paquete viaje en el bus, en tres pasos: trayecto y paquete, las dos personas y el
 * detalle con la confirmación. Al enviar queda un comprobante con código, QR y las etapas del envío
 */
export function Encomiendas({ alVolver }: PropiedadesEncomiendas) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { perfil } = usePerfil();
  const [paso, establecerPaso] = useState<1 | 2 | 3>(1);
  const [ciudad, establecerCiudad] = useState<CiudadRed>('Boaco');
  const [sentido, establecerSentido] = useState<SentidoRed>('ida');
  const [tamano, establecerTamano] = useState<TamanoEncomienda>('pequeno');
  const [fragil, establecerFragil] = useState(false);
  const [remitente, establecerRemitente] = useState('');
  const [destinatario, establecerDestinatario] = useState('');
  const [telefono, establecerTelefono] = useState('');
  const [descripcion, establecerDescripcion] = useState('');
  const [errores, establecerErrores] = useState<ErrorEncomienda[]>([]);
  const [solicitudes, establecerSolicitudes] = useState<Encomienda[]>([]);
  const [recienEnviada, establecerRecienEnviada] = useState<Encomienda | null>(
    null,
  );
  const [enviando, establecerEnviando] = useState(false);
  const corredor = corredorDe({ ciudad, sentido });

  useEffect(() => {
    void leerEncomiendas().then(establecerSolicitudes);
  }, []);

  function datos() {
    return {
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

  function seguir() {
    const fallos = erroresDeEncomienda(datos()).filter((error) =>
      CAMPOS_DEL_PASO[paso].includes(error),
    );
    establecerErrores(fallos);
    if (fallos.length > 0) return;
    if (paso < 3) establecerPaso((paso + 1) as 2 | 3);
  }

  async function solicitar() {
    const fallos = erroresDeEncomienda(datos());
    establecerErrores(fallos);
    if (fallos.length > 0) {
      // lleva al primer paso que tiene algo mal
      establecerPaso(
        fallos.some((f) => CAMPOS_DEL_PASO[2].includes(f)) ? 2 : 3,
      );
      return;
    }
    const nueva = nuevaEncomienda(datos());
    establecerSolicitudes(await guardarEncomienda(nueva));
    establecerRecienEnviada(nueva);
    establecerEnviando(true);
  }

  function otro() {
    establecerRecienEnviada(null);
    establecerPaso(1);
    establecerDescripcion('');
    establecerDestinatario('');
    establecerTelefono('');
    establecerFragil(false);
    establecerErrores([]);
  }

  const error = (campo: ErrorEncomienda) =>
    errores.includes(campo) ? MENSAJES[campo]() : undefined;

  const tarjetaTamano = (opcion: TamanoEncomienda) => {
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
            borderColor: activa ? colores.fichaActiva : colores.linea,
          },
        ]}
      >
        <FormaPaquete
          color={activa ? colores.sobreFichaActiva : colores.tinta}
          tamano={opcion}
        />
        <Text
          style={[
            tipografia.nombreLinea,
            { color: activa ? colores.sobreFichaActiva : colores.tinta },
          ]}
        >
          {t(`encomiendas.${opcion}`)}
        </Text>
        <Text
          style={[
            tipografia.etiqueta,
            estilos.centrado,
            { color: activa ? colores.sobreFichaActiva : colores.tintaSuave },
          ]}
        >
          {t(`encomiendas.${opcion}Detalle`)}
        </Text>
      </Pressable>
    );
  };

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
            <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
              {t('encomiendas.detalle')}
            </Text>

            <View
              accessibilityLabel={rellenar(t('encomiendas.progreso'), { paso })}
              accessibilityRole="progressbar"
              accessibilityValue={{ max: 3, min: 1, now: paso }}
              accessible
              style={estilos.progreso}
            >
              <View style={estilos.filaProgreso}>
                <Text
                  style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
                >
                  {`${paso}/3`}
                </Text>
                <Text style={[tipografia.etiqueta, { color: colores.tinta }]}>
                  {NOMBRES_PASO[paso]()}
                </Text>
              </View>
              <View style={estilos.segmentos}>
                {([1, 2, 3] as const).map((numero) => (
                  <View
                    key={numero}
                    style={[
                      estilos.segmento,
                      {
                        backgroundColor:
                          numero <= paso ? colores.ambar : colores.linea,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>

            {paso === 1 && (
              <Aparece>
                <View style={estilos.grupo}>
                  <Text
                    style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
                  >
                    {t('encomiendas.trayecto')}
                  </Text>
                  <ControlSegmentado
                    alCambiar={establecerCiudad}
                    opciones={CIUDADES_RED.map((nombre) => ({
                      clave: nombre,
                      etiqueta: nombre,
                    }))}
                    valor={ciudad}
                  />
                  <ControlSegmentado
                    alCambiar={establecerSentido}
                    opciones={[
                      { clave: 'ida', etiqueta: t('rutas.desdeManagua') },
                      { clave: 'vuelta', etiqueta: t('rutas.haciaManagua') },
                    ]}
                    valor={sentido}
                  />
                  <Text
                    style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
                  >
                    {t('encomiendas.tamano')}
                  </Text>
                  <View style={estilos.tamanos}>
                    {TAMANOS.map(tarjetaTamano)}
                  </View>
                  <Bloque estiloContenido={estilos.fragil}>
                    <View style={estilos.textoFragil}>
                      <Text
                        style={[tipografia.subtitulo, { color: colores.tinta }]}
                      >
                        {t('encomiendas.fragil')}
                      </Text>
                      <Text
                        style={[
                          tipografia.pequeno,
                          { color: colores.tintaSuave },
                        ]}
                      >
                        {t('encomiendas.fragilDetalle')}
                      </Text>
                    </View>
                    <Interruptor
                      activo={fragil}
                      alCambiar={establecerFragil}
                      etiqueta={t('encomiendas.fragil')}
                    />
                  </Bloque>
                </View>
              </Aparece>
            )}

            {paso === 2 && (
              <Aparece>
                <View style={estilos.grupo}>
                  <Bloque estiloContenido={estilos.persona}>
                    <Text style={[tipografia.titulo, { color: colores.tinta }]}>
                      {t('encomiendas.quienEnvia')}
                    </Text>
                    <CampoTexto
                      alCambiar={establecerRemitente}
                      error={error('remitente')}
                      etiqueta={t('encomiendas.remitente')}
                      valor={remitente}
                    />
                    {nombreCompleto(perfil) !== '' && remitente === '' && (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() =>
                          establecerRemitente(
                            nombrePropio(nombreCompleto(perfil)),
                          )
                        }
                      >
                        <Text
                          style={[
                            tipografia.subtitulo,
                            { color: colores.ambarTexto },
                          ]}
                        >
                          {t('encomiendas.usarMisDatos')}
                        </Text>
                      </Pressable>
                    )}
                  </Bloque>
                  <Bloque estiloContenido={estilos.persona}>
                    <Text style={[tipografia.titulo, { color: colores.tinta }]}>
                      {t('encomiendas.quienRecibe')}
                    </Text>
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
                </View>
              </Aparece>
            )}

            {paso === 3 && (
              <Aparece>
                <View style={estilos.grupo}>
                  <Bloque estiloContenido={estilos.persona}>
                    <CampoTexto
                      alCambiar={establecerDescripcion}
                      error={error('descripcion')}
                      etiqueta={t('encomiendas.descripcion')}
                      marcador={t('encomiendas.marcadorDescripcion')}
                      valor={descripcion}
                    />
                  </Bloque>
                  <Bloque
                    estiloContenido={estilos.resumen}
                    hundido
                    radio="loseta"
                  >
                    <Text
                      style={[
                        tipografia.etiqueta,
                        { color: colores.ambarTexto },
                      ]}
                    >
                      {t('encomiendas.resumen')}
                    </Text>
                    <Text style={[tipografia.titulo, { color: colores.tinta }]}>
                      {`${corredor.origen} → ${corredor.destino}`}
                    </Text>
                    <View style={estilos.resumenFila}>
                      <FormaPaquete tamano={tamano} />
                      <View style={estilos.resumenTexto}>
                        <Text
                          style={[
                            tipografia.nombreFila,
                            { color: colores.tinta },
                          ]}
                        >
                          {`${t(`encomiendas.${tamano}`)}${fragil ? ` · ${t('encomiendas.fragil')}` : ''}`}
                        </Text>
                        <Text
                          style={[
                            tipografia.pequeno,
                            { color: colores.tintaSuave },
                          ]}
                        >
                          {`${t('encomiendas.de')} ${nombrePropio(remitente)}`}
                        </Text>
                        <Text
                          style={[
                            tipografia.pequeno,
                            { color: colores.tintaSuave },
                          ]}
                        >
                          {`${t('encomiendas.para')} ${nombrePropio(destinatario)}`}
                        </Text>
                      </View>
                    </View>
                  </Bloque>
                  <Text
                    style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                  >
                    {t('encomiendas.nota')}
                  </Text>
                </View>
              </Aparece>
            )}

            <View style={estilos.navegacion}>
              {paso > 1 && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => establecerPaso((paso - 1) as 1 | 2)}
                  style={estilos.atras}
                >
                  <Text
                    style={[
                      tipografia.subtitulo,
                      { color: colores.ambarTexto },
                    ]}
                  >
                    {t('encomiendas.atras')}
                  </Text>
                </Pressable>
              )}
              <View style={estilos.principal}>
                {paso < 3 ? (
                  <BotonAccion
                    alPresionar={seguir}
                    etiqueta={t('encomiendas.seguir')}
                  />
                ) : (
                  <BotonAccion
                    alPresionar={() => void solicitar()}
                    etiqueta={t('encomiendas.solicitar')}
                    icono="boleto"
                  />
                )}
              </View>
            </View>
          </>
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
                  <LineaEstadoEncomienda cumplidas={1} />
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
    borderRadius: radios.bloque,
    borderWidth: 2,
    flex: 1,
    gap: espacios.cuatro,
    padding: espacios.doce,
  },
  tamanos: { flexDirection: 'row', gap: espacios.ocho },
  textoFragil: { flex: 1, gap: espacios.cuatro },
});
