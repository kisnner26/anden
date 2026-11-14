import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
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
  // dónde está: x recorre el ancho de la pantalla y y sube cuando la persona la arrastra
  const x = useRef(new Animated.Value(MARGEN)).current;
  const y = useRef(new Animated.Value(0)).current;
  const paso = useRef(new Animated.Value(0)).current;
  const xActual = useRef(MARGEN);
  const yActual = useRef(0);
  const [mirandoA, establecerMirandoA] = useState<1 | -1>(1);
  const arrastrando = useRef(false);
  const [animo, establecerAnimo] = useState<Humor | null>(null);
  const hablando = useRef(false);
  const alturaMaxima = useRef(0);
  alturaMaxima.current = Math.max(
    0,
    height - margenes.top - margenes.bottom - 260,
  );

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

  /** camina hasta una posición: voltea hacia donde va y avanza a brinquitos */
  function caminarA(destino: number, alTerminar?: () => void) {
    const distancia = Math.abs(destino - xActual.current);
    if (distancia < 4) {
      alTerminar?.();
      return;
    }
    establecerMirandoA(destino > xActual.current ? 1 : -1);
    if (reducido) {
      x.setValue(destino);
      alTerminar?.();
      return;
    }
    paso.setValue(0);
    const brincos = Animated.loop(
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
    Animated.timing(x, {
      duration: Math.max(700, distancia * 6),
      easing: Easing.inOut(Easing.quad),
      toValue: destino,
      useNativeDriver: false,
    }).start(() => {
      brincos.stop();
      paso.setValue(0);
      alTerminar?.();
    });
  }

  const ocupada =
    dormida || pensando || preguntando || dicho !== null || hayConsejo;
  hablando.current = ocupada;

  // pasea sola por el borde de abajo: cada tanto elige otro punto, camina y se queda un rato mirando
  useEffect(() => {
    if (!activa || ocupada) return;
    let activo = true;
    let espera: ReturnType<typeof setTimeout>;
    const proxima = () => {
      espera = setTimeout(
        () => {
          if (!activo || arrastrando.current || hablando.current) return;
          const libre = Math.max(MARGEN + 1, width - TAMANO - MARGEN);
          let destino = MARGEN + Math.random() * (libre - MARGEN);
          // que valga la pena caminar: al menos un buen trecho
          if (Math.abs(destino - xActual.current) < 90) {
            destino = xActual.current > libre / 2 ? MARGEN : libre;
          }
          caminarA(destino, () => {
            if (activo) proxima();
          });
        },
        4500 + Math.random() * 6000,
      );
    };
    proxima();
    return () => {
      activo = false;
      clearTimeout(espera);
      x.stopAnimation();
      paso.stopAnimation();
      paso.setValue(0);
    };
  }, [activa, ocupada, width]);

  // cuando tiene algo que decir se acerca al borde izquierdo para que el globo quepa a su lado
  useEffect(() => {
    if (!activa) return;
    if (hayConsejo || dicho !== null || preguntando || pensando) {
      x.stopAnimation();
      caminarA(MARGEN);
    }
  }, [activa, hayConsejo, dicho, preguntando, pensando]);

  // al arrastrarla la sigue el dedo; al soltarla se queda ahí y celebra con un brinco
  const arrastre = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        Math.abs(g.dx) > 8 || Math.abs(g.dy) > 8,
      onPanResponderGrant: () => {
        arrastrando.current = true;
        x.stopAnimation();
        paso.stopAnimation();
        x.setOffset(xActual.current);
        x.setValue(0);
        y.setOffset(yActual.current);
        y.setValue(0);
      },
      onPanResponderMove: (_e, g) => {
        x.setValue(g.dx);
        y.setValue(g.dy);
      },
      onPanResponderRelease: () => {
        x.flattenOffset();
        y.flattenOffset();
        const fx = Math.min(
          width - TAMANO - MARGEN,
          Math.max(MARGEN, xActual.current),
        );
        const fy = Math.min(
          0,
          Math.max(-alturaMaxima.current, yActual.current),
        );
        x.setValue(fx);
        y.setValue(fy);
        arrastrando.current = false;
        establecerSalto((n) => n + 1);
        sonar('mascotaBoing');
      },
      onPanResponderTerminate: () => {
        x.flattenOffset();
        y.flattenOffset();
        arrastrando.current = false;
      },
    }),
  ).current;

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

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        estilos.contenedor,
        {
          // por encima de la barra de pestañas flotante
          bottom: Math.max(margenes.bottom, espacios.doce) + 78,
          opacity: entrada,
          transform: [
            {
              translateY: entrada.interpolate({
                inputRange: [0, 1],
                outputRange: [90, 0],
              }),
            },
          ],
        },
      ]}
      testID="guia-mascota"
    >
      <Animated.View
        pointerEvents="box-none"
        style={[estilos.escenario, { transform: [{ translateY: y }] }]}
      >
        {preguntando ? (
          <View style={estilos.globo}>
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
          <View style={estilos.globo}>
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
          {...arrastre.panHandlers}
          style={[estilos.mascota, { transform: [{ translateX: x }] }]}
        >
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
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  cerrar: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  contenedor: {
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 40,
  },
  escenario: { minHeight: TAMANO },
  globo: {
    alignSelf: 'flex-start',
    marginBottom: espacios.cuatro,
    marginLeft: MARGEN + TAMANO + espacios.cuatro,
    marginRight: MARGEN,
    maxWidth: 290,
  },
  mascota: { bottom: 0, left: 0, position: 'absolute', width: TAMANO },
  preguntar: { gap: espacios.ocho, padding: espacios.doce },
  textoGlobo: { padding: espacios.doce },
});
