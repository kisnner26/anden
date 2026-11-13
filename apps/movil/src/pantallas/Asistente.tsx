import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aparece } from '@/componentes/Aparece';
import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Chip } from '@/componentes/Chip';
import { Interruptor } from '@/componentes/Interruptor';
import { FilaSalida } from '@/componentes/FilaSalida';
import { OrbeIA } from '@/componentes/OrbeIA';
import { PuntosPensando } from '@/componentes/PuntosPensando';
import { TextoEscribiendo } from '@/componentes/TextoEscribiendo';
import {
  destinosFrecuentes,
  salidaMasBarata,
  salidasRelacionadas,
} from '@/datos/ayudasIA';
import { armarContexto, instruccionesDelAsistente } from '@/datos/contextoIA';
import { formatoHoraCompleta } from '@/datos/formato';
import { useBoletos } from '@/datos/useBoletos';
import { useIA } from '@/datos/useIA';
import { useSalidas } from '@/datos/useSalidas';
import { useVoz } from '@/datos/useVoz';
import { motivoNoDisponible } from '@/servicios/ia';
import { guardarRespuestaHablada, leerRespuestaHablada } from '@/servicios/voz';
import { coloresIA } from '@/tema/colores';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesAsistente {
  /** abre el detalle de una salida mostrada junto a una respuesta */
  alAbrirViaje?: (viajeId: string) => void;
  alVolver: () => void;
}

interface Intercambio {
  id: number;
  pregunta: string;
  respuesta: string;
}

/** el asistente: responde con las salidas y boletos reales de la app usando el modelo del teléfono */
export function Asistente({ alAbrirViaje, alVolver }: PropiedadesAsistente) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const { disponibilidad, nombre, preguntar, usable } = useIA();
  const { boletos } = useBoletos();
  const { ahora, salidas } = useSalidas();
  const [texto, establecerTexto] = useState('');
  const [pensando, establecerPensando] = useState(false);
  const [fallo, establecerFallo] = useState(false);
  const [historial, establecerHistorial] = useState<Intercambio[]>([]);
  const [siguienteId, establecerSiguienteId] = useState(1);
  const voz = useVoz();
  const [respuestaEnVoz, establecerRespuestaEnVoz] = useState(false);
  const [escuchando, establecerEscuchando] = useState(false);
  const [avisoVoz, establecerAvisoVoz] = useState<
    'sin-permiso' | 'no-disponible' | null
  >(null);
  const dicho = useRef('');
  const enviarActual = useRef<(pregunta: string) => Promise<void>>(
    async () => undefined,
  );
  const hablarRespuesta = useRef(false);

  useEffect(() => {
    let vigente = true;
    void leerRespuestaHablada().then((activa) => {
      if (!vigente) return;
      establecerRespuestaEnVoz(activa);
      hablarRespuesta.current = activa;
    });
    return () => {
      vigente = false;
      void voz.callar();
      void voz.detener();
    };
  }, [voz]);

  const destinos = useMemo(
    () => destinosFrecuentes(salidas, ahora),
    [ahora, salidas],
  );
  const masBarata = useMemo(
    () => salidaMasBarata(salidas, ahora),
    [ahora, salidas],
  );
  const proximoBoleto = boletos
    .filter(
      ({ boleto, resumen }) =>
        boleto.estado === 'vigente' && new Date(resumen.salida) >= ahora,
    )
    .sort(
      (a, b) =>
        new Date(a.resumen.salida).getTime() -
        new Date(b.resumen.salida).getTime(),
    )[0];

  async function enviar(pregunta: string) {
    const limpia = pregunta.trim();
    if (limpia === '' || pensando) return;
    establecerPensando(true);
    establecerFallo(false);
    try {
      const contexto = armarContexto(salidas, boletos, new Date());
      const respuesta = await preguntar(
        instruccionesDelAsistente(contexto),
        limpia,
      );
      establecerHistorial((previo) => [
        { id: siguienteId, pregunta: limpia, respuesta: respuesta.trim() },
        ...previo,
      ]);
      establecerSiguienteId((id) => id + 1);
      establecerTexto('');
      if (hablarRespuesta.current) void voz.hablar(respuesta.trim());
    } catch {
      establecerFallo(true);
    } finally {
      establecerPensando(false);
    }
  }

  enviarActual.current = enviar;

  async function alternarEscucha() {
    if (escuchando) {
      await voz.detener();
      return;
    }
    await voz.callar();
    establecerAvisoVoz(null);
    dicho.current = '';
    const resultado = await voz.escuchar({
      alFallar: () => establecerEscuchando(false),
      alTerminar: () => {
        establecerEscuchando(false);
        const pregunta = dicho.current;
        dicho.current = '';
        if (pregunta.trim() !== '') void enviarActual.current(pregunta);
      },
      alTexto: (reconocido) => {
        dicho.current = reconocido;
        establecerTexto(reconocido);
      },
    });
    if (resultado === 'ok') establecerEscuchando(true);
    else establecerAvisoVoz(resultado);
  }

  async function cambiarRespuestaEnVoz(activa: boolean) {
    establecerRespuestaEnVoz(activa);
    hablarRespuesta.current = activa;
    if (!activa) await voz.callar();
    await guardarRespuestaHablada(activa);
  }

  const sugerencias = [
    t('ia.sugerencias.proximo'),
    t('ia.sugerencias.boleto'),
    destinos[0]
      ? rellenar(t('ia.preguntaDestino'), { destino: destinos[0] })
      : t('ia.sugerencias.asientos'),
  ];

  const motivo = usable ? null : motivoNoDisponible(disponibilidad, nombre);

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={[
        estilos.contenido,
        {
          paddingBottom: espacios.cuarentaYOcho,
          paddingTop: margenes.top + espacios.ocho,
        },
      ]}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colores.fondo }}
    >
      <CabeceraPantalla alVolver={alVolver} titulo={t('ia.asistenteTitulo')} />

      <View style={estilos.hero}>
        <OrbeIA pensando={pensando} tamano={84} />
        <LinearGradient
          colors={[...coloresIA]}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 0 }}
          style={estilos.borde}
        >
          <View style={[estilos.insignia, { backgroundColor: colores.fondo }]}>
            <Text style={[tipografia.etiqueta, { color: colores.tinta }]}>
              {rellenar(t('ia.potenciadoPor'), { nombre })}
            </Text>
          </View>
        </LinearGradient>
        <Text
          style={[
            tipografia.cuerpo,
            estilos.centrado,
            { color: colores.tintaSuave },
          ]}
        >
          {t('ia.asistenteDetalle')}
        </Text>
      </View>

      {!usable ? (
        <Bloque estiloContenido={estilos.aviso}>
          <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
            {t('ia.sinUso')}
          </Text>
          <Text style={[tipografia.cuerpo, { color: colores.tintaSuave }]}>
            {motivo ?? t('ia.activarEnAjustes')}
          </Text>
        </Bloque>
      ) : (
        <>
          {proximoBoleto && (
            <Aparece indice={0}>
              <Bloque estiloContenido={estilos.tarjeta}>
                <Text
                  style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
                >
                  {t('ia.proximoBoleto')}
                </Text>
                <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                  {rellenar(t('ia.proximoBoletoFila'), {
                    anden: proximoBoleto.resumen.anden,
                    asiento: proximoBoleto.boleto.asiento,
                    destino: proximoBoleto.resumen.destino,
                  })}
                </Text>
                <Text
                  style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                >
                  {rellenar(t('ia.saleEn'), {
                    hora: formatoHoraCompleta(
                      new Date(proximoBoleto.resumen.salida),
                    ),
                  })}
                </Text>
              </Bloque>
            </Aparece>
          )}

          <Aparece indice={1}>
            <Bloque estiloContenido={estilos.tarjeta}>
              <Text
                style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
              >
                {t('ia.masBarata')}
              </Text>
              {masBarata ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => alAbrirViaje?.(masBarata.viajeId)}
                >
                  <Text
                    style={[tipografia.subtitulo, { color: colores.tinta }]}
                  >
                    {rellenar(t('ia.masBarataDetalle'), {
                      destino: masBarata.destino,
                      hora: formatoHoraCompleta(masBarata.salida),
                      tarifa: masBarata.tarifa ?? 0,
                    })}
                  </Text>
                </Pressable>
              ) : (
                <Text
                  style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                >
                  {t('ia.sinMasBarata')}
                </Text>
              )}
            </Bloque>
          </Aparece>

          <View style={estilos.sugerencias}>
            {sugerencias.map((pregunta) => (
              <Chip
                alCambiar={() => void enviar(pregunta)}
                deshabilitado={pensando}
                etiqueta={pregunta}
                key={pregunta}
              />
            ))}
          </View>
          <CampoTexto
            alCambiar={establecerTexto}
            etiqueta={t('ia.campo')}
            marcador={t('ia.marcador')}
            valor={texto}
          />
          <Pressable
            accessibilityLabel={
              escuchando ? t('ia.dejarDeEscuchar') : t('ia.hablar')
            }
            accessibilityRole="button"
            accessibilityState={{ selected: escuchando }}
            onPress={() => void alternarEscucha()}
            style={estilos.hablar}
          >
            <Bloque estiloContenido={estilos.hablarContenido} radio="pildora">
              <OrbeIA pensando={escuchando} tamano={22} />
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {escuchando ? t('ia.escuchando') : t('ia.hablar')}
              </Text>
            </Bloque>
          </Pressable>
          {avisoVoz && (
            <Text
              accessibilityLiveRegion="polite"
              style={[tipografia.pequeno, { color: colores.cancelado }]}
            >
              {avisoVoz === 'sin-permiso'
                ? t('ia.sinPermisoVoz')
                : t('ia.vozNoDisponible')}
            </Text>
          )}
          <Bloque estiloContenido={estilos.filaVoz}>
            <View style={estilos.textoVoz}>
              <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
                {t('ia.respuestaEnVoz')}
              </Text>
              <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
                {t('ia.respuestaEnVozDetalle')}
              </Text>
            </View>
            <Interruptor
              activo={respuestaEnVoz}
              alCambiar={(activa) => void cambiarRespuestaEnVoz(activa)}
              etiqueta={t('ia.respuestaEnVoz')}
            />
          </Bloque>
          <BotonAccion
            alPresionar={() => void enviar(texto)}
            cargando={pensando}
            deshabilitado={texto.trim() === ''}
            etiqueta={pensando ? t('ia.pensando') : t('ia.preguntar')}
          />
          {fallo && (
            <Text
              accessibilityLiveRegion="polite"
              style={[tipografia.cuerpo, { color: colores.cancelado }]}
            >
              {t('ia.error')}
            </Text>
          )}

          {pensando && (
            <Bloque estiloContenido={estilos.pensando}>
              <PuntosPensando />
              <Text
                accessibilityLiveRegion="polite"
                style={[tipografia.pequeno, { color: colores.tintaSuave }]}
              >
                {rellenar(t('ia.pensandoCon'), { nombre })}
              </Text>
            </Bloque>
          )}

          {historial.map((intercambio, indice) => {
            const relacionadas = salidasRelacionadas(
              `${intercambio.pregunta} ${intercambio.respuesta}`,
              salidas,
              ahora,
            );
            return (
              <View key={intercambio.id} style={estilos.intercambio}>
                <View
                  style={[
                    estilos.burbujaPregunta,
                    { backgroundColor: colores.barroClaro },
                  ]}
                >
                  <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
                    {intercambio.pregunta}
                  </Text>
                </View>
                <Bloque estiloContenido={estilos.respuesta}>
                  <View style={estilos.firma}>
                    <LinearGradient
                      colors={[...coloresIA]}
                      end={{ x: 1, y: 1 }}
                      start={{ x: 0, y: 0 }}
                      style={estilos.chispa}
                    />
                    <Text
                      style={[
                        tipografia.etiqueta,
                        { color: colores.ambarTexto },
                      ]}
                    >
                      {rellenar(t('ia.respuestaDe'), { nombre })}
                    </Text>
                  </View>
                  <TextoEscribiendo
                    animado={indice === 0}
                    estilo={[tipografia.cuerpo, { color: colores.tinta }]}
                    texto={intercambio.respuesta}
                  />
                  {relacionadas.length > 0 && (
                    <View style={estilos.relacionadas}>
                      <Text
                        style={[
                          tipografia.etiqueta,
                          { color: colores.tintaSuave },
                        ]}
                      >
                        {t('ia.relacionadas')}
                      </Text>
                      {relacionadas.map((salida) => (
                        <FilaSalida
                          alPresionar={alAbrirViaje}
                          key={salida.viajeId}
                          salida={salida}
                        />
                      ))}
                    </View>
                  )}
                </Bloque>
              </View>
            );
          })}
          {historial.length > 0 && (
            <>
              <Text style={[tipografia.pequeno, { color: colores.tintaSuave }]}>
                {rellenar(t('ia.nota'), { nombre })}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => establecerHistorial([])}
                style={estilos.limpiar}
              >
                <Text
                  style={[tipografia.subtitulo, { color: colores.cancelado }]}
                >
                  {t('ia.limpiar')}
                </Text>
              </Pressable>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  aviso: { gap: espacios.ocho, padding: espacios.veinticuatro },
  borde: { borderRadius: radios.pildora, padding: 2 },
  burbujaPregunta: {
    alignSelf: 'flex-end',
    borderRadius: radios.loseta,
    maxWidth: '85%',
    padding: espacios.doce,
  },
  centrado: { textAlign: 'center' },
  chispa: { borderRadius: radios.pildora, height: 14, width: 14 },
  contenido: { gap: espacios.dieciseis, paddingHorizontal: espacios.lateral },
  filaVoz: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.dieciseis,
    padding: espacios.dieciseis,
  },
  firma: { alignItems: 'center', flexDirection: 'row', gap: espacios.ocho },
  hablar: { minHeight: 52 },
  hablarContenido: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    justifyContent: 'center',
    paddingVertical: espacios.ocho,
  },
  hero: { alignItems: 'center', gap: espacios.doce },
  insignia: {
    borderRadius: radios.pildora,
    paddingHorizontal: espacios.dieciseis,
    paddingVertical: espacios.cuatro,
  },
  intercambio: { gap: espacios.ocho },
  limpiar: { alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  pensando: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    padding: espacios.dieciseis,
  },
  relacionadas: { gap: espacios.ocho },
  respuesta: { gap: espacios.ocho, padding: espacios.dieciseis },
  sugerencias: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
  textoVoz: { flex: 1, gap: 2 },
  tarjeta: { gap: espacios.cuatro, padding: espacios.dieciseis },
});
