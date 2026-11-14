import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { useIA } from '@/datos/useIA';
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

export interface PropiedadesGuiaMascota {
  pantalla: PantallaMascota;
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
          bottom: Math.max(margenes.bottom, espacios.doce) + espacios.cuatro,
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
      <View pointerEvents="box-none" style={estilos.fila}>
        <Pressable
          accessibilityHint={t('mascota.pregunta')}
          accessibilityLabel={texto ?? t('mascota.activar')}
          accessibilityRole="button"
          onLongPress={alMantener}
          onPress={alTocar}
        >
          <MascotaRumbo humor={humor} salto={salto} tamano={64} />
        </Pressable>
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
      </View>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  cerrar: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  contenedor: {
    left: espacios.doce,
    position: 'absolute',
    right: espacios.doce,
    zIndex: 40,
  },
  fila: { alignItems: 'flex-end', flexDirection: 'row', gap: espacios.cuatro },
  globo: { flex: 1, marginBottom: espacios.doce, maxWidth: 290 },
  preguntar: { gap: espacios.ocho, padding: espacios.doce },
  textoGlobo: { padding: espacios.doce },
});
