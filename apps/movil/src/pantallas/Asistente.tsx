import { estadoAsientos } from '@anden/dominio';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aparece } from '@/componentes/Aparece';
import { Bloque } from '@/componentes/Bloque';
import { EsqueletoIA } from '@/componentes/EsqueletoIA';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CabeceraPantalla } from '@/componentes/CabeceraPantalla';
import { ActividadIA } from '@/componentes/ActividadIA';
import { CompositorIA } from '@/componentes/CompositorIA';
import { FichaCiudadIA } from '@/componentes/FichaCiudadIA';
import { FotoDestino } from '@/componentes/FotoDestino';
import { TarjetaSalidaIA } from '@/componentes/TarjetaSalidaIA';
import { Chip } from '@/componentes/Chip';
import { Interruptor } from '@/componentes/Interruptor';
import { FilaSalida } from '@/componentes/FilaSalida';
import { OndaDeVoz } from '@/componentes/OndaDeVoz';
import { OrbeIA } from '@/componentes/OrbeIA';
import { PuntosPensando } from '@/componentes/PuntosPensando';
import { TextoEscribiendo } from '@/componentes/TextoEscribiendo';
import {
  destinosFrecuentes,
  salidaMasBarata,
  salidasRelacionadas,
} from '@/datos/ayudasIA';
import { armarContacto, guardarContacto } from '@/datos/contactoConfianza';
import {
  interpretarOrden,
  proximaSalidaA,
  telefonoDictado,
  type PantallaAbrible,
} from '@/datos/ordenesIA';
import { nombreCompleto, nombrePropio } from '@/datos/perfil';
import { usePerfil } from '@/datos/usePerfil';
import { useSesion } from '@/datos/useSesion';
import { armarContexto, instruccionesDelAsistente } from '@/datos/contextoIA';
import {
  actividadDeHerramienta,
  armarDatosParaElModelo,
  instruccionesDeConversacion,
  leerRespuestaRica,
  RESPUESTA_VACIA,
  type RespuestaRica,
} from '@/datos/conversacionIA';
import { FICHAS } from '@/datos/fichasCiudad';
import { formatoHoraCompleta } from '@/datos/formato';
import { useBoletos } from '@/datos/useBoletos';
import { registrarReserva, resumenParaModelo } from '@/datos/memoriaIA';
import { sugerenciasDelMomento } from '@/datos/sugerenciasIA';
import { useIA } from '@/datos/useIA';
import { useMemoriaIA } from '@/datos/useMemoriaIA';
import { useTurista } from '@/datos/useTurista';
import { useSalidas } from '@/datos/useSalidas';
import { useVoz } from '@/datos/useVoz';
import { motivoNoDisponible } from '@/servicios/ia';
import {
  guardarRespuestaHablada,
  guardarVozEnLinea,
  leerRespuestaHablada,
  leerVozEnLinea,
} from '@/servicios/voz';
import { coloresIA } from '@/tema/colores';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesAsistente {
  /** abre el detalle de una salida mostrada junto a una respuesta */
  /** abre el boleto recién reservado por orden de voz */
  alAbrirBoleto?: (boletoId: string) => void;
  alAbrirViaje?: (viajeId: string) => void;
  /** lleva a una pantalla de la app cuando la persona lo pide por voz o por escrito */
  alAbrirPantalla?: (pantalla: PantallaAbrible) => void;
  alVolver: () => void;
  /** una pregunta que se envía sola al abrir, por ejemplo desde el detalle de un viaje */
  preguntaInicial?: string;
}

interface Intercambio {
  /** lo que consulta el modelo mientras responde, por ejemplo "Buscando salidas" */
  actividad?: string | null;
  /** la respuesta sigue llegando */
  enCurso?: boolean;
  id: number;
  pregunta: string;
  respuesta: string;
  /** respuesta con tarjetas, solo cuando conversó con herramientas */
  rica?: RespuestaRica;
}

/** el asistente: responde con las salidas y boletos reales de la app usando el modelo del teléfono */
export function Asistente({
  alAbrirBoleto,
  alAbrirPantalla,
  alAbrirViaje,
  alVolver,
  preguntaInicial,
}: PropiedadesAsistente) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const {
    conversar,
    disponibilidad,
    nombre,
    olvidar,
    precalentar,
    preguntar,
    usable,
  } = useIA();
  const { boletos, reservar } = useBoletos();
  const { ahora, datos, salidas } = useSalidas();
  const { perfil } = usePerfil();
  const { sesion } = useSesion();
  // lo que Andén espera antes de seguir una orden: un teléfono o un sí para reservar
  const [pendiente, establecerPendiente] = useState<
    | { nombre: string; tipo: 'telefono' }
    | {
        asiento: number;
        destino: string;
        tipo: 'confirmar';
        viajeId: string;
      }
    | null
  >(null);
  const [texto, establecerTexto] = useState('');
  const [pensando, establecerPensando] = useState(false);
  const [fallo, establecerFallo] = useState(false);
  const [historial, establecerHistorial] = useState<Intercambio[]>([]);
  const contadorId = useRef(1);
  const conversacionId = useRef(`conversacion-${Date.now()}`);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const voz = useVoz();
  const memoriaIA = useMemoriaIA();
  const { cambiar: cambiarTurista, turista } = useTurista();
  // cambia en cada apertura de la pantalla para que las preguntas sugeridas roten
  const [semilla] = useState(() => Math.floor(Date.now() / 1000));
  const [respuestaEnVoz, establecerRespuestaEnVoz] = useState(false);
  const [escuchando, establecerEscuchando] = useState(false);
  // el volumen de la voz mueve el orbe sin volver a dibujar toda la pantalla
  const nivel = useRef(new Animated.Value(0)).current;
  // el orbe de la barra de abajo tiene su propio valor: compartirlo con el grande rompe la animación al cambiar de uno a otro
  const nivelBarra = useRef(new Animated.Value(0)).current;
  const [hablando, establecerHablando] = useState(false);
  const [problemaVoz, establecerProblemaVoz] = useState<string | null>(null);
  const [vozEnLinea, establecerVozEnLinea] = useState(false);
  const usarVozEnLinea = useRef(false);
  const [avisoVoz, establecerAvisoVoz] = useState<
    'sin-permiso' | 'no-disponible' | null
  >(null);
  const dicho = useRef('');
  const enviarActual = useRef<
    (pregunta: string, porVoz?: boolean) => Promise<void>
  >(async () => undefined);
  const hablarRespuesta = useRef(false);

  useEffect(() => {
    let vigente = true;
    void leerRespuestaHablada().then((activa) => {
      if (!vigente) return;
      establecerRespuestaEnVoz(activa);
      hablarRespuesta.current = activa;
    });
    // se carga la voz por adelantado para que la primera respuesta hablada no tarde
    void voz.preparar?.();
    void leerVozEnLinea().then((activa) => {
      if (!vigente) return;
      establecerVozEnLinea(activa);
      usarVozEnLinea.current = activa;
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

  // lo que recuerda más lo que ya reservó: una reserva dice más que una pregunta
  const memoriaEfectiva = boletos.reduce(
    (previa, { resumen }) => registrarReserva(previa, resumen.destino),
    memoriaIA.memoria,
  );
  const sugerencias = useMemo(
    () =>
      sugerenciasDelMomento({
        ahora,
        boletoProximo: proximoBoleto
          ? {
              destino: proximoBoleto.resumen.destino,
              minutosParaSalir: Math.round(
                (new Date(proximoBoleto.resumen.salida).getTime() -
                  ahora.getTime()) /
                  60_000,
              ),
            }
          : null,
        destinos,
        memoria: memoriaEfectiva,
        semilla,
        turista,
      }),
    [ahora, destinos, memoriaEfectiva, proximoBoleto, semilla, turista],
  );

  /** agrega un intercambio sin pasar por el modelo y lo lee en voz alta si corresponde */
  function responder(pregunta: string, respuesta: string, porVoz: boolean) {
    const id = contadorId.current++;
    establecerHistorial((previo) => [...previo, { id, pregunta, respuesta }]);
    establecerTexto('');
    if (porVoz || hablarRespuesta.current) {
      void voz.hablar(respuesta, {
        alEstado: establecerHablando,
        alProblema: (motivo) => {
          establecerHablando(false);
          establecerProblemaVoz(motivo);
        },
        enLinea: usarVozEnLinea.current,
      });
    }
  }

  /** ejecuta lo que la persona pidió dentro de la app; devuelve lo que se le contesta, o nulo si no era una orden */
  async function ejecutarOrden(pedido: string): Promise<string | null> {
    if (pendiente?.tipo === 'telefono') {
      const telefono = telefonoDictado(pedido);
      const contacto = telefono
        ? armarContacto(pendiente.nombre, telefono)
        : null;
      if (!contacto) {
        return 'No entendí el número. Decímelo de nuevo, con los 8 dígitos.';
      }
      await guardarContacto(contacto);
      establecerPendiente(null);
      return `Listo: ${contacto.nombre} quedó como tu contacto de emergencia. Lo vas a ver al compartir tu viaje.`;
    }
    const ciudades = [
      ...new Set(datos.terminales.map((terminal) => terminal.ciudad)),
    ];
    const orden = interpretarOrden(pedido, ciudades);
    if (!orden) return null;
    if (orden.tipo === 'abrir') {
      if (!alAbrirPantalla) return null;
      alAbrirPantalla(orden.pantalla);
      return t(`ia.abriendo.${orden.pantalla}`);
    }
    if (orden.tipo === 'contacto') {
      establecerPendiente({
        nombre: nombrePropio(orden.nombre),
        tipo: 'telefono',
      });
      return `¿Cuál es el teléfono de ${nombrePropio(orden.nombre)}? Decímelo con los 8 dígitos.`;
    }
    const salida = proximaSalidaA(
      salidas,
      orden.destino,
      orden.origen,
      new Date(),
    );
    if (!salida) {
      return `No encontré salidas a ${orden.destino} con asientos por ahora. Revisá Horarios más tarde.`;
    }
    const hora = formatoHoraCompleta(salida.salida);
    const tarifa = salida.tarifa === null ? '' : `, C$ ${salida.tarifa}`;
    if (orden.tipo === 'viaje') {
      return `El próximo bus a ${salida.destino} sale de ${salida.origen} a las ${hora}, punto de encuentro ${salida.puntoEncuentro || 'por confirmar'}${tarifa}. Quedan ${salida.asientosLibres} asientos.`;
    }
    const viaje = datos.viajes.find(
      (candidato) => candidato.id === salida.viajeId,
    );
    const bus = datos.buses.find((candidato) => candidato.id === viaje?.busId);
    const libre = bus
      ? estadoAsientos(
          bus.configuracion,
          datos.ocupaciones.filter((o) => o.viajeId === salida.viajeId),
          new Date(),
        ).find((asiento) => asiento.estado === 'libre')
      : undefined;
    if (!libre)
      return `La salida a ${salida.destino} ya no tiene asientos libres.`;
    establecerPendiente({
      asiento: libre.numero,
      destino: salida.destino,
      tipo: 'confirmar',
      viajeId: salida.viajeId,
    });
    return `Puedo reservarte el asiento ${libre.numero} a ${salida.destino}, sale a las ${hora}${tarifa}, y pagás en efectivo al abordar. ¿Confirmás?`;
  }

  async function confirmarReserva() {
    if (pendiente?.tipo !== 'confirmar') return;
    const datosPendiente = pendiente;
    establecerPendiente(null);
    const nombrePasajero =
      nombreCompleto(perfil).trim() || (sesion?.nombre ?? '').trim();
    const resultado = await reservar(datosPendiente.viajeId, [
      { asiento: datosPendiente.asiento, nombre: nombrePasajero },
    ]);
    if (resultado.ok) {
      const primero = resultado.valor[0];
      responder(
        'Confirmar reserva',
        `Reservado: asiento ${datosPendiente.asiento} a ${datosPendiente.destino}. Pagás en efectivo al abordar.`,
        false,
      );
      if (primero) alAbrirBoleto?.(primero.boleto.id);
    } else {
      responder(
        'Confirmar reserva',
        'No pude reservar ese asiento: alguien lo tomó o la venta se cerró. Probá de nuevo.',
        false,
      );
    }
  }

  function actualizarIntercambio(id: number, cambios: Partial<Intercambio>) {
    establecerHistorial((previo) =>
      previo.map((intercambio) =>
        intercambio.id === id ? { ...intercambio, ...cambios } : intercambio,
      ),
    );
  }

  /**
   * conversa con el modelo usando herramientas que consultan los datos reales; va mostrando el texto y las
   * tarjetas mientras llegan. Devuelve falso si no logró una respuesta, para caer en el modo sencillo.
   */
  async function conversarConHerramientas(
    pregunta: string,
    porVoz: boolean,
  ): Promise<boolean> {
    if (!conversar) return false;
    const id = contadorId.current++;
    establecerHistorial((previo) => [
      ...previo,
      {
        actividad: null,
        enCurso: true,
        id,
        pregunta,
        respuesta: '',
        rica: RESPUESTA_VACIA,
      },
    ]);
    establecerTexto('');
    try {
      const final = await conversar({
        alHerramienta: (herramienta) =>
          actualizarIntercambio(id, {
            actividad: actividadDeHerramienta(herramienta),
          }),
        alParcial: (json) =>
          actualizarIntercambio(id, {
            actividad: null,
            rica: leerRespuestaRica(json, salidas),
          }),
        conversacion: conversacionId.current,
        datosJson: JSON.stringify(
          armarDatosParaElModelo(salidas, boletos, new Date()),
        ),
        instrucciones: instruccionesDeConversacion({ turista }),
        pregunta,
      });
      const rica = leerRespuestaRica(final, salidas);
      if (rica.texto === '') throw new Error('respuesta-vacia');
      actualizarIntercambio(id, {
        actividad: null,
        enCurso: false,
        respuesta: rica.texto,
        rica,
      });
      if (porVoz || hablarRespuesta.current) {
        void voz.hablar(rica.texto, {
          alEstado: establecerHablando,
          alProblema: (motivo) => {
            establecerHablando(false);
            establecerProblemaVoz(motivo);
          },
          enLinea: usarVozEnLinea.current,
        });
      }
      return true;
    } catch {
      // se quita lo a medias y se responde con el modo sencillo
      establecerHistorial((previo) =>
        previo.filter((intercambio) => intercambio.id !== id),
      );
      return false;
    }
  }

  function nuevaConversacion() {
    void voz.callar();
    establecerHablando(false);
    establecerHistorial([]);
    void olvidar?.(conversacionId.current);
    conversacionId.current = `conversacion-${Date.now()}`;
  }

  async function enviar(pregunta: string, porVoz = false) {
    const limpia = pregunta.trim();
    if (limpia === '' || pensando) return;
    establecerPensando(true);
    establecerFallo(false);
    try {
      const orden = await ejecutarOrden(limpia);
      if (orden !== null) {
        responder(limpia, orden, porVoz);
        return;
      }
      const todosLosDestinos = [...new Set(salidas.map((s) => s.destino))];
      memoriaIA.recordarPregunta(limpia, todosLosDestinos);
      if (conversar && (await conversarConHerramientas(limpia, porVoz))) return;
      const contexto = [
        armarContexto(salidas, boletos, new Date()),
        resumenParaModelo(memoriaEfectiva),
      ]
        .filter((parte) => parte !== '')
        .join('\n');
      const respuesta = await preguntar(
        instruccionesDelAsistente(contexto, { turista }),
        limpia,
      );
      const id = contadorId.current++;
      establecerHistorial((previo) => [
        ...previo,
        { id, pregunta: limpia, respuesta: respuesta.trim() },
      ]);
      establecerTexto('');
      // si le hablaste, te contesta hablando aunque el interruptor esté apagado
      if (porVoz || hablarRespuesta.current) {
        void voz.hablar(respuesta.trim(), {
          alEstado: establecerHablando,
          alProblema: (motivo) => {
            establecerHablando(false);
            establecerProblemaVoz(motivo);
          },
          enLinea: usarVozEnLinea.current,
        });
      }
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
    establecerProblemaVoz(null);
    const resultado = await voz.escuchar({
      alFallar: () => establecerEscuchando(false),
      alNivel: (valor) => {
        for (const animado of [nivel, nivelBarra]) {
          Animated.timing(animado, {
            duration: 90,
            toValue: valor,
            useNativeDriver: true,
          }).start();
        }
      },
      alTerminar: () => {
        establecerEscuchando(false);
        const pregunta = dicho.current;
        dicho.current = '';
        if (pregunta.trim() !== '') void enviarActual.current(pregunta, true);
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
    if (!activa) {
      await voz.callar();
      establecerHablando(false);
    }
    await guardarRespuestaHablada(activa);
  }

  async function cambiarVozEnLinea(activa: boolean) {
    establecerVozEnLinea(activa);
    usarVozEnLinea.current = activa;
    await guardarVozEnLinea(activa);
  }

  const preguntaEnviada = useRef(false);
  useEffect(() => {
    if (!usable || !preguntaInicial || preguntaEnviada.current) return;
    preguntaEnviada.current = true;
    void enviarActual.current(preguntaInicial);
  }, [preguntaInicial, usable]);

  const motivo = usable ? null : motivoNoDisponible(disponibilidad, nombre);
  const conversando = historial.length > 0;
  const estadoOrbe = escuchando
    ? 'escuchando'
    : pensando
      ? 'pensando'
      : hablando
        ? 'hablando'
        : 'reposo';

  useEffect(() => {
    if (usable) {
      void precalentar?.(
        conversacionId.current,
        instruccionesDeConversacion({ turista }),
      );
    }
  }, [precalentar, turista, usable]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[estilos.raiz, { backgroundColor: colores.fondo }]}
    >
      <ScrollView
        contentContainerStyle={[
          estilos.contenido,
          {
            paddingBottom: espacios.veinticuatro,
            paddingTop: margenes.top + espacios.ocho,
          },
        ]}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => {
          if (conversando) scrollRef.current?.scrollToEnd({ animated: true });
        }}
        ref={scrollRef}
        style={estilos.raiz}
      >
        <CabeceraPantalla
          alVolver={alVolver}
          titulo={t('ia.asistenteTitulo')}
        />

        {conversando && (
          <Pressable
            accessibilityRole="button"
            onPress={nuevaConversacion}
            style={estilos.nueva}
          >
            <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
              {t('asistenteRico.nuevaConversacion')}
            </Text>
          </Pressable>
        )}

        {!conversando && (
          <View style={estilos.hero}>
            <OrbeIA
              alPresionar={() => void alternarEscucha()}
              estado={estadoOrbe}
              etiquetaAccesible={escuchando ? t('ia.detener') : t('ia.hablar')}
              nivel={nivel}
              tamano={120}
            />
            <Text
              accessibilityLiveRegion="polite"
              style={[
                tipografia.subtitulo,
                estilos.centrado,
                { color: colores.tinta },
              ]}
            >
              {escuchando
                ? t('ia.detener')
                : pensando
                  ? t('ia.pensandoCaption')
                  : hablando
                    ? t('ia.respondiendo')
                    : t('ia.tocaElOrbe')}
            </Text>
            <LinearGradient
              colors={[...coloresIA]}
              end={{ x: 1, y: 0 }}
              start={{ x: 0, y: 0 }}
              style={estilos.borde}
            >
              <View
                style={[estilos.insignia, { backgroundColor: colores.fondo }]}
              >
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
        )}

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
            {!conversando && (
              <>
                <View style={estilos.seccion}>
                  <Text
                    style={[tipografia.etiqueta, { color: colores.tintaSuave }]}
                  >
                    {t('asistenteRico.descubri')}
                  </Text>
                  <ScrollView
                    contentContainerStyle={estilos.carrusel}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  >
                    {FICHAS.map((ficha) => (
                      <Pressable
                        accessibilityRole="button"
                        disabled={pensando}
                        key={ficha.ciudad}
                        onPress={() =>
                          void enviar(
                            rellenar(t('asistenteRico.queVisitar'), {
                              ciudad: ficha.ciudad,
                            }),
                          )
                        }
                        style={({ pressed }) => pressed && estilos.presionada}
                      >
                        <FotoDestino
                          destino={ficha.ciudad}
                          estilo={estilos.ciudad}
                          radio="tarjeta"
                        >
                          <View style={estilos.ciudadTexto}>
                            <Text
                              style={[
                                tipografia.pequeno,
                                { color: colores.ambar },
                              ]}
                            >
                              {rellenar(t('asistenteRico.queVisitar'), {
                                ciudad: '',
                              }).trim()}
                            </Text>
                            <Text
                              style={[
                                tipografia.subtitulo,
                                { color: colores.sobreNegro },
                              ]}
                            >
                              {ficha.ciudad}
                            </Text>
                          </View>
                        </FotoDestino>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                {proximoBoleto && (
                  <Aparece indice={0}>
                    <Bloque estiloContenido={estilos.tarjeta}>
                      <Text
                        style={[
                          tipografia.etiqueta,
                          { color: colores.ambarTexto },
                        ]}
                      >
                        {t('ia.proximoBoleto')}
                      </Text>
                      <Text
                        style={[tipografia.subtitulo, { color: colores.tinta }]}
                      >
                        {rellenar(t('ia.proximoBoletoFila'), {
                          puntoEncuentro: proximoBoleto.resumen.puntoEncuentro,
                          asiento: proximoBoleto.boleto.asiento,
                          destino: proximoBoleto.resumen.destino,
                        })}
                      </Text>
                      <Text
                        style={[
                          tipografia.pequeno,
                          { color: colores.tintaSuave },
                        ]}
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
                      style={[
                        tipografia.etiqueta,
                        { color: colores.ambarTexto },
                      ]}
                    >
                      {t('ia.masBarata')}
                    </Text>
                    {masBarata ? (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => alAbrirViaje?.(masBarata.viajeId)}
                      >
                        <Text
                          style={[
                            tipografia.subtitulo,
                            { color: colores.tinta },
                          ]}
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
                        style={[
                          tipografia.pequeno,
                          { color: colores.tintaSuave },
                        ]}
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

                <Bloque estiloContenido={estilos.filaVoz}>
                  <View style={estilos.textoVoz}>
                    <Text
                      style={[tipografia.subtitulo, { color: colores.tinta }]}
                    >
                      {t('ia.turista')}
                    </Text>
                    <Text
                      style={[
                        tipografia.pequeno,
                        { color: colores.tintaSuave },
                      ]}
                    >
                      {t('ia.turistaDetalle')}
                    </Text>
                  </View>
                  <Interruptor
                    activo={turista}
                    alCambiar={(activo) => void cambiarTurista(activo)}
                    etiqueta={t('ia.turista')}
                  />
                </Bloque>
                <Bloque estiloContenido={estilos.filaVoz}>
                  <View style={estilos.textoVoz}>
                    <Text
                      style={[tipografia.subtitulo, { color: colores.tinta }]}
                    >
                      {t('ia.respuestaEnVoz')}
                    </Text>
                    <Text
                      style={[
                        tipografia.pequeno,
                        { color: colores.tintaSuave },
                      ]}
                    >
                      {t('ia.respuestaEnVozDetalle')}
                    </Text>
                  </View>
                  <Interruptor
                    activo={respuestaEnVoz}
                    alCambiar={(activa) => void cambiarRespuestaEnVoz(activa)}
                    etiqueta={t('ia.respuestaEnVoz')}
                  />
                </Bloque>
                {respuestaEnVoz && (
                  <Bloque estiloContenido={estilos.filaVoz}>
                    <View style={estilos.textoVoz}>
                      <Text
                        style={[tipografia.subtitulo, { color: colores.tinta }]}
                      >
                        {t('ia.vozNatural')}
                      </Text>
                      <Text
                        style={[
                          tipografia.pequeno,
                          { color: colores.tintaSuave },
                        ]}
                      >
                        {t('ia.vozNaturalDetalle')}
                      </Text>
                    </View>
                    <Interruptor
                      activo={vozEnLinea}
                      alCambiar={(activa) => void cambiarVozEnLinea(activa)}
                      etiqueta={t('ia.vozNatural')}
                    />
                  </Bloque>
                )}
              </>
            )}

            {historial.map((intercambio, indice) => {
              const esUltimo = indice === historial.length - 1;
              const rica = intercambio.rica;
              const relacionadas = rica
                ? []
                : salidasRelacionadas(
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
                    {intercambio.actividad ? (
                      <ActividadIA actividad={intercambio.actividad} />
                    ) : null}
                    {rica ? (
                      rica.texto !== '' ? (
                        <Text
                          style={[tipografia.cuerpo, { color: colores.tinta }]}
                        >
                          {rica.texto}
                        </Text>
                      ) : intercambio.enCurso && !intercambio.actividad ? (
                        <PuntosPensando />
                      ) : null
                    ) : (
                      <TextoEscribiendo
                        animado={esUltimo}
                        estilo={[tipografia.cuerpo, { color: colores.tinta }]}
                        texto={intercambio.respuesta}
                      />
                    )}
                  </Bloque>

                  {rica?.ciudad ? (
                    <Aparece>
                      <FichaCiudadIA ciudad={rica.ciudad} />
                    </Aparece>
                  ) : null}
                  {rica?.salidas.map((salida, posicion) => (
                    <Aparece indice={posicion} key={salida.viajeId}>
                      <TarjetaSalidaIA
                        alAbrir={(viajeId) => alAbrirViaje?.(viajeId)}
                        salida={salida}
                      />
                    </Aparece>
                  ))}
                  {rica?.mostrarBoletos && alAbrirPantalla ? (
                    <Aparece>
                      <BotonAccion
                        alPresionar={() => alAbrirPantalla('boletos')}
                        etiqueta={t('asistenteRico.boletosTitulo')}
                      />
                    </Aparece>
                  ) : null}
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
                  {esUltimo &&
                  !intercambio.enCurso &&
                  rica &&
                  rica.seguimientos.length > 0 ? (
                    <View style={estilos.seccion}>
                      <Text
                        style={[
                          tipografia.etiqueta,
                          { color: colores.tintaSuave },
                        ]}
                      >
                        {t('asistenteRico.seguirPreguntando')}
                      </Text>
                      <View style={estilos.sugerencias}>
                        {rica.seguimientos.map((seguimiento) => (
                          <Chip
                            alCambiar={() => void enviar(seguimiento)}
                            deshabilitado={pensando}
                            etiqueta={seguimiento}
                            key={seguimiento}
                          />
                        ))}
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}

            {escuchando && (
              <Text
                accessibilityLiveRegion="polite"
                style={[tipografia.pequeno, { color: colores.tintaSuave }]}
              >
                {t('ia.escuchando')}
              </Text>
            )}
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
            {fallo && (
              <Text
                accessibilityLiveRegion="polite"
                style={[tipografia.cuerpo, { color: colores.cancelado }]}
              >
                {t('ia.error')}
              </Text>
            )}
            {problemaVoz !== null && (
              <Text
                accessibilityLiveRegion="polite"
                style={[tipografia.pequeno, { color: colores.cancelado }]}
              >
                {rellenar(t('ia.vozProblema'), { motivo: problemaVoz })}
              </Text>
            )}
            {hablando && (
              <Bloque estiloContenido={estilos.hablando} radio="pildora">
                <OndaDeVoz tono="habla" />
                <Text
                  accessibilityLiveRegion="polite"
                  style={[
                    tipografia.pequeno,
                    estilos.hablandoTexto,
                    { color: colores.tinta },
                  ]}
                >
                  {t('ia.hablando')}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    void voz.callar();
                    establecerHablando(false);
                  }}
                  style={estilos.callar}
                >
                  <Text
                    style={[tipografia.etiqueta, { color: colores.cancelado }]}
                  >
                    {t('ia.callar')}
                  </Text>
                </Pressable>
              </Bloque>
            )}

            {pensando && !historial.some((i) => i.enCurso) && (
              <Bloque estiloContenido={estilos.pensandoColumna}>
                <View style={estilos.pensando}>
                  <PuntosPensando />
                  <Text
                    accessibilityLiveRegion="polite"
                    style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                  >
                    {rellenar(t('ia.pensandoCon'), { nombre })}
                  </Text>
                </View>
                <EsqueletoIA />
              </Bloque>
            )}

            {pendiente?.tipo === 'confirmar' && (
              <Bloque estiloContenido={estilos.confirmar}>
                <BotonAccion
                  alPresionar={() => void confirmarReserva()}
                  etiqueta={t('ia.confirmarReserva')}
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => establecerPendiente(null)}
                  style={estilos.callar}
                >
                  <Text
                    style={[tipografia.subtitulo, { color: colores.cancelado }]}
                  >
                    {t('ia.cancelarOrden')}
                  </Text>
                </Pressable>
              </Bloque>
            )}

            {conversando && (
              <>
                <Text
                  style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                >
                  {rellenar(t('ia.nota'), { nombre })}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={nuevaConversacion}
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
      {usable && (
        <View style={{ paddingBottom: margenes.bottom }}>
          <CompositorIA
            alCambiar={establecerTexto}
            alEnviar={() => void enviar(texto)}
            alHablar={() => void alternarEscucha()}
            deshabilitado={pensando}
            estado={estadoOrbe}
            mostrarOrbe={conversando}
            nivel={nivelBarra}
            texto={texto}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  carrusel: { gap: espacios.doce, paddingRight: espacios.lateral },
  ciudad: { height: 120, justifyContent: 'flex-end', width: 190 },
  ciudadTexto: { gap: 2, padding: espacios.doce },
  nueva: { alignItems: 'flex-end', minHeight: 32, justifyContent: 'center' },
  presionada: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  seccion: { gap: espacios.ocho },
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
  hablando: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espacios.doce,
    paddingHorizontal: espacios.dieciseis,
    paddingVertical: espacios.ocho,
  },
  hablandoTexto: { flex: 1 },
  confirmar: { gap: espacios.ocho, padding: espacios.dieciseis },
  callar: { justifyContent: 'center', minHeight: 44 },
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
  },
  pensandoColumna: { gap: espacios.doce, padding: espacios.dieciseis },
  raiz: { flex: 1 },
  relacionadas: { gap: espacios.ocho },
  respuesta: { gap: espacios.ocho, padding: espacios.dieciseis },
  sugerencias: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.ocho },
  textoVoz: { flex: 1, gap: 2 },
  tarjeta: { gap: espacios.cuatro, padding: espacios.dieciseis },
});
