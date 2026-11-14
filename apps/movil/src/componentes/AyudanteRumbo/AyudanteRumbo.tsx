import { usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { armarContexto } from '@/datos/contextoIA';
import {
  DIFICULTAD_INICIAL,
  registrarSenal,
  type EstadoDificultad,
} from '@/datos/dificultad';
import { ayudaPorDefecto, descripcionDelApuro } from '@/datos/ayudaDeRumbo';
import {
  instruccionesDeRumbo,
  limpiarRespuestaDeRumbo,
} from '@/datos/mascotaIA';
import { escucharSenales, type SenalDeAyuda } from '@/datos/senalesDeAyuda';
import { useBoletos } from '@/datos/useBoletos';
import { useConexion } from '@/datos/useConexion';
import { useIA } from '@/datos/useIA';
import { useMascota } from '@/datos/useMascota';
import { useSalidas } from '@/datos/useSalidas';
import { useSonidos } from '@/datos/useSonidos';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

import { CuerpoQueSeTransforma } from './CuerpoQueSeTransforma';
import { OjosQueAsoman } from './OjosQueAsoman';

/** cuánto se queda asomando los ojos si nadie los toca */
export const SEGUNDOS_ASOMADO = 9;
/** cuánto se queda la ayuda abierta */
export const SEGUNDOS_DE_AYUDA = 16;

const TAMANO = 64;
const MARGEN = 12;
const ANCHO_AYUDA = 260;

type Fase = 'ayuda' | 'asomado' | 'oculto';

/**
 * Rumbo solo existe cuando hace falta: si nota que la persona se está trabando (errores repetidos, una reserva que
 * falla, toques que no responden, sin señal) asoma los ojos por el borde derecho de la pantalla. Si los toca, se
 * materializa, se transforma en una tarjeta y le da una ayuda concreta, armada con la IA del teléfono cuando se puede.
 * Si nadie lo atiende, se esconde y no vuelve a insistir por un rato
 */
export function AyudanteRumbo() {
  const { activa } = useMascota();
  const ruta = usePathname();
  const margenes = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const reducido = useMovimientoReducido();
  const sonar = useSonidos();
  const ia = useIA();
  const { enLinea } = useConexion();
  const { boletos } = useBoletos();
  const { ahora, salidas } = useSalidas();

  const [fase, establecerFase] = useState<Fase>('oculto');
  const [texto, establecerTexto] = useState<string | null>(null);
  const [abierto, establecerAbierto] = useState(false);
  const [montada, establecerMontada] = useState(false);
  const detector = useRef<EstadoDificultad>(DIFICULTAD_INICIAL);
  const forma = useRef(new Animated.Value(0)).current;
  const motivo = useRef<SenalDeAyuda>('errorFormulario');

  // en la portada de inicio no sale: ahí nadie está trabado todavía
  const permitido = activa && ruta !== '/';
  const yOjos = Math.round(height * 0.58);

  function alimentar(senal: SenalDeAyuda) {
    const r = registrarSenal(detector.current, senal, Date.now());
    detector.current = r.estado;
    if (r.asomar) {
      motivo.current = r.asomar;
      establecerFase((actual) => (actual === 'oculto' ? 'asomado' : actual));
    }
  }

  useEffect(() => {
    if (!permitido) return;
    return escucharSenales(alimentar);
  }, [permitido]);

  const estabaEnLinea = useRef(enLinea);
  useEffect(() => {
    if (estabaEnLinea.current === enLinea) return;
    estabaEnLinea.current = enLinea;
    if (permitido && !enLinea) alimentar('sinConexion');
  }, [enLinea, permitido]);

  // si nadie atiende los ojos, se esconden solos
  useEffect(() => {
    if (fase !== 'asomado') return;
    const espera = setTimeout(
      () => establecerFase('oculto'),
      SEGUNDOS_ASOMADO * 1000,
    );
    return () => clearTimeout(espera);
  }, [fase]);

  // al cambiar de pantalla a la portada todo se esconde
  useEffect(() => {
    if (!permitido) establecerFase('oculto');
  }, [permitido]);

  // la ayuda se abre con la transformación y se cierra sola
  useEffect(() => {
    if (fase === 'ayuda') {
      establecerMontada(true);
      if (reducido) {
        forma.setValue(1);
        establecerAbierto(true);
      } else {
        Animated.sequence([
          Animated.timing(forma, {
            duration: 170,
            easing: Easing.out(Easing.quad),
            toValue: 0.45,
            useNativeDriver: false,
          }),
          Animated.spring(forma, {
            friction: 6,
            tension: 85,
            toValue: 1,
            useNativeDriver: false,
          }),
        ]).start(() => establecerAbierto(true));
      }
      const cierre = setTimeout(
        () => establecerFase('oculto'),
        SEGUNDOS_DE_AYUDA * 1000,
      );
      return () => clearTimeout(cierre);
    }
    if (montada) {
      establecerAbierto(false);
      if (reducido) {
        forma.setValue(0);
        establecerMontada(false);
      } else {
        Animated.timing(forma, {
          duration: 280,
          easing: Easing.inOut(Easing.cubic),
          toValue: 0,
          useNativeDriver: false,
        }).start(() => establecerMontada(false));
      }
    }
  }, [fase]);

  /** al tocar los ojos: ayuda escrita al instante y, si la IA del teléfono puede, una más a medida */
  async function ayudar() {
    sonar('mascotaHola');
    establecerTexto(ayudaPorDefecto(motivo.current));
    establecerFase('ayuda');
    if (!ia.usable) return;
    try {
      const respuesta = await ia.preguntar(
        instruccionesDeRumbo(armarContexto(salidas, boletos, ahora)),
        `La persona ${descripcionDelApuro(motivo.current)}. Ayudala en una o dos frases concretas, sin repetir el problema.`,
      );
      const limpia = limpiarRespuestaDeRumbo(respuesta);
      if (limpia !== '') establecerTexto(limpia);
    } catch {
      /* se queda con la ayuda escrita */
    }
  }

  if (!permitido || fase === 'oculto') {
    if (!montada) return null;
  }

  const anchoCard = Math.min(ANCHO_AYUDA, width - 2 * MARGEN);
  const altoCard = Math.max(58, 28 + Math.ceil((texto?.length ?? 0) / 30) * 18);
  const xBus = width - TAMANO - MARGEN;
  const yBus = Math.min(yOjos, height - margenes.bottom - 160);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, estilos.capa]}
      testID="ayudante-rumbo"
    >
      {fase === 'asomado' ? (
        <OjosQueAsoman alToque={() => void ayudar()} y={yOjos} />
      ) : null}
      {montada ? (
        <Animated.View
          pointerEvents="box-none"
          style={[estilos.bus, { left: xBus, top: yBus }]}
        >
          <CuerpoQueSeTransforma
            abierto={abierto}
            alToque={() => establecerFase('oculto')}
            alto={altoCard}
            altoBus={TAMANO * 0.86}
            ancho={anchoCard}
            anchoBus={TAMANO}
            desplazamientoX={width - MARGEN - anchoCard - xBus}
            forma={forma}
            haciaArriba
            humor="saludando"
            salto={0}
            texto={texto}
          />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  bus: { height: TAMANO, position: 'absolute', width: TAMANO },
  capa: { zIndex: 40 },
});
