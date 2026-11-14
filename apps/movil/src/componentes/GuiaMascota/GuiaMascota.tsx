import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bloque } from '@/componentes/Bloque';
import { BotonAccion } from '@/componentes/BotonAccion';
import { CampoTexto } from '@/componentes/CampoTexto';
import { MascotaRumbo } from '@/componentes/MascotaRumbo';
import {
  consejoDeLaMascota,
  yaSeVioHoy,
  type Humor,
  type PantallaMascota,
} from '@/datos/mascota';
import { nombrePropio } from '@/datos/perfil';
import { armarContexto } from '@/datos/contextoIA';
import {
  fraseDeRespaldo,
  instruccionesDeRumbo,
  limpiarRespuestaDeRumbo,
} from '@/datos/mascotaIA';
import { escucharMascota, type EventoMascota } from '@/datos/mascotaEventos';
import {
  medirPerchas,
  medirPercha,
  perchasUtiles,
  type Percha,
} from '@/datos/perchas';
import { useConexion } from '@/datos/useConexion';
import { useIA } from '@/datos/useIA';
import { rellenar } from '@/textos/rellenar';
import { useSonidos } from '@/datos/useSonidos';
import { useBoletoPorCalificar } from '@/datos/useBoletoPorCalificar';
import { useBoletos } from '@/datos/useBoletos';
import { useMascota } from '@/datos/useMascota';
import { usePerfil } from '@/datos/usePerfil';
import { useSalidas } from '@/datos/useSalidas';
import { useSensaciones } from '@/datos/useSensaciones';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

/** cuánto tarda un consejo en irse solo si nadie lo toca */
export const SEGUNDOS_DEL_CONSEJO = 14;
/** cuánto tiempo sin que la toquen antes de que se duerma */
export const SEGUNDOS_PARA_DORMIR = 45;

const TAMANO = 64;
const MARGEN = 12;
const ANCHO_GLOBO = 260;

export interface PropiedadesGuiaMascota {
  /** qué pestaña está abierta: de ahí salen los consejos; sin ella solo reacciona y pasea */
  pantalla: PantallaMascota | null;
}

/**
 * Rumbo, la mascota viva: siempre está abajo a la izquierda, parpadea, mira a los lados y se duerme si nadie la toca.
 * Tiene un globo cuando hay algo útil que decir en la pantalla. Al tocarla brinca, suena y dice algo que la IA del
 * teléfono (Apple Intelligence o Gemini) arma con los datos reales de la persona; al mantenerla apretada se le
 * puede preguntar lo que sea. Si la persona no la activó en los ajustes, no se dibuja nada
 */
export function GuiaMascota({ pantalla }: PropiedadesGuiaMascota) {
  const { colores } = useTema();
  const margenes = useSafeAreaInsets();
  const reducido = useMovimientoReducido();
  const sentir = useSensaciones();
  const { activa, marcar, vistos } = useMascota();
  const { boletos } = useBoletos();
  const { ahora, salidas } = useSalidas();
  const { perfil } = usePerfil();
  const porCalificar = useBoletoPorCalificar();
  const [despedido, establecerDespedido] = useState<string | null>(null);
  const entrada = useRef(new Animated.Value(0)).current;
  const ia = useIA();
  const sonar = useSonidos();
  const [salto, establecerSalto] = useState(0);
  const [dormida, establecerDormida] = useState(false);
  const [dicho, establecerDicho] = useState<string | null>(null);
  const [pensando, establecerPensando] = useState(false);
  const [preguntando, establecerPreguntando] = useState(false);
  const [pregunta, establecerPregunta] = useState('');
  const vez = useRef(0);
  const sonoHola = useRef<string | null>(null);
  const { enLinea } = useConexion();
  const { height, width } = useWindowDimensions();
  // dónde está, en coordenadas de la ventana: sola se sube a las tarjetas de la pantalla o camina por el piso
  const altoM = TAMANO * 0.86;
  const pisoY = height - Math.max(margenes.bottom, MARGEN) - 78 - altoM;
  const x = useRef(new Animated.Value(MARGEN)).current;
  const y = useRef(new Animated.Value(0)).current;
  const arco = useRef(new Animated.Value(0)).current;
  const paso = useRef(new Animated.Value(0)).current;
  const xActual = useRef(MARGEN);
  const yActual = useRef(0);
  const [mirandoA, establecerMirandoA] = useState<1 | -1>(1);
  const [posado, establecerPosado] = useState({ x: MARGEN, y: 0 });
  const [animo, establecerAnimo] = useState<Humor | null>(null);
  const hablando = useRef(false);
  const moviendose = useRef(false);
  const iniciada = useRef(false);
  const perchaActual = useRef<{ dx: number; ref: Percha['ref'] } | null>(null);

  useEffect(() => {
    const a = x.addListener(({ value }) => {
      xActual.current = value;
    });
    const b = y.addListener(({ value }) => {
      yActual.current = value;
    });
    return () => {
      x.removeListener(a);
      y.removeListener(b);
    };
  }, [x, y]);

  /** la mascota dice algo propio de un suceso de la app y reacciona con su cuerpo */
  function reaccionar(evento: EventoMascota) {
    const dichos: Record<
      EventoMascota['tipo'],
      { humor: Humor; texto: string }
    > = {
      calificacion: { humor: 'saludando', texto: t('mascota.evCalificacion') },
      conexion: { humor: 'feliz', texto: t('mascota.evConexion') },
      recibido: { humor: 'celebrando', texto: t('mascota.evRecibido') },
      reserva: {
        humor: 'celebrando',
        texto: rellenar(t('mascota.evReserva'), {
          destino: evento.tipo === 'reserva' ? evento.destino : '',
        }),
      },
      sinConexion: { humor: 'alerta', texto: t('mascota.evSinConexion') },
      transferido: { humor: 'celebrando', texto: t('mascota.evTransferido') },
    };
    const reaccion = dichos[evento.tipo];
    establecerDormida(false);
    establecerPreguntando(false);
    establecerSalto((n) => n + 1);
    sonar(evento.tipo === 'sinConexion' ? 'bocina' : 'mascotaHola');
    establecerAnimo(reaccion.humor);
    establecerDicho(reaccion.texto);
    setTimeout(() => establecerAnimo(null), 5000);
  }

  useEffect(() => {
    if (!activa) return;
    return escucharMascota((evento) => reaccionar(evento));
  }, [activa]);

  // al perder o recuperar la señal avisa sola, sin esperar a que pase nada más
  const estabaEnLinea = useRef(enLinea);
  useEffect(() => {
    if (!activa || estabaEnLinea.current === enLinea) return;
    estabaEnLinea.current = enLinea;
    reaccionar({ tipo: enLinea ? 'conexion' : 'sinConexion' });
  }, [activa, enLinea]);

  const consejo = useMemo(() => {
    const proximo = boletos
      .filter(
        ({ boleto, resumen }) =>
          boleto.estado === 'vigente' && new Date(resumen.salida) >= ahora,
      )
      .sort(
        (a, b) =>
          new Date(a.resumen.salida).getTime() -
          new Date(b.resumen.salida).getTime(),
      )[0];
    if (pantalla === null) return null;
    return consejoDeLaMascota({
      ahora,
      boletoProximo: proximo
        ? {
            destino: proximo.resumen.destino,
            minutos: Math.round(
              (new Date(proximo.resumen.salida).getTime() - ahora.getTime()) /
                60_000,
            ),
            punto: proximo.resumen.puntoEncuentro,
          }
        : null,
      haySalidasHoy: salidas.some(
        (s) =>
          s.salida.toDateString() === ahora.toDateString() &&
          s.salida.getTime() >= ahora.getTime(),
      ),
      nombre: nombrePropio(perfil.nombre).split(' ')[0] ?? '',
      pantalla,
      porCalificar: porCalificar !== null,
      sinBoletos: boletos.length === 0,
    });
  }, [ahora, boletos, pantalla, perfil.nombre, porCalificar, salidas]);

  const hayConsejo =
    activa &&
    consejo !== null &&
    despedido !== consejo.id &&
    !yaSeVioHoy(vistos, consejo.id, ahora);

  // entra con un resorte apenas está activa, y saluda con un sonido cuando aparece un consejo nuevo
  useEffect(() => {
    if (!activa) {
      entrada.setValue(0);
      return;
    }
    if (reducido) entrada.setValue(1);
    else
      Animated.spring(entrada, {
        friction: 6,
        tension: 90,
        toValue: 1,
        useNativeDriver: true,
      }).start();
  }, [activa, entrada, reducido]);

  useEffect(() => {
    if (!hayConsejo || !consejo || sonoHola.current === consejo.id) return;
    sonoHola.current = consejo.id;
    sonar('mascotaHola');
    const id = consejo.id;
    const temporizador = setTimeout(
      () => despedir(id),
      SEGUNDOS_DEL_CONSEJO * 1000,
    );
    return () => clearTimeout(temporizador);
  }, [hayConsejo, consejo?.id]);

  // si nadie la toca un rato, se duerme con un ronquido; cualquier toque la despierta
  useEffect(() => {
    if (!activa || dormida) return;
    const sueno = setTimeout(() => {
      establecerDormida(true);
      establecerDicho(null);
      sonar('mascotaZzz');
    }, SEGUNDOS_PARA_DORMIR * 1000);
    return () => clearTimeout(sueno);
  }, [activa, dormida, salto, dicho, pregunta, preguntando]);

  // lo que dice se va solo
  useEffect(() => {
    if (dicho === null) return;
    const temporizador = setTimeout(() => establecerDicho(null), 11_000);
    return () => clearTimeout(temporizador);
  }, [dicho]);

  /** va a un punto: si es lejos o está a otra altura salta en arco y aterriza con un brinco; si no, camina a pasitos */
  function irA(destinoX: number, destinoY: number, alTerminar?: () => void) {
    moviendose.current = true;
    const dx = destinoX - xActual.current;
    const dy = destinoY - yActual.current;
    const distancia = Math.hypot(dx, dy);
    if (Math.abs(dx) > 4) establecerMirandoA(dx > 0 ? 1 : -1);
    const terminar = (aterrizo: boolean) => {
      moviendose.current = false;
      paso.stopAnimation();
      paso.setValue(0);
      arco.setValue(0);
      establecerPosado({ x: destinoX, y: destinoY });
      if (aterrizo) establecerSalto((n) => n + 1);
      alTerminar?.();
    };
    if (reducido || distancia < 4) {
      x.setValue(destinoX);
      y.setValue(destinoY);
      terminar(false);
      return;
    }
    const salta = Math.abs(dy) > 24;
    const duracion = Math.max(650, Math.min(1500, distancia * 5));
    const piezas: Animated.CompositeAnimation[] = [
      Animated.timing(x, {
        duration: duracion,
        easing: Easing.inOut(Easing.quad),
        toValue: destinoX,
        useNativeDriver: false,
      }),
      Animated.timing(y, {
        duration: duracion,
        easing: Easing.inOut(Easing.cubic),
        toValue: destinoY,
        useNativeDriver: false,
      }),
    ];
    let brincos: Animated.CompositeAnimation | null = null;
    if (salta) {
      piezas.push(
        Animated.sequence([
          Animated.timing(arco, {
            duration: duracion / 2,
            easing: Easing.out(Easing.quad),
            toValue: -(50 + Math.abs(dy) * 0.25),
            useNativeDriver: false,
          }),
          Animated.timing(arco, {
            duration: duracion / 2,
            easing: Easing.in(Easing.quad),
            toValue: 0,
            useNativeDriver: false,
          }),
        ]),
      );
    } else {
      brincos = Animated.loop(
        Animated.sequence([
          Animated.timing(paso, {
            duration: 170,
            easing: Easing.out(Easing.quad),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(paso, {
            duration: 170,
            easing: Easing.in(Easing.quad),
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
      );
      brincos.start();
    }
    Animated.parallel(piezas).start(() => {
      brincos?.stop();
      terminar(salta);
    });
  }

  /** elige adónde ir: casi siempre a la orilla de una tarjeta que esté a la vista, a veces al piso */
  async function elegirDestino(): Promise<{
    percha: { dx: number; ref: Percha['ref'] } | null;
    x: number;
    y: number;
  }> {
    const libreX = Math.max(MARGEN + 1, width - TAMANO - MARGEN);
    const piso = () => ({
      percha: null,
      x: MARGEN + Math.random() * (libreX - MARGEN),
      y: pisoY,
    });
    if (Math.random() < 0.25) return piso();
    const utiles = perchasUtiles(await medirPerchas(), {
      altoMascota: altoM,
      anchoMascota: TAMANO,
      anchoVentana: width,
      pisoY: pisoY + altoM - 20,
      topeY: margenes.top,
    });
    const actual = perchaActual.current?.ref;
    const otras = utiles.filter((p) => p.ref !== actual);
    const lista = otras.length > 0 ? otras : utiles;
    const elegida = lista[Math.floor(Math.random() * lista.length)];
    if (!elegida) return piso();
    const dx =
      10 + Math.random() * Math.max(0, elegida.rect.ancho - TAMANO - 20);
    return {
      percha: { dx, ref: elegida.ref },
      x: elegida.rect.x + dx,
      y: elegida.rect.y - altoM + 4,
    };
  }

  const ocupada =
    dormida || pensando || preguntando || dicho !== null || hayConsejo;
  hablando.current = ocupada;

  // la primera vez aparece en el piso, en el borde izquierdo
  useEffect(() => {
    if (!activa || iniciada.current) return;
    iniciada.current = true;
    x.setValue(MARGEN);
    y.setValue(pisoY);
    xActual.current = MARGEN;
    yActual.current = pisoY;
    establecerPosado({ x: MARGEN, y: pisoY });
  }, [activa, pisoY, x, y]);

  // pasea sola: cada tanto elige un lugar nuevo, salta hasta ahí y se queda un rato mirando
  useEffect(() => {
    if (!activa || ocupada) return;
    let activo = true;
    let espera: ReturnType<typeof setTimeout>;
    const siguiente = () => {
      espera = setTimeout(
        async () => {
          if (!activo || hablando.current || moviendose.current) return;
          const destino = await elegirDestino();
          if (!activo || hablando.current) return;
          perchaActual.current = destino.percha;
          irA(destino.x, destino.y, () => {
            if (activo) siguiente();
          });
        },
        4500 + Math.random() * 5500,
      );
    };
    siguiente();
    return () => {
      activo = false;
      clearTimeout(espera);
    };
  }, [activa, ocupada, width, height]);

  // mientras está sobre una tarjeta la sigue: si la pantalla se desplaza, ella se va con la tarjeta, y si la tarjeta sale de la vista baja al piso
  useEffect(() => {
    if (!activa) return;
    const seguir = setInterval(async () => {
      const percha = perchaActual.current;
      if (!percha || moviendose.current) return;
      const rect = await medirPercha(percha.ref);
      if (moviendose.current || perchaActual.current !== percha) return;
      if (
        !rect ||
        rect.y < margenes.top + altoM + 4 ||
        rect.y > pisoY + altoM - 20
      ) {
        perchaActual.current = null;
        irA(xActual.current, pisoY);
        return;
      }
      const nx =
        rect.x + Math.min(percha.dx, Math.max(0, rect.ancho - TAMANO - 10));
      const ny = rect.y - altoM + 4;
      if (
        Math.abs(nx - xActual.current) > 1 ||
        Math.abs(ny - yActual.current) > 1
      ) {
        x.setValue(nx);
        y.setValue(ny);
        if (Math.abs(ny - posado.y) > 12 || Math.abs(nx - posado.x) > 12)
          establecerPosado({ x: nx, y: ny });
      }
    }, 250);
    return () => clearInterval(seguir);
  }, [activa, altoM, margenes.top, pisoY, posado.x, posado.y]);

  function despedir(id: string) {
    marcar(id);
    establecerDespedido(id);
  }

  /** lo que sabe de la persona, para que la IA no invente nada */
  function datosReales(): string {
    return armarContexto(salidas, boletos, ahora);
  }

  async function responder(texto: string) {
    if (!ia.usable) {
      establecerDicho(
        texto === '' ? fraseDeRespaldo(vez.current++) : t('mascota.sinIA'),
      );
      return;
    }
    establecerPensando(true);
    try {
      const respuesta = await ia.preguntar(
        instruccionesDeRumbo(datosReales()),
        texto === ''
          ? 'Decime una sola frase breve y útil para esta persona ahora mismo, según sus datos.'
          : texto,
      );
      establecerDicho(limpiarRespuestaDeRumbo(respuesta));
    } catch {
      establecerDicho(t('mascota.falloIA'));
    } finally {
      establecerPensando(false);
    }
  }

  function alTocar() {
    const estabaDormida = dormida;
    establecerDormida(false);
    establecerSalto((n) => n + 1);
    sonar(estabaDormida ? 'mascotaHola' : 'mascotaBoing');
    sentir('toque');
    if (hayConsejo && consejo) {
      despedir(consejo.id);
      return;
    }
    establecerPreguntando(false);
    void responder('');
  }

  function alMantener() {
    establecerDormida(false);
    establecerSalto((n) => n + 1);
    sonar('mascotaHola');
    sentir('aviso');
    establecerDicho(null);
    establecerPreguntando(true);
  }

  async function enviarPregunta() {
    const texto = pregunta.trim();
    if (texto === '') return;
    establecerPreguntando(false);
    establecerPregunta('');
    await responder(texto);
  }

  if (!activa) return null;
  const humor: Humor = dormida
    ? 'dormido'
    : pensando
      ? 'pensando'
      : dicho !== null
        ? 'saludando'
        : hayConsejo && consejo
          ? consejo.humor
          : 'feliz';
  const texto = pensando
    ? t('mascota.preguntando')
    : (dicho ?? (hayConsejo && consejo ? consejo.texto : null));

  const bubbleArriba = posado.y > 190;
  const izquierdaGlobo =
    Math.min(
      width - MARGEN - ANCHO_GLOBO,
      Math.max(MARGEN, posado.x + TAMANO / 2 - ANCHO_GLOBO / 2),
    ) - posado.x;
  const posicionGlobo = bubbleArriba
    ? { bottom: altoM + 6, left: izquierdaGlobo }
    : { left: izquierdaGlobo, top: altoM + 6 };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        StyleSheet.absoluteFill,
        estilos.contenedor,
        { opacity: entrada },
      ]}
      testID="guia-mascota"
    >
      <Animated.View
        pointerEvents="box-none"
        style={[
          estilos.personaje,
          {
            transform: [
              { translateX: x },
              { translateY: y },
              { translateY: arco },
            ],
          },
        ]}
      >
        {preguntando ? (
          <View style={[estilos.globo, posicionGlobo]}>
            <Bloque estiloContenido={estilos.preguntar}>
              <CampoTexto
                alCambiar={establecerPregunta}
                etiqueta={t('mascota.pregunta')}
                marcador={t('mascota.preguntaMarcador')}
                valor={pregunta}
              />
              <BotonAccion
                alPresionar={() => void enviarPregunta()}
                deshabilitado={pregunta.trim() === ''}
                etiqueta={t('mascota.enviarPregunta')}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => establecerPreguntando(false)}
                style={estilos.cerrar}
              >
                <Text
                  style={[tipografia.pequeno, { color: colores.tintaSuave }]}
                >
                  {t('mascota.cerrar')}
                </Text>
              </Pressable>
            </Bloque>
          </View>
        ) : texto !== null ? (
          <View style={[estilos.globo, posicionGlobo]}>
            <Bloque estiloContenido={estilos.textoGlobo}>
              <Text
                accessibilityLiveRegion="polite"
                style={[tipografia.pequeno, { color: colores.tinta }]}
              >
                {texto}
              </Text>
            </Bloque>
          </View>
        ) : null}
        <Animated.View
          style={{
            transform: [
              { scaleX: mirandoA },
              {
                translateY: paso.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -7],
                }),
              },
            ],
          }}
        >
          <Pressable
            accessibilityHint={t('mascota.pregunta')}
            accessibilityLabel={texto ?? t('mascota.activar')}
            accessibilityRole="button"
            onLongPress={alMantener}
            onPress={alTocar}
          >
            <MascotaRumbo
              humor={animo ?? humor}
              salto={salto}
              tamano={TAMANO}
            />
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  cerrar: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  contenedor: { zIndex: 40 },
  globo: { position: 'absolute', width: ANCHO_GLOBO },
  personaje: {
    height: TAMANO,
    left: 0,
    position: 'absolute',
    top: 0,
    width: TAMANO,
  },
  preguntar: { gap: espacios.ocho, padding: espacios.doce },
  textoGlobo: { padding: espacios.doce },
});
